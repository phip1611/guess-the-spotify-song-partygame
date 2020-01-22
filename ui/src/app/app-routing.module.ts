import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerComponent } from './player/player.component';
import { GameMasterComponent } from './gamemaster/game-master.component';
import { SpotifyRedirectComponent } from './gamemaster/spotify-redirect.component';


const routes: Routes = [
  {
    path: 'game/:id',
    component: PlayerComponent
  },
  {
    path: '',
    component: GameMasterComponent
  },
  {
    path: 'spotify-redirect',
    component: SpotifyRedirectComponent
  },
  {
    path: '**', component: GameMasterComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
