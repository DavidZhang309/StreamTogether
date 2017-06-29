import { SocketService, ISocketResponse, SocketState } from '../socket.service';
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
        history: BehaviorSubject<IStreamItem[]>,
        chat: BehaviorSubject<IChatEntry[]>,
        stream: Subject<IStreamStatus>,
        streamEvents: Subject<IStreamEvent>,
        hasControl: BehaviorSubject<boolean>
        inSync: BehaviorSubject<boolean>
    }
    private stateData: { 
        users: string[],
        chat: IChatEntry[],
        history: IStreamItem[],
        stream: IStreamStatus,
        hasControl: boolean,
        inSync: boolean
    };

    public constructor(private socketSvc: SocketService) {
        this.socket = socketSvc.getSocket();
        this.stateSubjects = {
            users: new BehaviorSubject([]),
            history: new BehaviorSubject([]),
            chat: new BehaviorSubject([]),
            stream: new Subject(),
            streamEvents: new Subject(),
            hasControl: new BehaviorSubject(false),
            inSync: new BehaviorSubject(true)
        }
        this.stateData = {
            users: [],
            chat: [],
            history: [],
            stream: null,
            hasControl: false,
            inSync: true
        }

        this.socket.on('text', (response: ISocketResponse) => {
            this.stateData.chat.push(response.result);
            this.stateSubjects.chat.next(this.stateData.chat);
        });
        this.socket.on('users', (response: ISocketResponse) => {
            this.stateSubjects.users.next(response.result);
        });
        this.socket.on('stream', (response: ISocketResponse) => {
            this.stateData.history.push(response.result.currentStream);
            this.stateSubjects.history.next(this.stateData.history);
            this.stateSubjects.stream.next(response.result);
        });
        this.socket.on('streamEvent', (response: ISocketResponse) => {
            this.stateSubjects.streamEvents.next(response.result);
        })
    }

    public getChat(): Observable<IChatEntry[]> {
        return this.stateSubjects.chat.asObservable();
    }

    public getUsers(): Observable<string[]> {
        return this.stateSubjects.users.asObservable();
    }

    public getHistory(): Observable<IStreamItem[]> {
        return this.stateSubjects.history.asObservable();
    }

    public getStream(): Observable<IStreamStatus> {
        return this.stateSubjects.stream.asObservable();
    }

    public getStreamEvents(): Observable<IStreamEvent> {
        return this.stateSubjects.streamEvents.asObservable();
    }


    public isSync(): Observable<boolean> {
        return this.stateSubjects.inSync.asObservable();
    }
    public hasControl(): Observable<boolean> {
        return this.stateSubjects.hasControl.asObservable();
    }

    public isConnected() {
        return this.socketSvc.getState() == SocketState.Room;
    }
    public syncRoom() {
        return new Promise<ISyncData>((resolve, reject) => {
            this.socket.emit('state', (response: ISocketResponse) => {
                if (response.error != null) { reject(response.error) }
                let result: ISyncData = response.result;
                console.log(result);
                this.stateData.chat = result.chat;
                this.stateSubjects.chat.next(this.stateData.chat);
                
                this.stateSubjects.users.next(result.users);

                this.stateData.history = result.history;
                this.stateSubjects.history.next(result.history);

                this.stateData.hasControl = result.hasControl;
                this.stateSubjects.hasControl.next(result.hasControl);
                
                if (result.stream != null) {
                    this.stateData.stream = result.stream;
                    this.stateSubjects.stream.next(result.stream);
                }
                resolve(result);
            });
        })
    }
    public leaveRoom() {
        this.socketSvc.leaveRoom();
    }
    public sendChatMessage(text: string) {
        this.socket.emit('text', text);
    }
    public sync(sync: boolean) {
        this.socket.emit('sync', sync);
    } 

    // CONTROL METHODS
    public stream(url: string) {
        this.socket.emit('stream', url);
    }
    public playStream(offset: number) {
        this.socket.emit('play', offset, Date.now());
    }
    public pauseStrean(offset: number) {
        this.socket.emit('pause', offset, Date.now());
    }
    public seekStream(offset: number) {
        this.socket.emit('seek', offset, Date.now());
    }
}

interface JoinInfo {
    id: string,
    name: string
}

interface ISyncData {
    chat: IChatEntry[];
    history: IStreamItem[];
    users: string[];
    stream: IStreamStatus;
    hasControl: boolean;
}

export interface IChatEntry {
    user: string,
    message: string;
    time: string;
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

export interface IStreamEvent {
    user: string,
    event: string,
    stream: IStreamStatus
}