import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../common/game.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Log } from 'ng-log';

@Component({
  selector: 'app-start-new-game',
  template: `
      <mat-card>
        <form class="w-100">
          <mat-form-field class="w-100">
            <input matInput placeholder="Spotify-Playlist (Link)">
          </mat-form-field>

          <div class="row">
            <div class="col-4 col-lg-6">
              <mat-form-field class="w-100" color="primary">
                <input matInput type="number" min="1" placeholder="Anzahl Runden">
              </mat-form-field>
            </div>
            <div class="col-8 col-lg-4 offset-lg-2 mt-3">
              <button class="w-100" mat-raised-button color="primary">Neues Spiel starten</button>
            </div>
          </div>

        </form>
      </mat-card>
    
  `
})
export class StartNewGameComponent {


}
