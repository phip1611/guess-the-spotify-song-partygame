import { SocketEventType } from '../../common-ts/socket-events';
import { Client, ClientType } from './client';

export class Log {

    static eventReceived(type: SocketEventType, socketIoClientId: string, payload?: any) {
        this.log(`received '${type}'(${payload ? JSON.stringify(payload) : ''}), socketIoClientId: '${socketIoClientId}'`);
    }

    static eventSent(type: SocketEventType, gameId: string, clientUuid, socketIoClientId: string, payload?: any, ) {
        this.log(`sent '${type}'(${payload ? JSON.stringify(payload) : ''}); gameId='${gameId}', clientUuid='${clientUuid}', socketIoClientId: '${socketIoClientId}'`);
    }

    static disconnectedSocket(client: Client) {
        this.log(`Socket disconnected for '${ClientType[client.type]}', socketIoClientId: '${client.socketIoClientId}', clientUuid: '${client.uuid}'`);
    }

    static log(msg: string | object): void {
        console.log('[Server]: ' + msg);
    }

    static warn(msg: string | object): void {
        console.warn('[Server]: ' + msg);
    }

    static debug(msg: string | object): void {
        console.debug('[Server]: ' + msg);
    }

    static error(msg: string | object): void {
        console.error('[Server]: ' + msg);
    }

    static info(msg: string | object): void {
        console.info('[Server]: ' + msg);
    }


}