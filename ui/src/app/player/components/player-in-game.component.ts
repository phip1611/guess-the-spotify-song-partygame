import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../../common/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player-in-game',
  template: `
    <mat-card>
      <button mat-raised-button color="warn" class="w-100" style="height: 400px; font-size: 30px"
              [disabled]="!buzzerEnabled"
      >Buzzer</button>
    </mat-card>
  `
})
export class PlayerInGameComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerInGameComponent.name);

  buzzerEnabled = false;

  private subs1: Subscription;
  private subs2: Subscription;

  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.subs1 = this.socketService.getBuzzerEnabled().subscribe(() => {
      this.buzzerEnabled = true;
    });
    this.subs2 = this.socketService.getNextRoundStarted().subscribe(() => {
      this.buzzerEnabled = false;
    });
  }

  ngOnDestroy(): void {
    this.subs1.unsubscribe();
    this.subs2.unsubscribe();
  }


}
