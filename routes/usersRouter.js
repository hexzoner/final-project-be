import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
import { getUsers, getAllUsers, createUser, updateUser, deleteUser } from "../controllers/users.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";
import authorize from "../middleware/authorize.js";
import { userSchema } from "../schemas/schemas.js";

const usersRouter = Router();

usersRouter
  .route("/")
  .get(verifyTokenMiddleware, getUsers)
  .post(verifyTokenMiddleware, authorize(["admin"]), validateJOI(userSchema.POST), createUser);

usersRouter.route("/all").get(getAllUsers);

usersRouter
  .route("/:id")
  .put(verifyTokenMiddleware, authorize(["admin"]), updateUser)
  .delete(verifyTokenMiddleware, authorize(["admin"]), deleteUser);

export default usersRouter;
