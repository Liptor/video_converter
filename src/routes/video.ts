import { Router } from 'express';
import multer from 'multer';
import { getVideo, uploadVideo } from '../controllers/video';


export const router = Router();


const upload = multer({ dest: "../converted" });

router.post('/upload', upload.single('file'), uploadVideo);

router.get('/download/:filename', getVideo);
