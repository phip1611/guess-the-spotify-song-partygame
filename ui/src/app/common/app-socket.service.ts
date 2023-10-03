import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SOCKET_URL } from './config/urls';
import { environment } from '../../environments/environment';

/**
 * Because https://stackoverflow.com/questions/59840964
 * we don't use forRoot in AppModule
 */
@Injectable({
  providedIn: 'root'
})
export class AppSocket extends Socket {

  // private static readonly LOGGER = new Log(AppSocket.name);

  constructor() {
    // instead of forRoot we do this
    // because https://stackoverflow.com/questions/59840964
    super({
      url: SOCKET_URL,
      options: {
        forceNew: true,
        reconnectionDelay: 10,
        reconnectionDelayMax: 500,
        timeout: 100,
      }
    });

    if (!environment.production) {
      // AppSocket.LOGGER.debug(`Socket is available as global var "socket" (window.socket)`);
      (window as any).socket = this;
    }
  }

}
