import { RoomInfo } from './room';

import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RoomService {
    private socket: SocketIOClient.Socket;
    private events: { [event:string]: Subject<any> };

    public constructor() {
        this.socket = io.connect('/rooms');
        this.events = { }
    }

    // 
    protected pushEvent(event: string, data: any) {
        if (this.events[event] != null) {
            this.events[event].next(data);
        }
    }

    //
    public enterRoom(info: JoinInfo): Promise<IJoinResult> {
        return new Promise<IJoinResult>((resolve, reject) => {
            this.socket.emit('join', info, (result: IJoinResult) => {
                if (result.error != null) { reject(result) }
                resolve(result)
            });
        })
    }

    public getEvent(event: string): Observable<any> {
        let subject = this.events[event];
        if (subject == null) {
            subject = new Subject<any>();
        }

        this.socket.on(event, (result: ISocketData) => {
            subject.next(result);
        })

        // store and return observer
        this.events[event] = subject;
        return subject.asObservable();
    }

    public leaveRoom() {
        this.socket.disconnect();
    }
}

interface ISocketData {
    error: any;
    // result: any; 
}

interface JoinInfo {
    id: string,
    name: string
}

interface IJoinResult {
    error: string;
    chat: string[];
    users: string[];
}