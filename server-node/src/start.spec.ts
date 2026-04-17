import { jest } from '@jest/globals';
import { io, Socket } from 'socket.io-client';
import { SocketEventType } from '../../common-ts/socket-events.js';
import { AppServer } from './app-server.js';
import { GameService } from './game.service.js';
import { Game, GameId } from './game.js';
import { ClientUuid } from './client.js';

const TEST_PORT = 63246;
const SOCKET_CLEANUP_TIMEOUT_MS = 500;

jest.setTimeout(20000);

beforeAll(() => {
    const appServer = AppServer.getInstance();
    const gameService = GameService.getInstance();
    // order is important!
    appServer.init(TEST_PORT); // #1
    gameService.init(); // #2
});


const newIoSocket = () => {
    const socket = io('http://localhost:' + TEST_PORT, {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket']
    });
    testSockets.push(socket);
    return socket;
};

const GAME_ID: GameId = 'abc';
let gameMaster: Socket;
let player1: Socket;
let player2: Socket;
let testSockets: Socket[] = [];

beforeEach(async () => {
    testSockets = [];
    gameMaster = newIoSocket();
    player1 = newIoSocket();
    player2 = newIoSocket();
    await Promise.all([receiveEvent(gameMaster, 'connect'), receiveEvent(player1, 'connect'), receiveEvent(player2, 'connect')])
});


afterEach(async () => {
    await Promise.all(testSockets.map(closeSocket));
    await waitFor(() => GameService.getInstance().socketIoClientIdToClientMap.size === 0, SOCKET_CLEANUP_TIMEOUT_MS);
    GameService.getInstance().reset();
    testSockets = [];
});

/**
 *  Cleanup WS & HTTP servers
 */
afterAll(async () => {
    GameService.getInstance().close();
    await AppServer.getInstance().close();
});

test('play game regular', async () => {
    await _createGameAndConnectPlayers();
    for (let i = 0; i < 50; i++) {
        await _playGameRound();
    }

    // check state on server
    await Promise.all([closeSocket(gameMaster), closeSocket(player1), closeSocket(player2)]);
    await waitFor(() => GameService.getInstance().socketIoClientIdToClientMap.size === 0, SOCKET_CLEANUP_TIMEOUT_MS);

    const games = Array.from(GameService.getInstance().gameIdToGameMap.values());
    games.forEach(game => {
        expect(game.gameMaster.dead).toBeTruthy();
        game.players.forEach(p => expect(p.dead).toBeTruthy)
    });

    expect(GameService.getInstance().socketIoClientIdToClientMap.size).toBe(0);
    expect(GameService.getInstance().clientUuidMap.size).toBe(3); // knows player1, player2, and game master
});

test('play game with soft reset', async () => {
    const [gameMasterUuid, player1Uuid, player2Uuid] = await _createGameAndConnectPlayers();
    for (let i = 0; i < 50; i++) {
        await _playGameRound();
    }

    gameMaster.disconnect();
    player1.disconnect();
    player2.disconnect();

    gameMaster.connect();
    player1.connect();
    player2.connect();

    gameMaster.emit(SocketEventType.GM_RECONNECT, gameMasterUuid);
    player1.emit(SocketEventType.PLAYER_RECONNECT, player1Uuid);
    player2.emit(SocketEventType.PLAYER_RECONNECT, player2Uuid);

    const [gameMasterUuidCpy, player1UuidCpy, player2UuidCpy] = await Promise.all([
        receiveEvent<ClientUuid>(gameMaster, SocketEventType.SERVER_CONFIRM),
        receiveEvent<ClientUuid>(player1, SocketEventType.SERVER_CONFIRM),
        receiveEvent<ClientUuid>(player2, SocketEventType.SERVER_CONFIRM)
    ]);
    expect(gameMasterUuidCpy).toBe(gameMasterUuid);
    expect(player1UuidCpy).toBe(player1Uuid);
    expect(player2UuidCpy).toBe(player2Uuid);

    // play a few rounds
    for (let i = 0; i < 50; i++) {
        await _playGameRound();
    }

    expect(getGame().playersConnected.length).toBe(2);

    // now just reconnect one player again
    // and check
    await closeSocket(player1);
    player1.connect();

    await waitFor(() => getGame().playersConnected.length === 1, SOCKET_CLEANUP_TIMEOUT_MS);
    expect(getGame().playersConnected.length).toBe(1);

    player1.emit(SocketEventType.PLAYER_RECONNECT, player1Uuid);
    await expect(receiveEvent(player1, SocketEventType.SERVER_CONFIRM)).resolves.toBe(player1Uuid);
    expect(getGame().playersConnected.length).toBe(2);
    expect(getGame().playersConnected.find(p => p.uuid === player1Uuid)!.socket.connected).toBeTruthy();
    expect(getGame().playersConnected.find(p => p.uuid === player1Uuid)!.socketIoClientId).toBe(player1.id);
    expect(getGame().playersConnected.find(p => p.uuid === player2Uuid)!.socket.connected).toBeTruthy();
    expect(getGame().playersConnected.find(p => p.uuid === player2Uuid)!.socketIoClientId).toBe(player2.id);

    // play a few rounds
    for (let i = 0; i < 50; i++) {
        await _playGameRound();
    }
});

