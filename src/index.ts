import * as express from 'express';
import * as express_parser from 'body-parser';
import * as express_handlebars from 'express-handlebars';
import * as http from 'http';
import * as sockets from 'socket.io';
import * as config from './config';

import { RoomManager } from './RoomManager';
import { RoomController } from './RoomController';
import { RoomRouter } from './middleware/RoomRouter';
import { RoomPrototypeRouter } from './middleware/RoomPrototypeRouter';

// Initialize
let app = express();
let server = http.createServer(app);
let socketIO = sockets(server);

let roomMgr = new RoomManager(socketIO);
let roomRouter = new RoomRouter(roomMgr);
let prototypeRouter = new RoomPrototypeRouter(roomMgr);

roomMgr.purgeRooms();

// Set up handlebars for rendering prototype 
app.engine('handlebars', express_handlebars({ 
    defaultLayout: 'main', 
    layoutsDir: './src/templates/layouts/', 
    partialsDir: './src/templates/partials/', 
    helpers: { 
        footer_script: function(options) { 
            this._footer_scripts = options.fn(this); 
            return null; 
        }, 
        round_number: function(num: string, amount: any) { 
            return parseFloat(num).toFixed(parseInt(amount)); 
        } 
    } 
})); 
app.set('views', './src/templates'); 
app.set('view engine', 'handlebars'); 

// Set up routing
app.use(express_parser.json());
app.use(express_parser.urlencoded());

app.use('/api/room', roomRouter.router);
if (config.appConfig.enable_prototype) {
    app.use('/prototype', prototypeRouter.router);
}
app.use('/', express.static('build/client'));
app.use(function(error: Error, request, response, next) { //error
    response.statusCode = 500;
    response.send({
        error: config.appConfig.send_error_log ? error.message : "Unable to handle request"
    });
});

server.listen(config.appConfig.port, () => {
    console.log('Server started!');
});