import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getVideo, uploadVideo } from '../controllers/video';
import upload from '../middlewares/multerMiddleware';

export const router = Router();

router.post('/upload', upload.single('file'), uploadVideo);

router.get('/download/:filename', getVideo);
