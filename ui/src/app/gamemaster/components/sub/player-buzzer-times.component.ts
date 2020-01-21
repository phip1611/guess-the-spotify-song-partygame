import { Component, Input } from '@angular/core';
import { Playback, PlayerBuzzerTimesType } from '../in-game.component';

@Component({
  selector: 'app-player-buzzer-times',
  template: `
    <mat-card *ngIf="times.length">
      <mat-list>
        <ng-container *ngFor="let e of times; let i = index">
          <mat-list-item>{{e.playerName}} - {{e.seconds}}s</mat-list-item>
          <mat-divider *ngIf="i < times.length - 1"></mat-divider>
        </ng-container>
      </mat-list>
    </mat-card>
  `
})
export class PlayerBuzzerTimesComponent {

  @Input()
  times: PlayerBuzzerTimesType = [];

}
