import express from "express";
import {
    generateFlashcards,
    
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate-flashcards', generateFlashcards);

export default router;
