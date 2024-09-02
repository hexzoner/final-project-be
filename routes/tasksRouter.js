import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
import { taskSchema } from "../schemas/schemas.js";
import { getTasks, createTask, getAllTasks, updateTask, deleteTask, getTaskById } from "../controllers/tasks.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";
import authorize from "../middleware/authorize.js";
import isOwner from "../middleware/isOwner.js";

const tasksRouter = Router();
// console.log(taskSchema);
tasksRouter
  .route("/")
  .get(verifyTokenMiddleware, getTasks)
  .post(verifyTokenMiddleware, authorize(["admin", "manager"]), validateJOI(taskSchema.POST), createTask);
tasksRouter.route("/all").get(getAllTasks);
tasksRouter
  .route("/:id")
  .get(verifyTokenMiddleware, getTaskById)
  .put(verifyTokenMiddleware, authorize(["admin", "manager", "staff"]), validateJOI(taskSchema.PUT), updateTask)
  .delete(verifyTokenMiddleware, authorize(["admin", "manager"]), deleteTask);

export default tasksRouter;
