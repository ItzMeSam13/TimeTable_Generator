import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const GetTimetable = async (req, res) => {
    const { taskListId } = req.params;

    if (!taskListId) {
        return res.status(400).json({ error: "Task list ID is required" });
    }

    try {
        const taskList = await prisma.taskList.findUnique({
            where: { id: taskListId },
            include: { Timetable: true }
        });

        if (!taskList || !taskList.Timetable) {
            return res.status(404).json({ error: "No timetable found for this Task List" });
        }

        let scheduleText = taskList.Timetable.schedule;
        let timetableId = taskList.Timetable.id; // 🔹 Get TimeTableId

        console.log("📌 Debug - Raw Timetable.schedule:", scheduleText);

        // 🔹 Parse scheduleText if it is a stringified JSON object
        try {
            if (typeof scheduleText === "string") {
                scheduleText = JSON.parse(scheduleText);
            } else if (typeof scheduleText !== "object" || scheduleText === null) {
                return res.status(400).json({ error: "Timetable data is missing or corrupted." });
            }
        } catch (error) {
            console.error("❌ Error parsing timetable JSON:", error);
            return res.status(400).json({ error: "Timetable data is not in valid JSON format." });
        }

        // 🔹 Format the timetable with AM/PM times and extract only the date
        const formattedSchedule = convertTimetableTo12HourFormat(scheduleText.timetable);

        return res.status(200).json({
            TimeTableId: timetableId, // 🔹 Include TimeTableId in response
            timetable: formattedSchedule
        });
    } catch (error) {
        console.error("Error fetching timetable:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// 🔹 Convert Time Format for Each Task Entry
function convertTimetableTo12HourFormat(timetableArray) {
    if (!Array.isArray(timetableArray)) {
        console.error("❌ Invalid timetable format:", timetableArray);
        return "Error: Timetable data is not an array.";
    }

    return timetableArray.map(task => ({
        TaskName: task.TaskName,
        StartTime: task.StartTime,  // Keep original ISO format
        EndTime: task.EndTime,      // Keep original ISO format
        Duration: task.Duration,
        Date: extractDate(task.Date),  // Convert Date to "YYYY-MM-DD"
        Priority: task.Priority
    }));
}

// 🔹 Extracts Only "YYYY-MM-DD" from an ISO Date
function extractDate(isoDate) {
    if (!isoDate) return null;
    
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) return isoDate; // Return original if invalid

    return dateObj.toISOString().split("T")[0]; // Extracts "YYYY-MM-DD"
}
