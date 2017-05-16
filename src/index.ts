import * as express from 'express';
import * as express_parser from 'body-parser';
import * as http from 'http';
import * as sockets from 'socket.io';
import * as config from './config';

import { ClientManager } from './ClientManager';
import { RoomRouter } from './middleware/RoomRouter';

let app = express();
let server = http.createServer(app);
let socketIO = sockets(server);

let clientMgr = new ClientManager(socketIO);
let roomRouter = new RoomRouter();

app.use(express_parser.json());
app.use(express_parser.urlencoded());

app.use('/api/room',roomRouter.router);
app.use('/', express.static('build/client'));

server.listen(config.devAppConfig.port, () => {
    console.log('Server started!');
});