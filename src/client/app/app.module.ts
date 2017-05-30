import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LobbyComponent } from './lobby.component';
import { RoomComponent } from './room.component';

@NgModule({
    imports:      [ 
        BrowserModule,
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
    declarations: [ AppComponent, LobbyComponent, RoomComponent ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }

