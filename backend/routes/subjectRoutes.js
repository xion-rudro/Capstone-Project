import express from 'express';
import protect from '../middleware/auth.js';
import { uploadPdf } from '../config/multer.js';
import {
  listSubjects, createSubject, updateSubject, deleteSubject,
  createTopic, updateTopic, deleteTopic, uploadTopicPdf,
  renameTopicPdf, deleteTopicPdf, getPdfFile
} from '../controllers/documentController.js';

const router = express.Router();
router.use(protect);
router.get('/files/:fileId', getPdfFile);
router.get('/', listSubjects);
router.post('/', createSubject);
router.patch('/:subjectId', updateSubject);
router.delete('/:subjectId', deleteSubject);
router.post('/:subjectId/topics', createTopic);
router.patch('/:subjectId/topics/:topicId', updateTopic);
router.delete('/:subjectId/topics/:topicId', deleteTopic);
router.post('/:subjectId/topics/:topicId/pdf', uploadPdf.single('pdf'), uploadTopicPdf);
router.patch('/:subjectId/topics/:topicId/pdf', renameTopicPdf);
router.delete('/:subjectId/topics/:topicId/pdf', deleteTopicPdf);

export default router;
