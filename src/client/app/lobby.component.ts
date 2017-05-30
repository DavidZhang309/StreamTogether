import { Room } from './room';
import { LobbyService } from './lobby.service';
import { Component, OnInit } from '@angular/core';

@Component({
    providers: [
        LobbyService, 
    ],
    selector: 'lobby',
    templateUrl: '/lobby.html'
})
export class LobbyComponent implements OnInit { 
    roomList: Room[];

    public constructor(private lobbySvc: LobbyService) { }

    public ngOnInit() {
        this.lobbySvc.getRoomList().then((rooms) => {
            this.roomList = rooms;
        });
    }
}
