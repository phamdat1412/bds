import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import { env } from "./configs/env.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.frontendBaseUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Real estate backend API is running",
  });
});

app.use(`/${env.uploadDir}`, express.static(path.resolve(process.cwd(), env.uploadDir)));

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;