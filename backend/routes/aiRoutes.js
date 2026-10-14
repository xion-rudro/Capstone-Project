import express from 'express';
import protect from '../middleware/auth.js';
import { listChats, createChat, getChat, sendMessage } from '../controllers/aiController.js';

const router = express.Router();
router.use(protect);
router.get('/chats', listChats);
router.post('/chats', createChat);
router.get('/chats/:chatId', getChat);
router.post('/chats/:chatId/messages', sendMessage);

export default router;
