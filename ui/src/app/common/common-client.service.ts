/**
 * Holds the data that describes the state between the server and the client.
 */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonClientService {

  private _clientUuid: string;

  private _gameId: string;

  private _playerType: 'player' | 'gameMaster';

  get clientUuid(): string {
    return this._clientUuid;
  }

  set clientUuid(value: string) {
    this._clientUuid = value;
  }

  get gameId(): string {
    return this._gameId;
  }

  set gameId(value: string) {
    this._gameId = value;
  }

  get playerType(): 'player' | 'gameMaster' {
    return this._playerType;
  }

  set playerType(value: 'player' | 'gameMaster') {
    this._playerType = value;
  }

}
