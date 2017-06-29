import * as io from 'socket.io-client';

export enum SocketState { Lobby, Room };
export class SocketService {
    private socket: any;
    private state: SocketState;

    public constructor() {
        this.socket = io.connect('/rooms');        
    }

    public getSocket() {
        return this.socket;
    }

    public getState(): SocketState {
        return this.state;
    }

    public joinRoom(joinArgs: IJoinRoomArgs): Promise<any> {
        if (this.state == SocketState.Room) {
            throw new Error('Incorrect state for joining');
        }

        return new Promise((resolve, reject) => {
            this.socket.emit('join', joinArgs, (response: ISocketResponse) => {
                if (response.error) { 
                    reject(response.error);
                } else {
                    this.state = SocketState.Room;
                    resolve(response.result);
                }
            });
        });
    }

    public leaveRoom() {
        if (this.state == SocketState.Room) {
            this.socket.emit('leave');
            this.state = SocketState.Lobby;
        } else {
            throw new Error('Incorrect state for leaving');
        }
    }
}

export interface ISocketResponse {
    error: any;
    result: any; 
}

export interface IJoinRoomArgs {
    id: string;
    name: string;
    password?: string;
}