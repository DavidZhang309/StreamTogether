import { RoomDataService, IRoomInfo } from './services/RoomDataService';


export class RoomController {
    service = new RoomDataService();
    users: any = { }; //[string] => userinfo
    host: IUserInfo = null;
    chatHistory: IChatText[] = [];
    roomInfo: IRoomInfo;
    namespace: any;
    
    public constructor(namespace, roomInfo: IRoomInfo) {
        this.roomInfo = roomInfo;
        this.namespace = namespace;
    }

    private getUserFromSocket(socket): IUserInfo {
        let names = Object.keys(this.users);
        for(let i = 0; i < names.length; i++) {
            if (socket.id == this.users[names[i]].socket.id) { return this.users[names[i]] }
        }
        return undefined;
    }
 
    protected getRoom() {
        return this.namespace.in(this.roomInfo.id);
    }

    protected removeUser(user: IUserInfo) {
        //remove from info
        delete this.users[user.name];

        //announce new user list
        this.getRoom().emit('users', Object.keys(this.users));
    }

    protected decideHost() {
        if (this.host != null) { return; } //host still exists

        let userList = Object.keys(this.users);
        if (userList.length == 0) { return; } //no one to be host

        // random host
        this.host = this.users[userList[Math.floor(Math.random() * userList.length)]];

        // announce result
        this.host.socket.emit('host', {
            is_host: true,
            name: this.host.name
        })
        this.host.socket.in(this.roomInfo.id).emit('host', {
            is_host: false,
            name: this.host.name
        });
    }

    public verifyUser(joinInfo): Promise<boolean> {
        // check if name conflicts
        // NOTE: this is a promise due to possible async actions in the future
        return new Promise<boolean>((resolve, reject) => {
            if (Object.keys(this.users).indexOf(joinInfo.name) >= 0) { 
                // Name taken, cannot join
                reject(new Error('Name taken.'));
            } else {
                resolve(true);
            }
        });
    }

    public clientJoin(socket, joinInfo, ackFn) {
        let user = {
            socket: socket,
            name: joinInfo.name
        };

        // Add user
        this.users[user.name] = user;

        this.decideHost();

        // announce user list
        this.getRoom().emit('users', Object.keys(this.users));

        // Bind events
        socket.on('text', (text) => {
            this.chatHistory.push(<IChatText>{ 
                user: user.name,
                message: text,
                time: new Date(Date.now())
            });
            this.getRoom().in(this.roomInfo.id).emit('text', user.name + ": " + text);
        });

        // sync room
        ackFn({ 
            chat: this.chatHistory,
            users: Object.keys(this.users),
        });
    }

    public clientLeave(socket) {
        let user = this.getUserFromSocket(socket);
        this.removeUser(user);
        if (this.host.name == user.name) { this.host = null; }

        if (this.host == null) { this.decideHost(); }
    }
}

export interface IUserInfo {
    socket;
    name: string;
}

export interface IChatText {
    user: string; // null if server
    message: string;
    time: Date;
}

export interface IStreamItem {
    user: string;
    url: string;
}