import * as mongodb from 'mongodb';
import { BaseDataService } from './BaseDataService'

export class RoomDataService extends BaseDataService{
    public getRoomList(): Promise<IRoomInfo[]> {
        return this.connectToDB().then((db) => {
            let rooms = db.collection('rooms');
            return rooms.find({}).toArray().then((rooms) => {
                return rooms.map((room) => {
                    room.id = room._id;
                    delete room._id;
                    return room;
                })
            });
        });
    }

    public getRoom(id: string): Promise<IRoomInfo> {
        return this.connectToDB().then((db) => {
            let rooms = db.collection('rooms');
            return <Promise<IRoomInfo>>rooms.findOne({
                _id: new mongodb.ObjectID(id)
            }).then((room) => {
                if (room == null) { return null };
                room.id = room._id;
                delete room._id;
                return room
            });
        });
    }

    /**
     * Creates the room on database
     * @param roomInfo Information on room
     * 
     * @returns The roomInfo with id
     */
    public createRoom(roomInfo): Promise<IRoomInfo> {
        return this.connectToDB().then((db) => {
            let rooms = db.collection('rooms');
            return rooms.insertOne(roomInfo).then((result) =>{
                roomInfo.id = roomInfo._id.toHexString();
                delete roomInfo._id;
                return <IRoomInfo>roomInfo;
            });
        })
    }

    public destroyRoom(roomInfo) {
        return this.connectToDB().then((db) => {
            db.collection('rooms').remove({
                _id: roomInfo.id
            });
        })
    }
}

export interface IRoomInfo {
    id: string,
    name: string
}