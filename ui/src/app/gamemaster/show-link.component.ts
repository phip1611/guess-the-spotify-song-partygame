import { Component, OnInit } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../common/client-state.service';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../common/spotify-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameMasterService } from './game-master.service';

@Component({
  selector: 'app-show-link',
  template: `
    <ng-container *ngIf="clientGameStateService.getState()?.gameId">
      Teile diesen Link mit deinen Freunden, damit sie dem Spiel beitreten können:
      <mat-chip-list>
        <mat-chip color="primary" selected>
          http://localhost:4200/game/{{clientGameStateService.getState()?.gameId}}</mat-chip>
      </mat-chip-list>
    </ng-container>
  `
})
export class ShowLinkComponent implements OnInit {

  constructor(private clientGameStateService: ClientGameStateService) {
  }


  ngOnInit(): void {
  }

}
