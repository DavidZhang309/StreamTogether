import { SocketService } from './socket.service';
import { UserService } from './user/user.service';

import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
    providers: [ UserService, SocketService ],
    selector: 'my-app',
    templateUrl: '/components/app.html'
})
export class AppComponent { 
    public constructor(private router: Router, private userSvc: UserService) { 
        if (this.userSvc.getName() == null) {
            this.router.navigateByUrl('guest/profile');
        }
    }
}
