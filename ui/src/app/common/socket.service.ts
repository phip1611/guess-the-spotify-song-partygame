import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Log } from 'ng-log';
// tslint:disable-next-line:max-line-length
import { GmCreateGamePayload, GmEnableBuzzerPayload, GmStartNextRoundPayload, PlayerBuzzerPayload, PlayerRegisterPayload, SocketEvent, SocketEventType } from './model/socket-events';
import { SOCKET_URL } from './config/urls';
import { SocketProvider } from './socket.provider';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private static readonly LOGGER = new Log(SocketService.name);

  constructor(private socket: SocketProvider) {
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
