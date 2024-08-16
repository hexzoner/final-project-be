import { Router } from "express";
import validateJOI from "../middleware/validateJOI.js";
import { userSchema } from "../schemas/schemas.js";
import { signIn, signUp, me } from "../controllers/auth.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

const authRouter = Router();

authRouter.route("/signup").post(validateJOI(userSchema.POST), signUp);
authRouter.route("/login").post(validateJOI(userSchema.LOGIN), signIn);
authRouter.route("/me").get(verifyTokenMiddleware, me);

export default authRouter;
