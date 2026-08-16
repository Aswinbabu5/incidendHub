const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const incidentRoutes = require("./routes/incidentRoutes")

dotenv.config();
// console.log("Mongo URI:", process.env.MONGO_URI)
// console.log("EMAIL_USER:", process.env.EMAIL_USER)
// console.log("EMAIL_PASS exists:", process.env.EMAIL_PASS?.length)
connectDB();

const app = express()
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://incidend-hub.vercel.app"
    ]
}))
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/incident", incidentRoutes)

app.get("/", (req, res) => {
    res.json({
        message: "Incident Api is running",
    })
})

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`server was running in this port ${port}`)
})