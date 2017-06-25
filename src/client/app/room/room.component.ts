import { RoomService, IChatEntry, IStreamItem, IStreamStatus } from './room.service';
import { UserService } from '../user/user.service';
import { ViewChildren, QueryList, ElementRef, Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/first';

@Component({
    providers: [ 
        RoomService,
        UserService
    ],
    selector: 'room',
    templateUrl: '/components/room/room.html',
})
export class RoomComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren('videoPlayer') 
    videoPlayerQuery: QueryList<ElementRef>;

    tab: string;
    users: Observable<string[]>;
    chat: Observable<IChatEntry[]>;
    history: Observable<IStreamItem[]>;
    isHost: boolean;
    stream: IStreamStatus;

    chatText: string;
    url: string;
    streamTime: number;

    public constructor(private router: ActivatedRoute, private roomSvc: RoomService, private userSvc: UserService) { 
        this.streamTime = 0;
        this.url = '';
        this.isHost = false;
    }

    public ngOnInit() {
        this.tab = 'users';
        
        this.users = this.roomSvc.getUsers();
        this.history = this.roomSvc.getHistory();
        this.chat = this.roomSvc.getChat();
        this.roomSvc.isHost().subscribe((isHost) => {
            this.isHost = isHost;
        });

        let username = this.userSvc.getName();
        this.router.params.subscribe((params) => {
            this.roomSvc.enterRoom({ 
                id: params['id'], 
                name: username == null ? 'Angular client' : username
            }).then((result) => {
                console.log(result);
            });
        });
    }

    public ngAfterViewInit() {
        this.roomSvc.getStream().subscribe((stream) => {
            this.stream = stream;
            let videoPlayer = this.videoPlayerQuery.first;

            this.url = stream.currentStream.url;
            let offset = stream.isPlaying ? (Date.now() - stream.lastPlay) / 1000 : 0;
            this.streamTime = offset + stream.lastPlayTime;

            if (stream != null) {
                setTimeout(() => {
                    this.videoPlayerQuery.first.nativeElement.load();
                }, 100);
            }
        });

        this.roomSvc.getStreamEvents().subscribe((stream) => {
            this.stream = stream;

            let offset = stream.isPlaying ? (Date.now() - stream.lastPlay) / 1000 : 0;
            this.streamTime = offset + stream.lastPlayTime;

            if (stream.isPlaying) {
                this.videoPlayerQuery.first.nativeElement.play();
            } else {
                this.videoPlayerQuery.first.nativeElement.pause();
            }
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
    public playStream(currentTime: number) {
        this.roomSvc.playStream(currentTime);
    }
    public pauseStream(currentTime: number) {
        this.roomSvc.pauseStrean(currentTime);
    }
    public seekStream(currentTime: number) {
        this.roomSvc.seekStream(currentTime);
    }
}