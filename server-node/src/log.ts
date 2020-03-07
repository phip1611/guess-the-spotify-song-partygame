import { SocketEventType } from '../../common-ts/socket-events';
import { Client } from './client';

export class Log {

    static eventReceived(type: SocketEventType, socketIoClientId: string, payload?: any) {
        console.log(`Server received '${type}'(${payload ? JSON.stringify(payload) : ''}), socketIoClientId: '${socketIoClientId}'`);
    }

    static eventSent(type: SocketEventType, gameId: string, clientUuid, socketIoClientId: string, payload?: any, ) {
        console.log(`Server sent '${type}'(${payload ? JSON.stringify(payload) : ''}); gameId='${gameId}', clientUuid='${clientUuid}', socketIoClientId: '${socketIoClientId}'`);
    }

    static invalidGameId(type: SocketEventType) {
        console.error(`Server: Can't join game because game id doesn't exist! [${type}] `);
    }

    static invalidClientUuid(type: SocketEventType) {
        console.error(`Server: Invalid client uuid! Can't rejoin! [${type}]`);
    }

    static invalidGame(type: SocketEventType, gameId: string) {
        console.error(`Server: Can't join game with id '${gameId}' via [${type}] because it doesn't exist (anymore)!`);
    }

    static addedClientToGame(type: SocketEventType, gameId: string, clientUuid: string, socketIoClientId: string, clientType: 'player' | 'gameMaster') {
        console.log(`Server: Added ${clientType} (${clientUuid}) via [${type}] to game '${gameId}', socketIoClientId: '${socketIoClientId}'`);
    }

    static reconnectedClientToGame(type: SocketEventType, gameId: string, clientUuid: string, socketIoClientId: string, clientType: 'player' | 'gameMaster') {
        console.log(`Server: Reconnected ${clientType} (${clientUuid}) via [${type}] to game '${gameId}', socketIoClientId: '${socketIoClientId}'`);
    }

    static disconnectedSocket(client: Client, clientType: 'player' | 'gameMaster') {
        console.log(`Server: Manually disconnected '${clientType}', socketIoClientId: '${client.socketIoClientId}', clientUuid: '${client.uuid}'`);
    }
}