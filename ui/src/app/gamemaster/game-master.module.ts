import { NgModule } from '@angular/core';
import { AppCommonModule } from '../common/app-common.module';
import { GameMasterComponent } from './game-master.component';
import { StartNewGameComponent } from './start-new-game.component';


@NgModule({
  declarations: [
    GameMasterComponent,
    StartNewGameComponent
  ],
  imports: [
    AppCommonModule
  ],
  providers: [],
})
export class GameMasterModule {
}
