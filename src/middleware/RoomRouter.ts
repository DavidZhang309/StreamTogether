import { Router } from 'express';
import { IRoomInfo } from '../services/RoomDataService';
import { RoomManager } from '../RoomManager'; 

export class RoomRouter {
    roomMgr: RoomManager
    router = Router();

    public constructor(roomManager: RoomManager) {
        this.roomMgr = roomManager;

        this.router.get('/list', (request, response, next) => { 
            this.getRoomList(request, response, next) 
        });
        this.router.post('/create', (request, response, next) => {
            this.createRoom(request, response, next);
        });
    }

    public getRoomList(request, response, next) {
        this.roomMgr.getRoomList().then((rooms) => {
            response.send({
                result: rooms
            });
        }).catch((err) => {
            next(err);
        });
    }

    /**
     * 
     */
    public createRoom(request, response, next) {
        //Gather room information
        let roomParam = <IRoomInfo>{
            name: request.body.name
        }

        this.roomMgr.makeRoom(roomParam).then((result) =>{
            response.send({
                result: result
            });
        }).catch((err) => {
            next(err);  
        });
    }
}