import { Client } from './client';

/**
 * Represents a active game. Holds only information that is necessary to make connection between
 * game master and players as well as reconnects possible.
 */
export class Game {

    /**
     * The ID of the game.
     */
    private readonly _id: string;

    private _gameMaster: Client;

    private _players: Client[] = [];

    private readonly _started: Date;

    constructor(id: string, gameMaster: Client) {
        this._id = id;
        this._gameMaster = gameMaster;
        this._started = new Date();
    }

    public addPlayer(player: Client) {
        this._players.push(player);
    }

    get id(): string {
        return this._id;
    }

    get gameMaster(): Client {
        return this._gameMaster;
    }

    get players(): Client[] {
        return this._players;
    }

    get started(): Date {
        return this._started;
    }

    /**
     * Will be used to reconnect the game master to the session.
     *
     * @param value
     */
    set gameMaster(value: Client) {
        if (this._gameMaster) {
            this._gameMaster.socket.disconnect(true);
        }
        this._gameMaster = value;
    }

}
