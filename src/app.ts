import express, { Request, Response } from "express";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { router } from "./routes/video";

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());

app.use(router);

app.use("*", (req: Request, res: Response) => {
  res.status(404).send({ message: "Запрашиваемый ресурс не найден" });
});

app.listen(PORT);

export default app;
