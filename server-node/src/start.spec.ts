import * as socketIoClient from 'socket.io-client';
import { SocketEventType } from '../../common-ts/socket-events';
import { AppServer } from './app-server';
import { GameService } from './game.service';

const TEST_PORT = 63246;

beforeAll(() => {
    const appServer = AppServer.getInstance();
    const gameService = GameService.getInstance();
    // order is important!
    appServer.init(TEST_PORT); // #1
    gameService.init(); // #2
});

/**
 *  Cleanup WS & HTTP servers
 */
afterAll(() => {
    AppServer.getInstance().close();
    GameService.getInstance().reset();
});


test('play game', async () => {
    let gameMasterUuid, player1Uuid, player2Uuid;
    gameMasterUuid = await gmCreateGame();
    player1Uuid = await player1Hello();
    player2Uuid = await player2Hello();

    expect(gameMasterUuid).toBeDefined();
    expect(player1Uuid).toBeDefined();
    expect(player2Uuid).toBeDefined();

    console.log(`gameMasterUuid=${gameMasterUuid}, player1Uuid=${player1Uuid}, player2Uuid=${player2Uuid}`);

    player1.emit(SocketEventType.PLAYER_REGISTER, "PLAYER_1");
    player2.emit(SocketEventType.PLAYER_REGISTER, "PLAYER_2");

    await receivePlayerRegisters();

    gameMaster.emit(SocketEventType.GM_START_NEXT_ROUND);
    await player1ReceivedNextRound();
    await player2ReceivedNextRound();

    gameMaster.emit(SocketEventType.GM_ENABLE_BUZZER);
    await player1ReceivedBuzzerEnabled();
    await player2ReceivedBuzzerEnabled();

    // now test reconnect
    player1.disconnect();
    player2.disconnect();
    gameMaster.disconnect();

    player1.connect();
    player2.connect();
    gameMaster.connect();

    player1.emit(SocketEventType.PLAYER_RECONNECT, player1Uuid);
    player2.emit(SocketEventType.PLAYER_RECONNECT, player2Uuid);
    gameMaster.emit(SocketEventType.GM_RECONNECT, gameMasterUuid);

    gameMaster.emit(SocketEventType.GM_START_NEXT_ROUND);
    await player1ReceivedNextRound();
    await player2ReceivedNextRound();
});

async function gmCreateGame(): Promise<string> {
    gameMaster.emit(SocketEventType.GM_CREATE_GAME, "abc");
    return new Promise(resolve => {
        gameMaster.once(SocketEventType.SERVER_CONFIRM, uuid => resolve(uuid));
    });
}

async function player1Hello(): Promise<string> {
    player1.emit(SocketEventType.PLAYER_HELLO, "abc");
    return new Promise(resolve => {
        player1.once(SocketEventType.SERVER_CONFIRM, uuid => resolve(uuid));
    });
}

async function player2Hello(): Promise<string> {
    player2.emit(SocketEventType.PLAYER_HELLO, "abc");
    return new Promise(resolve => {
        player2.once(SocketEventType.SERVER_CONFIRM, uuid => resolve(uuid));
    });
}

async function receivePlayerRegisters(): Promise<void> {
    return new Promise((resolve) => {
        let foundPlayer1 = false;
        let foundPlayer2 = false;
        let registerPlayerRecCount = 0;
        gameMaster.addEventListener(SocketEventType.PLAYER_REGISTER, registeredPlayerName => {
            registerPlayerRecCount++;
            if (!foundPlayer1) foundPlayer1 = registeredPlayerName === "PLAYER_1";
            if (!foundPlayer2) foundPlayer2 = registeredPlayerName === "PLAYER_2";

            if (registerPlayerRecCount === 2) {
                gameMaster.removeAllListeners();
                expect(foundPlayer1).toBeTruthy();
                expect(foundPlayer2).toBeTruthy();
                resolve();
            }
        });
    });
}

async function player1ReceivedNextRound(): Promise<void> {
    return new Promise((resolve) => {
        player1.once(SocketEventType.GM_START_NEXT_ROUND, () => resolve());
    });
}
async function player2ReceivedNextRound(): Promise<void> {
    return new Promise((resolve) => {
        player2.once(SocketEventType.GM_START_NEXT_ROUND, () => resolve());
    });
}
async function player1ReceivedBuzzerEnabled(): Promise<void> {
    return new Promise((resolve) => {
        player1.once(SocketEventType.GM_ENABLE_BUZZER, () => resolve());
    });
}
async function player2ReceivedBuzzerEnabled(): Promise<void> {
    return new Promise((resolve) => {
        player2.once(SocketEventType.GM_ENABLE_BUZZER, () => resolve());
    });
}

const gameMaster: SocketIOClient.Socket = socketIoClient('http://localhost:' + TEST_PORT);
const player1: SocketIOClient.Socket = socketIoClient('http://localhost:' + TEST_PORT);
const player2: SocketIOClient.Socket = socketIoClient('http://localhost:' + TEST_PORT);

