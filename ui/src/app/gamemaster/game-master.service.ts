import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Log } from 'ng-log';

@Injectable({
  providedIn: 'root'
})
export class GameMasterService {

  private static readonly LOGGER = new Log(GameMasterService.name);

  private songsAvailable: any[] = [];

  private songsPlayed: any[] = [];

  private roundsCount = 0;

  private players: string[] = [];

  constructor(private httpClient: HttpClient) {
  }

  createGame(songs: any[], rounds: number) {
    this.songsAvailable = songs;
    this.roundsCount = rounds;
  }

  destroyGame(songs: any[], rounds: number) {
    this.songsAvailable = [];
    this.players = [];
    this.roundsCount = 0;
  }

  addPlayer(playerName: string): void {
    if (!this.players.includes(playerName)) {
      GameMasterService.LOGGER.debug(`Player ${playerName} joined the game`);
      this.players.push(playerName);
    } else {
      GameMasterService.LOGGER.error(`Player ${playerName} already registered!`);
    }
  }

  getPlayers(): string[] {
    return this.players;
  }

  getSongsAvailable(): any[] {
    return this.songsAvailable;
  }

  getSongsPlayed(): any[] {
    return this.songsPlayed;
  }

  getRandomSongAndMarkAsPlayed(): any {
    const index = this.getRandomSongIndex();
    const song = this.songsAvailable[index];
    this.songsAvailable.splice(index, 1);
    this.songsPlayed.push(song);
    // console.dir('next song is: ');
    // console.dir(song);
    return song;
  }

  markSongAsPlayed(songId: string): void {
    this.songsPlayed.push(
      this.songsAvailable.filter(x => x.id === songId)[0]
    );
  }

  private getRandomSongIndex(): number {
    return Math.floor(Math.random() * this.songsAvailable.length);
  }

}
