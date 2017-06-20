import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LobbyService } from './lobby.service';
import { RoomInfo } from './room';

@Component({
    providers: [
        LobbyService, 
    ],
    selector: 'room-form',
    templateUrl: '/components/room-form.html'
})
export class RoomFormComponent {
    room = new RoomInfo();

    public constructor(private lobbySvc: LobbyService, private router: Router) { }

    createRoom() {
        this.lobbySvc.createRoom(this.room).then((roomInfo) => {
            // console.log(roomInfo);
            this.router.navigateByUrl('/room/' + roomInfo.id);
        });
    }
}