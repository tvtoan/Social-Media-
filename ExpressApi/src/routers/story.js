import express, { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { createStory, getStories,getStory, deleteStory } from '../controllers/storyController';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,'uploadStories');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // save original file name
    }
})

const upload = multer({storage})

router.post('/', authMiddleware, upload.single('image'), (req, res, next) => {
    console.log(req.file);
    createStory(req, res, next);
});
router.get('/', authMiddleware, getStories);
router.get('/:id', authMiddleware, getStory);
router.delete('/:id', authMiddleware, deleteStory);

export default router;