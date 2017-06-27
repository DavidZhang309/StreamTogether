import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { LobbyComponent } from './lobby/lobby.component';
import { RoomFormComponent } from './lobby/room-form.component';
import { RoomComponent } from './room/room.component';
import { GuestInfoComponent } from './user/guest-info.component';

@NgModule({
    imports: [ 
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'lobby', pathMatch: 'full' },
            {
                path: 'lobby',
                component: LobbyComponent
            }, {
                path: 'lobby/create',
                component: RoomFormComponent
            }, {
                path: 'room/:id',
                component: RoomComponent
            }, {
                path: 'guest/profile',
                component: GuestInfoComponent
            }
        ]),
        NgbModule.forRoot()
    ],
    declarations: [ 
        AppComponent, 
        LobbyComponent, 
        RoomFormComponent, 
        RoomComponent ,
        GuestInfoComponent
    ],
    bootstrap: [ 
        AppComponent
    ]
})
export class AppModule { }

