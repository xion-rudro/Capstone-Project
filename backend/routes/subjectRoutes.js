import express from 'express';
import { createSubject, createTopic, getSubjects } from '../controllers/subjectController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getSubjects);
router.post('/', createSubject);
router.post('/:subjectId/topics', createTopic);

export default router;
