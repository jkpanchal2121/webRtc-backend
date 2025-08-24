import { rooms, users, addRoom, addUserToRoom, removeUser, getRoomForSocket } from './rooms.js';


export const registerSocketEvents = (io, socket) => {
    console.log(`Socket connected: ${socket.id}`);


    // Create Room
    socket.on('create-room', ({ roomId, username }) => {
        if (rooms.has(roomId)) {
            socket.emit('error', { message: 'Room already exists' });
            return;
        }
        addRoom(roomId, socket.id);
        addUserToRoom(socket.id, username, roomId, true);
        socket.join(roomId);
        socket.emit('room-created', { roomId });
    });


    // Join Room
    socket.on('join-room', ({ roomId, username }) => {
        const room = rooms.get(roomId);
        if (!room) return socket.emit('error', { message: 'Room not found' });
        if (room.participants.size >= 10) return socket.emit('error', { message: 'Room is full' });


        addUserToRoom(socket.id, username, roomId, false);
        socket.join(roomId);


        // Notify host & participants
        socket.to(room.host).emit('new-participant', { participantId: socket.id, username });


        const participants = Array.from(room.participants.entries()).map(([id, data]) => ({ socketId: id, username: data.username }));
        socket.emit('room-joined', { roomId, participants, hostId: room.host });
    });


    // WebRTC signaling
    ['offer', 'answer', 'candidate'].forEach(event => {
        socket.on(event, (data) => {
            const { to } = data;
            socket.to(to).emit(event, { ...data, from: socket.id });
        });
    });


    // Disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (!user) return;


        const { roomId, username, isHost } = user;
        if (isHost) io.to(roomId).emit('host-disconnected');
        else socket.to(roomId).emit('participant-left', { participantId: socket.id, username });
    });
};