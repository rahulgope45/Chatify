import express from 'express'
import authRoutes from "./routes/auth.route.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import messageRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js';
import cors from 'cors'


const app = express();
dotenv.config()

const PORT = process.env.PORT || 5000 

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

app.listen(PORT, () => {
    console.log("Server is running on port "+ PORT)
    connectDB()
})

