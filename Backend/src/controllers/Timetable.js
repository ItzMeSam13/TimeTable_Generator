import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const GetTimetable = async (req, res) => {
    const { taskListId } = req.params;

    try {
        const timetable = await prisma.timetable.findUnique({
            where: { taskListId }
        });

        if (!timetable) {
            return res.status(404).json({ error: "No timetable found for this Task List" });
        }

        return res.status(200).json({ timetable: timetable.schedule });
    } catch (error) {
        console.error("Error fetching timetable:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
