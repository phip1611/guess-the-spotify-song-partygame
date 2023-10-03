import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpotifyApiService } from '../spotify-api.service';
import { Injectable } from '@angular/core';
import {Logger} from "../logger";

@Injectable()
export class SpotifyTokenInterceptor implements HttpInterceptor {

  private static readonly LOGGER = new Logger(SpotifyTokenInterceptor.name);

  constructor(private spotifyApiService: SpotifyApiService) {
  }


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.spotifyApiService.isConnected()) {
      SpotifyTokenInterceptor.LOGGER.debug('Injected token into request to ' + req.url);
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.spotifyApiService.getAuthToken()}`
        }
      });
    }
    return next.handle(req);
  }

}
