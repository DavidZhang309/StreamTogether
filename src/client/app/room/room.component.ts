import { RoomService, IChatEntry, IStreamStatus } from './room.service';
import { UserService } from '../user/user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Component({
    providers: [ 
        RoomService,
        UserService
    ],
    selector: 'room',
    templateUrl: '/components/room/room.html',
})
export class RoomComponent implements OnInit, OnDestroy {
    inSync: boolean;
    tab: string;
    users: Observable<string[]>;
    chat: Observable<IChatEntry[]>;
    isHost: Observable<boolean>;
    stream: IStreamStatus;

    chatText: string;
    url: string;

    public constructor(private router: ActivatedRoute, private roomSvc: RoomService, private userSvc: UserService) { }

    public ngOnInit() {
        this.tab = 'users';
        
        this.users = this.roomSvc.getUsers();
        this.chat = this.roomSvc.getChat();
        this.isHost = this.roomSvc.isHost();
        let streamOb = this.roomSvc.getStream();

        streamOb.subscribe((stream) => {
            this.stream = stream;
        })

        let username = this.userSvc.getName();
        this.router.params.subscribe((params) => {
            this.roomSvc.enterRoom({ 
                id: params['id'], 
                name: username == null ? 'Angular client' : username
            }).then((result) => {
                // console.log(result);
            });
        });
    }

    public ngOnDestroy() {
        this.roomSvc.leaveRoom();
    }

    public switchTab(tab: string) {
        this.tab = tab;
    }
    public sendChatMessage() {
        if (this.chatText.length == 0) { return; }
        this.roomSvc.sendChatMessage(this.chatText);
        this.chatText = '';
    }

    public streamUrl() {
        if (this.url.length == 0) { return }
        this.roomSvc.stream(this.url);
    }
    public playStream() {

    }
    public pauseStream() {

    }
    public seekStream() {
        
    }
}