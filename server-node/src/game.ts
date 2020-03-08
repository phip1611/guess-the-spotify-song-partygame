import { Client, ClientType } from './client';
import { Log } from './log';

export type GameId = string;

/**
 * Represents a active game. Holds only information that is necessary to make connection between
 * game master and players as well as reconnects possible.
 *
 * If a client disconnects the socket on the
 */
export class Game {

    /**
     * The ID of the game.
     */
    private readonly _id: GameId;

    private _gameMaster: Client;

    private _players: Client[] = [];

    private readonly _started: Date;

    constructor(id: string, gameMaster: Client) {
        this._id = id;
        this._gameMaster = gameMaster;
        this._started = new Date();
    }

    /**
     * This connects/adds a client to the session. It first checks if the client uuid is already present.
     * If so we do a reconnect. Otherwise we just add the client to the session.
     *
     * Disconnects work by calling {@link Client#disconnect}. There is no further action necessary here in Game.
     *
     * @param client
     * @return if the client was connected to the game
     */
    public connectClient(client: Client): boolean {
        if (!client || client.dead) {
            throw new Error('Invalid client! null');
        }
        if (client.dead) {
            throw new Error('Invalid client! dead');
        }
        if (!client.socket.connected) {
            throw new Error('Invalid client! not connected');
        }

        if (client.type === ClientType.GAME_MASTER) {
            if (this._gameMaster && this._gameMaster.uuid != client.uuid) {
                throw new Error('New game master has different client uuid!');
            }
            Log.log(`Game#connectClient: new game master set; ${JSON.stringify(client.toPrintable())}`);
            this._gameMaster = client;
        } else {
            const index = this._players.findIndex(p => p.uuid === client.uuid);
            if (index !== -1) {
                // remove old one
                if (!this._players[index].dead) {
                    throw new Error('Player to remove is not dead!');
                }
                this._players.splice(index, 1);
            }
            Log.log(`Game#connectClient: added player; ${JSON.stringify(client.toPrintable())}`);
            this._players.push(client);
        }

        return true;
    }


    get id(): GameId {
        return this._id;
    }

    get gameMaster(): Client {
        return this._gameMaster;
    }

    /**
     * Returns all players, also the ones who's sockets are dead.
     */
    get players(): Client[] {
        return this._players;
    }

    /**
     * Returns all players that are connected. Filters out 'dead' clients.
     */
    get playersConnected(): Client[] {
        return this._players.filter(p => !p.dead);
    }

    get started(): Date {
        return this._started;
    }

    public toPrintable() {
        return {
            id: this.id,
            gameMaster: this.gameMaster.toPrintable(),
            players: this._players.map(p => p.toPrintable()),
            playersConnected: this.playersConnected.map(p => p.toPrintable()),
            started: this.started.toISOString()
        }
    }

}
