import { Server as SocketIoServer, Socket } from 'socket.io';
import { SocketEventType } from './socket-events';

// INIT
const socketIo = require('socket.io');
const port = 8080;
const httpServer = require('http').createServer();
const io: SocketIoServer = socketIo(httpServer);
httpServer.listen(port);

let gameMasterSocket: Socket;
let clientSockets: Socket[] = [];

io.on('connect', (socket) => {
    console.log('client connected');

    socket.on(SocketEventType.GM_CREATE_GAME, () => {
        console.log('new game created');
        if (gameMasterSocket && gameMasterSocket.connected) {
            gameMasterSocket.disconnect(true);
        }
        clientSockets.forEach(s => s.disconnect(true));
        clientSockets = [];
        gameMasterSocket = socket;
    });

    socket.on(SocketEventType.PLAYER_REGISTER, (data) => {
        console.log(`send player register (${data}) to game master`);
        gameMasterSocket.emit(SocketEventType.PLAYER_REGISTER, data);
    });
});

