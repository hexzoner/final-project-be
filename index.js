import "./db/index.js";
import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import authRouter from "./routes/authRouter.js";
import areasRouter from "./routes/areasRouter.js";
import tasksRouter from "./routes/tasksRouter.js";
import usersRouter from "./routes/usersRouter.js";
import reportsRouter from "./routes/reportsRouter.js";
import uploadImageRouter from "./routes/upload-image.js";
import uploadImageS3Router from "./routes/upload-image-s3.js";
import path from "path";
import { imagePath } from "./routes/upload-image-s3.js";

const __dirname = import.meta.dirname;

const app = express();
export const port = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/files", express.static(path.join(__dirname, imagePath)));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);
app.use("/areas", areasRouter);
app.use("/reports", reportsRouter);
app.use("/upload-image", uploadImageRouter);
app.use("/upload-image-s3", uploadImageS3Router);
app.use("*", (req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on port : ${port}`));
