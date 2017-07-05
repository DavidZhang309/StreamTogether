// -- State data --

/**
 * The information of a chat entry
 */
export interface IChatEntry {
    user: string,
    message: string;
    time: string;
}

export enum StreamType {
    Video,
    Audio,
    Image
}
export interface IStreamItem {
    url: string;
    type: StreamType;
}
export interface IStreamStatus {
    currentStream: IStreamItem;
    isPlaying: boolean;
    lastPlay: number;
    lastPlayTime: number;
}

/**
 * The client view of the room state
 */
export interface IClientState {
    chat: IChatEntry[];
    history: IStreamItem[];
    users: string[];
    stream: IStreamStatus;
    hasControl: boolean;
}

// -- Events --
export interface IStreamEvent {
    user: string,
    event: string,
    stream: IStreamStatus
}