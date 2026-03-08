const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // Map to store userId -> socketId

module.exports = {
    init: (server) => {
        io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL 
                    ? process.env.FRONTEND_URL.split(',') 
                    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            console.log(`🔌 New client connected: ${socket.id}`);

            // Clients should emit 'register' with their JWT or User ID on connect
            socket.on('register', (userId) => {
                userSockets.set(userId.toString(), socket.id);
                console.log(`👤 User ${userId} registered socket ${socket.id}`);
            });

            socket.on('disconnect', () => {
                // Remove the socket from the map on disconnect
                for (const [userId, socketId] of userSockets.entries()) {
                    if (socketId === socket.id) {
                        userSockets.delete(userId);
                        console.log(`👤 User ${userId} disconnected socket ${socket.id}`);
                        break;
                    }
                }
            });
        });

        return io;
    },

    getIo: () => {
        if (!io) {
            throw new Error('Socket.io is not initialized!');
        }
        return io;
    },

    notifyUser: (userId, payload) => {
        if (io) {
            const socketId = userSockets.get(userId.toString());
            if (socketId) {
                io.to(socketId).emit('processing_complete', payload);
                console.log(`🔔 Emitted 'processing_complete' for uploadId ${payload.uploadId} to userId ${userId}`);
            } else {
                console.log(`❌ Cannot notify userId ${userId}. Socket not connected.`);
            }
        }
    }
};
