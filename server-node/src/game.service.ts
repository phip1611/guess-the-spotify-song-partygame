import * as SocketIO from 'socket.io';
import { Socket } from 'socket.io';
import { AppServer } from './app-server';
import { Game } from './game';
import { GmCreateGamePayload, GmReconnectPayload, PlayerBuzzerPayload, PlayerHelloPayload, PlayerReconnectPayload, PlayerRegisterPayload, SocketEventType } from '../../common-ts/socket-events';
import { Client } from './client';
import { Log } from './log';

/**
 * The game service only manages the communication between
 * the game master and it's client. The game master tries to
 * hold as minimum logic about the actual game as possible.
 * All the logic shall happen at the game masters device.
 */
export class GameService {

    private static instance: GameService;

    private _games: Map<string, Game> = new Map<string, Game>();

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
            console.log(`client connected; socket io client id is '${socket.client.id}'`);
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
            Log.eventReceived(SocketEventType.GM_CREATE_GAME, socket.client.id, gameId);
            this.addGameMasterToGame(SocketEventType.GM_CREATE_GAME, socket, gameId, null);
        });

        /**
         * PLAYER_HELLO means that the player connects with the server.
         * This event will not be forwarded to the game master.
         */
        socket.on(SocketEventType.PLAYER_HELLO, (gameId: PlayerHelloPayload) => {
            Log.eventReceived(SocketEventType.PLAYER_HELLO, socket.client.id, gameId);
            this.addPlayerToGame(SocketEventType.PLAYER_HELLO, socket, gameId, null);
        });

        /**
         * GM_RECONNECT means a game master want to rejoin an existing game.
         */
        socket.on(SocketEventType.GM_RECONNECT, (uuid: GmReconnectPayload) => {
            Log.eventReceived(SocketEventType.GM_RECONNECT, socket.client.id, uuid);
            this.addGameMasterToGame(SocketEventType.GM_RECONNECT, socket, null, uuid);
        });

        /**
         * PLAYER_RECONNECT means a game master want to rejoin an existing game.
         */
        socket.on(SocketEventType.PLAYER_RECONNECT, (uuid: PlayerReconnectPayload) => {
            Log.eventReceived(SocketEventType.PLAYER_RECONNECT, socket.client.id, uuid);
            this.addPlayerToGame(SocketEventType.PLAYER_RECONNECT, socket, null, uuid);
        });

        socket.on('reconnect', () => {
            console.info('A socket reconnected');
        });

        // socket.on('disconnect', reason => {
        socket.once('disconnect', reason => {
            console.info('A socket disconnected: ' + reason);
        });
    }

    private addGameMasterToGame(type: SocketEventType, socket: Socket, gameId: string, clientUuid: string) {
        if (clientUuid) {
            // we want to reconnect
            gameId = this.clientMap.get(clientUuid);
            if (!gameId) {
                Log.invalidClientUuid(type);
                return;
            }
        }

        if (!gameId) {
            Log.invalidGameId(type);
            return;
        }

        let game = this.games.get(gameId);
        if (!game && clientUuid) { // tried to reconnect to an (now) invalid game
            Log.invalidGame(type, gameId);
            this.clientMap.delete(clientUuid);
        }


        // be aware: clientUuid can be null! therefore we could get a new client uuid here for the client object
        // otherwise we have a new uuid
        const client = new Client(socket, clientUuid);
        clientUuid = client.uuid; // if clientUuid was previously null

        if (game && clientUuid) {
            // reconnect; just set new game master
            game.gameMaster = client;
            Log.reconnectedClientToGame(type, gameId, clientUuid, client.socketIoClientId, 'gameMaster');
        } else {
            game = new Game(gameId, client);
            Log.addedClientToGame(type, gameId, clientUuid, client.socketIoClientId, 'gameMaster');
            this.clientMap.set(clientUuid, gameId);
            this.games.set(gameId, game);
        }

        Log.eventSent(SocketEventType.SERVER_CONFIRM, gameId, clientUuid, client.socketIoClientId, clientUuid);

        socket.emit(SocketEventType.SERVER_CONFIRM, clientUuid);
        this.setUpGmForwardSocketEventsHandler(socket, game.id);
    }

    private addPlayerToGame(type: SocketEventType, socket: Socket, gameId: string | null, clientUuid: string | null) {
        if (clientUuid) {
            // we want to reconnect
            gameId = this.clientMap.get(clientUuid);
            if (!gameId) {
                Log.invalidClientUuid(type);
                return;
            }
        }

        if (!gameId) {
            Log.invalidGameId(type);
            return;
        }

        const game = this.games.get(gameId);
        if (!game) {
            Log.invalidGame(type, gameId);

            if (clientUuid) {
                this.clientMap.delete(clientUuid);
            }
        }

        // be aware: clientUuid can be null! therefore we could get a new client uuid here for the client object
        // otherwise we have a new uuid
        const client = new Client(socket, clientUuid);

        if (client.uuid === clientUuid) {
            // client already defined; we do a reconnect
            game.removePlayer(clientUuid); // remove old object from game
            game.addPlayer(client); // add new object to game

            Log.reconnectedClientToGame(type, gameId, clientUuid, client.socketIoClientId,'player');

            console.dir(game.toPrintable())
        } else {
            clientUuid = client.uuid; // if clientUuid was previously null

            // add new client to game
            game.addPlayer(client);
            Log.addedClientToGame(type, gameId, clientUuid, client.socketIoClientId, 'player');
            this.clientMap.set(clientUuid, gameId);
        }

        socket.emit(SocketEventType.SERVER_CONFIRM, clientUuid);

        Log.eventSent(SocketEventType.SERVER_CONFIRM, gameId, clientUuid, client.socketIoClientId, clientUuid);
        this.setUpForwardPlayerSocketEventsHandler(socket, game.id);
    }

    /**
     * Set up all socket listeners for game master events.
     * (Events that game master sends to server).
     * In principle all of these events will be broadcasted
     * to all players of the game.
     */
    private setUpGmForwardSocketEventsHandler(socket: SocketIO.Socket, gameId: string) {

        socket.on(SocketEventType.GM_START_NEXT_ROUND, () => {
            Log.eventReceived(SocketEventType.GM_START_NEXT_ROUND, socket.client.id);
            const game = this.games.get(gameId); // get the latest object
            game.players.map(p => p.socket).forEach(s => s.emit(SocketEventType.GM_START_NEXT_ROUND));
        });

        socket.on(SocketEventType.GM_ENABLE_BUZZER, () => {
            Log.eventReceived(SocketEventType.GM_ENABLE_BUZZER, socket.client.id);
            const game = this.games.get(gameId); // get the latest object
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
        socket.on(SocketEventType.PLAYER_REGISTER, (playerName: PlayerRegisterPayload) => {
            Log.eventReceived(SocketEventType.PLAYER_REGISTER, socket.client.id, playerName);
            const game = this.games.get(gameId); // get the latest object
            game.gameMaster.socket.emit(SocketEventType.PLAYER_REGISTER, playerName);
        });

        // a player hits the buzzer, let the game master now it
        socket.on(SocketEventType.PLAYER_BUZZER, (playerName: PlayerBuzzerPayload) => {
            Log.eventReceived(SocketEventType.PLAYER_BUZZER, socket.client.id, playerName);
            const game = this.games.get(gameId); // get the latest object
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


    get games(): Map<string, Game> {
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
