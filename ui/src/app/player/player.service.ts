import { Injectable, signal } from '@angular/core';
import { Log } from '../common/logging/logger';
import { PlayerModule } from './player.module';

@Injectable()
export class PlayerService {

  private static readonly LOGGER = new Log(PlayerService.name);

  private readonly playerNameState = signal('');

  readonly playerName = this.playerNameState.asReadonly();

  getPlayerName(): string {
    return this.playerNameState();
  }

  setPlayerName(playerName: string): void {
    this.playerNameState.set(playerName);
  }
}
