import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../../common/socket.service';

@Component({
  selector: 'app-player-in-game',
  template: `
    Spieler in game
  `
})
export class PlayerInGameComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerInGameComponent.name);

  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }


}
