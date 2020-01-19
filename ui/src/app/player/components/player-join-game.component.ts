import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../../common/socket.service';
import { SocketEventType } from '../../common/model/socket-events';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-player-join-game',
  template: `
    <mat-card *ngIf="!joined">
      <form class="w-100" *ngIf="form" [formGroup]="form">
        <mat-form-field class="w-100">
          <input matInput placeholder="Benutzername" formControlName="playerName">
        </mat-form-field>

        <div class="row">
          <div class="col-4 offset-8 col-lg-6 offset-lg-6">
            <button
              [disabled]="!form.valid"
              class="w-100" mat-raised-button color="primary" (click)="doJoinGame()">Spiel beitreten
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

  constructor(private socketService: SocketService,
              private fb: FormBuilder) {
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
    this.socketService.sendMessage({
      payload: this.playerName,
      type: SocketEventType.PLAYER_REGISTER
    });
    this.joined = true;
  }

}
