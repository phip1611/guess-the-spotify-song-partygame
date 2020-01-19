import { NgModule } from '@angular/core';
import { AppCommonModule } from '../common/app-common.module';
import { GameMasterComponent } from './game-master.component';
import { StartNewGameComponent } from './components/start-new-game.component';
import { SpotifyRedirectComponent } from './spotify-redirect.component';
import { ShowLinkComponent } from './components/show-link.component';
import { InGameComponent } from './components/in-game.component';


@NgModule({
  declarations: [
    GameMasterComponent,
    StartNewGameComponent,
    SpotifyRedirectComponent,
    ShowLinkComponent,
    InGameComponent,
  ],
  imports: [
    AppCommonModule
  ],
  providers: [],
})
export class GameMasterModule {
}
