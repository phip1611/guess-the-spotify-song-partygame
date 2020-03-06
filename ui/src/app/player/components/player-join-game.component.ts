import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../../common/socket.service';
import { SocketEventType } from '../../common/model/socket-events';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { PlayerService } from '../player-master.service';

@Component({
  selector: 'app-player-join-game',
  template: `
    <mat-card *ngIf="!joined">
      <form *ngIf="form" [formGroup]="form">
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

    </mat-card>

    <mat-card *ngIf="joined">
      <h3 class="mt-3 text-center">{{playerName}} - Bitte warte, bis der Gamemaster das Spiel startet :)</h3>

      <div class="d-flex justify-content-center mt-3">
        <div class="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </mat-card>
  `
})
export class PlayerJoinGameComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerJoinGameComponent.name);

  form: FormGroup;

  joined = false;

  playerName: string;

  @Output()
  done = new EventEmitter();

  constructor(private socketService: SocketService,
              private fb: FormBuilder,
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
    this.playerName = this.form.getRawValue().playerName;
    this.playerService.setPlayerName(this.playerName);
    this.socketService.sendMessage({
      payload: this.playerName,
      type: SocketEventType.PLAYER_REGISTER
    });
    this.joined = true;

    // wait until game round started
    this.socketService.getNextRoundStarted().pipe(take(1)).subscribe(
      () => this.done.next()
    );
  }

}
