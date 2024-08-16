import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
// import { taskSchema } from "../schemas/schemas.js";
import { getTasks } from "../controllers/tasks.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

const tasksRouter = Router();

tasksRouter.route("/").get(verifyTokenMiddleware, getTasks);

export default tasksRouter;
