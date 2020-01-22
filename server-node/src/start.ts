import { AppServer } from './app-server';
import { GameService } from './game.service';

// order is important!
AppServer.init(); // #1
GameService.init(); // #2
