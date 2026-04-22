import { Injectable, signal } from '@angular/core';
import { Log } from '../common/logging/logger';
import { CommonClientService } from '../common/common-client.service';
import { SpotifyPlaylistTrack } from '../common/spotify-playlist-track';

export type PointsPerPlayerType = { playerName: string; points: number }[];

@Injectable()
export class GameMasterService {

  private static readonly LOGGER = new Log(GameMasterService.name);

  private readonly songsAvailableState = signal<SpotifyPlaylistTrack[]>([]);

  private readonly songsPlayedState = signal<SpotifyPlaylistTrack[]>([]);

  private readonly playersState = signal<string[]>([]);

  private readonly pointsPerPlayerState = signal<PointsPerPlayerType>([]);

  private readonly roundState = signal(0);

  private readonly totalRoundsState = signal(0);

  readonly players = this.playersState.asReadonly();
  readonly pointsPerPlayer = this.pointsPerPlayerState.asReadonly();

  constructor(private clientService: CommonClientService) {
  }

  /**
   * There can only be one game at a time. We have the complete state (for the gm)
   * for the game in this service.
   */
  createGame(songs: SpotifyPlaylistTrack[]) {
    this.clientService.gameId = GameMasterService.generateGameId();
    this.songsAvailableState.set([...songs]);
    this.songsPlayedState.set([]);
    this.playersState.set([]);
    this.pointsPerPlayerState.set([]);
    this.roundState.set(0);
    this.totalRoundsState.set(songs.length);
  }

  /*destroyGame(songs: any[], rounds: number) {
    this.songsAvailable = [];
    this.players = [];
    this.gameId = null;
    this.round = -1;
    this.totalRounds = 0;
  }*/

  addPlayer(playerName: string): void {
    if (!this.playersState().includes(playerName)) {
      GameMasterService.LOGGER.debug(`Player ${playerName} joined the game`);
      this.playersState.update((players) => [...players, playerName]);
      this.pointsPerPlayerState.update((pointsPerPlayer) => [...pointsPerPlayer, {
        playerName: playerName,
        points: 0
      }]);
    } else {
      GameMasterService.LOGGER.error(`Player ${playerName} already registered!`);
    }
  }

  getPlayers(): string[] {
    return this.playersState();
  }

  getSongsAvailable(): SpotifyPlaylistTrack[] {
    return this.songsAvailableState();
  }

  getSongsPlayed(): SpotifyPlaylistTrack[] {
    return this.songsPlayedState();
  }

  getGameId(): string {
    return this.clientService.gameId;
  }

  getPointsPerPlayer(): PointsPerPlayerType {
    return this.pointsPerPlayerState();
  }

  getRandomSongAndMarkAsPlayed(): SpotifyPlaylistTrack {
    const index = this.getRandomSongIndex();
    const songsAvailable = this.songsAvailableState();
    const song = songsAvailable[index];
    this.songsAvailableState.set(songsAvailable.filter((_, songIndex) => songIndex !== index));
    this.songsPlayedState.update((songsPlayed) => [...songsPlayed, song]);
    return song;
  }

  markSongAsPlayed(songId: string): void {
    const song = this.songsAvailableState().find((x) => x.id === songId);
    if (song) {
      this.songsPlayedState.update((songsPlayed) => [...songsPlayed, song]);
    }
  }

  addPoint(index: number): void {
    this.pointsPerPlayerState.update((pointsPerPlayer) => pointsPerPlayer.map((entry, entryIndex) => (
      entryIndex === index ? {...entry, points: entry.points + 1} : entry
    )));
  }

  removePoint(index: number): void {
    this.pointsPerPlayerState.update((pointsPerPlayer) => pointsPerPlayer.map((entry, entryIndex) => (
      entryIndex === index ? {...entry, points: entry.points - 1} : entry
    )));
  }

  nextRound(): void {
    this.roundState.update((round) => round + 1);
  }

  getRound(): number {
    return this.roundState();
  }

  getTotalRounds(): number {
    return this.totalRoundsState();
  }

  hasMoreSongs(): boolean {
    return this.songsAvailableState().length > 0;
  }

  private getRandomSongIndex(): number {
    return Math.floor(Math.random() * this.songsAvailableState().length);
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
