import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        const existingTaskCount = await prisma.tasks.count({
            where: { taskListId }
        });

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

        const insertedTasks = await prisma.tasks.findMany({
            where: { taskListId },
            orderBy: { TaskNo: "asc" }
        });

        return res.status(201).json({ message: "Tasks created successfully", tasks: insertedTasks });
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

export const UpdateTask = async (req, res) => {
    const { id } = req.params;
    const { TaskName, Deadline, Priority, Duration } = req.body;

    try {
        const existingTask = await prisma.tasks.findUnique({
            where: { TaskID: id }
        });

        if (!existingTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        const updatedTask = await prisma.tasks.update({
            where: { TaskID: id },
            data: {
                TaskName: TaskName !== undefined ? TaskName : existingTask.TaskName,
                Deadline: Deadline !== undefined ? new Date(Deadline) : existingTask.Deadline,
                Priority: Priority !== undefined ? Priority : existingTask.Priority,
                Duration: Duration !== undefined ? Number(Duration) : existingTask.Duration
            }
        });

        return res.status(200).json({ message: "Task updated successfully", task: updatedTask });
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