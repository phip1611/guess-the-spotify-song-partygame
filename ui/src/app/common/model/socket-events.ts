export interface SocketEvent {
  type: SocketEventType;
  payload: SocketPayload;
}

export enum SocketEventType {
  GM_CREATE_GAME = 'GM_CREATE_GAME',
  GM_ENABLE_BUZZER = 'GM_ENABLE_BUZZER',
  GM_START_NEXT_ROUND = 'GM_START_NEXT_ROUND',
  // when a client enters the session
  PLAYER_HELLO = 'PLAYER_HELLO',
  // when a client submitted its user name
  PLAYER_REGISTER = 'PLAYER_REGISTER',
  // when a client hit the buzzer button
  PLAYER_BUZZER = 'PLAYER_BUZZER',
}

/**
 * Notify clients they can register. The payload is the game id.
 */
export type GmCreateGamePayload = string;
/**
 * Notify clients buzzer is enabled.
 */
export type GmEnableBuzzerPayload = void;
/**
 * Notify clients next round started, therefore
 * buzzers are disabled again.
 */
export type GmStartNextRoundPayload = void;
/**
 * Notify game master a player registered.
 */
export type PlayerRegisterPayload = string;
/**
 * Notify game master a player hit the button.
 */
export type PlayerBuzzerPayload = string;
/**
 * Notify game master a player hit the button. The payload is the game ID
 * the client wants to join.
 */
export type PlayerHelloPayload = string;

export type SocketPayload = GmCreateGamePayload |
  GmEnableBuzzerPayload |
  GmStartNextRoundPayload |
  PlayerRegisterPayload |
  PlayerHelloPayload |
  PlayerBuzzerPayload;
