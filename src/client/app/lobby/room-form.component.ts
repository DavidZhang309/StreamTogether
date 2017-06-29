import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LobbyService } from './lobby.service';
import { UserService } from '../user/user.service';
import { RoomArgs } from '../room/room';

@Component({
    providers: [
        LobbyService, 
    ],
    selector: 'room-form',
    templateUrl: '/components/lobby/room-form.html'
})
export class RoomFormComponent {
    room = new RoomArgs();

    public constructor(
        private router: Router,
        private lobbySvc: LobbyService, 
        private userSvc: UserService
    ) { }

    createRoom() {
        this.lobbySvc.createRoom(this.room).then((roomInfo) => {
            this.lobbySvc.joinRoom({
                id: roomInfo.id,
                name: this.userSvc.getName(),
                password: this.room.password
            }).then(() => {
                this.router.navigateByUrl('/room/' + roomInfo.id);
            }).catch((err) => {
                console.log(err);
            });
        });
    }
}