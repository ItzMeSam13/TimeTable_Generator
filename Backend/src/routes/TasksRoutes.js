import { Router } from "express";
import { UpdateTasks, DeleteTask } from "../controllers/Tasks.js";
import { verifyToken } from "./authRoute.js";

const router = Router();

// 🔹 Update an existing task
router.patch("/update", verifyToken, UpdateTasks);

// 🔹 Delete an existing task
router.delete("/:id", verifyToken, DeleteTask);

export default router;
