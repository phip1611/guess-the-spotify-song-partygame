import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../../common/socket.service';
import { take } from 'rxjs/operators';
import { PlayerState } from '../player.component';

@Component({
  selector: 'app-player-waiting-for-game',
  template: `
    <mat-card>
      <h3 class="mt-3 text-center">Bitte warte, bis der Gamemaster das Spiel startet :)</h3>

      <div class="d-flex justify-content-center mt-3">
        <div class="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </mat-card>
  `
})
export class PlayerWaitingForGameComponent implements OnInit, OnDestroy {

  constructor(private socketService: SocketService) {
  }

  private static readonly LOGGER = new Log(PlayerWaitingForGameComponent.name);

  @Output()
  done = new EventEmitter();

  ngOnInit(): void {
    // wait if there is already a started game or until a game has been started
    this.socketService.getGameCreated().pipe(take(1)).subscribe(() => {
      PlayerWaitingForGameComponent.LOGGER.debug('created game session; now open dialog to join');
      this.done.next();
    });
  }

  ngOnDestroy(): void {
  }


}

