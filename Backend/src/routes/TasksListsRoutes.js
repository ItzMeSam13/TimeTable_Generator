import { Router } from "express";
import { CreateTaskList, GetUserTaskLists, DeleteTaskList, SyncTaskListToGoogleCalendar } from "../controllers/TasksList.js";
import { CreateTasks, GetUserTasks } from "../controllers/Tasks.js";
import { verifyToken } from "./authRoute.js";


const router = Router();

// 🔹 Task List Routes
router.post("/", verifyToken, CreateTaskList); 
router.get("/", verifyToken, GetUserTaskLists); 
router.delete("/:taskListId", verifyToken, DeleteTaskList);

// 🔹 Move Task Creation Inside Task List Routes
router.post("/:taskListId/tasks", verifyToken, CreateTasks);
router.get("/:taskListId/tasks", verifyToken, GetUserTasks); 

router.post("/:taskListId/sync-to-calendar", verifyToken, SyncTaskListToGoogleCalendar);
export default router;
