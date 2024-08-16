import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
// import { taskSchema } from "../schemas/schemas.js";
import { getUsers, getAllUsers } from "../controllers/users.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

const usersRouter = Router();

usersRouter.route("/").get(verifyTokenMiddleware, getUsers);
usersRouter.route("/all").get(getAllUsers);

export default usersRouter;
