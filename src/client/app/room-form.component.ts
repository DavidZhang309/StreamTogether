import { Component } from '@angular/core';

import { LobbyService } from './lobby.service';
import { RoomInfo } from './room';

@Component({
    selector: 'room-form',
    templateUrl: './room-form.html'
})
export class RoomFormComponent {
    room = new RoomInfo();

    public constructor(private lobbySvc: LobbyService) { }

    createRoom() {
        console.log(this.room);
    }
}