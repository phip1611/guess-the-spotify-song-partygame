export interface SocketEvent {
    type: SocketEventType;
    payload: SocketPayload;
}

export enum SocketEventType {
    // creates game with ID
    GM_CREATE_GAME = 'GM_CREATE_GAME',
    // reconencts to existing game after connection lost
    GM_RECONNECT = 'GM_RECONNECT',
    // enables buzzer for all players of game
    GM_ENABLE_BUZZER = 'GM_ENABLE_BUZZER',
    // disables buzzer for all players of game
    GM_START_NEXT_ROUND = 'GM_START_NEXT_ROUND',

    // when a client enters the session
    PLAYER_HELLO = 'PLAYER_HELLO',
    PLAYER_RECONNECT = 'PLAYER_RECONNECT',
    // when a client submitted its user name
    PLAYER_REGISTER = 'PLAYER_REGISTER',
    // when a client hit the buzzer button
    PLAYER_BUZZER = 'PLAYER_BUZZER',

    SERVER_CONFIRM = 'SERVER_CONFIRM'
}

/**
 * Notify clients they can register. The payload is the game ID.
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
 * Send the UUID the server has given us to reconnect to an existing game.
 */
export type GmReconnectPayload = string;
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
/**
 * Send the UUID the server has given us to reconnect to an existing game.
 */
export type PlayerReconnectPayload = string;
/**
 * UUID server sends to either player or game master to make reconnects possible.
 */
export type ServerConfirmPayload = string;

export type SocketPayload = GmCreateGamePayload |
    GmEnableBuzzerPayload |
    GmStartNextRoundPayload |
    GmReconnectPayload |
    PlayerRegisterPayload |
    PlayerHelloPayload |
    PlayerBuzzerPayload |
    PlayerReconnectPayload |
    ServerConfirmPayload;
