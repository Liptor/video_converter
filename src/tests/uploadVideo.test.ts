import request from "supertest";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadVideo, getVideo } from "../controllers/video";

const app = express();
const upload = multer({ dest: "../converted" });

app.post("/upload", upload.single("file"), uploadVideo);
app.get("/download/:filename", getVideo);

describe("Video Controller", () => {
  const convertedDir = path.join(__dirname, "converted");
  const testFilePath = path.join(__dirname, "test.mov");

  beforeAll(() => {
    if (!fs.existsSync(convertedDir)) {
      fs.mkdirSync(convertedDir);
    }
  });

  afterAll(() => {
    fs.readdirSync(convertedDir).forEach((file) => {
      fs.unlinkSync(path.join(convertedDir, file));
    });
    fs.rmdirSync(convertedDir);
  });

  it("should upload and convert a video file", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("file", testFilePath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Файл сконвертирован");
    expect(response.body).toHaveProperty("downloadUrl");
  }, 10000);

  it("should return 400 if no file is uploaded", async () => {
    const response = await request(app).post("/upload").send();

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Файл не загружен");
  });

  it("should return 400 if file format is not .mov", async () => {
    const invalidFilePath = path.join(__dirname, "test.txt");
    fs.writeFileSync(invalidFilePath, "dummy content");

    const response = await request(app)
      .post("/upload")
      .attach("file", invalidFilePath);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Поддерживается только формат .mov"
    );

    fs.unlinkSync(invalidFilePath);
  });

  it("should return 404 if video file is not found", async () => {
    const response = await request(app).get("/download/nonexistent.mp4");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Файл не найден");
  });

  it("should download the converted video file", async () => {
    const uploadResponse = await request(app)
      .post("/upload")
      .attach("file", testFilePath);

    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body).toHaveProperty("downloadUrl");

    const downloadUrl = uploadResponse.body.downloadUrl;
    const filename = path.basename(downloadUrl);

    const response = await request(app).get(`/download/${filename}`);

    console.log(filename, "should download the converted video file");

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toBe(
      `attachment; filename="${filename}"`
    );

    const filePath = path.join(convertedDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
});
