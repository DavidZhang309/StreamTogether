import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
    private isGuest:boolean;

    public constructor() { 
        this.isGuest = true;
    }

    public getName() {
        if (!this.isGuest) {
            return "";
        } else {
            return localStorage.getItem('guestName');
        }
    }

    public setGuestName(name: string) {
        localStorage.setItem('guestName', name);
    }
}