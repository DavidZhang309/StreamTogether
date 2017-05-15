import * as express from 'express';
import * as http from 'http';
import * as sockets from 'socket.io';
import * as config from './config';

import { ClientManager } from './ClientManager';

let app = express();
let server = http.createServer(app);
let socketIO = sockets(server);

let appRouter = new ClientManager(socketIO);

app.use('/', express.static('build/client'));

server.listen(config.devAppConfig.port, () => {
    console.log('Server started!');
});