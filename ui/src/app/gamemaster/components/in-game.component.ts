import { Component, OnInit } from '@angular/core';
import { GameMasterService } from '../game-master.service';
import { SocketService } from '../../common/socket.service';
import { SocketEventType } from '../../common/model/socket-events';

@Component({
  selector: 'app-gm-in-game',
  template: `
    <mat-card>
      <div class="row">
        <div class="col">
          <button class="w-100"
                  [disabled]="showSolution"
                  mat-raised-button color="accent" (click)="showSolution = true">Lösung
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
              <mat-card-title>{{currentSong.track.name}}</mat-card-title>
              <mat-card-subtitle>{{getArtistsStringFromCurrentSong()}}
                - {{currentSong.track.album.name}}</mat-card-subtitle>
            </mat-card-header>
            <img mat-card-image [src]="currentSong.track?.album?.images[0]?.url">
          </mat-card>
        </div>
      </div>
    </ng-container>

  `
})
export class InGameComponent implements OnInit {

  showSolution: boolean;

  currentSong: any;

  playSongButtonEnabled = true;

  constructor(private gameMasterService: GameMasterService,
              private socketService: SocketService) {
  }

  ngOnInit(): void {
    // when this component is shown it shall start the first game round
    this.onNextRound();
  }

  onSongPlayed(): void {
    this.playSongButtonEnabled = false;
    this.socketService.sendMessage({
      type: SocketEventType.GM_ENABLE_BUZZER,
      payload: null
    });
    const audio = new Audio(this.currentSong.track.preview_url);
    audio.play();
    audio.addEventListener('ended', () => this.playSongButtonEnabled = true);
  }

  onNextRound() {
    this.currentSong = this.gameMasterService.getRandomSongAndMarkAsPlayed();
    this.socketService.sendMessage({
      type: SocketEventType.GM_START_NEXT_ROUND,
      payload: null
    });
  }

  private getArtistsStringFromCurrentSong(): string {
    const val = this.currentSong.track.artists.map(x => x.name).reduce((a, b) => a + ', ' + b) as string;
    if (val.includes(', ')) {
      return val.substr(0, val.length - 2);
    } else {
      return val;
    }
  }
}
