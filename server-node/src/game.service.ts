import * as SocketIO from 'socket.io';
import { AppServer } from './app-server';
import { Game } from './game';
import { SocketEventType } from '../../common-ts/socket-events';

/**
 * The game service only manages the communication between
 * the game master and it's client. The game master tries to
 * keep as minimum logic about the actual game as possible.
 * All the logic shall happen at the game masters device.
 */
export class GameService {

    private static io: SocketIO.Server;

    private static games: Map<String, Game> = new Map<String, Game>();

    public static init() {
        this.io = AppServer.getSocketIo();
        this.io.on('connect', (socket => {
            console.log('client connected');
            this.handleSocket(socket);
        }));
        this.setUpRemovalOfOldGames();
    }

    /**
     * Handles incoming initial requests. Valid incoming events
     * are either PLAYER_HELLO or GM_CREATE_GAME.
     *
     * @param socket
     */
    private static handleSocket(socket: SocketIO.Socket) {

        /**
         * GM_CREATE_GAME means that the game master connects with the server.
         * This event will not be forwarded to any player.
         */
        socket.on(SocketEventType.GM_CREATE_GAME, (gameId) => {
            if (this.games.has(gameId)) {
                // TODO notify game master
                throw new Error('Game ID already used!');
            }

            console.log(`new game created with id '${gameId}'`);

            this.games.set(gameId, new Game(gameId, socket));
            this.setUpGmSocketEvents(socket, gameId);
        });

        /**
         * PLAYER_HELLO means that the player connects with the server.
         * This event will not be forwarded to the game master.
         */
        socket.on(SocketEventType.PLAYER_HELLO, (gameId) => {
            if (!this.games.has(gameId)) {
                // TODO notify game master
                //throw new Error('No game with this ID found!');
                console.error('PLAYER_HELLO: No game with this ID found!');
                return;
            }

            console.log(`player joined game with id '${gameId}'`);

            this.games.get(gameId).addPlayer(socket);
            this.setUpPlayerSocketEvents(socket, gameId);
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
    private static setUpGmSocketEvents(socket: SocketIO.Socket, gameId: string) {

        socket.on(SocketEventType.GM_START_NEXT_ROUND, () => {
            const game = this.games.get(gameId); // always get the current object
            // received from game master
            console.log(`notify all clients that next game round has started (for game '${gameId}')`);
            game.players.forEach(s => s.emit(SocketEventType.GM_START_NEXT_ROUND));
        });

        socket.on(SocketEventType.GM_ENABLE_BUZZER, () => {
            const game = this.games.get(gameId); // always get the current object

            // received from game master
            console.log(`notify all clients that buzzers are enabled (for game '${gameId}')`);
            game.players.forEach(s => s.emit(SocketEventType.GM_ENABLE_BUZZER));
        });
    }

    /**
     * Set up all socket listeners for player events.
     * (Events that players sends to server).
     * In principle all of these events will be send
     * to the game master of the game.
     */
    private static setUpPlayerSocketEvents(socket: SocketIO.Socket, gameId: string) {
        socket.on(SocketEventType.PLAYER_REGISTER, (data) => {
            const game = this.games.get(gameId); // always get the current object
            console.log(`send player register (${data}) to game master (for game '${gameId}')`);
            game.gameMaster.emit(SocketEventType.PLAYER_REGISTER, data);
        });

        // a player hits the buzzer, let the game master now it
        socket.on(SocketEventType.PLAYER_BUZZER, (playerName) => {
            const game = this.games.get(gameId); // always get the current object
            console.log(`Player ${playerName} hit the buzzer; let the game master know (for game '${gameId}')`);
            game.gameMaster.emit(SocketEventType.PLAYER_BUZZER, playerName);
        });
    }

    private static setUpRemovalOfOldGames() {
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
                idsToRemove.push(game.id);
            }
        });
        idsToRemove.forEach(id => context.games.delete(id));
    }
}
