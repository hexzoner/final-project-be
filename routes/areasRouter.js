import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
// import { areaSchema } from "../schemas/schemas.js";
import { getAreas, createArea, updateArea, deleteArea, getAllAreas } from "../controllers/areas.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";
import authorize from "../middleware/authorize.js";
import isOwner from "../middleware/isOwner.js";

const areasRouter = Router();

areasRouter
  .route("/")
  .get(verifyTokenMiddleware, getAreas)
  .post(verifyTokenMiddleware, authorize(["admin", "manager"]), createArea);
areasRouter.route("/all").get(getAllAreas);
areasRouter
  .route("/:id")
  .put(verifyTokenMiddleware, authorize(["admin", "manager"]), updateArea)
  .delete(verifyTokenMiddleware, authorize(["admin", "manager"]), deleteArea);

export default areasRouter;
