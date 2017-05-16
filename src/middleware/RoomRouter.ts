import { Router } from 'express';
import { EventEmitter } from 'events';
import { RoomDataService, IRoomInfo } from '../services/RoomDataService';

export class RoomRouter extends EventEmitter {
    service = new RoomDataService();
    router = Router();

    public constructor() {
        super();

        this.router.get('/list', (request, response, next) => { 
            this.getRoomList(request, response, next) 
        });
        this.router.post('/create', (request, response, next) => {
            this.createRoom(request, response, next);
        });
    }

    public getRoomList(request, response, next) {
        this.service.getRoomList().then((roomList) => {
            response.send({
                result: roomList
            });
        }).catch((err) => {
            next(err);
        });
    }

    /**
     * createRoom
     */
    public createRoom(request, response, next) {
        //Gather room information
        let roomInfo = {
            name: request.body.name
        }

        // create room
        this.service.createRoom(roomInfo).then((info) => {
            this.emit('roomRequest', info);
            response.send({
                result: info
            });
        }).catch((err) => { 
            next(err); 
        });
    }
}