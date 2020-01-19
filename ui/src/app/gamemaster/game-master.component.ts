import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../common/client-state.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../common/spotify-api.service';
import { CommonGameService } from '../common/common-game.service';

@Component({
  selector: 'app-game-master',
  template: `
    Gamemaster
  `
})
export class GameMasterComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(GameMasterComponent.name);

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }
}
