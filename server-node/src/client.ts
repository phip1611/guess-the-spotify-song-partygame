import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { Log } from './log';

/**
 * Represents a client that is connected through socket.io to a Game. A client can be
 * 'dead' which means its socket is null. This is no valid initial state but can happen
 * if its socket disconnects. This way we invalidated the socket but still can have
 * the clientUuid inside a game to make reconnects possible.
 */
export class Client {

    private readonly _type: ClientType;

    private readonly _uuid: string;

    private _socket: Socket;

    /**
     * If the client reconnects we use the same uuid.
     *
     * @param socket
     * @param type
     * @param uuid
     */
    constructor(socket: Socket, type: ClientType, uuid?: string) {
        if (!socket) {
            throw new Error('Socket is null!');
        }
        // !type doesnt work because it is a enum and "0" is a valid value
        if (type === undefined || type === null) {
            throw new Error('type is null!');
        }
        this._uuid = uuid ? uuid : uuidv4();
        this._type = type;
        this._socket = socket;
    }

    get uuid(): string {
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
        return this._socket.client.id;
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

        // if (!this._socket.disconnected) {
        this._socket.disconnect(true);
        // }
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
    GAME_MASTER,
    PLAYER,
}