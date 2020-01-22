import { Injectable } from '@angular/core';
import { Log } from 'ng-log';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private static readonly LOGGER = new Log(PlayerService.name);

  private playerName: string;

  getPlayerName(): string {
    return this.playerName;
  }

  setPlayerName(playerName: string): void {
    this.playerName = playerName;
  }

}
