import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { GameMasterService } from '../game-master.service';
import { SocketService } from '../../common/socket.service';
import { Subscription } from 'rxjs';
import { JOIN_GAME_URL } from '../../common/config/urls';
import { SocketEventType } from '../../../../../common-ts/socket-events';
import { CommonClientService } from '../../common/common-client.service';
import {Logger} from "../../common/logger";

@Component({
  selector: 'app-gm-show-link',
  template: `
    <mat-card>
      <p>Teile diesen Link mit deinen Freunden, damit sie dem Spiel beitreten können:</p>
      <mat-chip-listbox>
        <mat-chip color="warn" selected>
          {{joinGameUrl}}
        </mat-chip>
      </mat-chip-listbox>

      <ng-container *ngIf="player.length">
        <p class="mt-3">Folgende Spieler sind beigetreten:</p>
        <mat-chip-listbox>
          <mat-chip *ngFor="let player of player">
            {{ player }}
          </mat-chip>
        </mat-chip-listbox>
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

  private static readonly LOGGER = new Logger(ShowLinkComponent.name);

  public player: string[] = [];

  public joinGameUrl: string;

  @Output()
  done = new EventEmitter<void>();

  private subscription: Subscription;

  constructor(private gameMasterService: GameMasterService,
              private socketService: SocketService,
              private clientService: CommonClientService) {
    this.joinGameUrl = JOIN_GAME_URL + '/' + gameMasterService.getGameId();
  }


  ngOnInit(): void {
    // when this component is shown its because the game was just created
    this.socketService.sendMessage({
      payload: this.gameMasterService.getGameId(),
      type: SocketEventType.GM_CREATE_GAME
    });

    this.socketService.getServerConfirm().subscribe(uuid => {
      this.clientService.clientUuid = uuid;
      ShowLinkComponent.LOGGER.info('GM_CREATE_GAME von Server bestätigt');
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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
