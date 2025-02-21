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

export const SyncTaskListToGoogleCalendar = async (req, res) => {
    const { taskListId } = req.params;

    try {
        // 🔹 Fetch all tasks from the Task List
        const tasks = await prisma.tasks.findMany({
            where: { taskListId },
            orderBy: { Deadline: "asc" }
        });

        if (tasks.length === 0) {
            return res.status(400).json({ error: "No tasks found in this Task List." });
        }

        // 🔹 Get all events from Google Calendar
        const { data: calendarEvents } = await calendar.events.list({
            calendarId: "primary",
            maxResults: 1000, // Adjust if needed
        });

        // 🔹 Map existing calendar events
        const existingEvents = new Map();
        calendarEvents.items.forEach(event => {
            if (event.summary) {
                existingEvents.set(event.summary, event);
            }
        });

        // 🔹 Add or Update each task as an event in Google Calendar
        for (const task of tasks) {
            const eventStart = new Date(task.Deadline).toISOString();
            const eventEnd = new Date(new Date(task.Deadline).getTime() + task.Duration * 60 * 60 * 1000).toISOString();

            if (existingEvents.has(task.TaskName)) {
                // 🔹 Update existing event if task name exists in calendar
                const existingEvent = existingEvents.get(task.TaskName);
                await calendar.events.update({
                    calendarId: "primary",
                    eventId: existingEvent.id,
                    resource: {
                        summary: task.TaskName,
                        description: `Priority: ${task.Priority}`,
                        start: { dateTime: eventStart },
                        end: { dateTime: eventEnd },
                    },
                });
            } else {
                // 🔹 Create a new event if it doesn’t exist
                await calendar.events.insert({
                    calendarId: "primary",
                    resource: {
                        summary: task.TaskName,
                        description: `Priority: ${task.Priority}`,
                        start: { dateTime: eventStart },
                        end: { dateTime: eventEnd },
                    },
                });
            }
        }

        return res.status(201).json({ message: "Task List synced & updated in Google Calendar successfully!" });
    } catch (error) {
        console.error("Google Calendar Error:", error.message);
        return res.status(500).json({ error: "Failed to sync Task List to Google Calendar" });
    }
};
