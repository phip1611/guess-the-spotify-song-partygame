import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';
import {AppCommonModule} from "./common/app-common.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,

    AppCommonModule,
    // PlayerModule,
    // GameMasterModule,
  ],
  providers: [
    provideAnimations()
    // {provide: HTTP_INTERCEPTORS, useClass: SpotifyTokenInterceptor, multi: true},

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
