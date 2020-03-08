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


const newIoSocket = () => {
    return socketIoClient('http://localhost:' + TEST_PORT, {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket']
    });
};

let gameMaster: SocketIOClient.Socket;
let player1: SocketIOClient.Socket;
let player2: SocketIOClient.Socket;

beforeEach(async () => {
    gameMaster = newIoSocket();
    player1 = newIoSocket();
    player2 = newIoSocket();
    await Promise.all([connectEvent(gameMaster), connectEvent(player1), connectEvent(player2)])
});


afterEach(() => {
    GameService.getInstance().reset();

    if (gameMaster.connected) {
        gameMaster.disconnect();
    }
    if (player1.connected) {
        player1.disconnect();
    }
    if (player2.connected) {
        player2.disconnect();
    }
});

/**
 *  Cleanup WS & HTTP servers
 */
afterAll(() => {
    AppServer.getInstance().close();
});

test('play game regular', async () => {
    await _testPlayRegularGameAndDisconnect();
});

test('play game with soft reset', async () => {
    const [gameMasterUuid, player1Uuid, player2Uuid] = await _testPlayRegularGameAndDisconnect();

    gameMaster.disconnect();
    player1.disconnect();
    player2.disconnect();

    gameMaster.connect();
    player1.connect();
    player2.connect();

    const a = await reconnectGmAndServerConfirmEvent(gameMaster, gameMasterUuid);
    expect(a).toBe(gameMasterUuid);
    const b = await reconnectPlayerAndServerConfirmEvent(player1, player1Uuid);
    expect(b).toBe(player1Uuid);
    const c = await reconnectPlayerAndServerConfirmEvent(player2, player2Uuid);
    expect(c).toBe(player2Uuid);
});

test('play game with hard reset', async () => {
    const [gameMasterUuid, player1Uuid, player2Uuid] = await _testPlayRegularGameAndDisconnect();

    console.log("======================= _testPlayRegularGame done ===========================");

    // now test reconnect

    // we don't need to await locally
    gameMaster.disconnect();
    player1.disconnect();
    player2.disconnect();

    // pretend we refreshed the tab
    const newGameMaster: SocketIOClient.Socket = newIoSocket();
    const newPlayer1: SocketIOClient.Socket = newIoSocket();
    const newPlayer2: SocketIOClient.Socket = newIoSocket();

    newGameMaster.once('disconnect', () => {
        throw new Error('newGameMaster disconnected early!');
    });
    newPlayer1.once('disconnect', () => {
        throw new Error('newPlayer1 disconnected early!');
    });
    newPlayer2.once('disconnect', () => {
        throw new Error('newPlayer2 disconnected early!');
    });

    await connectEvent(newGameMaster);
    await connectEvent(newPlayer1);
    await connectEvent(newPlayer2);

    // without previous await the ids would be null here!
    console.log(`TEST: '${newGameMaster.id}', '${newPlayer1.id}', '${newPlayer2.id}'`);

    let gameMasterUuid2 = await reconnectGmAndServerConfirmEvent(newGameMaster, gameMasterUuid);
    expect(gameMasterUuid2).toBe(gameMasterUuid);

    let player1Uuid2 = await reconnectPlayerAndServerConfirmEvent(newPlayer1, player1Uuid);
    expect(player1Uuid2).toBe(player1Uuid);

    let player2Uuid2 = await reconnectPlayerAndServerConfirmEvent(newPlayer2, player2Uuid);
    expect(player2Uuid2).toBe(player2Uuid);


    // a little bit of time so that all requests will be received by the server and we
    // can see the logs
    await timeoutPromise(100);

    console.log("========================= SERVER CONFIRMS DONE =========================");

    newGameMaster.emit(SocketEventType.GM_START_NEXT_ROUND);
    await playerReceivedNextRound(newPlayer1);
    await playerReceivedNextRound(newPlayer2);

    newGameMaster.emit(SocketEventType.GM_ENABLE_BUZZER);
    await playerReceivedBuzzerEnabled(newPlayer1);
    await playerReceivedBuzzerEnabled(newPlayer2);

    // clean up
    // remove "disconnected early" listeners
    newGameMaster.removeAllListeners();
    newPlayer1.removeAllListeners();
    newPlayer2.removeAllListeners();

});

