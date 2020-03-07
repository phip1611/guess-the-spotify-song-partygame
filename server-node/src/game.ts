import { Client } from './client';
import { Log } from './log';

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

    public removePlayer(clientUuid: string) {
        const index = this.players.findIndex(p => p.uuid === clientUuid);
        if (index === -1) return;
        this.players.splice(index, 1);
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
     * Will be used to reconnect the game master to the session. The new gameMaster
     * will have of course the same client id but a different socket io client id.
     *
     * @param value
     */
    set gameMaster(value: Client) {
        if (this._gameMaster.socketIoClientId !== value.socketIoClientId) {
            Log.disconnectedSocket(this._gameMaster, 'gameMaster');
            this._gameMaster.socket.disconnect(true);
        } else {
            console.warn(`Log#gameMaster: called setter but the socket is the same! ${value.toPrintable()}`);
        }


        this._gameMaster = value;
    }

    public toPrintable() {
        return {
            id: this.id,
            gameMaster: this.gameMaster.toPrintable(),
            players: this.players.map(p => p.toPrintable()),
            started: this.started.toISOString()
        }
    }

}
