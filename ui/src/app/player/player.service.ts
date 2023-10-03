import { Injectable } from '@angular/core';
import { PlayerModule } from './player.module';
import {Logger} from "../common/logger";

@Injectable()
export class PlayerService {

  private static readonly LOGGER = new Logger(PlayerService.name);

  private playerName: string;

  getPlayerName(): string {
    return this.playerName;
  }

  setPlayerName(playerName: string): void {
    this.playerName = playerName;
  }
}
