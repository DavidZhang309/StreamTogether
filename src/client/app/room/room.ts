import { IRoomListing, IJoinRoomArgs } from '../../../common/interface/room';

export class RoomInfo implements IRoomListing {
    id: string;
    name: string;
    passwordProtected: boolean;
    user_count: number;
}

export class RoomArgs implements IJoinRoomArgs {
    name: string;
    password?: string;
}