import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Log } from 'ng-log';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private static readonly LOGGER = new Log(SocketService.name);

  constructor(private socket: Socket) {
  }

  sendMessage(event: SocketEvent) {
    SocketService.LOGGER.debug('send message through socket!');
    this.socket.emit(event.type, event.payload);
  }

  getPlayerRegistered(): Observable<UserNamePayload> {
    return this.socket
      .fromEvent(SocketEventType.PLAYER_REGISTER)
      .pipe(map(x => x as UserNamePayload));
  }

  getPlayerBuzzered(): Observable<BuzzerHitPayload> {
    return this.socket
      .fromEvent(SocketEventType.PLAYER_BUZZER)
      .pipe(map(x => x as BuzzerHitPayload));
  }

  getBuzzerEnabled(): Observable<BuzzerHitPayload> {
    return this.socket
      .fromEvent(SocketEventType.GM_ENABLE_BUZZER)
      .pipe(map(x => x as BuzzerHitPayload));
  }

  getNextRoundStarted(): Observable<NextRoundPayload> {
    return this.socket
      .fromEvent(SocketEventType.GM_NEXT_ROUND_START)
      .pipe(map(x => x as NextRoundPayload));
  }

}

export interface SocketEvent {
  type: SocketEventType;
  payload: UserNamePayload | BuzzerHitPayload | EnabledBuzzerPayload | NextRoundPayload;
}

export enum SocketEventType {
  PLAYER_REGISTER = 'PLAYER_REGISTER',
  PLAYER_BUZZER = 'PLAYER_BUZZER',
  GM_ENABLE_BUZZER = 'GM_ENABLE_BUZZER',
  GM_NEXT_ROUND_START = 'GM_NEXT_ROUND_START'
}

export type UserNamePayload = string;
export type BuzzerHitPayload = void;
export type EnabledBuzzerPayload = void;
export type NextRoundPayload = void;
