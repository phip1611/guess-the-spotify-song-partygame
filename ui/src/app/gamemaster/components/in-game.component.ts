import { Component, OnInit } from '@angular/core';
import { GameMasterService } from '../game-master.service';
import { SocketService } from '../../common/socket.service';
import { SocketEventType } from '../../common/model/socket-events';

@Component({
  selector: 'app-gm-in-game',
  template: `
    <mat-card>
      <div class="row">
        <div class="col">
          <button class="w-100"
                  [disabled]="showSolution"
                  mat-raised-button color="accent" (click)="showSolution = true">Lösung
          </button>
        </div>
        <div class="col">
          <button class="w-100"
                  [disabled]="!playSongButtonEnabled" mat-raised-button color="warn" (click)="onSongPlayed()">Song
            abspielen
          </button>
        </div>
        <div class="col">
          <button class="w-100"
                  mat-raised-button color="primary" (click)="onNextRound()">Nächste Runde
          </button>
        </div>
      </div>
    </mat-card>

    <ng-container *ngIf="showSolution">
      <div class="row mt-3">
        <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{currentSong.track.name}}</mat-card-title>
              <mat-card-subtitle>{{getArtistsStringFromCurrentSong()}}
                - {{currentSong.track.album.name}}</mat-card-subtitle>
            </mat-card-header>
            <img mat-card-image [src]="currentSong.track?.album?.images[0]?.url">
          </mat-card>
        </div>
      </div>
    </ng-container>

  `
})
export class InGameComponent implements OnInit {

  showSolution: boolean;

  currentSong: any;

  playSongButtonEnabled = true;

  constructor(private gameMasterService: GameMasterService,
              private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.gameMasterService.createGame(debugData, 10);
    this.onNextRound();
  }

  onSongPlayed(): void {
    this.playSongButtonEnabled = false;
    this.socketService.sendMessage({
      type: SocketEventType.GM_ENABLE_BUZZER,
      payload: null
    });
    const audio = new Audio(this.currentSong.track.preview_url);
    audio.play();
    audio.addEventListener('ended', () => this.playSongButtonEnabled = true);
  }

  onNextRound() {
    this.currentSong = this.gameMasterService.getRandomSongAndMarkAsPlayed();
    this.socketService.sendMessage({
      type: SocketEventType.GM_START_NEXT_ROUND,
      payload: null
    });
  }

  private getArtistsStringFromCurrentSong(): string {
    const val = this.currentSong.track.artists.map(x => x.name).reduce((a, b) => a + ', ' + b) as string;
    if (val.includes(', ')) {
      return val.substr(0, val.length - 2);
    } else {
      return val;
    }
  }
}

