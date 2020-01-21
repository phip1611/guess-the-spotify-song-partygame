import { NgModule } from '@angular/core';
import { AppCommonModule } from '../common/app-common.module';
import { GameMasterComponent } from './game-master.component';
import { CreateNewGameComponent } from './components/create-new-game.component';
import { SpotifyRedirectComponent } from './spotify-redirect.component';
import { ShowLinkComponent } from './components/show-link.component';
import { InGameComponent } from './components/in-game.component';
import { SpotifySongcardComponent } from './components/sub/spotify-songcard.component';
import { PlayerPointsComponent } from './components/sub/player-points.component';
import { PlayerBuzzerTimesComponent } from './components/sub/player-buzzer-times.component';


@NgModule({
  declarations: [
    GameMasterComponent,
    CreateNewGameComponent,
    SpotifyRedirectComponent,
    ShowLinkComponent,
    InGameComponent,
    SpotifySongcardComponent,
    PlayerPointsComponent,
    PlayerBuzzerTimesComponent,
  ],
  imports: [
    AppCommonModule
  ],
  providers: []
})
export class GameMasterModule {
}
