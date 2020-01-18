import { Component, OnInit } from '@angular/core';
import { ClientGameStateService } from './common/game.service';
import { Log, LogLevel } from 'ng-log';

@Component({
  selector: 'app-root',
  template: `


    <!--<mat-menu #appMenu="matMenu">
      <button mat-menu-item>Settings</button>
      <button mat-menu-item>Help</button>
    </mat-menu>

    <button mat-icon-button [matMenuTriggerFor]="appMenu">
      <mat-icon>more_vert</mat-icon>
    </button>-->

    <mat-toolbar color="primary" class="mb-3">
      <h1 class="text-center w-100">🎶 Songs erraten - Der Partyspaß 🥳</h1>
    </mat-toolbar>


    <div class="container">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {

  constructor(private clientGameStateService: ClientGameStateService) {
  }

  ngOnInit(): void {
    this.clientGameStateService.initOnBootstrap();

    Log.$logEntry.subscribe(e => console.log(LogLevel[e.level] + ': ' + e.message));
  }

}
