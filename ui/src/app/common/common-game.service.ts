import { Injectable, OnDestroy } from '@angular/core';
import { EMPTY, Observable, ReplaySubject, Subscription, timer } from 'rxjs';
import { Log } from 'ng-log';
import { PublicGameStatusDto } from './model/public-game-status-dto';
import { HttpClient } from '@angular/common/http';
import { debounce, debounceTime, expand, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommonGameService {

  private static readonly LOGGER = new Log(CommonGameService.name);

  constructor(private http: HttpClient) {
  }

  getCurrentGameState(gameId: string): Observable<PublicGameStatusDto> {
    return this.http.get<PublicGameStatusDto>('http://localhost:8080/gamestatus/' + gameId);
  }

  getCurrentGameStateUntilStarted(gameId: string): Observable<PublicGameStatusDto> {
    const obs = this.http.get<PublicGameStatusDto>('http://localhost:8080/gamestatus/' + gameId);
    const obsWithDebounce = timer(1000).pipe(switchMap(() => obs));

    return obs
      .pipe(expand(x => {
        if (x.started) {
          CommonGameService.LOGGER.debug('stop request series');
          return EMPTY;
        } else {
          CommonGameService.LOGGER.debug('repeat request');
          return obsWithDebounce;
        }
      }));
  }

}
