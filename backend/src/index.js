import express from 'express'
import authRoutes from "./routes/auth.route.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import messageRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js';


const app = express();
dotenv.config()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())

//Making auth
app.use("/api/auth", authRoutes )
app.use("/api/message", messageRoutes )

app.listen(PORT, () => {
    console.log("Server is running on port "+ PORT)
    connectDB()
})

