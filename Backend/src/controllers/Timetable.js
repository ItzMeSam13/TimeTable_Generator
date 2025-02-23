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
        let timetableId = taskList.Timetable.id;

        console.log("📌 Debug - Raw Timetable.schedule:", scheduleText);

  
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

        const formattedSchedule = convertTimetableTo12HourFormat(scheduleText.timetable);

        return res.status(200).json({
            TimeTableId: timetableId, 
            timetable: formattedSchedule
        });
    } catch (error) {
        console.error("Error fetching timetable:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



function convertTimetableTo12HourFormat(timetableArray) {
    if (!Array.isArray(timetableArray)) {
        console.error("❌ Invalid timetable format:", timetableArray);
        return "Error: Timetable data is not an array.";
    }

    return timetableArray.map(task => ({
        TaskName: task.TaskName,
        StartTime: task.StartTime,  
        EndTime: task.EndTime,      
        Duration: task.Duration,
        Date: extractDate(task.Date), 
        Priority: task.Priority
    }));
}


function extractDate(isoDate) {
    if (!isoDate) return null;
    
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) return isoDate;

    return dateObj.toISOString().split("T")[0]; 
}
