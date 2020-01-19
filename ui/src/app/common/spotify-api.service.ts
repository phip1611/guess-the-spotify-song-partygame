import { Injectable } from '@angular/core';
import { Log } from 'ng-log';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SpotifyPlaylistTrack } from './model/spotify-playlist-track';
import { flatten } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class SpotifyApiService {

  private static readonly LOGGER = new Log(SpotifyApiService.name);

  // from https://developer.spotify.com/dashboard/applications/
  private static readonly CLIENT_ID = 'd5b188f88aa342538c1150c4f4decb4c';

  private static readonly SPOTIFY_URI_LOGIN = 'https://accounts.spotify.com/authorize';

  private static readonly SPOTIFY_URL_PLAYLIST_TRACKS = 'https://api.spotify.com/v1/playlists/{playlist_id}/tracks';

  private static readonly SPOTIFY_URL_TRACK_INFO = 'https://api.spotify.com/v1/tracks/{track_id}';

  private authToken: string;

  constructor(private http: HttpClient) {
    this.authToken = localStorage.getItem('SPOTIFY_AUTH_TOKEN');
  }

  openAuthWebsite(): void {
    /*if (this.connected) {
      SpotifyApiService.LOGGER.debug('ALREADY CONNECTED!');
      return;
    }
    const params: SpotifyAuthPayload = {
      client_id: SpotifyApiService.CLIENT_ID,
      response_type: 'token',
      redirect_uri: 'http://localhost:4200/spotify-redirect',
      state: 'foobar',
      scope: 'string'
    };
    return this.http.get<string>(SpotifyApiService.SPOTIFY_URI_LOGIN, {
      params: new HttpParams({fromObject: params as any})
    });*/
    const paramsO: SpotifyAuthPayload = {
      client_id: SpotifyApiService.CLIENT_ID,
      response_type: 'token',
      redirect_uri: 'http://localhost:4200/spotify-redirect',
      state: 'foobar',
      scope: ''
    };
    const params = new HttpParams({fromObject: paramsO as any});
    const paramss = params.toString();
    window.location.href = SpotifyApiService.SPOTIFY_URI_LOGIN + '?' + paramss;
  }

  setAuthToken(authToken: string) {
    SpotifyApiService.LOGGER.debug('Auth token set!');
    localStorage.setItem('SPOTIFY_AUTH_TOKEN', authToken);
    this.authToken = authToken;
  }

  getAuthToken(): string {
    return this.authToken;
  }

  isConnected(): boolean {
    return !!this.authToken;
  }

  getPlaylistData(playlistId: string): Observable<any[]> {
    let id = playlistId.trim();
    if (id.startsWith('http://')) {
      id = id.split('spotify.com/playlist/')[1];
      if (id.includes('?si=')) {
        id = id.split('?si=')[0];
      }
    } else {
      id = id.replace('spotify:playlist:', '');
    }

    const url = SpotifyApiService.SPOTIFY_URL_PLAYLIST_TRACKS.replace('{playlist_id}', id);
    SpotifyApiService.LOGGER.debug('Request to spotify playlist api url: "' + url + '"');
    // todo check for pageable and not just take first 100
    return this.http.get<any>(url)
      .pipe(
        // all the items in the list
        map(x => x.items)
      );
  }

  getSingleSongData(songId: string): Observable<any> {
    const url = SpotifyApiService.SPOTIFY_URL_TRACK_INFO.replace('{track_id}', songId);
    return this.http.get<any>(url);
  }

}

interface SpotifyAuthPayload {
  client_id: string;
  response_type: 'token';
  redirect_uri: string;
  state: string;
  scope: string;
}
