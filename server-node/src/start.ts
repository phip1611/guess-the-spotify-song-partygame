import { Server as SocketIoServer, Socket } from 'socket.io';
import { SocketEventType } from './socket-events';

// INIT
const socketIo = require('socket.io');
const port = 8080;
const httpServer = require('http').createServer();
const io: SocketIoServer = socketIo(httpServer);
httpServer.listen(port);

let playersCanJoin = true;
let gameMasterSocket: Socket;
let playerSockets: Socket[] = [];

io.on('connect', (socket) => {
    console.log('client connected');

    socket.on(SocketEventType.PLAYER_HELLO, () => {
        if (playersCanJoin) {
            console.log('added player socket');
            playerSockets.push(socket);
            // notify we started the game already!
            if (gameMasterSocket) {
                console.log('notified player socket that a game was created and he can join');
                socket.emit(SocketEventType.GM_CREATE_GAME);
            }
            // else: clients are connected before a master
            // joined the game
        }
    });

    socket.on(SocketEventType.GM_CREATE_GAME, () => {
        playersCanJoin = true;
        console.log('new game created');
        // reset the old master socket
        if (gameMasterSocket && gameMasterSocket.connected) {
            gameMasterSocket.disconnect(true);
        }
        gameMasterSocket = socket;

        // disconnect all old clients that are no more connected
        playerSockets.filter(x => x.disconnected).forEach(s => s.disconnect(true));

        // notify all already connected players/clients
        playerSockets.forEach(s => s.emit(SocketEventType.GM_CREATE_GAME));
    });

    socket.on(SocketEventType.PLAYER_REGISTER, (data) => {
        if (playersCanJoin) {
            console.log(`send player register (${data}) to game master`);
            gameMasterSocket.emit(SocketEventType.PLAYER_REGISTER, data);
        }
    });
});
