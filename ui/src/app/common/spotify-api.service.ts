import { Injectable } from '@angular/core';
import { Log } from 'ng-log';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SPOTIFY_REDIRECT_URL } from './config/urls';

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
    const paramsO: SpotifyAuthPayload = {
      client_id: SpotifyApiService.CLIENT_ID,
      response_type: 'token',
      redirect_uri: SPOTIFY_REDIRECT_URL,
      state: '',
      scope: ''
    };
    const params = new HttpParams({fromObject: paramsO as any});
    const paramss = params.toString();
    window.location.href = SpotifyApiService.SPOTIFY_URI_LOGIN + '?' + paramss;
  }

  setAuthToken(authToken: string) {
    SpotifyApiService.LOGGER.debug('Auth token set!');
    if (authToken){
      localStorage.setItem('SPOTIFY_AUTH_TOKEN', authToken);
    } else {
      localStorage.removeItem('SPOTIFY_AUTH_TOKEN');
    }
    this.authToken = authToken;
  }

  getAuthToken(): string {
    return this.authToken;
  }

  isConnected(): boolean {
    return !!this.authToken;
  }

  getPlaylistData(playlistId: string): Observable<any[]> {
    // at this point we assume its valid because we have a validator
    // in the form
    const id = SpotifyApiService.parseIdString(playlistId);

    const url = SpotifyApiService.SPOTIFY_URL_PLAYLIST_TRACKS.replace('{playlist_id}', id);
    SpotifyApiService.LOGGER.debug('Request to spotify playlist api url: "' + url + '"');

    // todo check for pageable and not just take first 100
    return this.http.get<any>(url).pipe(
      map(x => x.items),
      map(items => items.map(i => i.track)),
      map(items => items.filter(i => !!i.preview_url)),
    );
  }

  getSingleSongData(songId: string): Observable<any> {
    const url = SpotifyApiService.SPOTIFY_URL_TRACK_INFO.replace('{track_id}', songId);
    return this.http.get<any>(url);
  }

  /**
   * Parses HTTPS://-Spotify-Links, "spotify:playlist:%id%"-Links and gives the ID back if found.
   * There is NO validation in here!
   *
   * @param idString
   */
  static parseIdString(idString: string): string | null {
    idString = idString.trim();
    if (idString.startsWith('spotify:playlist:')) {
      return idString.split('spotify:playlist:')[1];
    } else if (idString.startsWith('https://')) {
      let id = idString.split('spotify.com/playlist/')[1];
      if (id.includes('?')) {
        id = id.split('?')[0];
      }
      return id;
    } else {
      return idString;
    }
  }

}

interface SpotifyAuthPayload {
  client_id: string;
  response_type: 'token';
  redirect_uri: string;
  state: string;
  scope: string;
}
