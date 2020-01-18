import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientGameStateService, ClientRole } from '../common/game.service';
import { Log } from 'ng-log';

@Component({
  selector: 'app-player',
  template: `
    Player
  `
})
export class PlayerComponent implements OnInit {

  private static readonly LOGGER = new Log(PlayerComponent.name);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private clientGameStateService: ClientGameStateService) {
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      if (data && data.id) {
        this.clientGameStateService.updateClientState({
          gameId: data.id,
          role: ClientRole.PLAYER
        });
      } else if (!this.clientGameStateService.getState()
        || this.clientGameStateService.getState().role === ClientRole.GAME_MASTER) {
        PlayerComponent.LOGGER.debug('Redirecting from PlayerComponent to GameMasterComponent');
        this.router.navigateByUrl('/');
      }
      /*this.clientGameStateService.getState().subscribe(state => {
        if (!state) {

        } else {

        }
      });*/
    });
  }


}
