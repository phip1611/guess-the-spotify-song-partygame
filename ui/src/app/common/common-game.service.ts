import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { Log } from 'ng-log';
import { PublicGameStatusDto } from './model/public-game-status-dto';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonGameService {

  constructor(private http: HttpClient) {
  }

  getCurrentGameState(gameId: string): Observable<PublicGameStatusDto> {
    return this.http.get<PublicGameStatusDto>('http://localhost:8080/gamestatus/' + gameId);
  }

}
