import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { Log } from 'ng-log';

/**
 * Manages only in which state the client is.
 * No http client.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientGameStateService implements OnDestroy {

  private static readonly LOGGER = new Log(ClientGameStateService.name);

  private state$: ReplaySubject<ClientState> = new ReplaySubject(1);

  private currentState: ClientState;

  private readonly subscription: Subscription;

  constructor() {
    this.subscription = this.state$.subscribe(state => this.currentState = state);
  }

  // call this only once when bootstrapped
  initOnBootstrap() {
    const gameId = localStorage.getItem('GAME_ID') as string;
    const clientRole = localStorage.getItem('CLIENT_ROLE') as ClientRole;
    if (gameId && clientRole) {
      ClientGameStateService.LOGGER.debug(`Found gameId=${gameId} and clientRole=${clientRole} in Local Storage!`);
      this.state$.next({
        gameId: gameId,
        role: clientRole
      });
    } else {
      this.updateClientState(null);
    }
  }

  getState$(): Observable<ClientState> {
    return this.state$.asObservable();
  }

  getState(): ClientState {
    return this.currentState;
  }

  updateClientState(state: ClientState) {
    ClientGameStateService.LOGGER.debug(`Updated client state: gameId=${state?.gameId} and clientRole=${state?.role}`);

    if (state) {
      localStorage.setItem('GAME_ID', state.gameId);
      localStorage.setItem('CLIENT_ROLE', state.role);
    }

  }

  clear() {
    ClientGameStateService.LOGGER.debug(`clearing state`);
    this.updateClientState(null);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

export interface ClientState {
  gameId: string;
  role: ClientRole;
}

export enum ClientRole {
  GAME_MASTER = 'GAME_MASTER',
  PLAYER = 'PLAYER'
}
