import express from 'express'
import { uploadVideo, getVideos, getVideo, deleteVideo, addComment } from '../controllers/videoController'
import multer from 'multer';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router()

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadVideos');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({storage: videoStorage})
router.post('/', authMiddleware, upload.single('video'),(req, res, next) => {
    console.log(req.file);
    uploadVideo(req, res, next);
});

router.post('/:id/comments', authMiddleware, addComment)
router.get('/', authMiddleware, getVideos);
router.get('/:id', authMiddleware, getVideo);
router.delete('/:id', authMiddleware, deleteVideo);

export default router;