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

    users: Observable<string[]>;
    chat: Observable<IChatEntry[]>;
    history: Observable<IStreamItem[]>;
    liveStream: IStreamStatus;
    stream: IStreamStatus;

    username: string;
    tab: string;
    hasControl: boolean;
    inSync: boolean;
    chatText: string;
    url: string;
    streamTime: number;

    syncing: boolean;

    public constructor(private router: ActivatedRoute, private roomSvc: RoomService, private userSvc: UserService) { 
        this.inSync = true;
        this.url = '';
        this.streamTime = 0;
        
        this.tab = 'users';
        this.users = this.roomSvc.getUsers();
        this.history = this.roomSvc.getHistory();
        this.chat = this.roomSvc.getChat();
        this.roomSvc.isSync().subscribe((sync) => {
            this.inSync = sync;
        });
        this.roomSvc.hasControl().subscribe((control) => {
            this.hasControl = control;
        })
    }

    private syncPlayer() {
        let urlChanged = this.liveStream.currentStream.url != this.stream.currentStream.url;
        this.stream = this.liveStream; //merge back to live

        this.url = this.stream.currentStream.url;
        let offset = this.stream.isPlaying ? (Date.now() - this.stream.lastPlay) / 1000 : 0;
        this.streamTime = offset + this.stream.lastPlayTime;

        //TEMP: hacking timeout in to wait for the stupid video element to load in
        let videoOp = () => {
            if (urlChanged) {this.stream = this.liveStream; //merge back to live
                console.log("url changed");
                this.videoPlayerQuery.first.nativeElement.load();
            }
            if (this.stream.isPlaying) {
                this.videoPlayerQuery.first.nativeElement.play();
            } else {
                this.videoPlayerQuery.first.nativeElement.pause();
            }
            this.syncing = false;
        };
        
        setTimeout(()=>{
            videoOp();
        }, 64)
    }

    public ngOnInit() {
        this.username = this.userSvc.getName();
        this.router.params.subscribe((params) => {
            this.roomSvc.enterRoom({ 
                id: params['id'], 
                name: this.username == null ? 'Angular client' : this.username
            });
        });
    }

    public ngAfterViewInit() {
        this.roomSvc.getStream().subscribe((stream) => {
            this.liveStream = stream;
            if (this.inSync) { 
                this.stream = stream;
                this.syncPlayer(); 
            }
        });

        this.roomSvc.getStreamEvents().subscribe((event) => {
            this.liveStream = event.stream;
            if (this.inSync) {
                this.stream = event.stream;
            } else {
                return;
            }

            // if own event
            if (event.user == this.username) { return; }

            this.syncing = true;
            let offset = this.stream.isPlaying ? (Date.now() - this.stream.lastPlay) / 1000 : 0;
            this.streamTime = offset + this.stream.lastPlayTime;
            if (event.event == 'play') {
                this.videoPlayerQuery.first.nativeElement.play();
            } else if (event.event == 'pause') {
                this.videoPlayerQuery.first.nativeElement.pause();
            }
            this.syncing = false;
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
        if (this.inSync) {
            this.roomSvc.stream(this.url);
        } else {
            let element = this.videoPlayerQuery.first.nativeElement;
            element.load();
            element.play();
        }
    }
    public loadHistory(url: string) {
        this.url = url;
        this.streamUrl();
    }
    public playStream(currentTime: number) {
        if (this.syncing) { return; }
        console.log('play event');
        this.roomSvc.playStream(currentTime);
    }
    public pauseStream(currentTime: number) {
        if (this.syncing) { return; }
        console.log('pause event');
        this.roomSvc.pauseStrean(currentTime);
    }
    public seekStream(currentTime: number) {
        if (this.syncing) { return; }
        this.roomSvc.seekStream(currentTime);
    }
    public sync(sync: boolean) {
        this.roomSvc.sync(sync);
        this.inSync = sync;
        if (sync) {
            this.syncPlayer();
        }
    }
}