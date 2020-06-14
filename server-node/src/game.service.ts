import * as SocketIO from 'socket.io';
import { Socket } from 'socket.io';
import { AppServer } from './app-server';
import { Game, GameId } from './game';
import { GmCreateGamePayload, GmReconnectPayload, PlayerBuzzerPayload, PlayerHelloPayload, PlayerReconnectPayload, PlayerRegisterPayload, SocketEventType } from '../../common-ts/socket-events';
import { Log } from './log';
import { Client, CachedClientState, ClientType, ClientUuid } from './client';

/**
 * The game service only manages the communication between
 * the game master and it's client. The game master tries to
 * hold as minimum logic about the actual game as possible.
 * All the logic shall happen at the game masters device.
 */
export class GameService {

    private static instance: GameService;

    /**
     * Map of all active gameIdToGameMap. Map from game id to game.
     */
    private _gameIdToGameMap: Map<GameId, Game> = new Map();

    /**
     * This map helps us to manage reconnects. Once a client wants to reconnect we can lookup
     * the game its socket should be attached to.
     *
     * Key: clientUuid
     * Value: GameID
     */
    private _clientUuidMap: Map<ClientUuid, CachedClientState> = new Map();

    /**
     * This map is a mapping from socketIoClientId to client.
     *
     * Key: socketIoClientId
     * Value: Client
     */
    private _socketIoClientIdToClientMap: Map<string, Client> = new Map();

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
            Log.log(`client connected; socket io client id is '${socket.client.id}'`);
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

            try {
                this.addClientToGame(SocketEventType.GM_CREATE_GAME, socket, gameId, ClientType.GAME_MASTER);
            } catch (e) {
                Log.error(e);
            }

