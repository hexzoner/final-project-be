import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
// import { areaSchema } from "../schemas/schemas.js";
import { getAreas } from "../controllers/areas.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

const areasRouter = Router();

areasRouter.route("/").get(verifyTokenMiddleware, getAreas);

export default areasRouter;
