import Subject from '../models/Subject.js';
import ChatHistory from '../models/ChatHistory.js';
import AIRequest from '../models/AIRequest.js';
import { answerStudyQuestion } from '../utils/geminiService.js';

const ownedTopic = async (userId, subjectId, topicId) => {
  const subject = await Subject.findOne({ _id: subjectId, ownerId: userId });
  return { subject, topic: subject?.topics.id(topicId) };
};

export const listChats = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.topicId) query.topicId = req.query.topicId;
    const chats = await ChatHistory.find(query).sort({ updatedAt: -1 }).limit(50).lean();
    res.json({ chats });
  } catch (error) { next(error); }
};

export const createChat = async (req, res, next) => {
  try {
    const { subject, topic } = await ownedTopic(req.user._id, req.body.subjectId, req.body.topicId);
    if (!subject || !topic) return res.status(404).json({ error: 'Topic not found.' });
    const chat = await ChatHistory.create({
      userId: req.user._id,
      subjectId: subject._id,
      topicId: topic._id,
      title: `Chat about ${topic.name}`
    });
    res.status(201).json({ chat });
  } catch (error) { next(error); }
};

export const getChat = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({ _id: req.params.chatId, userId: req.user._id }).lean();
    if (!chat) return res.status(404).json({ error: 'Conversation not found.' });
    res.json({ chat });
  } catch (error) { next(error); }
};

export const sendMessage = async (req, res, next) => {
  const startedAt = Date.now();
  let requestRecord;
  try {
    const chat = await ChatHistory.findOne({ _id: req.params.chatId, userId: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Conversation not found.' });
    const message = String(req.body.message || '').trim().slice(0, 4000);
    if (!message) return res.status(400).json({ error: 'Write a question first.' });
    chat.messages.push({ role: 'user', content: message });
    if (chat.messages.length === 1) chat.title = message.slice(0, 75);
    await chat.save();
    requestRecord = await AIRequest.create({ userId: req.user._id, chatId: chat._id, status: 'error' });

    if (!process.env.GEMINI_API_KEY) {
      requestRecord.status = 'not_configured';
      requestRecord.durationMs = Date.now() - startedAt;
      await requestRecord.save();
      return res.status(503).json({ error: 'AI is not configured yet. Add GEMINI_API_KEY to backend/.env. Your question is saved.' });
    }

    let pdfName = '';
    let pdfText = '';
    if (req.body.usePdf !== false) {
      const { subject, topic } = await ownedTopic(req.user._id, chat.subjectId, chat.topicId);
      if (subject && topic?.pdf) {
        pdfName = topic.pdf.displayName;
        pdfText = String(topic.pdf.extractedText || '').slice(0, 24000);
      }
    }

    const answer = await answerStudyQuestion({ messages: chat.messages, pdfName, pdfText });
    chat.messages.push({ role: 'assistant', content: answer });
    await chat.save();
    requestRecord.status = 'success';
    requestRecord.durationMs = Date.now() - startedAt;
    await requestRecord.save();
    res.json({ chat });
  } catch (error) {
    if (requestRecord) {
      requestRecord.status = 'error';
      requestRecord.durationMs = Date.now() - startedAt;
      await requestRecord.save().catch(() => {});
    }
    next(error);
  }
};
