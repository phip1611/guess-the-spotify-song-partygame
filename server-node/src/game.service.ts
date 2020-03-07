import * as SocketIO from 'socket.io';
import { AppServer } from './app-server';
import { Game } from './game';
import { GmCreateGamePayload, GmReconnectPayload, PlayerHelloPayload, PlayerReconnectPayload, SocketEventType } from '../../common-ts/socket-events';
import { Client } from './client';

/**
 * The game service only manages the communication between
 * the game master and it's client. The game master tries to
 * hold as minimum logic about the actual game as possible.
 * All the logic shall happen at the game masters device.
 */
export class GameService {

    private static io: SocketIO.Server;

    private static games: Map<String, Game> = new Map<String, Game>();

    /**
     * This map helps us to manage reconnects. Once a client wants to reconnect we can lookup
     * the game its socket should be attached to.
     */
    private static clientMap: Map<string, Game> = new Map<string, Game>();

    public static init() {
        this.io = AppServer.getSocketIo();
        this.io.on('connect', (socket => {
            console.log('client connected');
            this.setUpSocketEventsHandler(socket);
        }));
        this.setUpRemovalOfOldGamesInterval();
    }

    /**
     * Handles incoming initial requests. Valid incoming events
     * are either PLAYER_HELLO or GM_CREATE_GAME or RECONNECT-Events.
     *
     * @param socket
     */
    private static setUpSocketEventsHandler(socket: SocketIO.Socket) {

        /**
         * GM_CREATE_GAME means that the game master connects with the server.
         * This event will not be forwarded to any player.
         */
        socket.on(SocketEventType.GM_CREATE_GAME, (gameId: GmCreateGamePayload) => {
            if (this.games.has(gameId)) {
                console.error(`Game id '${gameId}' already used!`);
                return;
            }

            const gameMaster = new Client(socket);
            const game = new Game(gameId, gameMaster);
            this.clientMap.set(gameMaster.uuid, game);

            console.log(`new game created with id '${gameId}'; game master is '${gameMaster.uuid}'`);

            this.games.set(gameId, new Game(gameId, gameMaster));
            this.setUpGmForwardSocketEventsHandler(socket, game);
        });

        /**
         * PLAYER_HELLO means that the player connects with the server.
         * This event will not be forwarded to the game master.
         */
        socket.on(SocketEventType.PLAYER_HELLO, (gameId: PlayerHelloPayload) => {
            if (!this.games.has(gameId)) {
                console.error('PLAYER_HELLO: No game with this ID found!');
                return;
            }

            console.log(`player joined game with id '${gameId}'`);

            const game = this.games.get(gameId);
            game.addPlayer(new Client(socket));
            this.setUpForwardPlayerSocketEventsHandler(socket, game);
        });

        /**
         * GM_RECONNECT means a game master want to rejoin an existing game.
         */
        socket.on(SocketEventType.GM_RECONNECT, (uuid: GmReconnectPayload) => {
            const game = this.clientMap.get(uuid);
            if (!game) {
                console.error(`GM_RECONNECT with id '${uuid}' unknown!`);
                return;
            }
            console.info(`GM_RECONNECT with id '${uuid}' to game ''${game.id}`);
            game.gameMaster = new Client(socket);
            this.setUpGmForwardSocketEventsHandler(socket, game);
        });

        /**
         * PLAYER_RECONNECT means a game master want to rejoin an existing game.
         */
        socket.on(SocketEventType.PLAYER_RECONNECT, (uuid: PlayerReconnectPayload) => {
            const game = this.clientMap.get(uuid);
            if (!game) {
                console.error(`GM_RECONNECT with id '${uuid}' unknown!`);
                return;
            }
            console.info(`PLAYER_RECONNECT with id '${uuid}' to game ''${game.id}`);
            game.addPlayer(new Client(socket));
            this.setUpForwardPlayerSocketEventsHandler(socket, game);
        });

        socket.on('disconnect', reason => {
            console.info('A socket disconnected: ' + reason);
        });
    }

    /**
     * Set up all socket listeners for game master events.
     * (Events that game master sends to server).
     * In principle all of these events will be broadcasted
     * to all players of the game.
     */
    private static setUpGmForwardSocketEventsHandler(socket: SocketIO.Socket, game: Game) {
        socket.on(SocketEventType.GM_START_NEXT_ROUND, () => {
            // received from game master
            console.log(`notify all clients that next game round has started (for game '${game.id}')`);
            game.players.map(p => p.socket).forEach(s => s.emit(SocketEventType.GM_START_NEXT_ROUND));
        });

        socket.on(SocketEventType.GM_ENABLE_BUZZER, () => {
            // received from game master
            console.log(`notify all clients that buzzers are enabled (for game '${game.id}')`);
            game.players.map(p => p.socket).forEach(s => s.emit(SocketEventType.GM_ENABLE_BUZZER));
        });
    }

    /**
     * Set up all socket listeners for player events.
     * (Events that players sends to server).
     * In principle all of these events will be send
     * to the game master of the game.
     */
    private static setUpForwardPlayerSocketEventsHandler(socket: SocketIO.Socket, game: Game) {
        socket.on(SocketEventType.PLAYER_REGISTER, (data) => {
            console.log(`send PLAYER_REGISTER(${data}) to game master (for game '${game.id}')`);
            game.gameMaster.socket.emit(SocketEventType.PLAYER_REGISTER, data);
        });

        // a player hits the buzzer, let the game master now it
        socket.on(SocketEventType.PLAYER_BUZZER, (playerName) => {
            console.log(`Player ${playerName} hit the buzzer; let the game master know (for game '${game.id}')`);
            game.gameMaster.socket.emit(SocketEventType.PLAYER_BUZZER, playerName);
        });
    }

    private static setUpRemovalOfOldGamesInterval() {
        const limit = 1000 * 60 * 60 * 2; // two hours in milli seconds
        const that = this;
        setInterval(() => this.removalOfOldGames(that), limit)
    }

    private static removalOfOldGames(context: any) {
        console.log('removing old games now');
        if (context.games.size === 0) { return; }
        const limit = 1000 * 60 * 60 * 2; // two hours in milli seconds
        const currentTime = new Date().getTime();
        const idsToRemove = [];
        context.games.forEach((game) => {
            if (currentTime - game.started.getTime() > limit) {
                console.log(`removing game '${game.id}'`);
                idsToRemove.push(game.id);
            }
        });
        idsToRemove.forEach(id => {
            const game = context.games.get(id);
            game.gameMaster.socket.disconnect(true);
            game.players.map(p => p.socket).forEach(s => s.disconnect(true));
            context.games.delete(id)
        });
    }
}
