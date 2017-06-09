import { RoomInfo } from './room';

import * as io from 'socket.io-client';

import { Injectable } from '@angular/core';

@Injectable()
export class RoomService {
    public constructor() { }

    public joinRoom(info: RoomInfo): Promise<SocketIOClient.Socket> {
        let socket = io.connect('/rooms');
        return new Promise<SocketIOClient.Socket>((resolve, reject) => {
            socket.emit('join', info, (result: ISocketResult) => {
                if (result.error == null) { reject(result.error) }
                resolve(socket);
            });
        })
    }
}

interface ISocketResult {
    error: any;
    result: any;
}