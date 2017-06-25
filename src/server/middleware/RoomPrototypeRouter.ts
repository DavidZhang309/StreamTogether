import { Router } from 'express';
import { RoomManager } from '../room/RoomManager';

export class RoomPrototypeRouter {
    router = Router();
    roomMgr: RoomManager;

    public constructor(roomMgr: RoomManager) {
        this.roomMgr = roomMgr;

        this.router.get('/', (request, response, next) => {
            this.roomMgr.getRoomList().then((rooms) => {
                response.render('pages/list', { rooms: rooms });
            });
        });
        this.router.get('/room', (request, response, next) => {
            response.render('pages/room');
        });
    }
}