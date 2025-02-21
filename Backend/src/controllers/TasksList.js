import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { google } from "googleapis";

const prisma = new PrismaClient();

export const CreateTaskList = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Task list name is required" });
    }

    try {
        const taskList = await prisma.taskList.create({
            data: {
                name,
                userId: req.user.userId
            }
        });

        return res.status(201).json({ message: "Task list created successfully", taskListId: taskList.id });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const GetUserTaskLists = async (req, res) => {
    try {
        const taskLists = await prisma.taskList.findMany({
            where: { userId: req.user.userId }
        });

        return res.status(200).json({ taskLists });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const DeleteTaskList = async (req, res) => {
    const { taskListId } = req.params;

    try {
        const existingTaskList = await prisma.taskList.findUnique({
            where: { id: taskListId }
        });

        if (!existingTaskList || existingTaskList.userId !== req.user.userId) {
            return res.status(404).json({ error: "Task list not found" });
        }

        await prisma.tasks.deleteMany({
            where: { taskListId }
        });

        await prisma.taskList.delete({
            where: { id: taskListId }
        });

        return res.status(200).json({ message: "Task list and all associated tasks deleted successfully" });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// 🔹 Load saved OAuth tokens
const tokens = JSON.parse(fs.readFileSync("tokens.json"));
const oAuth2Client = new google.auth.OAuth2();
oAuth2Client.setCredentials(tokens);
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

export const SyncTimetableToGoogleCalendar = async (req, res) => {
    const { taskListId } = req.params;

    try {
        const timetable = await prisma.timetable.findUnique({ where: { taskListId } });
        if (!timetable || !timetable.schedule) {
            return res.status(404).json({ error: "No timetable found for this Task List." });
        }

        const events = JSON.parse(timetable.schedule); // Assuming schedule is stored as JSON string
        const { data: calendarEvents } = await calendar.events.list({
            calendarId: "primary",
            maxResults: 1000,
        });

        const existingEvents = new Map();
        calendarEvents.items.forEach(event => {
            if (event.summary) existingEvents.set(event.summary, event);
        });

        for (const event of events) {
            const eventStart = new Date(event.startTime).toISOString();
            const eventEnd = new Date(event.endTime).toISOString();

            if (existingEvents.has(event.name)) {
                const existingEvent = existingEvents.get(event.name);
                await calendar.events.update({
                    calendarId: "primary",
                    eventId: existingEvent.id,
                    resource: {
                        summary: event.name,
                        description: event.details || "Generated by AI",
                        start: { dateTime: eventStart },
                        end: { dateTime: eventEnd },
                    },
                });
            } else {
                await calendar.events.insert({
                    calendarId: "primary",
                    resource: {
                        summary: event.name,
                        description: event.details || "Generated by AI",
                        start: { dateTime: eventStart },
                        end: { dateTime: eventEnd },
                    },
                });
            }
        }

        return res.status(201).json({ message: "Timetable synced with Google Calendar successfully!" });
    } catch (error) {
        console.error("Google Calendar Error:", error.message);
        return res.status(500).json({ error: "Failed to sync Timetable to Google Calendar" });
    }
};

