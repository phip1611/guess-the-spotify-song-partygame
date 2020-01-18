import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayerComponent } from './player/player.component';
import { GameMasterComponent } from './gamemaster/game-master.component';


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
    path: '**', component: GameMasterComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
