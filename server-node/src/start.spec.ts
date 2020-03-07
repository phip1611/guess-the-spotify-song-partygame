import * as socketIoClient from 'socket.io-client';
import { SocketEventType } from '../../common-ts/socket-events';
import { AppServer } from './app-server';
import { GameService } from './game.service';

const TEST_PORT = 63246;

// jest.setTimeout(10_000);

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


test('play game', () => {
    
});

const gameMaster: SocketIOClient.Socket = socketIoClient('http://localhost:' + TEST_PORT);
const player1: SocketIOClient.Socket = socketIoClient('http://localhost:' + TEST_PORT);
const player2: SocketIOClient.Socket = socketIoClient('http://localhost:' + TEST_PORT);

