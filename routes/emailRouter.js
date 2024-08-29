import { Router } from "express";
import { staffInvitation } from "../controllers/email.js";
import verifyTokenMiddleware from "../middleware/verifyToken.js";


const emailRouter = Router();

emailRouter.route("/invitation").post(verifyTokenMiddleware, staffInvitation);

export default emailRouter;