import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Log } from 'ng-log';
import { SOCKET_URL } from './config/urls';

/**
 * Because https://stackoverflow.com/questions/59840964
 * we don't use forRoot in AppModule
 */
@Injectable({
  providedIn: 'root'
})
export class AppSocket extends Socket {

  private static readonly LOGGER = new Log(AppSocket.name);

  constructor() {
    // instead of forRoot we do this
    // because https://stackoverflow.com/questions/59840964
    super({url: SOCKET_URL, options: {}});
  }

}
