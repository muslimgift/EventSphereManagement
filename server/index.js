const express = require("express")
const ConnectDB = require("./config/db")
const cors = require("cors")
require('dotenv').config()
const app = express()
const path = require("path");
const userRouter = require('./Routes/UserRoutes')
const expoRouter = require('./Routes/ExpoRoutes')
const eventRouter=require('./Routes/EventRoutes')
const registerRouter=require('./Routes/RegisterEvents')
const chatRouter=require('./Routes/ChatRoutes')
const scheduleRouter=require('./Routes/ScheduleRoutes')

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5000', // frontend URL
  credentials: true
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/exhibitors", express.static(path.join(__dirname, "exhibitors")));
app.use("/api/user",userRouter);
app.use("/api/expo",expoRouter);
app.use("/api/event",eventRouter)
app.use("/api/register-event",registerRouter)
app.use("/api/chat",chatRouter)
app.use("/api/schedule",scheduleRouter)


ConnectDB()

app.get("/", (req, res) => {
    res.send("server is running")
})






const Port = process.env.PORT || 5000
app.listen(Port, () => {
    console.log(`server is running on Port ${Port}`)
})
