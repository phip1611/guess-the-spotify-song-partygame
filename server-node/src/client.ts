import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { Log } from './log';
import { GameId } from './game';

export type ClientUuid = string;

/**
 * Represents a client that is connected through socket.io to a Game. A client can be
 * 'dead' which means its socket is null. This is no valid initial state but can happen
 * if its socket disconnects. This way we invalidated the socket but still can have
 * the clientUuid inside a game to make reconnects possible.
 *
 * If a client reconnects this instance will be thrown away and a new will be attached to the game.
 */
export class Client {

    private readonly _type: ClientType;

    private readonly _uuid: ClientUuid;

    private _socket: Socket;

    /**
     * If the client reconnects we use the same uuid.
     *
     * @param socket
     * @param type
     * @param uuid
     */
    constructor(socket: Socket, type: ClientType, uuid?: ClientUuid) {
        if (!socket) {
            throw new Error('Socket is null!');
        }
        if (!type) {
            throw new Error('type is null!');
        }
        this._uuid = uuid ? uuid : uuidv4();
        this._type = type;
        this._socket = socket;
    }

    get uuid(): ClientUuid {
        return this._uuid;
    }

    get socket(): Socket {
        return this._socket;
    }

    get type(): ClientType {
        return this._type;
    }

    // returns the client id of the connection from socket io
    // useful for debugging
    get socketIoClientId(): string {
        return this._socket ? this._socket.client.id : null;
    }

    /**
     * Indicates if the socket of the client is disconnected and null.
     */
    get dead(): boolean {
        return this._socket === null;
    }

    /**
     * Makes the client 'dead'. Disconnects client and sets the socket to null.
     */
    public disconnect(): void {
        if (!this._socket) {
            throw new Error('Socket already disconnected!');
        }

        Log.disconnectedSocket(this);

        if (!this._socket.disconnected) {
        // this probably prevents double disconnects or so..
            this._socket.disconnect(true);
        }
        this._socket = null;
    }

    public toPrintable() {
        return {
            uuid: this.uuid,
            type: this.type,
            dead: this.dead,
            socketIoClientId: this.socketIoClientId
        }
    }
}

export enum ClientType {
    GAME_MASTER = 'GAME_MASTER',
    PLAYER = 'PLAYER',
}

/**
 * Describes the meta information the game service holds about all clients to
 * make reconnects easier/more fault tolerant. This information shall
 * survives disconnects of the socket so that reconnects with a
 * client uuid are possible.
 */
export interface CachedClientState {
    gameId: GameId;
    clientType: ClientType
}