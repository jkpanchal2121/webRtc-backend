import { Server } from 'socket.io';
import { registerSocketEvents } from './events.js';


export const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
        transports: ['websocket', 'polling']
    });


    io.on('connection', (socket) => {
        registerSocketEvents(io, socket);
    });


    return io;
};