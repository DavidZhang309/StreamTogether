import { RoomDataService, IRoomInfo } from './services/RoomDataService';


export class RoomController {
    service = new RoomDataService();
    users: any[] = [];
    roomInfo: IRoomInfo;
    room: any;
    
    public constructor(room, roomInfo: IRoomInfo) {
        this.roomInfo = roomInfo;
        this.room = room;
    }

    public socketEnter(socket) {
        socket.on('join', (joinInfo) => {
            // Authenticate client
            let user = {
                socket: socket,
                name: joinInfo.name
            }

            // Add user
            this.users.push(user);

            // Bind events
            socket.on('text', (text) => {
                console.log(text);
                this.room.emit('text', user.name + " said: " + text);
            });
        });
    }
}