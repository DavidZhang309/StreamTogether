import * as sockets from 'socket.io';
import { RoomDataService, IRoomInfo } from './services/RoomDataService'
import { RoomController } from './RoomController';

export class RoomManager {
    service = new RoomDataService();
    namespace: any;
    rooms:any = { };

    public constructor(socketIO) {
        this.namespace = socketIO.of('/rooms');
        this.namespace.on('connect', (socket) => { this.handleClientEnter(socket); });
    }

    protected handleClientEnter(socket) {
        let room: RoomController = null; // single room only (per socket)
        socket.on('join', (request, ackFn) => {
            if (room != null) {
                ackFn({ 
                    error: 'only 1 room per connection' 
                });
                return;
            }
            this.service.getRoom(request.id).then((roomInfo) => {
                if (roomInfo == null) { 
                    ackFn({ 
                        error: 'room does not exist' 
                    });
                 } else {
                    let joinRoom: RoomController = this.rooms[request.id];
                    joinRoom.verifyUser(request).then(() => {
                        room = joinRoom;
                        socket.join(request.id, () => {
                            room.clientJoin(socket, request, ackFn);
                        });
                    }).catch((err) =>{
                        console.log(err);
                        ackFn({ error: 'join failed: ' + err.message })
                    })
                 }
            }).catch((err) => {
                console.log(err);
                ackFn({ 
                    error: 'server unable to handle request'
                });
            });
        });

        socket.on('disconnect', () => {
            if (room != null) { room.clientLeave(socket); }
        });

        socket.on('leave', () => {
            if (room != null) {
                socket.leave(room.roomInfo.id);
                room.clientLeave(socket);
                room = null;
            }
        });
    }

    
    public getRoomList(): Promise<IRoomInfo[]> {
        return this.service.getRoomList().then((roomList) => {
            return roomList.map((roomInfo) => { 
                let room: RoomController = this.rooms[roomInfo.id];
                return <IRoomInfo>{
                    id: roomInfo.id,
                    name: roomInfo.name,
                    user_count: Object.keys(room.users).length
                }
            })
        });
    }

    public makeRoom(info: IRoomInfo): Promise<IRoomInfo> {
        return this.service.createRoom(info).then((roomInfo) => {
            this.rooms[info.id] = new RoomController(this.namespace, info)
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