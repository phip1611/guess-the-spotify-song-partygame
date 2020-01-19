import { Component, OnInit } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../common/client-state.service';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../common/spotify-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameMasterService } from './game-master.service';

@Component({
  selector: 'app-start-new-game',
  template: `
    <ng-container *ngIf="!spotifyService.isConnected()">
      <button mat-raised-button color="primary" (click)="onConnect()"
      ><mat-icon>music_note</mat-icon> Bei Spotify einloggen</button>
    </ng-container>
    <mat-card *ngIf="spotifyService.isConnected()">
      <form class="w-100" *ngIf="form" [formGroup]="form">
        <mat-form-field class="w-100">
          <input matInput placeholder="Spotify-Playlist (Link)" formControlName="spotifyPlaylist">
        </mat-form-field>

        <div class="row">
          <div class="col-4 col-lg-6">
            <mat-form-field class="w-100" color="primary">
              <input matInput type="number" placeholder="Anzahl Runden" formControlName="rounds">
            </mat-form-field>
          </div>
          <div class="col-8 col-lg-4 offset-lg-2 mt-3">
            <button
              [disabled]="!form.valid"
              class="w-100" mat-raised-button color="primary" (click)="startGame()">Neues Spiel starten</button>
          </div>
        </div>

      </form>
    </mat-card>

  `
})
export class StartNewGameComponent implements OnInit {

  private static readonly LOGGER = new Log(StartNewGameComponent.name);

  form: FormGroup;

  constructor(private spotifyService: SpotifyApiService,
              private clientGameStateService: ClientGameStateService,
              private gameMasterService: GameMasterService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      spotifyPlaylist: ['', Validators.required],
      rounds: [1, [Validators.required, Validators.min(1)]],
    });
  }

  onConnect() {
    this.spotifyService.openAuthWebsite();
  }

  startGame() {
    const {spotifyPlaylist, rounds} = this.form.getRawValue();
    this.spotifyService.getPlaylistData(spotifyPlaylist).subscribe(data => {
      const songIds = [];
      data.forEach(entry => {
        const track = entry.track;
        songIds.push(track.id);
      });
      this.gameMasterService.startNewGame({rounds: rounds, songIds: songIds}).subscribe((gameId) => {
        StartNewGameComponent.LOGGER.debug('Started game, id is: ' + gameId);
        this.clientGameStateService.updateClientState({gameId: gameId, role: ClientRole.GAME_MASTER, playerId: null});
      });
    });
  }
}
