import { Injectable } from '@angular/core';
import { CommonClientService } from '../common/common-client.service';
import { SpotifyPlaylistTrack } from '../common/spotify-playlist-track';

export type PointsPerPlayerType = { playerName: string; points: number }[];

@Injectable()
export class GameMasterService {

  // private static readonly LOGGER = new Log(GameMasterService.name);

  private songsAvailable: SpotifyPlaylistTrack[] = [];

  private songsPlayed: SpotifyPlaylistTrack[] = [];

  private players: string[] = [];

  private pointsPerPlayer: PointsPerPlayerType = [];

  private round: number = 0;

  private totalRounds: number = 0;

  constructor(private clientService: CommonClientService) {
  }

  /**
   * There can only be one game at a time. We have the complete state (for the gm)
   * for the game in this service.
   */
  createGame(songs: SpotifyPlaylistTrack[]) {
    this.clientService.gameId = GameMasterService.generateGameId();
    this.songsAvailable = songs;
    this.round = 0;
    this.totalRounds = songs.length;
  }

  /*destroyGame(songs: any[], rounds: number) {
    this.songsAvailable = [];
    this.players = [];
    this.gameId = null;
    this.round = -1;
    this.totalRounds = 0;
  }*/

  addPlayer(playerName: string): void {
    if (!this.players.includes(playerName)) {
      // GameMasterService.LOGGER.debug(`Player ${playerName} joined the game`);
      this.players.push(playerName);
      this.pointsPerPlayer.push({
        playerName: playerName,
        points: 0
      });
    } else {
      // GameMasterService.LOGGER.error(`Player ${playerName} already registered!`);
    }
  }

  getPlayers(): string[] {
    return this.players;
  }

  getSongsAvailable(): SpotifyPlaylistTrack[] {
    return this.songsAvailable;
  }

  getSongsPlayed(): SpotifyPlaylistTrack[] {
    return this.songsPlayed;
  }

  getGameId(): string {
    return this.clientService.gameId;
  }

  getPointsPerPlayer(): PointsPerPlayerType {
    return this.pointsPerPlayer;
  }

  getRandomSongAndMarkAsPlayed(): SpotifyPlaylistTrack {
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

  nextRound(): void {
    this.round++;
  }

  getRound(): number {
    return this.round;
  }

  getTotalRounds(): number {
    return this.totalRounds;
  }

  hasMoreSongs(): boolean {
    return this.songsAvailable.length > 0;
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
