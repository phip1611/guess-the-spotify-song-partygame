import { Component, OnInit, signal } from '@angular/core';
import { Log } from '../common/logging/logger';
import { SocketService } from '../common/socket.service';
import { ActivatedRoute } from '@angular/router';
import { SocketEventType } from '../../../../common-ts/socket-events';
import { CommonClientService } from '../common/common-client.service';

@Component({
    selector: 'app-player',
    template: `
    @if (state() === 0) {
      <app-player-join-game
        (done)="onGameStarts()"
      ></app-player-join-game>
    }
    @if (state() === 1) {
      <app-player-in-game
      ></app-player-in-game>
    }
    `,
    standalone: false
})
export class PlayerComponent implements OnInit {

  private static readonly LOGGER = new Log(PlayerComponent.name);

  readonly state = signal(PlayerState.JOIN_GAME);

  constructor(private socketService: SocketService,
              private route: ActivatedRoute,
              private clientService: CommonClientService) {
  }

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.clientService.playerType = 'player';

      // let server know we can listen
      this.clientService.gameId = gameId;
      this.socketService.sendMessage({
        payload: gameId,
        type: SocketEventType.PLAYER_HELLO
      });
      this.socketService.getServerConfirm().subscribe(uuid => {
        this.clientService.clientUuid = uuid;
        PlayerComponent.LOGGER.info('PLAYER_HELLO von Server bestätigt');
      });
    }
  }


  onGameCreated() {
    this.state.set(PlayerState.JOIN_GAME);
  }

  onGameStarts() {
    this.state.set(PlayerState.IN_GAME);
  }
}


export enum PlayerState {
  JOIN_GAME,
  IN_GAME
}
