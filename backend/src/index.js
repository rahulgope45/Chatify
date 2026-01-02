import express from 'express'
import authRoutes from "./routes/auth.route.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import messageRoutes from './routes/message.route.js'
import friendRoutes from './routes/friend.route.js'
import { connectDB } from './lib/db.js';
import cors from 'cors'
import { app, server } from './lib/socket.js'
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()

const PORT = process.env.PORT || 5000;

// Fix: Proper __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:5173",
    credentials: true
}));

// API routes - MUST come before static files
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);

// Serve static files ONLY in production
if (process.env.NODE_ENV === "production") {
    // Correct path: go up from src to backend, then to frontend/dist
    const frontendDistPath = path.join(__dirname, "../../frontend/dist");

    app.use(express.static(frontendDistPath));

    // Catch-all route for React Router
    app.use((req, res) => {
        res.sendFile(path.join(frontendDistPath, "index.html"));
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    connectDB();
});