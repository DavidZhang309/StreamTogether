import { RoomInfo } from '../room/room';
import { LobbyService } from './lobby.service';
import { Component, OnInit } from '@angular/core';

@Component({
    providers: [
        LobbyService, 
    ],
    selector: 'lobby',
    templateUrl: '/components/lobby/lobby.html'
})
export class LobbyComponent implements OnInit { 
    roomList: RoomInfo[];

    public constructor(private lobbySvc: LobbyService) { }

    public ngOnInit() {
        this.refreshRoomList();
    }

    public refreshRoomList() {
        this.lobbySvc.getRoomList().then((rooms) => {
            this.roomList = rooms;
        });
    }
}
