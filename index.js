import "./db/index.js";
import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("*", (req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on port : ${port}`));
