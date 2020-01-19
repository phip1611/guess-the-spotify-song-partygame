import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../common/client-state.service';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../common/spotify-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameMasterService } from './game-master.service';
import { CommonGameService } from '../common/common-game.service';
import { PublicGameStatusDto } from '../common/model/public-game-status-dto';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-show-link',
  template: `
    <ng-container *ngIf="clientGameStateService.getState()?.gameId">
      Teile diesen Link mit deinen Freunden, damit sie dem Spiel beitreten können:
      <mat-chip-list>
        <mat-chip color="primary" selected>
          http://localhost:4200/game/{{clientGameStateService.getState()?.gameId}}</mat-chip>
      </mat-chip-list>
      Folgende Spieler sind beigetreten:
      <mat-chip-list>
        <mat-chip *ngFor="let player of currentGameState?.players">
          {{ player }}
        </mat-chip>
      </mat-chip-list>
      <button class="mt-3" mat-raised-button color="primary" (click)="startFirstGameRound()"
              *ngIf="currentGameState.players.length >= 2">Spiel starten
      </button>
    </ng-container>
  `
})
export class ShowLinkComponent implements OnInit {

  private static readonly LOGGER = new Log(ShowLinkComponent.name);

  currentGameState: PublicGameStatusDto;

  gameId: string;

  @Output()
  gameStarted: EventEmitter<void> = new EventEmitter<void>();

  constructor(private clientGameStateService: ClientGameStateService,
              private gameMasterService: GameMasterService,
              private spotifyApiService: SpotifyApiService,
              private commonGameService: CommonGameService) {
  }


  ngOnInit(): void {
    this.gameId = this.clientGameStateService.getState().gameId;
    this.commonGameService.getCurrentGameStateUntilStarted(this.clientGameStateService.getState().gameId)
      .subscribe(x => {
        this.currentGameState = x;
      });
  }

  startFirstGameRound(): void {
    this.gameMasterService.getNextSongId(this.gameId)
      /*.pipe(
        switchMap(songId =>
        this.spotifyApiService.getPlaylistData(songId)
      ));*/
      .pipe(
        switchMap(songId => this.gameMasterService.startNextRound(this.gameId, songId)
        )).subscribe(() => {
      ShowLinkComponent.LOGGER.debug('Started next round');
      this.gameStarted.next();
    });
  }
}
