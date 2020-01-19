import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientGameStateService, ClientRole, ClientState } from '../common/client-state.service';
import { Log } from 'ng-log';
import { take } from 'rxjs/operators';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-player',
  template: `
    Player
  `
})
export class PlayerComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerComponent.name);

  private currentState: ClientState;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private playerService: PlayerService,
              private clientGameStateService: ClientGameStateService) {
  }

  ngOnInit(): void {
    this.clientGameStateService.getState$().pipe(take(1)).subscribe(state => {
      this.currentState = state;
      if (!state) {
        const paramGameId = this.route.snapshot.paramMap.get('id');
        if (paramGameId) {
          const name = this.playerService.generateName();
          const state = {
            gameId: paramGameId,
            role: ClientRole.PLAYER,
            playerId: name
          };
          this.initPlayer(state);
          this.clientGameStateService.updateClientState(state);
        }
      } else {
        this.initPlayer(state);
      }
    });
  }

  initPlayer(state: ClientState) {
    this.playerService.addPlayerToGame(state.gameId, state.playerId).subscribe(() => {
      PlayerComponent.LOGGER.debug('Added player to game!');
    });
  }

  ngOnDestroy(): void {
  }


}
