import { Component, OnInit } from '@angular/core';
import { GameMasterService } from '../game-master.service';
import { SocketService } from '../../common/socket.service';
import { Subscription } from 'rxjs';
import { Log } from 'ng-log';
import { SocketEventType } from '../../../../../common-ts/socket-events';
import { SpotifyPlaylistTrack } from '../../common/spotify-playlist-track';

export type PlayerBuzzerTimesType = { playerName: string, seconds: number }[];

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
            <button *ngIf="gameMasterService.hasMoreSongs()" class="w-100"
                    [disabled]="!playback?.playedOnce || !solutionShowedOnce"
                    mat-raised-button color="primary"
                    (click)="onNextRound()">
              Nächste Runde
            </button>
            <button *ngIf="!gameMasterService.hasMoreSongs()" class="w-100"
                    [disabled]="true" mat-raised-button>
              Spiel vorbei :)
            </button>
          </div>
        </div>
      </mat-card>

      <!-- solution and player buzzer times on same row -->
      <div class="row mt-3">
        <ng-container *ngIf="!showSolution && !buzzerTimeByPlayerName.length">
          <div class="col-12 offset-0 col-lg-8 offset-lg-2">
            <app-player-points></app-player-points>
          </div>
        </ng-container>

        <ng-container
          *ngIf="showSolution && !buzzerTimeByPlayerName.length || !showSolution && buzzerTimeByPlayerName.length">
          <div class="col-12 offset-0 col-lg-8 offset-lg-2">
            <app-spotify-songcard *ngIf="showSolution" [playback]="playback"></app-spotify-songcard>
            <app-player-buzzer-times *ngIf="buzzerTimeByPlayerName.length"
                                     [times]="buzzerTimeByPlayerName"
            ></app-player-buzzer-times>
            <app-player-points class="mt-3"></app-player-points>
          </div>
        </ng-container>

        <ng-container *ngIf="showSolution && buzzerTimeByPlayerName.length">
          <div class="col-12 mb-3 col-lg-6 mb-lg-0">
            <app-spotify-songcard
              [playback]="playback"
            ></app-spotify-songcard>
          </div>
          <div class="col-12 col-lg-6">
            <app-player-buzzer-times [times]="buzzerTimeByPlayerName"></app-player-buzzer-times>
            <app-player-points class="mt-3"></app-player-points>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class InGameComponent implements OnInit {

  private static readonly LOGGER = new Log(InGameComponent.name);

  isVeryFirstRound: boolean = true;

  playback: Playback;

  showSolution: boolean;

  solutionShowedOnce = false;

  playerBuzzerSubscription: Subscription;

  buzzerTimeByPlayerName: PlayerBuzzerTimesType = [];

  constructor(public gameMasterService: GameMasterService,
              private socketService: SocketService) {
  }

  ngOnInit(): void {
    // when this component is shown it shall start the first game round
    this.onNextRound();
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
      const tmpArr = this.buzzerTimeByPlayerName;
      this.buzzerTimeByPlayerName = [];
      if (tmpArr.map(p => p.playerName).includes(playerId)) {
        InGameComponent.LOGGER.debug(`PLAYER_BUZZER for player '${playerId}' received multiple times; ignore`);
      } else {
        tmpArr.push({
          seconds: seconds, playerName: playerId
        });
      }
      // do trigger angular change detection
      this.buzzerTimeByPlayerName = tmpArr;
    });
  }

  onNextRound() {
    // just increment the round counter
    this.gameMasterService.nextRound();
    InGameComponent.LOGGER.debug(
      `Starting Round ${this.gameMasterService.getRound()}/${this.gameMasterService.getTotalRounds()}`
    );

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
      this.playerBuzzerSubscription.unsubscribe();
      this.buzzerTimeByPlayerName = [];
    } else {
      this.isVeryFirstRound = false;
    }

    // prepare audio playback
    const nextSong = this.gameMasterService.getRandomSongAndMarkAsPlayed();
    this.playback = new Playback(nextSong);
  }
}

/**
 * Represents a playback during a single game round for one song.
 */
export class Playback {

  get playedOnce(): boolean {
    return this._playedOnce;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get firstPlayedTime(): Date {
    return this._firstPlayedTime;
  }

  get spotifyTrack(): any {
    return this._spotifyTrack;
  }

  private static readonly LOGGER = new Log(Playback.name);

  private readonly _spotifyTrack: any;

  private audio: HTMLAudioElement;

  private _playedOnce: boolean = false;

  private _isPlaying: boolean = false;

  private _firstPlayedTime: Date;

  constructor(spotifyTrack: SpotifyPlaylistTrack) {
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
    return this._spotifyTrack.album?.images[0]?.url;
  }
}
