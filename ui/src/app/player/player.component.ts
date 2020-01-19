import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientGameStateService, ClientRole, ClientState } from '../common/client-state.service';
import { Log } from 'ng-log';
import { take } from 'rxjs/operators';
import { PlayerService } from './player.service';
import { CommonGameService } from '../common/common-game.service';
import { PublicGameStatusDto } from '../common/model/public-game-status-dto';

@Component({
  selector: 'app-player',
  template: `
    Spieler
  `
})
export class PlayerComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerComponent.name);

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }


}
