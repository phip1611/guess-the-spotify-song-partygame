import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../common/game.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Log } from 'ng-log';

@Component({
  selector: 'app-game-master',
  template: `
    <app-start-new-game *ngIf="!clientGameStateService.getState()"
    ></app-start-new-game>
  `
})
export class GameMasterComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(GameMasterComponent.name);

  private subscription: Subscription;

  constructor(private clientGameStateService: ClientGameStateService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.subscription = this.clientGameStateService.getState$().subscribe(state => {
      if (state && state.role === ClientRole.PLAYER) {
        GameMasterComponent.LOGGER.debug('Redirecting to /player');
        this.router.navigateByUrl('/game/' + state.gameId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

}
