import { RoomInfo } from '../room/room';
import { LobbyService } from './lobby.service';

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    providers: [
        LobbyService, 
    ],
    selector: 'lobby',
    templateUrl: '/components/lobby/lobby.html'
})
export class LobbyComponent implements OnInit { 
    @ViewChild('passwordModal')
    passwordModal: any;

    roomList: RoomInfo[];

    public constructor(private router: Router, private lobbySvc: LobbyService, private modalSvc: NgbModal) { }

    public ngOnInit() {
        this.refreshRoomList();
    }

    public joinRoom(roomInfo: RoomInfo) {
        if (!roomInfo.passwordProtected) {
            this.router.navigateByUrl('/room/' + roomInfo.id);
        } else {
            this.modalSvc.open(this.passwordModal);
        }
    }

    public refreshRoomList() {
        this.lobbySvc.getRoomList().then((rooms) => {
            this.roomList = rooms;
        });
    }
}
