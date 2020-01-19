import { Server as SocketIoServer } from 'socket.io';

const socketIo = require('socket.io');

enum SocketEventType {
    PLAYER_REGISTER = 'PLAYER_REGISTER',
    PLAYER_BUZZER = 'PLAYER_BUZZER',
    GM_ENABLE_BUZZER = 'GM_ENABLE_BUZZER',
    GM_NEXT_ROUND_START = 'GM_NEXT_ROUND_START'
}

const port = 8080;
const httpServer = require('http').createServer();
const io: SocketIoServer = socketIo(httpServer);
httpServer.listen(port);

io.on('connect', (socket) => {
    console.log('client connected');
    socket.on(SocketEventType.PLAYER_REGISTER, (data) => {
        console.log('player registered: ', data);
    });
});

