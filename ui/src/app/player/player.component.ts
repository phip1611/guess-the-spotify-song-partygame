import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketEventType, SocketService } from '../common/socket.service';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-player',
  template: `
    Spieler
  `
})
export class PlayerComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerComponent.name);

  constructor(private socketService: SocketService,
              private playerService: PlayerService) {
  }

  ngOnInit(): void {
    this.socketService.sendMessage({
      payload: this.playerService.generateName(), type: SocketEventType.PLAYER_REGISTER
    });
  }

  ngOnDestroy(): void {
  }


}
