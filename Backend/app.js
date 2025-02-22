import express from "express";
import authRouter from "./src/routes/authRoutes.js"
import tasksRouter from "./src/routes/TasksRoutes.js"
import taskListRouter from "./src/routes/TasksListsRoutes.js";
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import { google } from "googleapis";
console.log("🔹 GEMINI API Key:", process.env.GEMINI_API_KEY ? "Loaded ✅" : "Not Found ❌");

dotenv.config();

const port = process.env.PORT || 8001;
const app = express();

app.use(express.json());
app.use(cors());

// 🔹 Load Google OAuth credentials
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// 🔹 Step 1: Generate Google OAuth URL
app.get("/auth/google", (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/calendar.events"],
    });
    res.redirect(authUrl);
});

// 🔹 Step 2: Handle OAuth Callback & Save Token
app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync("tokens.json", JSON.stringify(tokens));
        res.json({ message: "Google Calendar connected successfully!" });
    } catch (error) {
        console.error("OAuth Error:", error.message);
        res.status(500).json({ error: "Authentication failed" });
    }
});

app.use("/auth", authRouter);
app.use("/tasklists", taskListRouter);
app.use("/tasks", tasksRouter);

app.get("/", (_req,res) =>{
    res.send("Welcome to the API")
})

app.listen(port,() => {
    console.log(`Server running on port ${port}`)
})