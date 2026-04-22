import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Log } from '../../common/logging/logger';
import { GameMasterService } from '../game-master.service';
import { SocketService } from '../../common/socket.service';
import { Subscription } from 'rxjs';
import { JOIN_GAME_URL } from '../../common/config/urls';
import { SocketEventType } from '../../../../../common-ts/socket-events';
import { CommonClientService } from '../../common/common-client.service';

@Component({
    selector: 'app-gm-show-link',
    template: `
    <mat-card>
      <p>Teile diesen Link mit deinen Freunden, damit sie dem Spiel beitreten können:</p>
      <mat-chip-set>
        <mat-chip color="warn" selected>
          {{joinGameUrl}}
        </mat-chip>
      </mat-chip-set>
    
      @if (players().length) {
        <p class="mt-3">Folgende Spieler sind beigetreten:</p>
        <mat-chip-set>
          @for (player of players(); track player) {
            <mat-chip>
              {{ player }}
            </mat-chip>
          }
        </mat-chip-set>
        <div class="d-flex justify-content-end">
          @if (players().length >= 2) {
            <button class="mt-3" mat-raised-button color="primary" (click)="startGame()"
              >Spiel starten
            </button>
          }
        </div>
      }
    </mat-card>
    `,
    standalone: false
})
export class ShowLinkComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(ShowLinkComponent.name);

  readonly players = this.gameMasterService.players;

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
    });
  }

  startGame(): void {
    this.done.emit();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
