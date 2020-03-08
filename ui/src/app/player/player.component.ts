import { Component, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../common/socket.service';
import { ActivatedRoute } from '@angular/router';
import { SocketEventType } from '../../../../common-ts/socket-events';
import { CommonClientService } from '../common/common-client.service';

@Component({
  selector: 'app-player',
  template: `
    <app-player-join-game *ngIf="state === 0"
                          (done)="onGameStarts()"
    ></app-player-join-game>
    <app-player-in-game *ngIf="state === 1"
    ></app-player-in-game>
  `
})
export class PlayerComponent implements OnInit {

  private static readonly LOGGER = new Log(PlayerComponent.name);

  state: PlayerState = PlayerState.JOIN_GAME;

  constructor(private socketService: SocketService,
              private route: ActivatedRoute,
              private clientService: CommonClientService) {
  }

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
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
    this.state = PlayerState.JOIN_GAME;
  }

  onGameStarts() {
    this.state = PlayerState.IN_GAME;
  }
}


export enum PlayerState {
  JOIN_GAME,
  IN_GAME
}
