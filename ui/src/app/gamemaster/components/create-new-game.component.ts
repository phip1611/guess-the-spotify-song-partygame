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
      <form class="w-100" *ngIf="form" [formGroup]="form">
        <mat-form-field class="w-100">
          <input matInput placeholder="Spotify-Playlist (Link)" formControlName="spotifyPlaylist">
        </mat-form-field>

        <div class="row">
          <div class="col-5 col-md-3 mt-2">Anzahl Runden:</div>
          <div class="col-1 mt-2">{{form?.getRawValue().rounds}}</div>
          <div class="col-6 col-md-8 ">
            <mat-slider thumbLabel
                        tickInterval="1"
                        [min]="1"
                        [max]="100"
                        class="w-100"
                        formControlName="rounds"
            ></mat-slider>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-sm-6 offset-sm-6 col-md-6 offset-md-6 col-lg-4 offset-lg-8 col-xl-3 offset-xl-9">
            <button [disabled]="!form.valid"
              class="w-100" mat-raised-button color="primary" (click)="startGame()">Neues Spiel starten
            </button>
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
      rounds: [10, [Validators.required, Validators.min(1)]],
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
      if (err.status === 401) {
        this.spotifyService.setAuthToken(null);
        this.spotifyService.openAuthWebsite();
      }
    });
  }
}
