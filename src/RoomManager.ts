import * as sockets from 'socket.io';
import { RoomDataService, IRoomInfo } from './services/RoomDataService'
import { RoomController } from './RoomController';

export class RoomManager {
    service = new RoomDataService();
    socketIO;
    namespace;
    rooms:any = { };

    public constructor(socketIO) {
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
                    room.socketEnter(socket);
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

    
    public getRoomList(): Promise<IRoomInfo[]> {
        return this.service.getRoomList().then((roomList) => {
            return roomList.map((room) => { 
                return <IRoomInfo>{
                    id: room.id,
                    name: room.name
                }
            })
        });
    }

    public makeRoom(info: IRoomInfo): Promise<IRoomInfo> {
        return this.service.createRoom(info).then((roomInfo) => {
            this.rooms[info.id] = new RoomController(this.socketIO.of('/rooms').in(info.id), info)
            return roomInfo;
        });
    }

    public purgeRooms() {
        this.service.getRoomList().then((rooms) => {
            // TODO: filter out persistant rooms
            let oldRooms = rooms;

            // TODO: keep connection for efficiency
            oldRooms.forEach((room) => {
                this.service.destroyRoom(room);
            })
        })
    }
}