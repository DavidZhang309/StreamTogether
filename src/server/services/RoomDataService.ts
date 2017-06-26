import * as mongodb from 'mongodb';
import * as crypto from 'crypto';
import { BaseDataService } from './BaseDataService'

export class RoomDataService extends BaseDataService{
    public constructor() {
        super();
    }

    private getRoomInfo(data: IRoomData): IRoomInfo {
        if (data == null) { return null; }
        return {
            id: data._id,
            name: data.name,
            passwordProtected: data.password != null
        };
    }

    public checkPassword(room: IRoomInfo, password: string): Promise<boolean> {
        return this.getRoomData(room.id).then((data) => {
            if (!room.passwordProtected) { return true; }
            if (password == null) { password = ''; }

            let hashAlgo = crypto.createHash('sha512');
            hashAlgo.update(data.salt + password);
            let hash = hashAlgo.digest('hex');
            return data.password === hash;
        });
    }

    public getRoomList(): Promise<IRoomInfo[]> {
        return this.connectToDB().then((db) => {
            let rooms = db.collection('rooms');
            return rooms.find({}).toArray().then((rooms) => {
                return rooms.map((room: IRoomData) => {
                    return this.getRoomInfo(room);
                });
            });
        });
    }

    private getRoomData(id: string): Promise<IRoomData> {
        return this.connectToDB().then((db) => {
            let rooms = db.collection('rooms');
            return rooms.findOne({
                _id: new mongodb.ObjectID(id)
            }).then((room: IRoomData) => {
                if (room == null) { return null };
                return room;
            });
        });
    }

    public getRoom(id: string): Promise<IRoomInfo> {
        return this.getRoomData(id).then((data) => {
            return this.getRoomInfo(data);
        });
    }

    /**
     * Creates the room on database
     * @param roomInfo Information on room
     * 
     * @returns The roomInfo with id
     */
    public createRoom(roomArgs: IRoomArgs): Promise<IRoomInfo> {
        return this.connectToDB().then((db) => {
            let roomData: any = {
                name: roomArgs.name,
            }

            if(roomArgs.password != null) {
                roomData.salt = crypto.randomBytes(16).toString('hex');
                let hash = crypto.createHash('sha512');
                hash.update(roomData.salt + roomArgs.password);
                roomData.password = hash.digest('hex');
            }

            let rooms = db.collection('rooms');
            return rooms.insertOne(roomData).then((result) => {
                return this.getRoomInfo(roomData);
            });
        })
    }

    public destroyRoom(roomInfo: IRoomInfo) {
        return this.connectToDB().then((db) => {
            db.collection('rooms').remove({
                _id: roomInfo.id
            });
        })
    }
}

export interface IRoomInfo {
    id: string;
    name: string;
    passwordProtected: boolean;
}

export interface IRoomArgs {
    name: string;
    password: string;
}

interface IRoomData {
    _id: string;
    name: string;
    password?: string;
    salt?: string;
}