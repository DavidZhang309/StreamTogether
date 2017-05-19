import { Router } from 'express';

export class RoomPrototypeRouter {
    router = Router();

    public constructor() {
        this.router.get('/', (request, response, next) => {
            response.render('pages/prototype');
        });
    }
}