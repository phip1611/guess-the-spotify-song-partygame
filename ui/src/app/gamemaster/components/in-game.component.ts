import { Component, OnInit } from '@angular/core';
import { ClientGameStateService, ClientRole } from '../../common/client-state.service';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../../common/spotify-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameMasterService } from '../game-master.service';

@Component({
  selector: 'app-in-game',
  template: `
    In game
  `
})
export class InGameComponent implements OnInit {
  ngOnInit(): void {
  }

}
