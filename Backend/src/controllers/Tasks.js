import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { generateOptimizedTimetable } from "../utils/geminiAI.js";

export const CreateTasks = async (req, res) => {
    const { taskListId } = req.params;
    const { tasks } = req.body;

    if (!taskListId || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: "Task list ID and tasks array are required" });
    }

    try {
        const taskListExists = await prisma.taskList.findUnique({
            where: { id: taskListId }
        });

        if (!taskListExists) {
            return res.status(404).json({ error: "Task list not found" });
        }

        const existingTaskCount = await prisma.tasks.count({ where: { taskListId } });

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];

            if (!task.TaskName || !task.Deadline || !task.Priority || !task.Duration) {
                return res.status(400).json({ error: "All task fields are required" });
            }

            const existingTask = await prisma.tasks.findFirst({
                where: { taskListId, TaskName: task.TaskName }
            });

            if (existingTask) {

                await prisma.tasks.update({
                    where: { TaskID: existingTask.TaskID },
                    data: {
                        Deadline: new Date(task.Deadline),
                        Priority: task.Priority,
                        Duration: Number(task.Duration)
                    }
                });
            } else {

                await prisma.tasks.create({
                    data: {
                        TaskNo: existingTaskCount + i + 1,
                        TaskName: task.TaskName,
                        Deadline: new Date(task.Deadline),
                        Priority: task.Priority,
                        Duration: Number(task.Duration),
                        taskListId
                    }
                });
            }
        }

        return res.status(201).json({ message: "Tasks saved successfully" });

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
    const { updates } = req.body; 

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

export const GenerateTimetable = async (req, res) => {
    const { taskListId } = req.params;

    if (!taskListId) {
        return res.status(400).json({ error: "Task list ID is required" });
    }

    try {
        const tasks = await prisma.tasks.findMany({ where: { taskListId } });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ error: "No tasks found in this Task List" });
        }

        const aiSchedule = await generateOptimizedTimetable(tasks);

        if (!aiSchedule) {
            return res.status(500).json({ error: "Failed to generate AI schedule" });
        }

        await prisma.timetable.upsert({
            where: { taskListId },
            update: { schedule: aiSchedule },
            create: { taskListId, schedule: aiSchedule }
        });

        return res.status(201).json({
            message: "AI Timetable generated successfully",
            timetable: aiSchedule
        });

    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
