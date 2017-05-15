import * as mongodb from 'mongodb';
import { BaseDataService } from './BaseDataService'

export class RoomDataService extends BaseDataService{
    public getRoomList(): Promise<any[]> {
        return this.connectToDB().then((db) => {
            let rooms = db.collection('rooms');
            return rooms.find({}).toArray();
        });
    }

    public getRoom(id: string) {
        return this.connectToDB().then((db) => {
            let rooms = db.collection('rooms');
            return rooms.findOne({
                _id: new mongodb.ObjectID(id)
            });
        });
    }
}