import { RoomService, IChatEntry, IStreamStatus } from './room.service'
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Component({
    providers: [ 
        RoomService
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
    stream: Observable<IStreamStatus>;

    chatText: string;
    url: string;

    public constructor(private router: ActivatedRoute, private roomSvc: RoomService) { }

    public ngOnInit() {
        this.tab = 'users';
        
        this.users = this.roomSvc.getUsers();
        this.chat = this.roomSvc.getChat();
        this.isHost = this.roomSvc.isHost();
        this.stream = this.roomSvc.getStream();

        this.router.params.subscribe((params) => {
            this.roomSvc.enterRoom({ 
                id: params['id'], 
                name: 'Angular client' 
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
        
    }
}