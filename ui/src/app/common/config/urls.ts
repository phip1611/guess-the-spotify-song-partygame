import { environment } from '../../../environments/environment';

export const SPOTIFY_REDIRECT_URL = location.protocol + '//' + location.host + '/spotify-redirect';
export const JOIN_GAME_URL = location.protocol + '//' + location.host + '/game';
export const SOCKET_URL = !environment.production ? 'http://localhost:8080' : (window.location.protocol + '//' + window.location.host);
