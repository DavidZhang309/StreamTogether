import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LobbyComponent } from './lobby.component';
import { RoomFormComponent } from './room-form.component';
import { RoomComponent } from './room.component';

@NgModule({
    imports: [ 
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot([
            { path: '', redirectTo: '/lobby', pathMatch: 'full' },
            {
                path: 'lobby',
                component: LobbyComponent
            },
            {
                path: 'room/:id',
                component: RoomComponent
            }
        ])
    ],
    declarations: [ 
        AppComponent, 
        LobbyComponent, 
        RoomFormComponent, 
        RoomComponent 
    ],
    bootstrap: [ 
        AppComponent 
    ]
})
export class AppModule { }

