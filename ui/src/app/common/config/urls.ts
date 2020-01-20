import { environment } from '../../../environments/environment';

export const SPOTIFY_REDIRECT_URL =  location.protocol + '//' + location.host + '/spotify-redirect';
export const JOIN_GAME_URL = location.protocol + '//' + location.host + '/game';
export const SOCKET_URL = getSocketUrl();

function getSocketUrl() {
  if (!environment.production) {
    return 'http://localhost:8080'
  } else {
    return '//' + location.hostname
  }
}
