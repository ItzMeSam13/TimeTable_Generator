import { Router } from "express";
import { UpdateTask, DeleteTask } from "../controllers/Tasks.js";
import { verifyToken } from "./authRoutes.js";

const router = Router();

// 🔹 Update an existing task
router.patch("/:id", verifyToken, UpdateTask);

// 🔹 Delete an existing task
router.delete("/:id", verifyToken, DeleteTask);
router.patch("/tasklists/:taskListId/tasks/:id", verifyToken, UpdateTask);
export default router;
