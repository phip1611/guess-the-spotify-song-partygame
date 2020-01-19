import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../common/client-state.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../common/spotify-api.service';
import { CommonGameService } from '../common/common-game.service';

@Component({
  selector: 'app-game-master',
  template: `
    <app-start-new-game *ngIf="gameMasterState === 'CREATE_GAME'"
    ></app-start-new-game>
    <app-show-link *ngIf="gameMasterState === 'INVITE_LINK'"
                   (gameStarted)="onGameStarted()"
    ></app-show-link>
    <app-in-game *ngIf="gameMasterState === 'IN_GAME'"
    ></app-in-game>
  `
})
export class GameMasterComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(GameMasterComponent.name);

  private subscription: Subscription;

  gameMasterState: GameMasterState/* = GameMasterState.CREATE_GAME*/;

  constructor(private clientGameStateService: ClientGameStateService,
              private spotifyService: SpotifyApiService,
              private commonGameService: CommonGameService,
              private router: Router) {
  }

  ngOnInit(): void {
    GameMasterComponent.LOGGER.debug('ngOnInit called!');
    this.clientGameStateService.getState$().subscribe(state => {
      if (state && state.role === ClientRole.PLAYER) {
        GameMasterComponent.LOGGER.debug('Redirecting to /player');
        this.router.navigateByUrl('/game/' + state.gameId);
        return;
      }

      if (!state) {
        this.gameMasterState = GameMasterState.CREATE_GAME;
      } else {
        this.commonGameService.getCurrentGameState(state.gameId).subscribe(state => {
          if (!state.started) {
            this.gameMasterState = GameMasterState.INVITE_LINK;
          } else {
            this.gameMasterState = GameMasterState.IN_GAME;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  onGameStarted() {
    this.gameMasterState = GameMasterState.IN_GAME;
  }
}

export enum GameMasterState {
  CREATE_GAME = 'CREATE_GAME',
  INVITE_LINK = 'INVITE_LINK',
  IN_GAME = 'IN_GAME'
}
