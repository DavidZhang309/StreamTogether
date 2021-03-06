import { SocketService, IJoinRoomArgs } from '../socket.service';
import { RoomArgs, RoomInfo } from '../room/room';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class LobbyService {
    public constructor(private http: Http, private socketSvc: SocketService) { }

    public getRoomList(): Promise<RoomInfo[]> {
        return this.http.get('/api/room/list').toPromise()
            .then((response) => { return response.json().result as RoomInfo[] });
    }

    public createRoom(roomInfo: RoomArgs): Promise<RoomInfo> {
        return this.http.post('/api/room/create', roomInfo).toPromise()
            .then((response) => { return response.json().result as RoomInfo });
    }
    
    public joinRoom(joinArgs: IJoinRoomArgs): Promise<any> {
        return this.socketSvc.joinRoom(joinArgs);
    }
}