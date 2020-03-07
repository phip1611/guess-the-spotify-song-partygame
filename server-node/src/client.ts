import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';

/**
 * Repräsentiert einen per Socket verbundenen Client, der zu einem bestehenden Spiel gehört.
 * Kann ein Game-Master oder ein Player sein.
 */
export class Client {

    private _uuid: string;

    private _socket: Socket;

    /**
     * If the client reconnects we use the same uuid.
     *
     * @param socket
     * @param uuid
     */
    constructor(socket: Socket, uuid?: string) {
        this._uuid = uuid ? uuid : uuidv4();
        this._socket = socket;
    }

    get uuid(): string {
        return this._uuid;
    }

    get socket(): Socket {
        return this._socket;
    }

    // returns the client id of the connection from socket io
    // useful for debugging
    get socketIoClientId(): string {
        return this._socket.client.id;
    }

    public toPrintable() {
        return {
            uuid: this.uuid,
            socketIoClientId: this.socketIoClientId
        }
    }
}