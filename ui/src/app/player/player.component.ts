import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../common/socket.service';
import { SocketEventType } from '../common/model/socket-events';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-player',
  template: `
    <app-player-waiting-for-game *ngIf="state === 0"
    ></app-player-waiting-for-game>
    <app-player-join-game *ngIf="state === 1"
    ></app-player-join-game>
    <app-player-in-game *ngIf="state === 2"
    ></app-player-in-game>
  `
})
export class PlayerComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerComponent.name);

  state: PlayerState = PlayerState.WAITING_FOR_GAME;

  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {
    // let server know we can listen
    this.socketService.sendMessage({
      payload: null,
      type: SocketEventType.PLAYER_HELLO
    });

    // wait if there is already a started game
    this.socketService.getGameCreated().pipe(take(1)).subscribe(() => {
      PlayerComponent.LOGGER.debug('created game session; now open dialog to join');
      this.state = PlayerState.JOIN_GAME;
    });

  }

  ngOnDestroy(): void {
  }


}


export enum PlayerState {
  WAITING_FOR_GAME,
  JOIN_GAME,
  IN_GAME
}
