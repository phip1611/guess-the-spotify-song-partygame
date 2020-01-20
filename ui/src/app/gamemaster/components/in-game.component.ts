import { Component, OnInit } from '@angular/core';
import { GameMasterService } from '../game-master.service';
import { SocketService } from '../../common/socket.service';
import { SocketEventType } from '../../common/model/socket-events';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gm-in-game',
  template: `
    <mat-card>
      <div class="row">
        <div class="col">
          <button class="w-100"
                  [disabled]="!songPlayedOnce"
                  mat-raised-button color="accent" (click)="showSolution = !showSolution; solutionShowedOnce = true">
            Lösung
          </button>
        </div>
        <div class="col">
          <button class="w-100"
                  [disabled]="!playSongButtonEnabled" mat-raised-button color="warn" (click)="onSongPlayed()">Song
            abspielen
          </button>
        </div>
        <div class="col">
          <button class="w-100"
                  [disabled]="!songPlayedOnce || !solutionShowedOnce"
                  mat-raised-button color="primary" (click)="onNextRound()">Nächste Runde
          </button>
        </div>
      </div>
    </mat-card>

    <ng-container *ngIf="showSolution">
      <div class="row mt-3">
        <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{currentSong.name}}</mat-card-title>
              <mat-card-subtitle>{{getArtistsStringFromCurrentSong()}}
                - {{currentSong.album.name}}</mat-card-subtitle>
            </mat-card-header>
            <img mat-card-image [src]="currentSong?.album?.images[0]?.url">
          </mat-card>
        </div>
      </div>
    </ng-container>

    <div *ngIf="buzzerTimeByPlayerName.length">
      <mat-card class="mt-3">
        <mat-list>
          <ng-container *ngFor="let e of buzzerTimeByPlayerName; let i = index">
            <mat-list-item>{{e.playerName}} - {{e.seconds}}s</mat-list-item>
            <mat-divider *ngIf="i !== buzzerTimeByPlayerName.length"></mat-divider>
          </ng-container>
        </mat-list>
      </mat-card>
    </div>

  `
})
export class InGameComponent implements OnInit {

  showSolution: boolean;

  currentSong: any;

  playSongButtonEnabled = true;

  songPlayedOnce = false;

  solutionShowedOnce = false;

  playerBuzzerSubscription: Subscription;

  songPlayedStartTime: Date = null;

  buzzerTimeByPlayerName: {playerName: string, seconds: number}[] = [];

  constructor(private gameMasterService: GameMasterService,
              private socketService: SocketService) {
  }

  ngOnInit(): void {
    // when this component is shown it shall start the first game round
    this.onNextRound();
  }

  onSongPlayed(): void {
    this.songPlayedOnce = true;
    if (!this.songPlayedStartTime) {
      this.songPlayedStartTime = new Date();
    }
    this.playSongButtonEnabled = false;
    this.socketService.sendMessage({
      type: SocketEventType.GM_ENABLE_BUZZER,
      payload: null
    });
    const audio = new Audio(this.currentSong.preview_url);
    audio.play();
    audio.addEventListener('ended', () => this.playSongButtonEnabled = true);

    this.socketService.getPlayerBuzzered().subscribe(playerId => {
      const millis = new Date().getTime() - this.songPlayedStartTime.getTime();
      const seconds = millis / 1000;
      this.buzzerTimeByPlayerName.push({
        seconds: seconds, playerName: playerId
      });
    });
  }

  onNextRound() {
    // todo mechanism that stops playback of song if desired
    this.playSongButtonEnabled = true;
    this.songPlayedOnce = false;
    this.solutionShowedOnce = false;

    if (this.playerBuzzerSubscription) {
      this.playerBuzzerSubscription.unsubscribe();
    }
    this.buzzerTimeByPlayerName = [];
    this.songPlayedStartTime = null;

    this.currentSong = this.gameMasterService.getRandomSongAndMarkAsPlayed();
    this.socketService.sendMessage({
      type: SocketEventType.GM_START_NEXT_ROUND,
      payload: null
    });
  }

  private getArtistsStringFromCurrentSong(): string {
    const val = this.currentSong.artists.map(x => x.name).reduce((a, b) => a + ', ' + b) as string;
    if (val.includes(', ')) {
      return val.substr(0, val.length - 2);
    } else {
      return val;
    }
  }
}
