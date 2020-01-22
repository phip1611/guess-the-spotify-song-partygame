import { Socket } from 'socket.io';

export class Game {

    private readonly _id: String;

    private readonly _gameMaster: Socket;

    private _players: Socket[] = [];

    private readonly _started: Date;

    constructor(id: String, gameMaster: Socket) {
        this._id = id;
        this._gameMaster = gameMaster;
        this._started = new Date();
    }

    public addPlayer(player: Socket) {
        /*if (!this._playersCanJoin) {
            console.debug('Players can\'t join no more because the game has already started!');
        }*/
        this._players.push(player);
    }

    /*public disablePlayersCanJoin(): void {
        this._playersCanJoin = false;
    }*/

    get id(): String {
        return this._id;
    }

    get gameMaster(): Socket {
        return this._gameMaster;
    }

    get players(): Socket[] {
        return this._players;
    }

    get started(): Date {
        return this._started;
    }
}
