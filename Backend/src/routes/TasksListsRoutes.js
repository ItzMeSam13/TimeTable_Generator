import { Router } from "express";
import {
	CreateTaskList,
	GetUserTaskLists,
	DeleteTaskList,
	EditTaskListName,
	SyncTimetableToGoogleCalendar,
} from "../controllers/TasksList.js";
import { CreateTasks, GetUserTasks, GenerateTimetable } from "../controllers/Tasks.js";
import { verifyToken } from "./authRoute.js";
import { GetTimetable } from "../controllers/Timetable.js";

const router = Router();

// 🔹 Task List Routes
router.post("/", verifyToken, CreateTaskList);
router.patch("/:taskListId", verifyToken, EditTaskListName);
router.get("/", verifyToken, GetUserTaskLists);
router.delete("/:taskListId", verifyToken, DeleteTaskList);
router.get("/:taskListId/timetable", verifyToken, GetTimetable);

// 🔹 Move Task Creation Inside Task List Routes
router.post("/:taskListId/tasks", verifyToken, CreateTasks);
router.post("/:taskListId/generate-timetable", verifyToken, GenerateTimetable); 
router.get("/:taskListId/tasks", verifyToken, GetUserTasks);
router.post(
	"/timetable/:timetableId/sync",
	verifyToken,
	SyncTimetableToGoogleCalendar
);
export default router;
