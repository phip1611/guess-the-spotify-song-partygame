import { Injectable } from '@angular/core';
import { Log } from 'ng-log';

export type PointsPerPlayerType = { playerName: string; points: number }[];

@Injectable({
  providedIn: 'root'
})
export class GameMasterService {

  private static readonly LOGGER = new Log(GameMasterService.name);

  private songsAvailable: any[] = [];

  private songsPlayed: any[] = [];

  private players: string[] = [];

  private pointsPerPlayer: PointsPerPlayerType = [];

  private gameId: string;

  constructor() {
  }

  /**
   * There can only be one game at a time. We have the complete state (for the gm)
   * for the game in this service.
   */
  createGame(songs: any[]) {
    this.gameId = GameMasterService.generateGameId();
    this.songsAvailable = songs;
  }

  destroyGame(songs: any[], rounds: number) {
    this.songsAvailable = [];
    this.players = [];
    this.gameId = null;
  }

  addPlayer(playerName: string): void {
    if (!this.players.includes(playerName)) {
      GameMasterService.LOGGER.debug(`Player ${playerName} joined the game`);
      this.players.push(playerName);
      this.pointsPerPlayer.push({
        playerName: playerName,
        points: 0
      });
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

  getGameId(): string {
    return this.gameId;
  }

  getPointsPerPlayer(): PointsPerPlayerType {
    return this.pointsPerPlayer;
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

  addPoint(index: number): void {
    this.pointsPerPlayer[index].points++;
  }

  removePoint(index: number): void {
    this.pointsPerPlayer[index].points--;
  }

  private getRandomSongIndex(): number {
    return Math.floor(Math.random() * this.songsAvailable.length);
  }

  public static generateGameId(): string {
    let result = '';
    const characters = 'qwer1234';
    const charactersLength = characters.length;
    for (let i = 0; i < 3; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

}
