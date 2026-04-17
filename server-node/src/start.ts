import { AppServer } from './app-server.js';
import { GameService } from './game.service.js';

const appServer = AppServer.getInstance();
const gameService = GameService.getInstance();

// order is important!
appServer.init(); // #1
gameService.init(); // #2
