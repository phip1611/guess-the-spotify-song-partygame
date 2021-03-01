import { dirname, join } from 'path';
import * as express from 'express';
import { Express, Request, Response } from 'express';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import { GameService } from './game.service';

/**
 * Initializes express and socket.io. Serves /public files. Angular lies there when the application is build.
 */
export class AppServer {

    public static readonly ROOT_DIR = dirname(require.main.filename);

    public static readonly ANGULAR_DIR = join(AppServer.ROOT_DIR, 'public');

    private httpServer: http.Server;

    private expressApp: Express;

    private socketIo: SocketIO.Server;

    private static instance: AppServer;

    private initDone: boolean = false;

    private constructor() {
    }

    public static getInstance(): AppServer {
        if (this.instance) return this.instance;
        return this.instance = new AppServer();
    }

    public init(port = 8080): void {
        if (this.initDone) {
            throw new Error('Init already done!');
        } else {
            this.initDone = true;
        }

        this.expressApp = express();
        this.httpServer = http.createServer(this.expressApp);
        this.socketIo = new SocketIO(this.httpServer);

        this.expressApp.use(express.static(AppServer.ANGULAR_DIR));

        // TODO only if debug
        this.setupInfoEndpoint();

        // ---- SERVE ANGULAR APPLICATION PATHS ---- //

        // found good solution to allow endpoints we may have but redirect everything to this..
        // perhaps through order of the statements!
        this.expressApp.all('*', (req, res) => {
            res.status(200).sendFile(`/`, {root: AppServer.ANGULAR_DIR});
        });

        this.httpServer.listen(port);
    }

    public getSocketIo(): SocketIO.Server {
        return this.socketIo;
    }

    private setupInfoEndpoint() {
        const endpoint = '/info';
        const gs = GameService.getInstance();
        this.expressApp.get(endpoint, (req: Request, res: Response) => {
            res.setHeader('Content-type', 'application/json');

            const games = Array.from(gs.gameIdToGameMap.values()).map(g => g.toPrintable());
            return res.send({
                games: games,
                sockets: Array.from(gs.socketIoClientIdToClientMap.keys())
            });
        });
    }

    public close() {
        this.socketIo.close();
        this.httpServer.close();
    }
}