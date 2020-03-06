import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Log } from 'ng-log';
// tslint:disable-next-line:max-line-length
import { GmEnableBuzzerPayload, GmStartNextRoundPayload, PlayerBuzzerPayload, PlayerRegisterPayload, SocketEvent, SocketEventType } from './model/socket-events';
import { SocketProvider } from './socket.provider';
import { PlayerService } from '../player/player-master.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private static readonly LOGGER = new Log(SocketService.name);

  constructor(private socket: SocketProvider,
              private playerService: PlayerService) {
    socket.on('disconnect', () => {
      socket.connect();
      // TODO refactor; now we have player-specific code in common :/
      if (playerService.getPlayerName() && playerService.getGameId()) {
        console.warn('io server disconnect während laufendem Spiel aufgetreten; reconnecten');

        this.sendMessage({
          payload: playerService.getPlayerName(),
          type: SocketEventType.PLAYER_HELLO
        });
      }
      // else the socket will automatically try to reconnect
    });
  }

  sendMessage(event: SocketEvent) {
    SocketService.LOGGER.debug('send message through socket!');
    this.socket.emit(event.type, event.payload);
  }

  /* This will never be send from the server back to a client
  getGameCreated(): Observable<GmCreateGamePayload> {
    return this.socket
      .fromEvent(SocketEventType.GM_CREATE_GAME)
      .pipe(map(x => x as GmCreateGamePayload));
  }*/

  getPlayerRegistered(): Observable<PlayerRegisterPayload> {
    return this.socket
      .fromEvent(SocketEventType.PLAYER_REGISTER)
      .pipe(map(x => x as PlayerRegisterPayload));
  }

  getPlayerBuzzered(): Observable<PlayerBuzzerPayload> {
    return this.socket
      .fromEvent(SocketEventType.PLAYER_BUZZER)
      .pipe(map(x => x as PlayerBuzzerPayload));
  }

  getBuzzerEnabled(): Observable<GmEnableBuzzerPayload> {
    return this.socket
      .fromEvent(SocketEventType.GM_ENABLE_BUZZER)
      .pipe(map(x => x as GmEnableBuzzerPayload));
  }

  getNextRoundStarted(): Observable<GmStartNextRoundPayload> {
    return this.socket
      .fromEvent(SocketEventType.GM_START_NEXT_ROUND)
      .pipe(map(x => x as GmStartNextRoundPayload));
  }

}
