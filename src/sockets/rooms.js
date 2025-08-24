export const rooms = new Map(); // roomId => { host, participants: Map(socketId, {username}) }
export const users = new Map(); // socketId => {username, roomId, isHost}


export const addRoom = (roomId, hostId) => {
    rooms.set(roomId, { host: hostId, participants: new Map(), createdAt: new Date() });
};


export const removeRoom = (roomId) => {
    rooms.delete(roomId);
};


export const addUserToRoom = (socketId, username, roomId, isHost = false) => {
    const room = rooms.get(roomId);
    if (!room) return false;
    if (isHost) room.host = socketId;
    else room.participants.set(socketId, { username });
    users.set(socketId, { username, roomId, isHost });
    return true;
};


export const removeUser = (socketId) => {
    const user = users.get(socketId);
    if (!user) return null;
    const room = rooms.get(user.roomId);


    if (room) {
        if (user.isHost) {
            rooms.delete(user.roomId);
        } else {
            room.participants.delete(socketId);
            if (room.participants.size === 0) rooms.delete(user.roomId);
        }
    }
    users.delete(socketId);
    return user;
};


export const getRoomForSocket = (socketId) => {
    for (const [roomId, room] of rooms.entries()) {
        if (room.host === socketId || room.participants.has(socketId)) {
            return { roomId, isHost: room.host === socketId };
        }
    }
    return null;
};