            this.setUpForwardGmSocketEventsHandler(socket, gameId);
        });

        /**
         * PLAYER_HELLO means that the player connects with the server.
         * This event will not be forwarded to the game master.
         */
        socket.on(SocketEventType.PLAYER_HELLO, (gameId: PlayerHelloPayload) => {
            Log.eventReceived(SocketEventType.PLAYER_HELLO, socket.client.id, gameId);

            try {
                this.addClientToGame(SocketEventType.PLAYER_HELLO, socket, gameId, ClientType.PLAYER);
            } catch (e) {
                Log.error(e);
            }

            this.setUpForwardPlayerSocketEventsHandler(socket, gameId);
        });

        /**
         * GM_RECONNECT means a game master want to rejoin an existing game.
         */
        socket.on(SocketEventType.GM_RECONNECT, (uuid: GmReconnectPayload) => {
            Log.eventReceived(SocketEventType.GM_RECONNECT, socket.client.id, uuid);

            let gameId;
            try {
                gameId = this.addClientToGame(SocketEventType.GM_RECONNECT, socket, uuid, ClientType.GAME_MASTER);
            } catch (e) {
                Log.error(e);
            }

            this.setUpForwardGmSocketEventsHandler(socket, gameId);
        });

        /**
         * PLAYER_RECONNECT means a game master want to rejoin an existing game.
         */
        socket.on(SocketEventType.PLAYER_RECONNECT, (uuid: PlayerReconnectPayload) => {
            Log.eventReceived(SocketEventType.PLAYER_RECONNECT, socket.client.id, uuid);

            let gameId;
            try {
                gameId = this.addClientToGame(SocketEventType.PLAYER_RECONNECT, socket, uuid, ClientType.PLAYER);
            } catch (e) {
                Log.error(e);
            }

            this.setUpForwardPlayerSocketEventsHandler(socket, gameId);
        });

        // socket.on('disconnect', reason => {
        socket.once('disconnect', reason => {
            Log.info(`Socket '${socket.client.id}' disconnected because of: ${reason}`);
            const client = this._socketIoClientIdToClientMap.get(socket.client.id);
            if (!client) return;

            // this is all we need to do here
            // remove the "socket" object inside client / make it null
            client.disconnect();

            // NO! this._clientUuidMap.delete(client.uuid);
            this._socketIoClientIdToClientMap.delete(socket.client.id);
        });
    }

    /**
     * Adds a player to the game. First checks if the game exists. Then connects.
     * Returns the id of the game.
     *
     * @param type
     * @param socket
     * @param id Either game id or client uuid (depending on type)
     * @param clientType
     * @return id of game
     */
    private addClientToGame(type: SocketEventType, socket: Socket, id: string, clientType: ClientType): string {
        const isReconnect = type === SocketEventType.GM_RECONNECT || type === SocketEventType.PLAYER_RECONNECT;

        let clientUuid: ClientUuid = null;
        let gameId: GameId = null;

        if (isReconnect) {
            // id is clientUuid
            clientUuid = id;

            const cachedClientState = this._clientUuidMap.get(clientUuid);
            if (!cachedClientState) {
                Log.error(`Unknown client uuid ${clientUuid}!`);
                throw new Error(`Unknown client uuid ${clientUuid}!`);
            }
            if (cachedClientState.clientType !== clientType) {
                Log.error(`Client uuid ${clientUuid} is known but type is different? expected=${cachedClientState.clientType}, actual=${clientType}`);
                throw new Error(`Client uuid ${clientUuid} is known but type is different? expected=${cachedClientState.clientType}, actual=${clientType}`);
            }

            gameId = this._clientUuidMap.get(clientUuid).gameId;
        } else {
            gameId = id;
        }

        // if clientUuid is still null we get a new one
        const client = new Client(socket, clientType, clientUuid);
        clientUuid = client.uuid; // make sure this var has the latest value

        let isNewGame = false;
        let game = this._gameIdToGameMap.get(gameId);
        if (!game) {
            // we create the game if its a GM_CREATE_GAME event
            if (type === SocketEventType.GM_CREATE_GAME) {
                if (!gameId) {
                    throw new Error(`Can't create a game with ID null!`);
                }
                // we connect the game master here already to the game
                game = new Game(gameId, client);
                this._gameIdToGameMap.set(gameId, game);
                isNewGame = true;
            } else {
                throw new Error(`Game with ${gameId} doesn't exist!`);
            }
        }

        // Otherwise game master is already attached to the game
        if (!isNewGame) {
            // now we know game, client and socket are valid
            // game.connectClient does the rest
            try {
                game.connectClient(client);
            } catch (e) {
                Log.error(`Can't connect client ${JSON.stringify(client.toPrintable())} to game ${game.id}`);
                Log.error(e);
                throw new Error(`Can't connect client ${JSON.stringify(client.toPrintable())} to game ${game.id}`);
            }
        }


        this._socketIoClientIdToClientMap.set(client.socketIoClientId, client);
        this._clientUuidMap.set(client.uuid, {clientType: clientType, gameId: gameId});

        Log.eventSent(SocketEventType.SERVER_CONFIRM, gameId, clientUuid, client.socketIoClientId, clientUuid);
        socket.emit(SocketEventType.SERVER_CONFIRM, clientUuid);

        return gameId;
    }



    /**
     * Set up all socket listeners for game master events.
     * (Events that game master sends to server).
     * In principle all of these events will be broadcasted
     * to all players of the game.
     */
    private setUpForwardGmSocketEventsHandler(socket: SocketIO.Socket, gameId: string) {

        socket.on(SocketEventType.GM_START_NEXT_ROUND, () => {
            Log.eventReceived(SocketEventType.GM_START_NEXT_ROUND, socket.client.id);
            const game = this.gameIdToGameMap.get(gameId); // get the latest object
            Log.info(`Forwarded GM_START_NEXT_ROUND to all players`);
            game.playersConnected.map(p => p.socket).forEach(s => s.emit(SocketEventType.GM_START_NEXT_ROUND));
        });

        socket.on(SocketEventType.GM_ENABLE_BUZZER, () => {
            Log.eventReceived(SocketEventType.GM_ENABLE_BUZZER, socket.client.id);
            const game = this.gameIdToGameMap.get(gameId); // get the latest object
            Log.info(`Forwarded GM_ENABLE_BUZZER to all players`);
            game.playersConnected.map(p => p.socket).forEach(s => s.emit(SocketEventType.GM_ENABLE_BUZZER));
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
            const game = this.gameIdToGameMap.get(gameId); // get the latest object
            Log.info(`Forwarded PLAYER_REGISTER(${playerName}) to GM (${game.gameMaster.socketIoClientId})`);
            game.gameMaster.socket.emit(SocketEventType.PLAYER_REGISTER, playerName);
        });

        // a player hits the buzzer, let the game master now it
        socket.on(SocketEventType.PLAYER_BUZZER, (playerName: PlayerBuzzerPayload) => {
            Log.eventReceived(SocketEventType.PLAYER_BUZZER, socket.client.id, playerName);
            const game = this.gameIdToGameMap.get(gameId); // get the latest object
            Log.info(`Forwarded PLAYER_BUZZER(${playerName}) to GM (${game.gameMaster.socketIoClientId})`);
            game.gameMaster.socket.emit(SocketEventType.PLAYER_BUZZER, playerName);
        });
    }

    private setUpRemovalOfOldGamesInterval() {
        const limit = 1000 * 60 * 60 * 2; // two hours in milli seconds
        const that = this;
        setInterval(() => this.removalOfOldGames(that), limit)
    }

    private removalOfOldGames(context: GameService) {
        Log.log('removing old gameIdToGameMap now');
        if (context.gameIdToGameMap.size === 0) { return; }
        const limit = 1000 * 60 * 60 * 2; // two hours in milli seconds
        const currentTime = new Date().getTime();
        const idsToRemove = [];

        Array.from(context.gameIdToGameMap.values()).forEach((game) => {
            if (currentTime - game.started.getTime() > limit) {
                Log.log(`removing game '${game.id}'`);
                idsToRemove.push(game.id);
            }
        });

        idsToRemove.forEach(id => {
            const game = context.gameIdToGameMap.get(id);
            game.gameMaster.socket.disconnect(true);
            context.clientUuidMap.delete(game.gameMaster.uuid);
            game.players.forEach(p => {
                p.disconnect();
                context.clientUuidMap.delete(p.uuid);
            });
            context.gameIdToGameMap.delete(id);
        });
    }


    get gameIdToGameMap(): Map<GameId, Game> {
        return this._gameIdToGameMap;
    }

    get clientUuidMap(): Map<ClientUuid, CachedClientState> {
        return this._clientUuidMap;
    }

    get socketIoClientIdToClientMap(): Map<string, Client> {
        return this._socketIoClientIdToClientMap;
    }

    reset() {
        this._gameIdToGameMap.clear();
        this._clientUuidMap.clear();
        this._socketIoClientIdToClientMap.clear();
    }
}
