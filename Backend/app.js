import express from "express";
import authRouter from "./src/routes/authRoutes.js"
import tasksRouter from "./src/routes/TasksRoutes.js"
import taskListRouter from "./src/routes/TasksListsRoutes.js";
import cors from 'cors'
import dotenv from 'dotenv'
console.log("🔹 GEMINI API Key:", process.env.GEMINI_API_KEY ? "Loaded ✅" : "Not Found ❌");

dotenv.config();

const port = process.env.PORT || 8001;
const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
app.use("/tasklists", taskListRouter);
app.use("/tasks", tasksRouter);

app.get("/", (_req,res) =>{
    res.send("Welcome to the API")
})

app.listen(port,() => {
    console.log(`Server running on port ${port}`)
})