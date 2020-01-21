import { Component, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { GameMasterService, PointsPerPlayerType } from '../../game-master.service';



@Component({
  selector: 'app-player-points',
  template: `
    <mat-list>
      <ng-container *ngFor="let player of playerPoints; let i = index">
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
        <mat-divider *ngIf="i < playerPoints.length - 1"></mat-divider>
      </ng-container>
    </mat-list>
  `
})
export class PlayerPointsComponent implements OnInit {

  private static readonly LOGGER = new Log(PlayerPointsComponent.name);

  playerPoints: PointsPerPlayerType = [];

  constructor(private gameMasterService: GameMasterService) {
  }

  ngOnInit(): void {
    this.playerPoints = this.gameMasterService.getPointsPerPlayer();
  }

  addPoint(index: number): void {
    this.gameMasterService.addPoint(index);
  }

  removePoint(index: number): void {
    this.gameMasterService.removePoint(index);
  }

}
