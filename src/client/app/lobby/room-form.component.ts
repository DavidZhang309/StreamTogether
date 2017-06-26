import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LobbyService } from './lobby.service';
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

    public constructor(private lobbySvc: LobbyService, private router: Router) { }

    createRoom() {
        this.lobbySvc.createRoom(this.room).then((roomInfo) => {
            // console.log(roomInfo);
            this.router.navigateByUrl('/room/' + roomInfo.id);
        });
    }
}