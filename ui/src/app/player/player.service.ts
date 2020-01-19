import { Injectable, NgModule } from '@angular/core';
import { AppCommonModule } from '../common/app-common.module';
import { PlayerComponent } from './player.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private http: HttpClient) {
  }

  addPlayerToGame(gameId: string, playerId: string): Observable<void> {
    return this.http.post<void>('http://localhost:8080/game/' + gameId +  '/addplayer/', playerId);
  }

  generateName(): string {
    let result           = 'Spieler-';
    const characters       = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 3; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

}
