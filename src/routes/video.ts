import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getVideo, uploadVideo } from '../controllers/video';

export const router = Router();

router.post('/upload', uploadVideo);

router.get('/download/:filename', getVideo);
