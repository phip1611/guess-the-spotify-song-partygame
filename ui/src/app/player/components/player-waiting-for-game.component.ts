import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../../common/socket.service';

@Component({
  selector: 'app-player-waiting-for-game',
  template: `
    
    <h3 class="mt-3 text-center">Bitte warte, bis der Gamemaster das Spiel startet :)</h3>

    <div class="d-flex justify-content-center mt-3">
      <div class="lds-facebook">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  `
})
export class PlayerWaitingForGameComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerWaitingForGameComponent.name);

  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }


}

