import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../../common/spotify-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameMasterService } from '../game-master.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-gm-create-new-game',
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
              <input matInput type="number" placeholder="Anzahl Runden" value="10" formControlName="rounds">
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
export class CreateNewGameComponent implements OnInit {

  private static readonly LOGGER = new Log(CreateNewGameComponent.name);

  form: FormGroup;

  @Output()
  done = new EventEmitter();

  constructor(private spotifyService: SpotifyApiService,
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
    const rounds = this.form.get('rounds').value;
    this.spotifyService.getPlaylistData(this.form.get('spotifyPlaylist').value).subscribe(songs => {
      this.gameMasterService.createGame(songs, rounds);
      this.done.next();
    }, (err: HttpErrorResponse) => {
      CreateNewGameComponent.LOGGER.error('Failure during fetching data from spotify! Error is');
      CreateNewGameComponent.LOGGER.error(err.message);
    });
  }
}
