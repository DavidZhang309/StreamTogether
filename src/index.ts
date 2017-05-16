import * as express from 'express';
import * as express_parser from 'body-parser';
import * as http from 'http';
import * as sockets from 'socket.io';
import * as config from './config';

import { RoomManager } from './RoomManager';
import { RoomController } from './RoomController';
import { RoomRouter } from './middleware/RoomRouter';

let app = express();
let server = http.createServer(app);
let socketIO = sockets(server);

let clientMgr = new RoomManager(socketIO);
let roomRouter = new RoomRouter();
roomRouter.on('roomRequest', (info) => {
    clientMgr.makeRoom(info);
});

app.use(express_parser.json());
app.use(express_parser.urlencoded());

app.use('/api/room',roomRouter.router);
app.use('/', express.static('build/client'));

server.listen(config.devAppConfig.port, () => {
    console.log('Server started!');
});