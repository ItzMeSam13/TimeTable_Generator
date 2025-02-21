import { Router } from "express";
import { UpdateTasks, DeleteTask } from "../controllers/Tasks.js";
import { verifyToken } from "./authRoute.js";
import { GetTimetable } from "../controllers/timetable.js";

const router = Router();

// 🔹 Update an existing task
router.patch("/update", verifyToken, UpdateTasks);

// 🔹 Delete an existing task
router.delete("/:id", verifyToken, DeleteTask);
router.get("/:taskListId/timetable", verifyToken, GetTimetable);

export default router;
