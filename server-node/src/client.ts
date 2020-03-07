import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';

/**
 * Repräsentiert einen per Socket verbundenen Client, der zu einem bestehenden Spiel gehört.
 * Kann ein Game-Master oder ein Player sein.
 */
export class Client {

    private _uuid: string;

    private _socket: Socket;

    constructor(socket: Socket) {
        this._uuid = uuidv4();
        this._socket = socket;
    }

    get uuid(): string {
        return this._uuid;
    }

    get socket(): Socket {
        return this._socket;
    }
}