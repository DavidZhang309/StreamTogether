import { RoomDataService, IRoomInfo } from '../services/RoomDataService';

import * as http from 'http';
import * as https from 'https';
import * as urllib from 'url';

export class RoomController {
    service = new RoomDataService();
    users: { [name: string]: IUserInfo } = { };
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

    private getHttpStreamType(url: string): Promise<string> {
        let ACCEPTED_MIME = ['image', 'audio', 'video'];
        let urlObj = urllib.parse(url);
        let adapters = {
            http: http,
            https: https
        };
        return new Promise<string>((resolve, reject) => {
            let request = adapters[urlObj.protocol].http.request({
                method: 'HEAD',
                host: urlObj.host,
                port: urlObj.port,
                path: urlObj.path
            }, (response) => {
                let buffer = [];
                response.on('data', (chunk) => {
                    buffer.push(chunk);
                });
                response.on('end', () => {
                    console.log(buffer.join(''));
                    resolve(ACCEPTED_MIME[0]);
                })
            });
            request.on('error', (err) => {
                console.log(err);
                reject(err);
            })
        })
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

    protected canUserControlStream(user: IUserInfo) {
        return user.inSync && user.hasControl;
    }

    /**
     * Get state data package formatted for client use
     */
    protected getClientSyncData(user: IUserInfo) {
        return {
            users: Object.keys(this.users),
            history: this.streamHistory,
            chat: this.chatHistory,
            hasControl: user.hasControl,
            stream: this.currentStreamInfo
        }
    }

    protected getRoom(socket?: any) {
        if (!socket) { socket = this.namespace; }
        return socket.in(this.roomInfo.id);
    }

    protected removeUser(user: IUserInfo) {
        //remove from info
        delete this.users[user.name];

        //announce new user list
        this.getRoom().emit('users', { result: Object.keys(this.users) });
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
            name: joinInfo.name,
            hasControl: true, 
            inSync: true
        };

        // Add user
        this.users[user.name] = user;

        //announce user join
        this.sendChatMessage(this.getRoom().in(this.roomInfo.id), user.name + " join the room.");

        // announce user list
        this.getRoom().emit('users', { result: Object.keys(this.users) });

        // Bind events
        socket.on('text', (text) => {
            this.sendChatMessage(this.getRoom().in(this.roomInfo.id), text, user.name);
        });

        socket.on('sync', (sync) => {
            user.inSync = sync == true; //coerce to boolean
        });

        socket.on('state', (ackFn) => {
            ackFn({ result: this.getClientSyncData(user) });
        })

        //control events
        socket.on('stream', (url, ackFn) => {
            if (!this.canUserControlStream(user)) { 
                ackFn({ error: 'You cannot control the live stream.' }); 
                return 
            }
            
            this.currentStreamInfo = {
                currentStream: {
                    url: url
                },
                isPlaying: false,
                lastPlay: null,
                lastPlayTime: 0
            }
            this.streamHistory.push(this.currentStreamInfo.currentStream);
            this.getRoom().emit('stream', { result: this.currentStreamInfo });
        });
        socket.on('play', (offset, time, ackFn) => {
            if (!this.canUserControlStream(user)) { 
                ackFn({ error: 'You cannot control the live stream.' }); 
                return 
            }
            this.currentStreamInfo.isPlaying = true;
            this.currentStreamInfo.lastPlay = time;
            this.currentStreamInfo.lastPlayTime = offset;
            this.getRoom(user.socket).emit('streamEvent', { 
                result: {
                    user: user.name,
                    event: 'play',
                    stream: this.currentStreamInfo 
                }
            });
        });
        socket.on('pause', (offset, time, ackFn) => {
            if (!this.canUserControlStream(user)) { 
                ackFn({ error: 'You cannot control the live stream.' }); 
                return 
            }
            this.currentStreamInfo.isPlaying = false;
            this.currentStreamInfo.lastPlay = time;
            this.currentStreamInfo.lastPlayTime = offset;
            this.getRoom(user.socket).emit('streamEvent', { 
                result: {
                    user: user.name,
                    event: 'pause',
                    stream: this.currentStreamInfo 
                }
            });
        });
        socket.on('seek', (offset, time, ackFn) => {
            if (!this.canUserControlStream(user)) { 
                ackFn({ error: 'You cannot control the live stream.' }); 
                return 
            }
            this.currentStreamInfo.lastPlay = time;
            this.currentStreamInfo.lastPlayTime = offset;
            this.getRoom(user.socket).emit('streamEvent', { 
                result: {
                    user: user.name,
                    event: 'seek',
                    stream: this.currentStreamInfo 
                }
            });
        })

        // sync room
        ackFn({ });
    }

    public clientLeave(socket) {
        let user = this.getUserFromSocket(socket);
        this.removeUser(user);
        this.sendChatMessage(this.getRoom().in(this.roomInfo.id), user.name + " left the room.");
    }
}

export interface IUserInfo {
    socket: any;
    name: string;
    hasControl: boolean;
    inSync: boolean
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