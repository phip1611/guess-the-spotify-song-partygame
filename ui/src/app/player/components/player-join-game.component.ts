import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng-log';
import { SocketService } from '../../common/socket.service';
import { SocketEventType } from '../../common/model/socket-events';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-player-join-game',
  template: `
    <mat-card>
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
  `
})
export class PlayerJoinGameComponent implements OnInit, OnDestroy {

  private static readonly LOGGER = new Log(PlayerJoinGameComponent.name);

  form: FormGroup;

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
    this.socketService.sendMessage({
      payload: this.form.getRawValue().playerName,
      type: SocketEventType.PLAYER_REGISTER
    });
  }

}
