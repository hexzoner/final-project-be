import { Router } from "express";
import { staffInvitation } from "../controllers/email.js";

const emailRouter = Router();

emailRouter.route("/invitation").post(staffInvitation);

export default emailRouter;