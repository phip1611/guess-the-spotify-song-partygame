import { Component, OnInit } from '@angular/core';
import { Log } from '../../../common/logging/logger';
import { GameMasterService } from '../../game-master.service';


@Component({
    selector: 'app-player-points',
    template: `
    <mat-list>
      @for (player of playerPoints(); track player; let i = $index) {
        <mat-list-item>
          <!-- controls rechts -->
          <div class="d-flex w-100 justify-content-between">
            <div>
              <mat-chip class="me-3">{{player.points}}</mat-chip>
              <span class="d-inline-block me-3">{{player.playerName}}</span>
            </div>
            <div>
              <mat-chip class="me-1" (click)="addPoint(i)">
                <mat-icon>add</mat-icon>
              </mat-chip>
              <mat-chip (click)="removePoint(i)">
                <mat-icon>remove</mat-icon>
              </mat-chip>
            </div>
          </div>
        </mat-list-item>
        @if (i < playerPoints().length - 1) {
          <mat-divider></mat-divider>
        }
      }
    </mat-list>
    `,
    standalone: false
})
export class PlayerPointsComponent implements OnInit {

  private static readonly LOGGER = new Log(PlayerPointsComponent.name);

  readonly playerPoints = this.gameMasterService.pointsPerPlayer;

  constructor(private gameMasterService: GameMasterService) {
  }

  ngOnInit(): void {}

  addPoint(index: number): void {
    this.gameMasterService.addPoint(index);
  }

  removePoint(index: number): void {
    this.gameMasterService.removePoint(index);
  }

}