const debugData = [
  {
    added_at: '2019-06-10T16:05:18Z',
    added_by: {
      external_urls: {
        spotify: 'https://open.spotify.com/user/phip1611'
      },
      href: 'https://api.spotify.com/v1/users/phip1611',
      id: 'phip1611',
      type: 'user',
      uri: 'spotify:user:phip1611'
    },
    is_local: false,
    primary_color: null,
    track: {
      album: {
        album_type: 'album',
        artists: [{
          external_urls: {
            spotify: 'https://open.spotify.com/artist/1HY2Jd0NmPuamShAr6KMms'
          },
          href: 'https://api.spotify.com/v1/artists/1HY2Jd0NmPuamShAr6KMms',
          id: '1HY2Jd0NmPuamShAr6KMms',
          name: 'Lady Gaga',
          type: 'artist',
          uri: 'spotify:artist:1HY2Jd0NmPuamShAr6KMms'
        }],
        available_markets: ['AD', 'AE', 'AR', 'AT', 'AU', 'BE', 'BG', 'BH', 'BO', 'BR', 'CH', 'CL', 'CO', 'CR', 'CY', 'CZ', 'DE', 'DK', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ES', 'FI', 'FR', 'GB', 'GR', 'GT', 'HK', 'HN', 'HU', 'ID', 'IE', 'IL', 'IN', 'IS', 'IT', 'JO', 'KW', 'LB', 'LI', 'LT', 'LU', 'LV', 'MA', 'MC', 'MT', 'MX', 'MY', 'NI', 'NL', 'NO', 'NZ', 'OM', 'PA', 'PE', 'PH', 'PL', 'PS', 'PT', 'PY', 'QA', 'RO', 'SA', 'SE', 'SG', 'SK', 'SV', 'TH', 'TN', 'TR', 'TW', 'UY', 'VN', 'ZA'],
        external_urls: {
          spotify: 'https://open.spotify.com/album/6LY3AerY6KNGOPsNPL63Kk'
        },
        href: 'https://api.spotify.com/v1/albums/6LY3AerY6KNGOPsNPL63Kk',
        id: '6LY3AerY6KNGOPsNPL63Kk',
        images: [{
          height: 640,
          url: 'https://i.scdn.co/image/f352570a707c3ed52ba8ff0b8d580d1b9b61595d',
          width: 640
        }, {
          height: 300,
          url: 'https://i.scdn.co/image/17b9d0e68f8a3d17d50c4e9d770aabdd82ea0fe8',
          width: 300
        }, {
          height: 64,
          url: 'https://i.scdn.co/image/824a5b07349f72eaf8566ccc599ffccd5a5518f5',
          width: 64
        }],
        name: 'Born This Way (International Special Edition Version)',
        release_date: '2011-05-23',
        release_date_precision: 'day',
        total_tracks: 23,
        type: 'album',
        uri: 'spotify:album:6LY3AerY6KNGOPsNPL63Kk'
      },
      artists: [{
        external_urls: {
          spotify: 'https://open.spotify.com/artist/1HY2Jd0NmPuamShAr6KMms'
        },
        href: 'https://api.spotify.com/v1/artists/1HY2Jd0NmPuamShAr6KMms',
        id: '1HY2Jd0NmPuamShAr6KMms',
        name: 'Lady Gaga',
        type: 'artist',
        uri: 'spotify:artist:1HY2Jd0NmPuamShAr6KMms'
      }],
      available_markets: ['AD', 'AE', 'AR', 'AT', 'AU', 'BE', 'BG', 'BH', 'BO', 'BR', 'CH', 'CL', 'CO', 'CR', 'CY', 'CZ', 'DE', 'DK', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ES', 'FI', 'FR', 'GB', 'GR', 'GT', 'HK', 'HN', 'HU', 'ID', 'IE', 'IL', 'IN', 'IS', 'IT', 'JO', 'KW', 'LB', 'LI', 'LT', 'LU', 'LV', 'MA', 'MC', 'MT', 'MX', 'MY', 'NI', 'NL', 'NO', 'NZ', 'OM', 'PA', 'PE', 'PH', 'PL', 'PS', 'PT', 'PY', 'QA', 'RO', 'SA', 'SE', 'SG', 'SK', 'SV', 'TH', 'TN', 'TR', 'TW', 'UY', 'VN', 'ZA'],
      disc_number: 1,
      duration_ms: 260253,
      episode: false,
      explicit: false,
      external_ids: {
        isrc: 'USUM71100638'
      },
      external_urls: {
        spotify: 'https://open.spotify.com/track/30XU4suKzCeoCK9YFzdufg'
      },
      href: 'https://api.spotify.com/v1/tracks/30XU4suKzCeoCK9YFzdufg',
      id: '30XU4suKzCeoCK9YFzdufg',
      is_local: false,
      name: 'Born This Way',
      popularity: 72,
      preview_url: 'https://p.scdn.co/mp3-preview/9fbedb906574695592b0cf1b53eff64c531953bc?cid=d5b188f88aa342538c1150c4f4decb4c',
      track: true,
      track_number: 2,
      type: 'track',
      uri: 'spotify:track:30XU4suKzCeoCK9YFzdufg'
    },
    video_thumbnail: {
      url: null
    }
  },
  {
    added_at: '2019-06-10T16:12:44Z',
    added_by: {
      external_urls: {
        spotify: 'https://open.spotify.com/user/phip1611'
      },
      href: 'https://api.spotify.com/v1/users/phip1611',
      id: 'phip1611',
      type: 'user',
      uri: 'spotify:user:phip1611'
    },
    is_local: false,
    primary_color: null,
    track: {
      album: {
        album_type: 'album',
        artists: [{
          external_urls: {
            spotify: 'https://open.spotify.com/artist/3BmGtnKgCSGYIUhmivXKWX'
          },
          href: 'https://api.spotify.com/v1/artists/3BmGtnKgCSGYIUhmivXKWX',
          id: '3BmGtnKgCSGYIUhmivXKWX',
          name: 'Kelly Clarkson',
          type: 'artist',
          uri: 'spotify:artist:3BmGtnKgCSGYIUhmivXKWX'
        }],
        available_markets: ['AD', 'AE', 'AR', 'AT', 'AU', 'BE', 'BG', 'BH', 'BO', 'BR', 'CA', 'CH', 'CL', 'CO', 'CR', 'CY', 'CZ', 'DE', 'DK', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ES', 'FI', 'FR', 'GB', 'GR', 'GT', 'HK', 'HN', 'HU', 'ID', 'IE', 'IL', 'IN', 'IS', 'IT', 'JO', 'KW', 'LB', 'LI', 'LT', 'LU', 'LV', 'MA', 'MC', 'MT', 'MX', 'MY', 'NI', 'NL', 'NO', 'NZ', 'OM', 'PA', 'PE', 'PH', 'PL', 'PS', 'PT', 'PY', 'QA', 'RO', 'SA', 'SE', 'SG', 'SK', 'SV', 'TH', 'TN', 'TR', 'TW', 'UY', 'VN', 'ZA'],
        external_urls: {
          spotify: 'https://open.spotify.com/album/0VmE95pr5TSpZWucfyhO5e'
        },
        href: 'https://api.spotify.com/v1/albums/0VmE95pr5TSpZWucfyhO5e',
        id: '0VmE95pr5TSpZWucfyhO5e',
        images: [{
          height: 640,
          url: 'https://i.scdn.co/image/ab67616d0000b273af384269742c6b04308c1be8',
          width: 640
        }, {
          height: 300,
          url: 'https://i.scdn.co/image/ab67616d00001e02af384269742c6b04308c1be8',
          width: 300
        }, {
          height: 64,
          url: 'https://i.scdn.co/image/ab67616d00004851af384269742c6b04308c1be8',
          width: 64
        }],
        name: 'Stronger (Deluxe Version)',
        release_date: '2011-10-24',
        release_date_precision: 'day',
        total_tracks: 17,
        type: 'album',
        uri: 'spotify:album:0VmE95pr5TSpZWucfyhO5e'
      },
      artists: [{
        external_urls: {
          spotify: 'https://open.spotify.com/artist/3BmGtnKgCSGYIUhmivXKWX'
        },
        href: 'https://api.spotify.com/v1/artists/3BmGtnKgCSGYIUhmivXKWX',
        id: '3BmGtnKgCSGYIUhmivXKWX',
        name: 'Kelly Clarkson',
        type: 'artist',
        uri: 'spotify:artist:3BmGtnKgCSGYIUhmivXKWX'
      }],
      available_markets: ['AD', 'AE', 'AR', 'AT', 'AU', 'BE', 'BG', 'BH', 'BO', 'BR', 'CA', 'CH', 'CL', 'CO', 'CR', 'CY', 'CZ', 'DE', 'DK', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ES', 'FI', 'FR', 'GB', 'GR', 'GT', 'HK', 'HN', 'HU', 'ID', 'IE', 'IL', 'IN', 'IS', 'IT', 'JO', 'KW', 'LB', 'LI', 'LT', 'LU', 'LV', 'MA', 'MC', 'MT', 'MX', 'MY', 'NI', 'NL', 'NO', 'NZ', 'OM', 'PA', 'PE', 'PH', 'PL', 'PS', 'PT', 'PY', 'QA', 'RO', 'SA', 'SE', 'SG', 'SK', 'SV', 'TH', 'TN', 'TR', 'TW', 'UY', 'VN', 'ZA'],
      disc_number: 1,
      duration_ms: 221946,
      episode: false,
      explicit: false,
      external_ids: {
        isrc: 'GBCTA1100364'
      },
      external_urls: {
        spotify: 'https://open.spotify.com/track/1nInOsHbtotAmEOQhtvnzP'
      },
      href: 'https://api.spotify.com/v1/tracks/1nInOsHbtotAmEOQhtvnzP',
      id: '1nInOsHbtotAmEOQhtvnzP',
      is_local: false,
      name: 'Stronger (What Doesn\'t Kill You)',
      popularity: 73,
      preview_url: 'https://p.scdn.co/mp3-preview/328bdd62e0e8f7f110cb546017ff3bf3042cc37a?cid=d5b188f88aa342538c1150c4f4decb4c',
      track: true,
      track_number: 2,
      type: 'track',
      uri: 'spotify:track:1nInOsHbtotAmEOQhtvnzP'
    },
    video_thumbnail: {
      url: null
    }
  }
];
