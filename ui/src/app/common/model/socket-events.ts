export interface SocketEvent {
  type: SocketEventType;
  payload: SocketPayload;
}

export enum SocketEventType {
  GM_CREATE_GAME = 'GM_CREATE_GAME',
  GM_ENABLE_BUZZER = 'GM_ENABLE_BUZZER',
  GM_START_NEXT_ROUND = 'GM_START_NEXT_ROUND',
  PLAYER_REGISTER = 'HELLO',
  PLAYER_BUZZER = 'PLAYER_BUZZER',
}

/**
 * Notify clients they can register.
 */
export type GmCreateGamePayload = void;
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
export type PlayerBuzzerPayload = void;

export type SocketPayload = GmCreateGamePayload |
  GmEnableBuzzerPayload |
  GmStartNextRoundPayload |
  PlayerRegisterPayload |
  PlayerBuzzerPayload;
