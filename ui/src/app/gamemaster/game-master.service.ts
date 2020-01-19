import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { GameMasterModule } from './game-master.module';
import { HttpClient } from '@angular/common/http';
import { NewGameInput } from '../common/model/new-game-input';
import { Observable, Subscription } from 'rxjs';
import { ClientGameStateService } from '../common/client-state.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameMasterService {

  constructor(private httpClient: HttpClient) {
  }

  startNewGame(input: NewGameInput): Observable<string> {
    return this.httpClient.post<string>('http://localhost:8080/game', input);
  }

  getNextSongId(gameId: string): Observable<string> {
    return this.httpClient.get(`http://localhost:8080/game/${gameId}/nextsong/`, {
      responseType: 'text'
    });
  }

  startNextRound(gameId: string, songId: string): Observable<void> {
    return this.httpClient.post<void>(`http://localhost:8080/game/${gameId}/startnextgameround/`, songId);
  }

}
