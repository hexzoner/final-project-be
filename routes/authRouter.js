import { Router } from "express";
import validateJOI from "../middlewares/validateJOI.js";
import { userSchema } from "../joi/schemas.js";
import { signIn, signUp, getUserData, getUsers } from "../controllers/users.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

const authRouter = Router();

authRouter.route("/signup").post(validateJOI(userSchema.POST), signUp);
authRouter.route("/signin").post(validateJOI(userSchema.LOGIN), signIn);
authRouter.route("/me").get(verifyTokenMiddleware, getUserData);
authRouter.route("/users").get(verifyTokenMiddleware, getUsers);

export default authRouter;
