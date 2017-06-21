# Sockets #
Sockets are used to form live communications within a room

## API Reference ##
All API follow the standard response pattern [TODO: link here], the section will documents the contents of this responses of the socket endpoints.

Note: N/A datatype means there is no specifications yet on what the property will contain

### Server responses ###
This section documents the possible server responses
#### users ####
```
{
    error: N/A  
    result: {
        users: string[],
        event: "entered" | "left"
        userOfEvent: string,
    }
}
```
This message is sent when a user either enters or leaves the room

#### chat ####
```
{
    error: N/A
    result: {
        message: string
    }
}
```
This message is sent when there is a chat message.

#### sync ####
```
{
    error: N/A
    result: {
        isHost: boolean,
        users: string[],
        chat: string[],
        queue: string[],
        history: string[]
        currentStream: undefined | {
            url: string,
            playing: boolean,
            lastAction: DateTime
        }
    }
}
```
This sends the current state of the room.
Note: this may be moved to client request section.

### Client Requests ###
This section documents the possible client requests and server responses

#### join ####
Request
```
{
    id: string, // The room ID
    password: string|undefined, // Optionally a password
    name: string, // Name of client
}
```


Response
```
{
    error: string,
    result: sync.result
}
```
This message will respond with the same interface as the server sync response result.

### Client Responses ###
This section documents the possible client responses. The difference here between client request is that the server is not only directly responding to the response, and may or may not be broadcasted to everyone else

