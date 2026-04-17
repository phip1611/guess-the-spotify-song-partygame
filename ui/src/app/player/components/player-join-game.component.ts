import { Component, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { Log } from '../../common/logging/logger';
import { SocketService } from '../../common/socket.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { PlayerService } from '../player.service';
import { SocketEventType } from '../../../../../common-ts/socket-events';

@Component({
    selector: 'app-player-join-game',
    template: `
    @if (!joined()) {
      <mat-card>
        @if (form) {
          <form [formGroup]="form">
            <div class="row">
              <div class="col-12 col-md-8">
                <mat-form-field class="w-100">
                  <input matInput placeholder="Benutzername" formControlName="playerName">
                </mat-form-field>
              </div>
              <div class="col-12 mt-0 mt-md-2 col-md-4">
                <button
                  [disabled]="!form.valid"
                  class="w-100" mat-raised-button color="primary"
                  (click)="doJoinGame()">Spiel beitreten
                </button>
              </div>
            </div>
          </form>
        }
      </mat-card>
    }
    
    @if (joined()) {
      <mat-card>
        <h3 class="mt-3 text-center">{{playerName()}} - Bitte warte, bis der Gamemaster das Spiel startet :)</h3>
        <div class="d-flex justify-content-center mt-3">
          <div class="lds-facebook">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </mat-card>
    }
    `,
    standalone: false
})
export class PlayerJoinGameComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerJoinGameComponent.name);

  form: UntypedFormGroup;

  readonly joined = signal(false);

  readonly playerName = signal('');

  @Output()
  done = new EventEmitter<void>();

  constructor(private socketService: SocketService,
              private fb: UntypedFormBuilder,
              private playerService: PlayerService) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      playerName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]]
    });
  }

  ngOnDestroy(): void {
  }

  doJoinGame(): void {
    const playerName = this.form.getRawValue().playerName;
    this.playerName.set(playerName);
    this.playerService.setPlayerName(playerName);
    this.socketService.sendMessage({
      payload: playerName,
      type: SocketEventType.PLAYER_REGISTER
    });
    this.joined.set(true);

    // wait until game round started
    this.socketService.getNextRoundStarted().pipe(take(1)).subscribe(
      () => this.done.emit()
    );
  }

}
