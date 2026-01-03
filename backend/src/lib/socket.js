import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

// Online users map
const userSocketMap = {};

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                "http://localhost:5173",
                'https://chatify-nine-fawn.vercel.app',
            ];

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST"]
    }
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);

        if (userId) delete userSocketMap[userId];

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, server, app };
