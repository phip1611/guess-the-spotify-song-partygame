import { Component, Input } from '@angular/core';
import { Playback } from '../in-game.component';

@Component({
  selector: 'app-spotify-songcard',
  template: `
    <mat-card *ngIf="playback">
      <mat-card-header>
        <mat-card-title>{{playback.getSongTitle()}}</mat-card-title>
        <mat-card-subtitle>
          {{playback.getArtistsString()}}
          - {{playback.getAlbumName()}}
        </mat-card-subtitle>
      </mat-card-header>
      <img mat-card-image [src]="playback.getImageUrl()" alt="Album image">
    </mat-card>
  `
})
export class SpotifySongcardComponent {

  @Input()
  playback: Playback;

}
