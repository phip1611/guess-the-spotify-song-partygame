import { Component, OnInit } from '@angular/core';
import { GameMasterService } from '../game-master.service';
import { SocketService } from '../../common/socket.service';
import { SocketEventType } from '../../common/model/socket-events';
import { Subscription } from 'rxjs';
import { Log } from 'ng-log';

@Component({
  selector: 'app-gm-in-game',
  template: `
    <div class="mb-3">
      <!-- if content is higher than display to have a margin at the bottom -->

      <mat-card>
        <div class="row">
          <div class="col-6 col-md-4">
            <button class="w-100"
                    [disabled]="!playback?.playedOnce"
                    mat-raised-button color="accent"
                    (click)="showSolution = !showSolution; solutionShowedOnce = true">
              Lösung
            </button>
          </div>
          <div class="col-6 col-md-4">
            <button class="w-100"
                    [disabled]="playback?.isPlaying"
                    mat-raised-button color="warn"
                    (click)="onPlaySong()">
              Song abspielen
            </button>
          </div>
          <div class="col-12 col-md-4 mt-2 mt-md-0">
            <button class="w-100"
                    [disabled]="!playback?.playedOnce || !solutionShowedOnce"
                    mat-raised-button color="primary"
                    (click)="onNextRound()">Nächste Runde
            </button>
          </div>
        </div>
      </mat-card>

      <ng-container *ngIf="showSolution">
        <div class="row mt-3">
          <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{playback.getSongTitle()}}</mat-card-title>
                <mat-card-subtitle>
                  {{playback.getArtistsString()}}
                  - {{playback.getAlbumName()}}</mat-card-subtitle>
              </mat-card-header>
              <img mat-card-image [src]="playback.getImageUrl()" alt="Album image">
            </mat-card>
          </div>
        </div>
      </ng-container>

      <div *ngIf="buzzerTimeByPlayerName.length">
        <mat-card class="mt-3">
          <mat-list>
            <ng-container *ngFor="let e of buzzerTimeByPlayerName; let i = index">
              <mat-list-item>{{e.playerName}} - {{e.seconds}}s</mat-list-item>
              <mat-divider *ngIf="i < buzzerTimeByPlayerName.length - 1"></mat-divider>
            </ng-container>
          </mat-list>
        </mat-card>
      </div>

      <mat-card class="mt-3">
        <mat-list>
          <ng-container *ngFor="let player of pointsPerPlayer; let i = index">
            <mat-list-item>
              <mat-chip class="mr-3">{{player.points}}</mat-chip>
              <span class="d-inline-block mr-3">{{player.playerName}}</span>
              <mat-chip class="mr-1" (click)="addPoint(i)">
                <mat-icon>add</mat-icon>
              </mat-chip>
              <mat-chip (click)="removePoint(i)">
                <mat-icon>remove</mat-icon>
              </mat-chip>
            </mat-list-item>
            <mat-divider *ngIf="i < pointsPerPlayer.length - 1"></mat-divider>
          </ng-container>
        </mat-list>
      </mat-card>
    </div>
  `
})
export class InGameComponent implements OnInit {

  isVeryFirstRound: boolean = true;

  playback: Playback;

  showSolution: boolean;

  solutionShowedOnce = false;

  playerBuzzerSubscription: Subscription;

  buzzerTimeByPlayerName: { playerName: string, seconds: number }[] = [];

  pointsPerPlayer: { playerName: string; points: number }[] = [];

  constructor(private gameMasterService: GameMasterService,
              private socketService: SocketService) {
  }

  ngOnInit(): void {
    // when this component is shown it shall start the first game round
    this.onNextRound();
    this.gameMasterService.getPlayers().forEach(pl => {
      this.pointsPerPlayer.push({ playerName: pl, points: 0 });
    });
  }

  onPlaySong(): void {
    this.socketService.sendMessage({
      type: SocketEventType.GM_ENABLE_BUZZER,
      payload: null
    });
    this.playback.play();

    this.playerBuzzerSubscription = this.socketService.getPlayerBuzzered().subscribe(playerId => {
      const millis = new Date().getTime() - this.playback.firstPlayedTime.getTime();
      const seconds = millis / 1000;
      this.buzzerTimeByPlayerName.push({
        seconds: seconds, playerName: playerId
      });
    });
  }

  onNextRound() {
    this.showSolution = false;

    // disable all buzzer buttons
    this.socketService.sendMessage({
      type: SocketEventType.GM_START_NEXT_ROUND,
      payload: null
    });

    if (!this.isVeryFirstRound) {
      this.playback.stop(); // stop old playback if it's running
      // reset everything
      this.solutionShowedOnce = false;
      // not sure why this can be undefined here..
      this.playerBuzzerSubscription.unsubscribe();
      this.buzzerTimeByPlayerName = [];
    } else {
      this.isVeryFirstRound = false;
    }

    // prepare audio playback
    const nextSong = this.gameMasterService.getRandomSongAndMarkAsPlayed();
    this.playback = new Playback(nextSong);
  }

  addPoint(index: number): void {
    this.pointsPerPlayer[index].points++;
  }

  removePoint(index: number): void {
    this.pointsPerPlayer[index].points--;
  }
}

/**
 * Represents a playback during a single game round for one song.
 */
class Playback {

  private static readonly LOGGER = new Log(Playback.name);

  private readonly _spotifyTrack: any;

  private _playedOnce: boolean = false;

  private audio: HTMLAudioElement;

  private _isPlaying: boolean = false;

  private _firstPlayedTime: Date;

  constructor(spotifyTrack: any) {
    this._spotifyTrack = spotifyTrack;
    this.audio = new Audio(spotifyTrack.preview_url);
    this.audio.addEventListener('ended', () => this.stop());
  }

  public play(): void {
    if (this._isPlaying) {
      Playback.LOGGER.debug('music is already playing!');
      return;
    }
    if (!this._firstPlayedTime) {
      this._firstPlayedTime = new Date();
    }
    this._playedOnce = true;
    this._isPlaying = true;
    this.audio.play();
  }

  public stop(): void {
    this._isPlaying = false;
    this.audio.pause();
    this.audio.currentTime = 0; // reset for another playback
  }

  get playedOnce(): boolean {
    return this._playedOnce;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get spotifyTrack(): any {
    return this._spotifyTrack;
  }

  get firstPlayedTime(): Date {
    return this._firstPlayedTime;
  }

  getSongTitle(): string {
    return this._spotifyTrack.name;
  }

  getAlbumName(): string {
    return this._spotifyTrack.album.name;
  }

  getArtistsString(): string {
    const names = this._spotifyTrack.artists.map(x => x.name) as string[];
    return names.reduce((a, b) => a + ', ' + b);
  }

  getImageUrl(): string {
    return this._spotifyTrack.album?.images[0]?.url
  }
}
