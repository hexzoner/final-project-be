import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
// import { areaSchema } from "../schemas/schemas.js";
import { getAreas, createArea, updateArea, deleteArea, getAllAreas } from "../controllers/areas.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

const areasRouter = Router();

areasRouter.route("/").get(verifyTokenMiddleware, getAreas).post(verifyTokenMiddleware, createArea);
areasRouter.route("/all").get(getAllAreas);
areasRouter.route("/:id").put(verifyTokenMiddleware, updateArea).delete(verifyTokenMiddleware, deleteArea);

export default areasRouter;
