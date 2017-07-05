export interface IRoomListing {
    id: string;
    name: string;
    passwordProtected: boolean;
    user_count: number;
}

export interface IJoinRoomArgs {
    name: string;
    password?: string;
}