export class RoomInfo {
    id: string;
    name: string;
    passwordProtected: boolean;
    user_count: number;
}

export class RoomArgs {
    name: string;
    password?: string;
}