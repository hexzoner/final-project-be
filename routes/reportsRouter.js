import { Router } from "express";
import { getStats, getWeekTasks } from "../controllers/reports.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";
import authorize from "../middleware/authorize.js";
import isOwner from "../middleware/isOwner.js";

const reportsRouter = Router();

reportsRouter.route("/dashboard/stats").get(verifyTokenMiddleware, getStats);
reportsRouter.route("/dashboard/weeklyTasks").get(verifyTokenMiddleware, getWeekTasks);

export default reportsRouter;
