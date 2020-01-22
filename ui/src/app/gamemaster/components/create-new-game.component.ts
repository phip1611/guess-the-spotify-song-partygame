import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../../common/spotify-api.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { GameMasterService } from '../game-master.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-gm-create-new-game',
  template: `
    <ng-container *ngIf="!spotifyService.isConnected()">
      <mat-card>
        <div class="d-flex justify-content-center">
          <button mat-raised-button color="primary" (click)="onConnect()"
          >
            <mat-icon>music_note</mat-icon>
            Bei Spotify einloggen
          </button>
        </div>
      </mat-card>
    </ng-container>

    <mat-card *ngIf="spotifyService.isConnected()">
      <div class="row">
        <div class="col-2 col-lg-1 mt-3 text-center">
          <mat-icon>link</mat-icon>
        </div>
        <div class="col-10 col-lg-11">
          <form *ngIf="form" [formGroup]="form">
            <mat-form-field class="w-100">
              <input matInput placeholder="Spotify-Playlist" formControlName="spotifyPlaylist">
              <mat-hint align="start">ID, Spotify-Link (spotify:playlist:) oder HTTPS</mat-hint>
            </mat-form-field>
          </form>
        </div>
        <div class="col-12 mt-3">
          <button [disabled]="!form.valid"
                  class="w-100" mat-raised-button color="primary" (click)="startGame()">
            Neues Spiel starten
          </button>
        </div>
      </div>
    </mat-card>

  `
})
export class CreateNewGameComponent implements OnInit {

  private static readonly LOGGER = new Log(CreateNewGameComponent.name);

  form: FormGroup;

  @Output()
  done = new EventEmitter();

  constructor(public spotifyService: SpotifyApiService,
              private gameMasterService: GameMasterService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      spotifyPlaylist: ['', [Validators.required, spotifyPlaylistValidator]]
    });
  }

  onConnect() {
    this.spotifyService.openAuthWebsite();
  }

  startGame() {
    this.spotifyService.getPlaylistData(this.form.get('spotifyPlaylist').value).subscribe(songs => {
      this.gameMasterService.createGame(songs);
      this.done.next();
    }, (err: HttpErrorResponse) => {
      CreateNewGameComponent.LOGGER.error('Failure during fetching data from spotify! Error is');
      CreateNewGameComponent.LOGGER.error(err.message);
      if (err.status === 401) {
        this.spotifyService.setAuthToken(null);
        this.spotifyService.openAuthWebsite();
      }
    });
  }
}

export const spotifyPlaylistValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as string;
  const playlistId = SpotifyApiService.parseIdString(value);
  if (!playlistId) {
    return {invalid: 'no valid id input'};
  }

  // now character and length validation
  // length validation is not exact because i dont know
  // if spotify ids will always have a fixed length
  if (playlistId.length < 5 || playlistId.length > 40) {
    return {length: 'input too short for a playlist id'}
  }
  if (!playlistId.match(/^[A-z0-9]+$/)) {
    return {length: 'ID doesnt match [A-z0-9]+'}
  }

  return null;
};
