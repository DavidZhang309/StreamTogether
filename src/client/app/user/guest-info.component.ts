import { UserService } from './user.service';

import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    providers: [ UserService ],
    selector: '<guest-info>',
    templateUrl: '/components/user/guest-info.html'
})
export class GuestInfoComponent {
    name: string;
    
    public constructor(private router: Router, private userSvc: UserService) { 
        //TODO: check if not guest
        this.name = userSvc.getName();
    }

    public changeName() {
        if (this.name.length == 0) { return; }

        this.userSvc.setGuestName(name);
        this.router.navigateByUrl('/app');
    }
}