import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
import { areaSchema, userSchema } from "../schemas/schemas.js";
import { getAreas, createArea, updateArea, deleteArea, getAllAreas } from "../controllers/areas.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";
import authorize from "../middleware/authorize.js";
import isOwner from "../middleware/isOwner.js";

const areasRouter = Router();
// console.log(areaSchema.POST);
areasRouter
  .route("/")
  .get(verifyTokenMiddleware, getAreas)
  .post(verifyTokenMiddleware, authorize(["admin", "manager"]), validateJOI(areaSchema.POST), createArea);
areasRouter.route("/all").get(getAllAreas);
areasRouter
  .route("/:id")
  .put(verifyTokenMiddleware, authorize(["admin", "manager"]), validateJOI(areaSchema.PUT), updateArea)
  .delete(verifyTokenMiddleware, authorize(["admin", "manager"]), deleteArea);

export default areasRouter;
