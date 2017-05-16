import * as mongodb from 'mongodb';
import { BaseDataService } from './BaseDataService'

export class RoomDataService extends BaseDataService{
    public getRoomList(): Promise<IRoomInfo[]> {
        return this.connectToDB().then((db) => {
            let rooms = db.collection('rooms');
            return rooms.find({}).toArray().then((rooms) => {
                return rooms.map((room) => {
                    return <IRoomInfo>{
                        id: room._id,
                        name: room.name
                    };
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
                return {
                    id: room._id,
                    name: room.name
                };
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
                console.log(result);
                roomInfo.id = result.insertedId.toHexString();
                return <IRoomInfo>roomInfo;
            });
        })
    }
}

export interface IRoomInfo {
    id: string,
    name: string
}