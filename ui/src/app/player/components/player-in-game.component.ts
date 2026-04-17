import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Log } from '../../common/logging/logger';
import { SocketService } from '../../common/socket.service';
import { Subscription } from 'rxjs';
import { PlayerService } from '../player.service';
import { SocketEventType } from '../../../../../common-ts/socket-events';
import { AppSocket } from '../../common/app-socket.service';

@Component({
    selector: 'app-player-in-game',
    template: `
    <mat-card>
      <p class="text-center">Bitte während des Spiels nicht zwischen WLAN und mobilem Internet wechseln!</p>
    </mat-card>

    <mat-card class="mt-3">
      <button mat-raised-button color="warn" class="w-100"
              style="height: 450px; font-size: 36px"
              [disabled]="!buzzerEnabled()"
              (click)="onBuzzered()"
      >BUZZER
      </button>
    </mat-card>
  `,
    standalone: false
})
export class PlayerInGameComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerInGameComponent.name);

  readonly buzzerEnabled = signal(false);

  private subs1: Subscription;
  private subs2: Subscription;

  constructor(private socketService: SocketService,
              private socket: AppSocket,
              private playerService: PlayerService) {
  }

  ngOnInit(): void {
    this.subs1 = this.socketService.getBuzzerEnabled().subscribe(() => {
      this.buzzerEnabled.set(true);
    });
    this.subs2 = this.socketService.getNextRoundStarted().subscribe(() => {
      this.buzzerEnabled.set(false);
    });
  }

  ngOnDestroy(): void {
    this.subs1.unsubscribe();
    this.subs2.unsubscribe();
  }


  onBuzzered() {
    this.socketService.sendMessage({
      payload: this.playerService.getPlayerName(),
      type: SocketEventType.PLAYER_BUZZER
    });
    this.buzzerEnabled.set(false);
  }
}
