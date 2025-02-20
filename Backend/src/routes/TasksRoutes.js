import { Router } from "express";
import {CreateTasks, GetUserTasks, UpdateTask, DeleteTask} from "../controllers/Tasks.js";
import { verifyToken } from "./authRoute.js";
const router = Router();

router.post("/",verifyToken, CreateTasks);
router.get("/",verifyToken, GetUserTasks);
router.patch("/:id",verifyToken, UpdateTask);
router.delete("/:id",verifyToken, DeleteTask);

export default router;