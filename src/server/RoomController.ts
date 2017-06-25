import { RoomDataService, IRoomInfo } from './services/RoomDataService';

export class RoomController {
    service = new RoomDataService();
    users: any = { }; //[string] => userinfo
    host: IUserInfo = null;
    chatHistory: IChatText[] = [];
    streamHistory: IStreamItem[] = [];
    currentStreamInfo: IStreamStatus = null;
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
 
    /**
     * Sends a chat message to all clients
     * @param socket The sockets to broadcast to
     * @param message The message being sent
     * @param user The user that made the chat. undefined|null means server message
     */
    protected sendChatMessage(socket, message: string, user?: string) {
        let chatEntry = {
            message: message,
            time: Date.now(),
            user: user
        };
        this.chatHistory.push(chatEntry);
        socket.emit('text', {
            result: chatEntry
        })
    }

    /**
     * Get state data package formatted for client use
     */
    protected getClientSyncData(user: IUserInfo) {
        return {
            users: Object.keys(this.users),
            history: this.streamHistory,
            chat: this.chatHistory,
            host: this.host.name,
            is_host: user.name == this.host.name,
            stream: this.currentStreamInfo
        }
    }

    protected getRoom() {
        return this.namespace.in(this.roomInfo.id);
    }

    protected removeUser(user: IUserInfo) {
        //remove from info
        delete this.users[user.name];

        //announce new user list
        this.getRoom().emit('users', { result: Object.keys(this.users) });
    }

    protected decideHost() {
        if (this.host != null) { return; } //host still exists

        let userList = Object.keys(this.users);
        if (userList.length == 0) { return; } //no one to be host

        // random host
        this.host = this.users[userList[Math.floor(Math.random() * userList.length)]];

        // announce result
        this.host.socket.emit('host', {
            result: {
                is_host: true,
                name: this.host.name
            }
        });
        this.host.socket.in(this.roomInfo.id).emit('host', {
            result: {
                is_host: false,
                name: this.host.name
            }
        });
        this.sendChatMessage(this.getRoom().in(this.roomInfo.id), this.host.name + " is now host.");
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

        //announce user join
        this.sendChatMessage(this.getRoom().in(this.roomInfo.id), user.name + " join the room.");

        // Decide if host will change from this join
        this.decideHost();

        // announce user list
        this.getRoom().emit('users', { result: Object.keys(this.users) });

        // Bind events
        socket.on('text', (text) => {
            this.sendChatMessage(this.getRoom().in(this.roomInfo.id), text, user.name);
            // this.getRoom().in(this.roomInfo.id).emit('text', { result: user.name + ": " + text } );
        });

        socket.on('queue', (url) => {
            //TODO: attempt to get metadata

        });

        //host events
        socket.on('stream', (url) => {
            if (user.name != this.host.name) { 
                ackFn({ error: 'You are not host.' }); 
                return 
            }
            
            this.currentStreamInfo = <IStreamStatus>{
                currentStream: <IStreamItem>{
                    url: url
                },
                isPlaying: false,
                lastPlay: null,
                lastPlayTime: 0
            }
            this.streamHistory.push(this.currentStreamInfo.currentStream);
            this.getRoom().emit('stream', { result: this.currentStreamInfo });
        });
        socket.on('play', (offset, time) => {
            if (user.name != this.host.name) { 
                ackFn({ error: 'You are not host.' }); 
                return 
            }
            this.currentStreamInfo.isPlaying = true;
            this.currentStreamInfo.lastPlay = time;
            this.currentStreamInfo.lastPlayTime = offset;
            this.getRoom().emit('streamEvent', { result: this.currentStreamInfo });
        });
        socket.on('pause', (offset, time) => {
            if (user.name != this.host.name) { 
                ackFn({ error: 'You are not host.' }); 
                return  
            }
            this.currentStreamInfo.isPlaying = false;
            this.currentStreamInfo.lastPlay = time;
            this.currentStreamInfo.lastPlayTime = offset;
            this.getRoom().emit('streamEvent', { result: this.currentStreamInfo });
        });
        socket.on('seek', (offset, time) => {
            this.currentStreamInfo.lastPlay = time;
            this.currentStreamInfo.lastPlayTime = offset;
            this.getRoom().emit('streamEvent', { result: this.currentStreamInfo });
        })

        // sync room
        ackFn({
            result: this.getClientSyncData(user)
        });
    }

    public clientLeave(socket) {
        let user = this.getUserFromSocket(socket);
        this.removeUser(user);
        if (this.host.name == user.name) { this.host = null; }
        this.sendChatMessage(this.getRoom().in(this.roomInfo.id), user.name + " left the room.");

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
    time: number;
}

export interface IStreamItem {
    url: string;
}

export interface IStreamStatus {
    currentStream: IStreamItem;
    isPlaying: boolean;
    lastPlay: number;
    lastPlayTime: number;
}