import * as sockets from 'socket.io';
import { RoomDataService } from './services/RoomDataService'

export class ClientManager {
    service = new RoomDataService();

    public constructor(socketIO) {
        socketIO.on('connection', (socket) => { this.handleNewClient(socket); });
    }

    protected handleNewClient(socket) {
        socket.on('join', (request) => {
            this.service.getRoom(request.id).then((roomInfo) => {
                if (roomInfo == null) { 
                    socket.emit('op_error', { error: 'room does not exist' });
                 } else {
                    socket.join('/rooms/' + request.id);
                 }
            }).catch((err) => {
                console.log(err);
                socket.emit('op_error', { error: 'server unable to handle request'});
            });
        })
        //socket.on('create', )
    }
}