async function _testPlayRegularGameAndDisconnect(): Promise<string[]> {
    let gameMasterUuid, player1Uuid, player2Uuid;
    gameMasterUuid = await gmCreateGameAndServerConfirmEvent();
    player1Uuid = await player1HelloAndServerConfirmEvent();
    player2Uuid = await player2HelloAndServerConfirmEvent();

    expect(gameMasterUuid).toBeDefined();
    expect(player1Uuid).toBeDefined();
    expect(player2Uuid).toBeDefined();

    console.log(`gameMasterUuid=${gameMasterUuid}, player1Uuid=${player1Uuid}, player2Uuid=${player2Uuid}`);

    player1.emit(SocketEventType.PLAYER_REGISTER, "PLAYER_1");
    player2.emit(SocketEventType.PLAYER_REGISTER, "PLAYER_2");

    await receiveBothPlayerRegisterEvents();

    gameMaster.emit(SocketEventType.GM_START_NEXT_ROUND);
    await playerReceivedNextRound(player1);
    await playerReceivedNextRound(player2);

    gameMaster.emit(SocketEventType.GM_ENABLE_BUZZER);
    await playerReceivedBuzzerEnabled(player1);
    await playerReceivedBuzzerEnabled(player2);

    // check state on server
    gameMaster.disconnect();
    player1.disconnect();
    player2.disconnect();

    // make sure disconnects reach server
    await timeoutPromise(100);

    const games = Array.from(GameService.getInstance().gameIdToGameMap.values());
    games.forEach(game => {
        expect(game.gameMaster.dead).toBeTruthy();
        game.players.forEach(p => expect(p.dead).toBeTruthy)
    });

    expect(GameService.getInstance().socketIoClientIdToClientMap.size).toBe(0);

    // NOW! This has to be stay on the server! to make reconnects possible
    // expect(GameService.getInstance().clientUuidToGameIdMap.size).toBe(0);

    return new Promise(resolve => resolve([gameMasterUuid, player1Uuid, player2Uuid]));
}

async function gmCreateGameAndServerConfirmEvent(): Promise<string> {
    return new Promise(resolve => {
        gameMaster.once(SocketEventType.SERVER_CONFIRM, uuid => resolve(uuid));
        gameMaster.emit(SocketEventType.GM_CREATE_GAME, "abc");
    });
}

async function player1HelloAndServerConfirmEvent(): Promise<string> {
    return new Promise(resolve => {
        player1.once(SocketEventType.SERVER_CONFIRM, uuid => resolve(uuid));
        player1.emit(SocketEventType.PLAYER_HELLO, "abc");
    });
}

async function player2HelloAndServerConfirmEvent(): Promise<string> {
    return new Promise(resolve => {
        player2.once(SocketEventType.SERVER_CONFIRM, uuid => resolve(uuid));
        player2.emit(SocketEventType.PLAYER_HELLO, "abc");
    });
}

async function reconnectPlayerAndServerConfirmEvent(socket: SocketIOClient.Socket, playerUuid: string): Promise<string> {
    return new Promise(resolve => {
        socket.once(SocketEventType.SERVER_CONFIRM, uuid => resolve(uuid));
        socket.emit(SocketEventType.PLAYER_RECONNECT, playerUuid);
    });
}

async function reconnectGmAndServerConfirmEvent(socket: SocketIOClient.Socket, gmUuid: string): Promise<string> {
    return new Promise(resolve => {
        socket.once(SocketEventType.SERVER_CONFIRM, uuid => resolve(uuid));
        socket.emit(SocketEventType.GM_RECONNECT, gmUuid);
    });
}

async function receiveBothPlayerRegisterEvents(): Promise<void> {
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

async function playerReceivedNextRound(player: SocketIOClient.Socket): Promise<void> {
    return new Promise((resolve) => {
        console.log(`TEST: once GM_START_NEXT_ROUND for socket client id = ${player.id}`);
        player.once(SocketEventType.GM_START_NEXT_ROUND, () => resolve());
    });
}
async function playerReceivedBuzzerEnabled(player: SocketIOClient.Socket): Promise<void> {
    return new Promise((resolve) => {
        player.once(SocketEventType.GM_ENABLE_BUZZER, () => resolve());
    });
}
async function connectEvent(socket: SocketIOClient.Socket): Promise<void> {
    return new Promise(resolve => {
        socket.once('connect', () => {
            resolve();
        })
    });
}
/*async function disconnectEvent(socket: SocketIOClient.Socket): Promise<void> {
    return new Promise(resolve => {
        socket.once('disconnect', () => {
            resolve();
        })
    });
}*/
async function timeoutPromise(mseconds: number): Promise<void> {
    // a little bit of time so that all requests will be received by the server and we
    // can see the logs
    return new Promise(resolve => {
        setTimeout(() => resolve(), mseconds);
    });
}


