import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCommonModule } from './common/app-common.module';
import { PlayerModule } from './player/player.module';
import { GameMasterModule } from './gamemaster/game-master.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,

    AppCommonModule,
    PlayerModule,
    GameMasterModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
