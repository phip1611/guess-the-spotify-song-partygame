import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../common/socket.service';
import { CommonClientService } from '../common/common-client.service';

@Component({
  selector: 'app-game-master',
  template: `
    <app-gm-create-new-game *ngIf="state === 0"
                            (done)="onNewGameCreated()"
    ></app-gm-create-new-game>
    <app-gm-show-link *ngIf="state === 1"
                      (done)="onGameStarted()"
    ></app-gm-show-link>
    <app-gm-in-game *ngIf="state === 2"
    ></app-gm-in-game>
  `
})
export class GameMasterComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(GameMasterComponent.name);

  public state: GameMasterState = GameMasterState.CREATE_GAME;

  constructor(private clientService: CommonClientService) {
  }

  ngOnInit(): void {
    this.clientService.playerType = 'gameMaster';
  }

  ngOnDestroy(): void {
  }

  onNewGameCreated() {
    // this.state += 1;
    this.state = GameMasterState.INVITE_LINK;
  }

  onGameStarted() {
    this.state = GameMasterState.IN_GAME;
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
