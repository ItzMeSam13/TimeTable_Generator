import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { generateOptimizedTimetable } from "../utils/geminiAI.js";




export const CreateTasks = async (req, res) => {
    const { taskListId } = req.params;
    const { tasks } = req.body;

    if (!taskListId || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: "Task list ID and tasks array are required" });
    }

    for (let task of tasks) {
        if (!task.TaskName || !task.Deadline || !task.Priority || !task.Duration) {
            return res.status(400).json({ error: "All task fields are required for every task" });
        }
    }

    try {
        // 🔹 Get existing task count to auto-increment TaskNo
        const existingTaskCount = await prisma.tasks.count({ where: { taskListId } });

        // 🔹 Save tasks with auto-incremented TaskNo
        await prisma.tasks.createMany({
            data: tasks.map((task, index) => ({
                TaskNo: existingTaskCount + index + 1,
                TaskName: task.TaskName,
                Deadline: new Date(task.Deadline),
                Priority: task.Priority,
                Duration: Number(task.Duration),
                taskListId
            })),
            skipDuplicates: true
        });

        // 🔹 Fetch all tasks from the list
        const allTasks = await prisma.tasks.findMany({ where: { taskListId } });

        // 🔹 Generate AI-Optimized Schedule
        const aiSchedule = await generateOptimizedTimetable(allTasks);

        if (!aiSchedule) {
            return res.status(201).json({
                message: "Tasks created successfully, but AI did not generate a valid schedule"
            });
        }

        // 🔹 Save AI-generated schedule in the timetable
        await prisma.timetable.upsert({
            where: { taskListId },
            update: { schedule: aiSchedule },
            create: { taskListId, schedule: aiSchedule }
        });

        return res.status(201).json({
            message: "Tasks created successfully, AI timetable generated",
            timetable: aiSchedule
        });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const GetUserTasks = async (req, res) => {
    const { taskListId } = req.params;

    if (!taskListId) {
        return res.status(400).json({ error: "Task list ID is required" });
    }

    try {
        const tasks = await prisma.tasks.findMany({
            where: { taskListId },
            orderBy: { TaskNo: "asc" }
        });

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const UpdateTasks = async (req, res) => {
    const { updates } = req.body; // Expecting an array of task updates

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: "An array of task updates is required" });
    }

    try {
        const updatedTasks = [];

        for (const task of updates) {
            const { TaskID, TaskName, Deadline, Priority, Duration } = task;

            const existingTask = await prisma.tasks.findUnique({
                where: { TaskID }
            });

            if (!existingTask) {
                return res.status(404).json({ error: `Task with ID ${TaskID} not found` });
            }

            const updatedTask = await prisma.tasks.update({
                where: { TaskID },
                data: {
                    TaskName: TaskName !== undefined ? TaskName : existingTask.TaskName,
                    Deadline: Deadline !== undefined ? new Date(Deadline) : existingTask.Deadline,
                    Priority: Priority !== undefined ? Priority : existingTask.Priority,
                    Duration: Duration !== undefined ? Number(Duration) : existingTask.Duration
                }
            });

            updatedTasks.push(updatedTask);
        }

        return res.status(200).json({ message: "Tasks updated successfully", tasks: updatedTasks });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const DeleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const existingTask = await prisma.tasks.findUnique({
            where: { TaskID: id }
        });

        if (!existingTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        await prisma.tasks.delete({
            where: { TaskID: id }
        });

        const remainingTasks = await prisma.tasks.findMany({
            where: { taskListId: existingTask.taskListId },
            orderBy: { TaskNo: "asc" }
        });

        for (let i = 0; i < remainingTasks.length; i++) {
            await prisma.tasks.update({
                where: { TaskID: remainingTasks[i].TaskID },
                data: { TaskNo: i + 1 }
            });
        }

        return res.status(200).json({ message: "Task deleted and renumbered successfully" });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};