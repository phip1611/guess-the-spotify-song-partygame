import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../../common/spotify-api.service';
import { GameMasterService } from '../game-master.service';
import { switchMap } from 'rxjs/operators';
import { SocketService } from '../../common/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gm-show-link',
  template: `
    Teile diesen Link mit deinen Freunden, damit sie dem Spiel beitreten können:
    <mat-chip-list>
      <mat-chip color="primary" selected>
        http://localhost:4200/game
      </mat-chip>
    </mat-chip-list>

    Folgende Spieler sind beigetreten:
    <mat-chip-list>
      <mat-chip *ngFor="let player of gameMasterService.getPlayers()">
        {{ player }}
      </mat-chip>
    </mat-chip-list>
    <button class="mt-3" mat-raised-button color="primary" (click)="startGame()"
            *ngIf="gameMasterService.getPlayers().length >= 2">Spiel starten
    </button>
  `
})
export class ShowLinkComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(ShowLinkComponent.name);

  private subscription: Subscription;

  constructor(private gameMasterService: GameMasterService,
              private socketService: SocketService) {
  }


  ngOnInit(): void {
    this.subscription = this.socketService.getPlayerRegistered().subscribe(playerId => {
      ShowLinkComponent.LOGGER.debug('Got signal from socket service that a players want to register');
      this.gameMasterService.addPlayer(playerId);
    });
  }

  startGame(): void {

  }

  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }
}