test('play game with hard reset', async () => {
    const [gameMasterUuid, player1Uuid, player2Uuid] = await _createGameAndConnectPlayers();
    for (let i = 0; i < 50; i++) {
        await _playGameRound();
    }

    // now test reconnect

    await Promise.all([closeSocket(gameMaster), closeSocket(player1), closeSocket(player2)]);

    // pretend we refreshed the tab
    const newGameMaster: Socket = newIoSocket();
    const newPlayer1: Socket = newIoSocket();
    const newPlayer2: Socket = newIoSocket();

    newGameMaster.once('disconnect', () => {
        throw new Error('newGameMaster disconnected early!');
    });
    newPlayer1.once('disconnect', () => {
        throw new Error('newPlayer1 disconnected early!');
    });
    newPlayer2.once('disconnect', () => {
        throw new Error('newPlayer2 disconnected early!');
    });

    await Promise.all([
        receiveEvent(newGameMaster, 'connect'),
        receiveEvent(newPlayer1, 'connect'),
        receiveEvent(newPlayer2, 'connect'),
    ]);

    newGameMaster.emit(SocketEventType.GM_RECONNECT, gameMasterUuid);
    newPlayer1.emit(SocketEventType.PLAYER_RECONNECT, player1Uuid);
    newPlayer2.emit(SocketEventType.PLAYER_RECONNECT, player2Uuid);

    const [gameMasterUuidCpy, player1UuidCpy, player2UuidCpy] = await Promise.all([
        receiveEvent<ClientUuid>(newGameMaster, SocketEventType.SERVER_CONFIRM),
        receiveEvent<ClientUuid>(newPlayer1, SocketEventType.SERVER_CONFIRM),
        receiveEvent<ClientUuid>(newPlayer2, SocketEventType.SERVER_CONFIRM)
    ]);
    expect(gameMasterUuidCpy).toBe(gameMasterUuid);
    expect(player1UuidCpy).toBe(player1Uuid);
    expect(player2UuidCpy).toBe(player2Uuid);

    expect(getGame().playersConnected.length).toBe(2);
    expect(getGame().players.filter(c => c.dead).length).toBe(0);
    expect(getGame().playersConnected.find(p => p.uuid === player1Uuid)!.socket.connected).toBeTruthy();
    expect(getGame().playersConnected.find(p => p.uuid === player1Uuid)!.socketIoClientId).toBe(newPlayer1.id);
    expect(getGame().playersConnected.find(p => p.uuid === player2Uuid)!.socket.connected).toBeTruthy();
    expect(getGame().playersConnected.find(p => p.uuid === player2Uuid)!.socketIoClientId).toBe(newPlayer2.id);

    for (let i = 0; i < 50; i++) {
        await _playGameRoundWithSockets(newGameMaster, newPlayer1, newPlayer2);
    }

    // clean up
    // remove "disconnected early" listeners
    newGameMaster.removeAllListeners();
    newPlayer1.removeAllListeners();
    newPlayer2.removeAllListeners();

});

test('rejects player hello for unknown game without attaching forwarders', async () => {
    const strayPlayer = newIoSocket();
    await receiveEvent(strayPlayer, 'connect');

    strayPlayer.emit(SocketEventType.PLAYER_HELLO, 'missing');
    await expectNoEvent(strayPlayer, SocketEventType.SERVER_CONFIRM, 100);

    const spy = jest.fn();
    gameMaster.on(SocketEventType.PLAYER_BUZZER, spy);
    strayPlayer.emit(SocketEventType.PLAYER_BUZZER, 'STRAY_PLAYER');
    await timeoutPromise(50);

    expect(spy).not.toHaveBeenCalled();
    expect(GameService.getInstance().socketIoClientIdToClientMap.size).toBe(0);

    await closeSocket(strayPlayer);
    gameMaster.removeListener(SocketEventType.PLAYER_BUZZER, spy);
});

test('rejects reconnect with unknown uuid without attaching forwarders', async () => {
    const strayPlayer = newIoSocket();
    await receiveEvent(strayPlayer, 'connect');

    strayPlayer.emit(SocketEventType.PLAYER_RECONNECT, 'missing-uuid');
    await expectNoEvent(strayPlayer, SocketEventType.SERVER_CONFIRM, 100);

    const spy = jest.fn();
    gameMaster.on(SocketEventType.PLAYER_REGISTER, spy);
    strayPlayer.emit(SocketEventType.PLAYER_REGISTER, 'STRAY_PLAYER');
    await timeoutPromise(50);

    expect(spy).not.toHaveBeenCalled();
    expect(GameService.getInstance().clientUuidMap.has('missing-uuid')).toBeFalsy();

    await closeSocket(strayPlayer);
    await waitFor(() => GameService.getInstance().socketIoClientIdToClientMap.size === 0, SOCKET_CLEANUP_TIMEOUT_MS);

    gameMaster.removeListener(SocketEventType.PLAYER_REGISTER, spy);
});

