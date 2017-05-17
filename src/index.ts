import * as express from 'express';
import * as express_parser from 'body-parser';
import * as http from 'http';
import * as sockets from 'socket.io';
import * as config from './config';

import { RoomManager } from './RoomManager';
import { RoomController } from './RoomController';
import { RoomRouter } from './middleware/RoomRouter';

// Initialize
let app = express();
let server = http.createServer(app);
let socketIO = sockets(server);

let roomMgr = new RoomManager(socketIO);
let roomRouter = new RoomRouter(roomMgr);

// Set up routing
app.use(express_parser.json());
app.use(express_parser.urlencoded());

app.use('/api/room',roomRouter.router);
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