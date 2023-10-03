import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyApiService } from '../common/spotify-api.service';
import {Logger} from "../common/logger";

@Component({
  selector: 'app-spotify-redirect',
  template: ``
})
export class SpotifyRedirectComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Logger(SpotifyRedirectComponent.name);


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
