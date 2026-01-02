import express from 'express'
import authRoutes from "./routes/auth.route.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import messageRoutes from './routes/message.route.js'
import friendRoutes from './routes/friend.route.js'
import { connectDB } from './lib/db.js';
import cors from 'cors'
import {app,server} from './lib/socket.js'
import path from 'path';

dotenv.config()

const PORT = process.env.PORT || 5000 
const _dirname = path.resolve();

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}
    
))

//Making auth
app.use("/api/auth", authRoutes )
app.use("/api/messages", messageRoutes )
app.use("/api/friends", friendRoutes )

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(_dirname,"../frontend/dist")))

    app.get("*", (req,res)=> {
        res.sendFile(path.join(_dirname,"../frontend/dist","index.html"));
    })
}

server.listen(PORT, () => {
    console.log("Server is running on port "+ PORT)
    connectDB()
})

