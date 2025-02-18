import { Request, Response } from "express";
import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

const convertedDir = path.join(__dirname, "../converted");

if (!fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir);
}

export const uploadVideo = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Файл не загружен" });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== ".mov") {
      fs.unlink(req.file.path, () => {});
      res.status(400).json({ error: "Поддерживается только формат .mov" });
      return;
    }

    const inputPath = req.file.path;
    const outputFileName = path.basename(inputPath, ".mov") + ".mp4";
    const outputPath = path.join(convertedDir, outputFileName);
    const downloadUrl = `http://localhost:3000/videos/download/${outputFileName}`;

    console.log(`Файл загружен: ${inputPath}`);

    await new Promise<void>((resolve, reject) => {
      Ffmpeg(inputPath)
        .output(outputPath)
        .on("end", () => {
          console.log(`Конвертация завершена: ${outputPath}`);
          fs.unlink(inputPath, () => {});
          resolve();
        })
        .on("error", (err) => {
          console.error("Ошибка FFmpeg:", err);
          fs.unlink(inputPath, () => {});
          fs.unlink(outputPath, () => {});
          reject(err);
        })
        .run();
    });

    res.json({ message: "Файл сконвертирован", downloadUrl });
  } catch (err: any) {
    console.error("Ошибка конвертации:", err.message);
    res
      .status(500)
      .json({ error: "Ошибка при конвертации видео", details: err.message });
  }
};

export const getVideo = (req: Request, res: Response) => {
  const filePath = path.join(convertedDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Файл не найден" });
    return;
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error("Ошибка при скачивании:", err);
      res.status(500).json({ error: "Ошибка при скачивании файла" });
    }
  });
};
