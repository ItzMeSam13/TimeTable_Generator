import { PrismaClient } from "@prisma/client";

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

