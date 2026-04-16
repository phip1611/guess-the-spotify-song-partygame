import { Component, Input } from '@angular/core';
import { PlayerBuzzerTimesType } from '../in-game.component';

@Component({
    selector: 'app-player-buzzer-times',
    template: `
    @if (times.length) {
      <mat-card>
        <mat-list>
          @for (e of times; track e; let i = $index) {
            <mat-list-item>{{e.playerName}} - {{e.seconds}}s</mat-list-item>
            @if (i < times.length - 1) {
              <mat-divider></mat-divider>
            }
          }
        </mat-list>
      </mat-card>
    }
    `,
    standalone: false
})
export class PlayerBuzzerTimesComponent {

  @Input()
  times: PlayerBuzzerTimesType = [];

}