/**
 * Utility method for tests. Creates a game on the server and let the players join the game.
 */
async function _createGameAndConnectPlayers(): Promise<ClientUuid[]> {
    gameMaster.emit(SocketEventType.GM_CREATE_GAME, GAME_ID);
    player1.emit(SocketEventType.PLAYER_HELLO, GAME_ID);
    player2.emit(SocketEventType.PLAYER_HELLO, GAME_ID);

    const [gameMasterUuid, player1Uuid, player2Uuid] = await Promise.all([
        receiveEvent<ClientUuid>(gameMaster, SocketEventType.SERVER_CONFIRM),
        receiveEvent<ClientUuid>(player1, SocketEventType.SERVER_CONFIRM),
        receiveEvent<ClientUuid>(player2, SocketEventType.SERVER_CONFIRM)
    ]);

    expect(gameMasterUuid).toBeDefined();
    expect(player1Uuid).toBeDefined();
    expect(player2Uuid).toBeDefined();

    console.log(`gameMasterUuid=${gameMasterUuid}, player1Uuid=${player1Uuid}, player2Uuid=${player2Uuid}`);

    player1.emit(SocketEventType.PLAYER_REGISTER, 'PLAYER_1');
    player2.emit(SocketEventType.PLAYER_REGISTER, 'PLAYER_2');

    const playerNames = await receiveEvents(gameMaster, SocketEventType.PLAYER_REGISTER, 2);
    expect(playerNames.length).toBe(2);
    expect(playerNames.includes('PLAYER_1')).toBeTruthy();
    expect(playerNames.includes('PLAYER_2')).toBeTruthy();

    return [gameMasterUuid, player1Uuid, player2Uuid];
}

/**
 * Plays a full game rounds with GM_START_NEXT_ROUND, GM_ENABLE_BUZZER, PLAYER_BUZZERED
 * and waits for all events to be received with the global vars (gameMaster, player1, player2).
 */
async function _playGameRound(): Promise<void> {
    return _playGameRoundWithSockets(gameMaster, player1, player2);
}

/**
 * Like {@link _playGameRound} but sockets to be used can be specified.
 */
async function _playGameRoundWithSockets(gmSocket: Socket, player1Socket: Socket, player2Socket: Socket): Promise<void> {
    gmSocket.emit(SocketEventType.GM_START_NEXT_ROUND);
    await Promise.all([
        receiveEvent(player1Socket, SocketEventType.GM_START_NEXT_ROUND),
        receiveEvent(player2Socket, SocketEventType.GM_START_NEXT_ROUND)
    ]);

    gmSocket.emit(SocketEventType.GM_ENABLE_BUZZER);
    await Promise.all([
        receiveEvent(player1Socket, SocketEventType.GM_ENABLE_BUZZER),
        receiveEvent(player2Socket, SocketEventType.GM_ENABLE_BUZZER)
    ]);

    player1Socket.emit(SocketEventType.PLAYER_BUZZER);
    player2Socket.emit(SocketEventType.PLAYER_BUZZER);

    // two events
    await receiveEvents(gmSocket, SocketEventType.PLAYER_BUZZER, 2);
}


async function receiveEvent<T>(socket: Socket, type: SocketEventType | string): Promise<T> {
    return new Promise((resolve) => {
        socket.once(type, (val: T) => resolve(val));
    });
}

async function expectNoEvent(socket: Socket, type: SocketEventType | string, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.removeListener(type, onEvent);
            resolve();
        }, timeoutMs);

        const onEvent = (value: unknown) => {
            clearTimeout(timer);
            socket.removeListener(type, onEvent);
            reject(new Error(`Unexpected event ${String(type)} with payload ${JSON.stringify(value)}`));
        };

        socket.on(type, onEvent);
    });
}

async function closeSocket(socket: Socket | undefined): Promise<void> {
    if (!socket || !socket.connected) {
        return;
    }

    await new Promise<void>((resolve) => {
        socket.once('disconnect', () => resolve());
        socket.disconnect();
    });
}

async function waitFor(predicate: () => boolean, timeoutMs: number, pollMs = 10): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (predicate()) {
            return;
        }
        await timeoutPromise(pollMs);
    }

    throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Use this when you expect multiple events of the same type during the next time period.
 * Removes all listeners of 'type' afterwards.
 */
async function receiveEvents<T>(socket: Socket, type: SocketEventType | string, count: number): Promise<T[]> {
    return new Promise((resolve) => {
        let i = 0;
        const data: T[] = [];
        socket.on(type, (rec: T) => {
            i++;
            if (i === count) {
                socket.removeAllListeners(type);
                resolve(data);
            }
            data.push(rec);
        });
    });
}
/** Promise around setTimeout */
async function timeoutPromise(mseconds: number): Promise<void> {
    // a little bit of time so that all requests will be received by the server and we
    // can see the logs
    return new Promise(resolve => {
        setTimeout(() => resolve(), mseconds);
    });
}


function getGame(): Game {
    return GameService.getInstance().gameIdToGameMap.get('abc')!;
}
