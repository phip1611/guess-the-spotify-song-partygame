import { NgModule } from '@angular/core';
import { AppCommonModule } from '../common/app-common.module';
import { PlayerComponent } from './player.component';
import { PlayerJoinGameComponent } from './components/player-join-game.component';
import { PlayerInGameComponent } from './components/player-in-game.component';


@NgModule({
  declarations: [
    PlayerComponent,
    PlayerJoinGameComponent,
    PlayerInGameComponent
  ],
  imports: [
    AppCommonModule
  ],
  providers: [],
})
export class PlayerModule {
}
