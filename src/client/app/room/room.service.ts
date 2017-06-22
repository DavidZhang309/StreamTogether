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

    private stateSubjects: {
        users: BehaviorSubject<string[]>,
        chat: BehaviorSubject<IChatEntry[]>,
        isHost: BehaviorSubject<boolean>,
        stream: Subject<IStreamStatus>
    }
    private stateData: { 
        users: string[],
        chat: IChatEntry[],
        stream: IStreamStatus
    };

    public constructor() {
        this.socket = io.connect('/rooms');
        this.stateSubjects = {
            users: new BehaviorSubject([]),
            chat: new BehaviorSubject([]),
            isHost: new BehaviorSubject(false),
            stream: new Subject()
        }
        this.stateData = {
            users: [],
            chat: [],
            stream: null
        }
    }

    public getChat(): Observable<IChatEntry[]> {
        return this.stateSubjects.chat.asObservable();
    }

    public getUsers(): Observable<string[]> {
        return this.stateSubjects.users.asObservable();
    }

    public isHost(): Observable<boolean> {
        return this.stateSubjects.isHost.asObservable();
    }

    public getStream(): Observable<IStreamStatus> {
        return this.stateSubjects.stream.asObservable();
    }

    //
    public enterRoom(info: JoinInfo): Promise<ISyncData> {
        return new Promise<ISyncData>((resolve, reject) => {
            this.socket.emit('join', info, (response: ISocketResponse) => {
                if (response.error != null) { reject(response.error) }
                let result: ISyncData = response.result;

                this.stateData.chat = result.chat;
                this.stateSubjects.chat.next(this.stateData.chat);
                
                this.stateSubjects.users.next(result.users);
                this.stateSubjects.isHost.next(result.is_host);
                
                if (result.stream != null) {
                    this.stateData.stream = result.stream;
                    this.stateSubjects.stream.next(result.stream);
                }

                resolve(result);
            });
            this.socket.on('text', (response: ISocketResponse) => {
                this.stateData.chat.push(response.result);
                this.stateSubjects.chat.next(this.stateData.chat);
            });
            this.socket.on('users', (response: ISocketResponse) => {
                this.stateSubjects.users.next(response.result);
            });
            this.socket.on('host', (response: ISocketResponse) => {
                this.stateSubjects.isHost.next(response.result.is_host);
            });
            this.socket.on('stream', (response: ISocketResponse) => {
                this.stateSubjects.stream.next(response.result);
            });
        })
    }

    public leaveRoom() {
        this.socket.disconnect();
    }

    public sendChatMessage(text: string) {
        this.socket.emit('text', text);
    }

    public stream(url: string) {
        this.socket.emit('stream', url);
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

interface ISyncData {
    error: string;
    chat: IChatEntry[];
    users: string[];
    is_host: boolean;
    stream: IStreamStatus;
}

export interface IChatEntry {
    user: string,
    message: string;
    time: string;
}

interface IStreamItem {
    url: string;
}
export interface IStreamStatus {
    currentStream: IStreamItem;
    isPlaying: boolean;
    lastPlay: number;
    lastPlayTime: number;
}