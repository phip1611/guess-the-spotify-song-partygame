import { Component, OnInit, signal } from '@angular/core';
import { GameMasterService } from '../game-master.service';
import { SocketService } from '../../common/socket.service';
import { Subscription } from 'rxjs';
import { Log } from '../../common/logging/logger';
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
              [disabled]="!playback()?.playedOnce"
              mat-raised-button color="accent"
              (click)="toggleSolution()">
              Lösung
            </button>
          </div>
          <div class="col-6 col-md-4">
            <button class="w-100"
              [disabled]="playback()?.isPlaying"
              mat-raised-button color="warn"
              (click)="onPlaySong()">
              Song abspielen
            </button>
          </div>
          <div class="col-12 col-md-4 mt-2 mt-md-0">
            @if (gameMasterService.hasMoreSongs()) {
              <button class="w-100"
                [disabled]="!playback()?.playedOnce || !solutionShowedOnce()"
                mat-raised-button color="primary"
                (click)="onNextRound()">
                Nächste Runde
              </button>
            }
            @if (!gameMasterService.hasMoreSongs()) {
              <button class="w-100"
                [disabled]="true" mat-raised-button>
                Spiel vorbei :)
              </button>
            }
          </div>
        </div>
      </mat-card>
    
      <!-- solution and player buzzer times on same row -->
      <div class="row mt-3">
        @if (!showSolution() && !buzzerTimeByPlayerName().length) {
          <div class="col-12 offset-0 col-lg-8 offset-lg-2">
            <app-player-points></app-player-points>
          </div>
        }
    
        @if (showSolution() && !buzzerTimeByPlayerName().length || !showSolution() && buzzerTimeByPlayerName().length) {
          <div class="col-12 offset-0 col-lg-8 offset-lg-2">
            @if (showSolution()) {
              <app-spotify-songcard [playback]="playback()"></app-spotify-songcard>
            }
            @if (buzzerTimeByPlayerName().length) {
              <app-player-buzzer-times
                [times]="buzzerTimeByPlayerName()"
              ></app-player-buzzer-times>
            }
            <app-player-points class="mt-3"></app-player-points>
          </div>
        }
    
        @if (showSolution() && buzzerTimeByPlayerName().length) {
          <div class="col-12 mb-3 col-lg-6 mb-lg-0">
            <app-spotify-songcard
              [playback]="playback()"
            ></app-spotify-songcard>
          </div>
          <div class="col-12 col-lg-6">
            <app-player-buzzer-times [times]="buzzerTimeByPlayerName()"></app-player-buzzer-times>
            <app-player-points class="mt-3"></app-player-points>
          </div>
        }
      </div>
    </div>
    `,
    standalone: false
})
export class InGameComponent implements OnInit {

  private static readonly LOGGER = new Log(InGameComponent.name);

  isVeryFirstRound: boolean = true;

  readonly playback = signal<Playback | null>(null);

  readonly showSolution = signal(false);

  readonly solutionShowedOnce = signal(false);

  playerBuzzerSubscription?: Subscription;

  readonly buzzerTimeByPlayerName = signal<PlayerBuzzerTimesType>([]);

  constructor(public gameMasterService: GameMasterService,
              private socketService: SocketService) {
  }

  ngOnInit(): void {
    // when this component is shown it shall start the first game round
    this.onNextRound();
  }

  onPlaySong(): void {
    const playback = this.playback();
    if (!playback) {
      return;
    }

    this.socketService.sendMessage({
      type: SocketEventType.GM_ENABLE_BUZZER,
      payload: null
    });
    playback.play();

    this.playerBuzzerSubscription = this.socketService.getPlayerBuzzered().subscribe(playerId => {
      const firstPlayedTime = playback.firstPlayedTime;
      if (!firstPlayedTime) {
        return;
      }

      const millis = new Date().getTime() - firstPlayedTime.getTime();
      const seconds = millis / 1000;
      const currentTimes = this.buzzerTimeByPlayerName();

      if (currentTimes.map((p) => p.playerName).includes(playerId)) {
        InGameComponent.LOGGER.debug(`PLAYER_BUZZER by player '${playerId}' received multiple times; ignore`);
      } else {
        InGameComponent.LOGGER.debug(`PLAYER_BUZZER received by player '${playerId}'`);
        const nextTimes = [...currentTimes, {
          seconds: seconds, playerName: playerId
        }];
        InGameComponent.LOGGER.debug(`buzzerTimeByPlayerName:`);
        InGameComponent.LOGGER.debug(JSON.stringify(nextTimes));
        this.buzzerTimeByPlayerName.set(nextTimes);
      }
    });
  }

  onNextRound() {
    // just increment the round counter
    this.gameMasterService.nextRound();
    InGameComponent.LOGGER.debug(
      `Starting Round ${this.gameMasterService.getRound()}/${this.gameMasterService.getTotalRounds()}`
    );

    this.showSolution.set(false);

    // disable all buzzer buttons
    this.socketService.sendMessage({
      type: SocketEventType.GM_START_NEXT_ROUND,
      payload: null
    });

    if (!this.isVeryFirstRound) {
      this.playback()?.stop();
      // reset everything
      this.solutionShowedOnce.set(false);
      this.playerBuzzerSubscription?.unsubscribe();
      this.buzzerTimeByPlayerName.set([]);
    } else {
      this.isVeryFirstRound = false;
    }

    // prepare audio playback
    const nextSong = this.gameMasterService.getRandomSongAndMarkAsPlayed();
    this.playback.set(new Playback(nextSong));
  }

  toggleSolution(): void {
    this.showSolution.update((showSolution) => !showSolution);
    this.solutionShowedOnce.set(true);
  }
}

/**
 * Represents a playback during a single game round for one song.
 */
export class Playback {

  private readonly playedOnceState = signal(false);

  private readonly isPlayingState = signal(false);

  private readonly firstPlayedTimeState = signal<Date | null>(null);

  get playedOnce(): boolean {
    return this.playedOnceState();
  }

  get isPlaying(): boolean {
    return this.isPlayingState();
  }

  get firstPlayedTime(): Date | null {
    return this.firstPlayedTimeState();
  }

  get spotifyTrack(): any {
    return this._spotifyTrack;
  }

  private static readonly LOGGER = new Log(Playback.name);

  private readonly _spotifyTrack: any;

  private audio: HTMLAudioElement;

  constructor(spotifyTrack: SpotifyPlaylistTrack) {
    this._spotifyTrack = spotifyTrack;
    this.audio = new Audio(spotifyTrack.preview_url);
    this.audio.addEventListener('ended', () => this.stop());
  }

  public play(): void {
    if (this.isPlayingState()) {
      Playback.LOGGER.debug('music is already playing!');
      return;
    }
    if (!this.firstPlayedTimeState()) {
      this.firstPlayedTimeState.set(new Date());
    }
    this.playedOnceState.set(true);
    this.isPlayingState.set(true);
    this.audio.play();
  }

  public stop(): void {
    this.isPlayingState.set(false);
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
