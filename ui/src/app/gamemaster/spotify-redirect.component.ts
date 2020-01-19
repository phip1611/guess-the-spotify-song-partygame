import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../common/client-state.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../common/spotify-api.service';

@Component({
  selector: 'app-spotify-redirect',
  template: ``
})
export class SpotifyRedirectComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(SpotifyRedirectComponent.name);


  constructor(private spotifyApiService: SpotifyApiService,
              private router: Router) {
  }

  ngOnInit(): void {
    let token = location.href;
    if (token.includes('access_token')) {
      token = token.split('#access_token=')[1].split('&')[0];
      this.spotifyApiService.setAuthToken(token);
    }
    this.router.navigateByUrl('/');
  }

  ngOnDestroy(): void {
  }



}
