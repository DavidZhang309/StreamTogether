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
    private stateSubjects: {
        users: BehaviorSubject<string[]>,
        chat: BehaviorSubject<IChatEntry[]>,
    }
    private stateData: { 
        users: string[],
        chat: IChatEntry[]
    };

    public constructor() {
        this.socket = io.connect('/rooms');
        this.events = { }
        this.stateSubjects = {
            users: new BehaviorSubject([]),
            chat: new BehaviorSubject([])
        }
        this.stateData = {
            users: [],
            chat: []
        }
    }

    // 
    protected pushEvent(event: string, data: any) {
        if (this.events[event] != null) {
            this.events[event].next(data);
        }
    }

    public getEvent(event: string): Observable<any> {
        let subject = this.events[event];
        if (subject == null) {
            subject = new Subject<any>();
        }

        this.socket.on(event, (response: ISocketResponse) => {
            subject.next(response.result);
        })

        // store and return observer
        this.events[event] = subject;
        return subject.asObservable();
    }

    public getChat(): Observable<IChatEntry[]> {
        return this.stateSubjects.chat.asObservable();
    }

    public getUsers(): Observable<string[]> {
        return this.stateSubjects.users.asObservable();
    }

    //
    public enterRoom(info: JoinInfo): Promise<IJoinResult> {
        return new Promise<IJoinResult>((resolve, reject) => {
            this.socket.emit('join', info, (result: IJoinResult) => {
                if (result.error != null) { reject(result) }
                this.stateSubjects.users.next(result.users);
                this.stateSubjects.chat.next(result.chat);
                resolve(result);
            });
        })
    }

    public leaveRoom() {
        this.socket.disconnect();
    }
}

interface ISocketResponse {
    error: any;
    result: any; 
}

interface JoinInfo {
    id: string,
    name: string
}

interface IJoinResult {
    error: string;
    chat: IChatEntry[];
    users: string[];
}

export interface IChatEntry {
    user: string,
    message: string;
    time: string;
}