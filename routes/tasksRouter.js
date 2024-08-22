import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
// import { taskSchema } from "../schemas/schemas.js";
import { getTasks, createTask, getAllTasks, updateTask, deleteTask, getTaskById } from "../controllers/tasks.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";
import authorize from "../middleware/authorize.js";
import isOwner from "../middleware/isOwner.js";

const tasksRouter = Router();

tasksRouter
  .route("/")
  .get(verifyTokenMiddleware, getTasks)
  .post(verifyTokenMiddleware, authorize(["admin"]), createTask);
tasksRouter.route("/all").get(getAllTasks);
tasksRouter
  .route("/:id")
  .get(verifyTokenMiddleware, getTaskById)
  .put(verifyTokenMiddleware, authorize(["admin"]), updateTask)
  .delete(verifyTokenMiddleware, authorize(["admin"]), deleteTask);

export default tasksRouter;
