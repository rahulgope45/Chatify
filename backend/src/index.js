import express from 'express'
import authRoutes from "./routes/auth.route.js"

const app = express();

//Making auth
app.use("/api/auth", authRoutes )

app.listen(5001, () => {
    console.log("Server is running on port 5001")
})

const jj = ff;