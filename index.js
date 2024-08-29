import "./db/index.js";
import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import authRouter from "./routes/authRouter.js";
import areasRouter from "./routes/areasRouter.js";
import tasksRouter from "./routes/tasksRouter.js";
import usersRouter from "./routes/usersRouter.js";
import reportsRouter from "./routes/reportsRouter.js";
import emailRouter from "./routes/emailRouter.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);
app.use("/areas", areasRouter);
app.use("/reports", reportsRouter);
app.use("/email", emailRouter);
app.use("*", (req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on port : ${port}`));
