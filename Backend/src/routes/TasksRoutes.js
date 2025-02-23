import { Router } from "express";
import { UpdateTasks, DeleteTask } from "../controllers/Tasks.js";
import { verifyToken } from "./authRoute.js";

const router = Router();


router.patch("/update", verifyToken, UpdateTasks);


router.delete("/:id", verifyToken, DeleteTask);
router.patch("/tasklists/:taskListId/tasks/:id", verifyToken, UpdateTasks);
export default router;
