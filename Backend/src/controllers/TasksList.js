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

export const EditTaskListName = async (req, res) => {
    const { taskListId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "New task list name is required" });
    }

    try {
        const existingTaskList = await prisma.taskList.findUnique({
            where: { id: taskListId }
        });

        if (!existingTaskList || existingTaskList.userId !== req.user.userId) {
            return res.status(404).json({ error: "Task list not found" });
        }

        const updatedTaskList = await prisma.taskList.update({
            where: { id: taskListId },
            data: { name }
        });

        return res.status(200).json({ message: "Task list name updated successfully", taskList: updatedTaskList });
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

        // 🔹 Delete AI-generated timetable first
        await prisma.timetable.deleteMany({
            where: { taskListId }
        });

        // 🔹 Delete all related tasks
        await prisma.tasks.deleteMany({
            where: { taskListId }
        });

        // 🔹 Delete Task List itself
        await prisma.taskList.delete({
            where: { id: taskListId }
        });

        // 🔹 Delete Google Calendar Events
        await deleteGoogleCalendarEvents(taskListId);

        return res.status(200).json({ message: "Task list and all associated data deleted successfully" });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
async function deleteGoogleCalendarEvents(taskListId) {
    try {
        // 🔹 Fetch all calendar events
        const { data: calendarEvents } = await calendar.events.list({
            calendarId: "primary",
            maxResults: 1000,
        });

        if (!calendarEvents.items.length) {
            return;
        }

        // 🔹 Filter events by taskListId
        const eventsToDelete = calendarEvents.items.filter(event =>
            event.description && event.description.includes(`TaskListID:${taskListId}`)
        );

        // 🔹 Delete each event
        for (const event of eventsToDelete) {
            await calendar.events.delete({
                calendarId: "primary",
                eventId: event.id
            });
        }

        console.log(` Deleted ${eventsToDelete.length} Google Calendar events for TaskList ${taskListId}`);
    } catch (error) {
        console.error(" Error deleting Google Calendar events:", error.message);
    }
}







// 🔹 Load saved OAuth tokens
const tokens = JSON.parse(fs.readFileSync("tokens.json"));
const oAuth2Client = new google.auth.OAuth2();
oAuth2Client.setCredentials(tokens);
const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

function parseTimetableText(data) {

    // 🔹 Ensure data is an object and contains the timetable array
    if (typeof data !== "object" || !data.timetable || !Array.isArray(data.timetable)) {
        console.error(" Error: Invalid timetable format. Expected an object with a timetable array.");
        return [];
    }

    const events = data.timetable.map(task => ({
        name: task.TaskName,
        startTime: new Date(task.StartTime).toISOString(),
        endTime: new Date(task.EndTime).toISOString(),
        details: `Priority: ${task.Priority}, Duration: ${task.Duration} hours`
    }));

    return events;
}




export const SyncTimetableToGoogleCalendar = async (req, res) => {
    const { timetableId } = req.params; // Using timetableId instead of taskListId

    try {
        // 🔹 Fetch the timetable from the database
        const timetable = await prisma.timetable.findUnique({ where: { id: timetableId } });

        if (!timetable || !timetable.schedule) {
            return res.status(404).json({ error: "No timetable found." });
        }

        // 🔹 Convert AI-generated text into structured JSON
        const events = parseTimetableText(timetable.schedule);

        if (!events.length) {
            return res.status(400).json({ error: "Failed to parse timetable." });
        }

        console.log(" Parsed Events:", events); // Debugging log

        // 🔹 Fetch existing Google Calendar events to prevent duplicates
        const { data: calendarEvents } = await calendar.events.list({
            calendarId: "primary",
            maxResults: 1000,
        });

        const existingEvents = new Map();
        calendarEvents.items.forEach(event => {
            if (event.summary) existingEvents.set(event.summary, event);
        });

        // 🔹 Sync new events
        for (const event of events) {
            if (!event.startTime || !event.endTime) continue;
        
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
        
            if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) continue;
            if (eventStart >= eventEnd) continue;
        
            const isMultiDay = eventStart.toDateString() !== eventEnd.toDateString();
        
            const calendarEvent = {
                summary: event.name,
                description: `Generated by AI `,
                start: isMultiDay
                    ? { date: eventStart.toISOString().split("T")[0] } // All-day format
                    : { dateTime: eventStart.toISOString() }, // DateTime format
                end: isMultiDay
                    ? { date: new Date(eventEnd.getTime() + 86400000).toISOString().split("T")[0] } // Extend end by 1 day
                    : { dateTime: eventEnd.toISOString() },
            };
        
            if (existingEvents.has(event.name)) {
                await calendar.events.update({
                    calendarId: "primary",
                    eventId: existingEvents.get(event.name).id,
                    resource: calendarEvent,
                });
            } else {
                await calendar.events.insert({
                    calendarId: "primary",
                    resource: calendarEvent,
                });
            }
        }
        

        return res.status(201).json({ message: "Timetable synced with Google Calendar successfully!" });

    } catch (error) {
        console.error(" Google Calendar Sync Error:", error.message);
        return res.status(500).json({ error: "Failed to sync Timetable to Google Calendar" });
    }
};


