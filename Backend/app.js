import express from "express";
import authRouter from "./src/routes/authRoute.js"
import cors from 'cors'
import dotenv from 'dotenv'


dotenv.config();

const port = process.env.PORT || 8001;
const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth",authRouter)

app.get("/", (_req,res) =>{
    res.send("Welcome to the API")
})

app.listen(port,() => {
    console.log(`Server running on port ${port}`)
})