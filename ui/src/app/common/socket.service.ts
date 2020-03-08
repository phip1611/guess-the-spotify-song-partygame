import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { Log } from 'ng-log';
// tslint:disable-next-line:max-line-length
import { GmEnableBuzzerPayload, GmStartNextRoundPayload, PlayerBuzzerPayload, PlayerRegisterPayload, ServerConfirmPayload, SocketEvent, SocketEventType } from '../../../../common-ts/socket-events';
import { AppSocket } from './app-socket.service';
import { CommonClientService } from './common-client.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private static readonly LOGGER = new Log(SocketService.name);

  constructor(private socket: AppSocket,
              private clientService: CommonClientService) {
    socket.on('disconnect', () => {
      SocketService.LOGGER.warn('disconnect occurred');
      socket.connect();
      if (this.clientService.clientUuid) {
        SocketService.LOGGER.info('tries to reconnect');

        // this handles the soft disconnect
        // i.e. connection lost without browser tab refresh

        const type = this.clientService.playerType === 'player' ? SocketEventType.PLAYER_RECONNECT : SocketEventType.GM_RECONNECT;
        // do reconnect
        this.socket.emit(type, this.clientService.clientUuid);
        this.getServerConfirm().subscribe(uuid => {
          if (uuid !== this.clientService.clientUuid) {
            throw new Error(`Server couldn't confirm our reconnect attempt! Abort! Mayday! Houston we have a problem!`);
          } else {
            SocketService.LOGGER.info('reconnect successful');
          }
        });
      }
    });
  }

  getServerConfirm(): Observable<ServerConfirmPayload> {
    return this.socket.fromEvent(SocketEventType.SERVER_CONFIRM).pipe(first(), map(x => x as ServerConfirmPayload));
  }

  sendMessage(event: SocketEvent): void {
    SocketService.LOGGER.debug('send message through socket!');
    this.socket.emit(event.type, event.payload);
  }

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
