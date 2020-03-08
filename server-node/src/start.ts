import { AppServer } from './app-server';
import { GameService } from './game.service';

const appServer = AppServer.getInstance();
const gameService = GameService.getInstance();

// order is important!
appServer.init(); // #1
gameService.init(); // #2

// TODO if is debug
// appServer.setupInfoEndpoint();
