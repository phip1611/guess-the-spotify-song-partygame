import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientGameStateService, ClientRole, ClientState } from '../common/client-state.service';
import { Log } from 'ng-log';
import { take } from 'rxjs/operators';
import { PlayerService } from './player.service';
import { CommonGameService } from '../common/common-game.service';
import { PublicGameStatusDto } from '../common/model/public-game-status-dto';

@Component({
  selector: 'app-player',
  template: `
    Folgende Spieler sind beigetreten:
    <mat-chip-list>
      <ng-container *ngFor="let player of currentGameState?.players">
        <mat-chip *ngIf="player === currentClientState.playerId" color="primary" selected>
          {{ player }}
        </mat-chip>
        <mat-chip *ngIf="player !== currentClientState.playerId" color="accent">
          {{ player }}
        </mat-chip>
      </ng-container>
    </mat-chip-list>
  `
})
export class PlayerComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerComponent.name);

  currentClientState: ClientState;

  currentGameState: PublicGameStatusDto;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private playerService: PlayerService,
              private commonGameService: CommonGameService,
              private clientGameStateService: ClientGameStateService) {
  }

  ngOnInit(): void {
    this.clientGameStateService.getState$().pipe(take(1)).subscribe(state => {
      this.currentClientState = state;
      if (!state) {
        const paramGameId = this.route.snapshot.paramMap.get('id');
        if (paramGameId) {
          const name = this.playerService.generateName();
          const state = {
            gameId: paramGameId,
            role: ClientRole.PLAYER,
            playerId: name
          };
          this.initPlayer(state);
          this.clientGameStateService.updateClientState(state);
        }
      } else {
        this.initPlayer(state);
      }
    });
  }

  initPlayer(state: ClientState) {
    this.playerService.addPlayerToGame(state.gameId, state.playerId).subscribe(() => {
      PlayerComponent.LOGGER.debug('Added player to game!');
    });
    this.commonGameService.getCurrentGameStateUntilStarted(state.gameId).subscribe(state =>
      this.currentGameState = state
    );
  }

  ngOnDestroy(): void {
  }


}
