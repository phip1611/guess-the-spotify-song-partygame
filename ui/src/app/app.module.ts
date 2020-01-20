import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCommonModule } from './common/app-common.module';
import { PlayerModule } from './player/player.module';
import { GameMasterModule } from './gamemaster/game-master.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpotifyTokenInterceptor } from './common/interceptor/spotify-token.interceptor';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { SOCKET_URL } from './common/config/urls';

const socketIoConfig: SocketIoConfig = { url: SOCKET_URL, options: {} };

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    SocketIoModule.forRoot(socketIoConfig),

    AppCommonModule,
    PlayerModule,
    GameMasterModule,
  ],
  providers: [

    { provide: HTTP_INTERCEPTORS, useClass: SpotifyTokenInterceptor, multi: true },

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
