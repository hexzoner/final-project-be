import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
// import { taskSchema } from "../schemas/schemas.js";
import { getTasks, createTask, getAllTasks, updateTask, deleteTask } from "../controllers/tasks.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

const tasksRouter = Router();

tasksRouter.route("/").get(verifyTokenMiddleware, getTasks).post(verifyTokenMiddleware, createTask);
tasksRouter.route("/all").get(getAllTasks);
tasksRouter.route("/:id").put(verifyTokenMiddleware, updateTask).delete(verifyTokenMiddleware, deleteTask);

export default tasksRouter;
