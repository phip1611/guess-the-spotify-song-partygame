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

    private static instance: GameService;

    private _games: Map<String, Game> = new Map<String, Game>();

    /**
     * This map helps us to manage reconnects. Once a client wants to reconnect we can lookup
     * the game its socket should be attached to.
     *
     * Key: clientUuid
     * Value: GameID
     */
    private _clientMap: Map<string, string> = new Map<string, string>();

    private initDone: boolean = false;

    private constructor() {
    }

    public static getInstance(): GameService {
        if (this.instance) return this.instance;
        return this.instance = new GameService();
    }

    public init() {
        if (this.initDone) {
            throw new Error('Init already done!');
        } else {
            this.initDone = true;
        }

        AppServer.getInstance().getSocketIo().on('connect', (socket => {
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
    private setUpSocketEventsHandler(socket: SocketIO.Socket) {

        /**
         * GM_CREATE_GAME means that the game master connects with the server.
         * This event will not be forwarded to any player.
         */
        socket.on(SocketEventType.GM_CREATE_GAME, (gameId: GmCreateGamePayload) => {
            if (this._games.has(gameId)) {
                console.error(`Game id '${gameId}' already used!`);
                return;
            }

            const gameMaster = new Client(socket);

            const game = new Game(gameId, gameMaster);

            this._clientMap.set(gameMaster.uuid, gameId);
            // game will be copied into map; its not the same object!
            this._games.set(gameId, new Game(gameId, gameMaster));
            socket.emit(SocketEventType.SERVER_CONFIRM, gameMaster.uuid);
            console.log(`new game created with id '${gameId}'; game master is '${gameMaster.uuid}'`);
            this.setUpGmForwardSocketEventsHandler(socket, game.id);
        });

        /**
         * PLAYER_HELLO means that the player connects with the server.
         * This event will not be forwarded to the game master.
         */
        socket.on(SocketEventType.PLAYER_HELLO, (gameId: PlayerHelloPayload) => {
            if (!this._games.has(gameId)) {
                console.error('PLAYER_HELLO: No game with this ID found!');
                return;
            }

            const player = new Client(socket);
            const game = this._games.get(gameId);
            game.addPlayer(player);
            this._clientMap.set(player.uuid, gameId);
            console.log(`player joined game id '${gameId}' with uuid '${player.uuid}'`);
            socket.emit(SocketEventType.SERVER_CONFIRM, player.uuid);
            this.setUpForwardPlayerSocketEventsHandler(socket, game.id);
        });

        /**
         * GM_RECONNECT means a game master want to rejoin an existing game.
         */
        socket.on(SocketEventType.GM_RECONNECT, (uuid: GmReconnectPayload) => {
            const gameId = this._clientMap.get(uuid);
            if (!gameId) {
                console.error(`GM_RECONNECT with id '${uuid}' unknown!`);
                return;
            }
            const game = this.games.get(gameId);

            console.info(`GM_RECONNECT with id '${uuid}' to game '${gameId}'`);
            const newGameMaster = new Client(socket);
            game.gameMaster = newGameMaster;
            socket.emit(SocketEventType.SERVER_CONFIRM, newGameMaster.uuid);
            this.setUpGmForwardSocketEventsHandler(socket, gameId);
        });

        /**
         * PLAYER_RECONNECT means a game master want to rejoin an existing game.
         */
        socket.on(SocketEventType.PLAYER_RECONNECT, (uuid: PlayerReconnectPayload) => {
            const gameId = this._clientMap.get(uuid);
            if (!gameId) {
                console.error(`GM_RECONNECT with id '${uuid}' unknown!`);
                return;
            }
            const game = this.games.get(gameId);

            console.info(`PLAYER_RECONNECT with id '${uuid}' to game '${gameId}'`);
            const newPlayer = new Client(socket);
            game.addPlayer(newPlayer);
            socket.emit(SocketEventType.SERVER_CONFIRM, newPlayer.uuid);
            this.setUpForwardPlayerSocketEventsHandler(socket, gameId);
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
    private setUpGmForwardSocketEventsHandler(socket: SocketIO.Socket, gameId: string) {

        socket.on(SocketEventType.GM_START_NEXT_ROUND, () => {
            const game = this.games.get(gameId); // get the latest object
            // received from game master
            console.log(`notify all clients that next game round has started (for game '${game.id}')`);
            game.players.map(p => p.socket).forEach(s => s.emit(SocketEventType.GM_START_NEXT_ROUND));
        });

        socket.on(SocketEventType.GM_ENABLE_BUZZER, () => {
            const game = this.games.get(gameId); // get the latest object
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
    private setUpForwardPlayerSocketEventsHandler(socket: SocketIO.Socket, gameId: string) {
        socket.on(SocketEventType.PLAYER_REGISTER, (data) => {
            const game = this.games.get(gameId); // get the latest object
            console.log(`send PLAYER_REGISTER(${data}) to game master (for game '${game.id}')`);
            game.gameMaster.socket.emit(SocketEventType.PLAYER_REGISTER, data);
        });

        // a player hits the buzzer, let the game master now it
        socket.on(SocketEventType.PLAYER_BUZZER, (playerName) => {
            const game = this.games.get(gameId); // get the latest object
            console.log(`Player ${playerName} hit the buzzer; let the game master know (for game '${game.id}')`);
            game.gameMaster.socket.emit(SocketEventType.PLAYER_BUZZER, playerName);
        });
    }

    private setUpRemovalOfOldGamesInterval() {
        const limit = 1000 * 60 * 60 * 2; // two hours in milli seconds
        const that = this;
        setInterval(() => this.removalOfOldGames(that), limit)
    }

    private removalOfOldGames(context: any) {
        console.log('removing old games now');
        if (context._games.size === 0) { return; }
        const limit = 1000 * 60 * 60 * 2; // two hours in milli seconds
        const currentTime = new Date().getTime();
        const idsToRemove = [];
        context._games.forEach((game) => {
            if (currentTime - game.started.getTime() > limit) {
                console.log(`removing game '${game.id}'`);
                idsToRemove.push(game.id);
            }
        });
        idsToRemove.forEach(id => {
            const game = context._games.get(id);
            game.gameMaster.socket.disconnect(true);
            game.players.map(p => p.socket).forEach(s => s.disconnect(true));
            context._games.delete(id)
        });
    }


    get games(): Map<String, Game> {
        return this._games;
    }

    get clientMap(): Map<string, string> {
        return this._clientMap;
    }

    reset() {
        this._games.clear();
        this._clientMap.clear();
    }
}
