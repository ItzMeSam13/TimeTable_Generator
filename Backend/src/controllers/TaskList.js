export const DeleteTaskList = async (req, res) => {
    const { taskListId } = req.params;

    try {
        // Delete tasks first
        await prisma.tasks.deleteMany({ where: { taskListId } });

        // Delete timetable entry
        await prisma.timetable.deleteMany({ where: { taskListId } });

        // Delete task list
        await prisma.taskList.delete({ where: { id: taskListId } });

        return res.status(200).json({ message: "Task List and associated data deleted successfully" });
    } catch (error) {
        console.error("Error deleting task list:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
