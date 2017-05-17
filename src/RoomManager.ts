import { EventEmitter } from 'events';
import * as sockets from 'socket.io';
import { RoomDataService, IRoomInfo } from './services/RoomDataService'
import { RoomController } from './RoomController';

export class RoomManager extends EventEmitter {
    service = new RoomDataService();
    socketIO;
    namespace;
    rooms:any = { };

    public constructor(socketIO) {
        super();
        this.socketIO = socketIO;
        this.namespace = socketIO.of('/rooms');
        this.namespace.on('connect', (socket) => { this.handleClientEnter(socket); });
    }

    protected handleClientEnter(socket) {
        socket.on('enter', (request, ackFn) => {
            this.service.getRoom(request.id).then((roomInfo) => {
                if (roomInfo == null) { 
                    ackFn({ 
                        error: 'room does not exist' 
                    });
                 } else {
                    socket.join(request.id);
                    let room = this.rooms[request.id];
                    room.sockets.push(socket);
                    room.room.socketEnter(socket);
                    ackFn({ });
                 }
            }).catch((err) => {
                console.log(err);
                ackFn({ 
                    error: 'server unable to handle request'
                });
            });
        });
    }

    public makeRoom(info: IRoomInfo) {
        this.rooms[info.id] = {
            room: new RoomController(this.socketIO.of('/rooms').in(info.id), info),
            sockets: []
        }
    }
}