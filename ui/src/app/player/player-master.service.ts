import { Injectable } from '@angular/core';
import { Log } from 'ng-log';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private static readonly LOGGER = new Log(PlayerService.name);

  private playerName: string;

  private gameId: string;

  getPlayerName(): string {
    return this.playerName;
  }

  setPlayerName(playerName: string): void {
    this.playerName = playerName;
  }

  getGameId(): string {
    return this.playerName;
  }

  setGameId(gameId: string): void {
    this.gameId = gameId;
  }

}
