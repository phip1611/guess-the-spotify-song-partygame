import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { GameMasterModule } from './game-master.module';
import { HttpClient } from '@angular/common/http';
import { NewGameInput } from '../common/model/new-game-input';
import { Observable, Subscription } from 'rxjs';
import { ClientGameStateService } from '../common/game.service';

@Injectable({
  providedIn: GameMasterModule
})
export class GameMasterService {

  constructor(private httpClient: HttpClient) {
  }

  startNewGame(input: NewGameInput): Observable<string> {
    return this.httpClient.post<string>('game', input);
  }

}
