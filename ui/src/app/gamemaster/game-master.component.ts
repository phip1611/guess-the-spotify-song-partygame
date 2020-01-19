import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../common/socket.service';
import { SocketEventType } from '../common/model/socket-events';

@Component({
  selector: 'app-game-master',
  template: `
    <app-gm-create-new-game *ngIf="state === 0"
                       (done)="onNewGameCreated()"
    ></app-gm-create-new-game>
    <app-gm-show-link *ngIf="state === 1"
    ></app-gm-show-link>
    <app-gm-in-game *ngIf="state === 2"
    ></app-gm-in-game>
  `
})
export class GameMasterComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(GameMasterComponent.name);

  public state: GameMasterState = GameMasterState.CREATE_GAME;

  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  onNewGameCreated() {
    this.state += 1;
    this.socketService.sendMessage({
      payload: null,
      type: SocketEventType.GM_CREATE_GAME
    });
  }
}

/**
 * The three states that the game master can be in.
 * Only 0 -> 1 -> 2, never back.
 */
export enum GameMasterState {
  CREATE_GAME,
  INVITE_LINK,
  IN_GAME
}
