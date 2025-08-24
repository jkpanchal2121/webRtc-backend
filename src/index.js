import connectDB from './config/db.js';
import app from './app.js';
import os from 'os';
import 'dotenv/config';
import express from 'express';
import http from 'http';
import { initSocket } from './sockets/indexSockets.js';


// Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;

// Function to get local IP
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const server = http.createServer(app);  // ✅ create HTTP server from Express

// Initialize Socket.IO
const io = initSocket(server);

const localIp = getLocalIp();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 HTTP endpoint (localhost): http://localhost:${PORT}`);
  console.log(`🌐 HTTP endpoint (LAN): http://${localIp}:${PORT}`);
  console.log(`🔌 WebSocket endpoint (localhost): ws://localhost:${PORT}`);
  console.log(`🔌 WebSocket endpoint (LAN): ws://${localIp}:${PORT}`);
});


///---------------------------------------Old Code-------------------------------------////

// // server.js
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');
// const { v4: uuidv4 } = require('uuid');
// const os = require('os');

// const app = express();
// const server = http.createServer(app);

// // Configure Socket.io with CORS
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling']
// });

// // Middleware
// app.use(cors());
// app.use(express.json());

// // In-memory storage
// const rooms = new Map();
// const users = new Map();

// // Utility function for logging
// const log = (type, message, data = {}) => {
//   const timestamp = new Date().toISOString();
//   const logData = JSON.stringify(data);
//   console.log(`[${timestamp}] [${type.toUpperCase()}] ${message} ${logData !== '{}' ? logData : ''}`);
// };

// // Get local IP
// const getLocalIp = () => {
//   const interfaces = os.networkInterfaces();
//   for (const name of Object.keys(interfaces)) {
//     for (const iface of interfaces[name]) {
//       if (iface.family === 'IPv4' && !iface.internal) {
//         return iface.address;
//       }
//     }
//   }
//   return '127.0.0.1';
// };

// // Expose local IP endpoint
// app.get('/local-ip', (req, res) => {
//   res.json({ localIp: getLocalIp() });
// });

// // Helper: find room by socket ID
// const getRoomForSocket = (socketId) => {
//   for (const [roomId, room] of rooms.entries()) {
//     if (room.host === socketId || room.participants.has(socketId)) {
//       return { roomId, isHost: room.host === socketId };
//     }
//   }
//   return null;
// };

// // Socket.io connection handling
// io.on('connection', (socket) => {
//   log('connection', `New client connected: ${socket.id}`);

//   // Create a new room
//   socket.on('create-room', (data) => {
//     try {
//       const { roomId, username } = data;

//       if (rooms.has(roomId)) {
//         socket.emit('error', { message: 'Room already exists' });
//         return;
//       }

//       rooms.set(roomId, { host: socket.id, participants: new Map(), createdAt: new Date() });
//       users.set(socket.id, { username, roomId, isHost: true });
//       socket.join(roomId);

//       log('room-created', `Room created: ${roomId} by ${username}`, { roomId, username });
//       socket.emit('room-created', { roomId });

//     } catch (error) {
//       log('error', 'Error creating room', { error: error.message });
//       socket.emit('error', { message: 'Failed to create room' });
//     }
//   });

//   // Join an existing room
//   socket.on('join-room', (data) => {
//     try {
//       const { roomId, username } = data;
//       const room = rooms.get(roomId);

//       if (!room) {
//         socket.emit('error', { message: 'Room not found' });
//         return;
//       }

//       if (room.participants.size >= 10) {
//         socket.emit('error', { message: 'Room is full' });
//         return;
//       }

//       room.participants.set(socket.id, { username });
//       users.set(socket.id, { username, roomId, isHost: false });
//       socket.join(roomId);

//       log('user-joined', `User joined room: ${username}`, { roomId, username });

//       // Notify host
//       socket.to(room.host).emit('new-participant', { participantId: socket.id, username });

//       // Send participants list to new user
//       const participants = Array.from(room.participants.entries()).map(([id, data]) => ({
//         socketId: id,
//         username: data.username
//       }));

//       socket.emit('room-joined', { roomId, participants, hostId: room.host });

//     } catch (error) {
//       log('error', 'Error joining room', { error: error.message });
//       socket.emit('error', { message: 'Failed to join room' });
//     }
//   });

//   // WebRTC signaling events
//   socket.on('offer', ({ to, offer }) => {
//     log('offer', `Offer from ${socket.id} to ${to}`, { from: socket.id, to });
//     socket.to(to).emit('offer', { offer, from: socket.id });
//   });

//   socket.on('answer', ({ to, answer }) => {
//     log('answer', `Answer from ${socket.id} to ${to}`, { from: socket.id, to });
//     socket.to(to).emit('answer', { answer, from: socket.id });
//   });

//   socket.on('candidate', ({ to, candidate }) => {
//     log('candidate', `ICE candidate from ${socket.id} to ${to}`);
//     socket.to(to).emit('candidate', { candidate, from: socket.id });
//   });

//   // Handle disconnect
//   socket.on('disconnect', () => {
//     try {
//       const user = users.get(socket.id);
//       if (!user) return;

//       const { roomId, username, isHost } = user;
//       const room = rooms.get(roomId);
//       if (!room) return;

//       if (isHost) {
//         log('host-disconnected', `Host disconnected from room ${roomId}`, { roomId, username });
//         io.to(roomId).emit('host-disconnected');
//         rooms.delete(roomId);
//       } else {
//         if (room.participants.has(socket.id)) {
//           room.participants.delete(socket.id);
//           log('user-left', `User left room ${roomId}`, { roomId, username });
//           socket.to(room.host).emit('participant-left', { participantId: socket.id, username });
//         }
//       }

//       users.delete(socket.id);

//       if (room && room.participants.size === 0) {
//         rooms.delete(roomId);
//         log('room-closed', `Room closed: ${roomId}`, { roomId });
//       }

//     } catch (error) {
//       log('error', 'Error during disconnection', { error: error.message });
//     }
//   });
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'ok',
//     rooms: rooms.size,
//     users: users.size,
//     timestamp: new Date().toISOString()
//   });
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   const localIp = getLocalIp();
//   console.log(`🚀 WebRTC Signaling Server running on port ${PORT}`);
//   console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
//   console.log(`🔌 WebSocket endpoint (LAN): ws://${localIp}:${PORT}`);
//   console.log(`🌐 HTTP endpoint: http://localhost:${PORT}`);
//   console.log(`🌐 HTTP endpoint (LAN): http://${localIp}:${PORT}`);
// });

// // Graceful shutdown
// const shutdown = () => {
//   console.log('Shutting down gracefully...');
//   io.emit('server-shutdown');
//   io.close(() => {
//     console.log('Socket.IO server closed');
//     process.exit(0);
//   });
// };

// process.on('SIGTERM', shutdown);
// process.on('SIGINT', shutdown);
