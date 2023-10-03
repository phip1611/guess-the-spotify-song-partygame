import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  /*{
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
  }*/
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
