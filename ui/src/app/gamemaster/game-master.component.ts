import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../common/socket.service';
import { SocketEventType } from '../common/model/socket-events';

@Component({
  selector: 'app-game-master',
  template: `
    Gamemaster
  `
})
export class GameMasterComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(GameMasterComponent.name);

  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.socketService.sendMessage({
      payload: null,
      type: SocketEventType.GM_CREATE_GAME
    });
    this.socketService.getPlayerRegistered().subscribe(player => {
      console.log('got data from socket, Player registred: ' + player);
    });
  }

  ngOnDestroy(): void {
  }
}
