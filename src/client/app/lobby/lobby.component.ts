import { RoomInfo } from '../room/room';
import { LobbyService } from './lobby.service';
import { UserService } from '../user/user.service';
import { JoinRequestModal } from './join.modal';

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    providers: [
        LobbyService, 
        UserService
    ],
    selector: 'lobby',
    templateUrl: '/components/lobby/lobby.html'
})
export class LobbyComponent implements OnInit { 
    @ViewChild('passwordModal')
    passwordModal: any;
    modalRef: any;

    joinModal: JoinRequestModal;

    roomList: RoomInfo[];
    authErrorText: string;

    public constructor(
        private router: Router, 
        private lobbySvc: LobbyService, 
        private modalSvc: NgbModal,
        private userSvc: UserService
    ) {
        this.joinModal = new JoinRequestModal();
        this.joinModal.name = this.userSvc.getName();
    }

    public ngOnInit() {
        this.refreshRoomList();
    }

    public joinRoomRequest(roomInfo: RoomInfo) {
        this.joinModal.roomInfo = roomInfo;
        if (!roomInfo.passwordProtected) {
            this.submitJoinRoomRequest();
        } else {
            this.modalRef = this.modalSvc.open(this.passwordModal);
        }
    }

    public submitJoinRoomRequest() {
        this.lobbySvc.joinRoom({
            id: this.joinModal.roomInfo.id,
            name: this.joinModal.name,
            password: this.joinModal.password
        }).then(() => {
            if (this.modalRef != null) {
                // close modal if opened
                this.modalRef.close();
            }
            this.router.navigateByUrl('/room/' + this.joinModal.roomInfo.id);
        }).catch((err) => {
            this.authErrorText = err;
        });
    }

    public refreshRoomList() {
        this.lobbySvc.getRoomList().then((rooms) => {
            this.roomList = rooms;
        });
    }
}
