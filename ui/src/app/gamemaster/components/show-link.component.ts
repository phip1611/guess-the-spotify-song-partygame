import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Log } from 'ng-log';
import { SpotifyApiService } from '../../common/spotify-api.service';
import { GameMasterService } from '../game-master.service';
import { switchMap } from 'rxjs/operators';
import { SocketService } from '../../common/socket.service';
import { Subscription } from 'rxjs';
import { SocketEventType } from '../../common/model/socket-events';
import { JOIN_GAME_URL } from '../../common/config/urls';

@Component({
  selector: 'app-gm-show-link',
  template: `
    <mat-card>
      <p>Teile diesen Link mit deinen Freunden, damit sie dem Spiel beitreten können:</p>
      <mat-chip-list>
        <mat-chip color="warn" selected>
          {{joinGameUrl}}
        </mat-chip>
      </mat-chip-list>

      <ng-container *ngIf="player.length">
        <p class="mt-3">Folgende Spieler sind beigetreten:</p>
        <mat-chip-list>
          <mat-chip *ngFor="let player of player">
            {{ player }}
          </mat-chip>
        </mat-chip-list>
        <div class="d-flex justify-content-end">
          <button class="mt-3" mat-raised-button color="primary" (click)="startGame()"
                  *ngIf="player.length >= 2">Spiel starten
          </button>
        </div>
      </ng-container>
    </mat-card>
  `
})
export class ShowLinkComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(ShowLinkComponent.name);

  private subscription: Subscription;

  public player: string[] = [];

  public joinGameUrl: string = JOIN_GAME_URL;

  @Output()
  done = new EventEmitter();

  constructor(private gameMasterService: GameMasterService,
              private socketService: SocketService) {
  }


  ngOnInit(): void {
    // when this component is shown its because the game was just created
    this.socketService.sendMessage({
      payload: null,
      type: SocketEventType.GM_CREATE_GAME
    });

    this.subscription = this.socketService.getPlayerRegistered().subscribe(playerId => {
      ShowLinkComponent.LOGGER.debug('Got signal from socket service that a players want to register');
      this.gameMasterService.addPlayer(playerId);
      this.player = this.gameMasterService.getPlayers();
    });
  }

  startGame(): void {
    this.done.next();
  }

  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

}
