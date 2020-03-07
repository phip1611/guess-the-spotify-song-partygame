import { dirname, join } from 'path';
import * as express from 'express';
import * as http from 'http';
import * as SocketIO from 'socket.io';

/**
 * Initializes express and socket.io. Serves /public files. Angular lies there when the application is build.
 */
export class AppServer {

    public static readonly ROOT_DIR = dirname(require.main.filename);

    public static readonly ANGULAR_DIR = join(AppServer.ROOT_DIR, 'public');

    private static httpServer;

    private static expressApp;

    private static socketIo;

    private static initDone = false;

    public static init(): void {
        if (this.initDone) {
            throw new Error('cant init twice!');
        }
        this.initDone = true;

        this.expressApp = express();
        this.httpServer = http.createServer(this.expressApp);
        this.socketIo = SocketIO(this.httpServer);

        this.expressApp.use(express.static(this.ANGULAR_DIR));

        // ---- SERVE ANGULAR APPLICATION PATHS ---- //
        this.expressApp.all('*', (req, res) => {
            res.status(200).sendFile(`/`, {root: this.ANGULAR_DIR});
        });

        this.httpServer.listen(8080);
    }

    public static getSocketIo(): SocketIO.Server {
        if (!this.initDone) {
            throw new Error('init not done yet!');
        }
        return this.socketIo;
    }
}