import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LobbyComponent } from './lobby.component';

@NgModule({
    imports:      [ 
        BrowserModule,
        HttpModule,
        RouterModule.forRoot([
            {
                path: 'lobby',
                component: LobbyComponent
            }
        ])
    ],
    declarations: [ AppComponent, LobbyComponent ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }

