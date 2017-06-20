import { RoomInfo } from './room';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class LobbyService {

    public constructor(private http: Http) { }

    public getRoomList(): Promise<RoomInfo[]> {
        return this.http.get('/api/room/list').toPromise()
            .then((response) => { return response.json().result as RoomInfo[] });
    }

    public createRoom(roomInfo: RoomInfo): Promise<RoomInfo> {
        return this.http.post('/api/room/create', roomInfo).toPromise()
            .then((response) => { return response.json().result as RoomInfo });
    }
}