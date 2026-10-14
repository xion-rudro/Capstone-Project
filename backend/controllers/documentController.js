import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import Subject from '../models/Subject.js';
import ChatHistory from '../models/ChatHistory.js';
import { uploadDirectory, removeStoredPdf } from '../config/multer.js';
import { parsePdfBuffer } from '../utils/pdfParser.js';

const text = (value, max) => String(value || '').trim().slice(0, max);
const ownedSubject = (userId, subjectId) => Subject.findOne({ _id: subjectId, ownerId: userId });
const getTopic = (subject, topicId) => subject?.topics.id(topicId);

export const listSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ ownerId: req.user._id }).sort({ updatedAt: -1 }).lean();
    res.json({ subjects });
  } catch (error) { next(error); }
};

export const createSubject = async (req, res, next) => {
  try {
    const name = text(req.body.name, 80);
    if (!name) return res.status(400).json({ error: 'Add a subject name.' });
    const subject = await Subject.create({ ownerId: req.user._id, name, topics: [] });
    res.status(201).json({ subject });
  } catch (error) { next(error); }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await ownedSubject(req.user._id, req.params.subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const name = text(req.body.name, 80);
    if (!name) return res.status(400).json({ error: 'Add a subject name.' });
    subject.name = name;
    await subject.save();
    res.json({ subject });
  } catch (error) { next(error); }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await ownedSubject(req.user._id, req.params.subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    for (const topic of subject.topics) await removeStoredPdf(topic.pdf?.storageName);
    await Promise.all([subject.deleteOne(), ChatHistory.deleteMany({ subjectId: subject._id })]);
    res.json({ ok: true });
  } catch (error) { next(error); }
};

export const createTopic = async (req, res, next) => {
  try {
    const subject = await ownedSubject(req.user._id, req.params.subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const name = text(req.body.name, 100);
    if (!name) return res.status(400).json({ error: 'Add a topic name.' });
    subject.topics.push({ name });
    await subject.save();
    res.status(201).json({ subject, topic: subject.topics.at(-1) });
  } catch (error) { next(error); }
};

export const updateTopic = async (req, res, next) => {
  try {
    const subject = await ownedSubject(req.user._id, req.params.subjectId);
    const topic = getTopic(subject, req.params.topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    const name = text(req.body.name, 100);
    if (!name) return res.status(400).json({ error: 'Add a topic name.' });
    topic.name = name;
    await subject.save();
    res.json({ subject, topic });
  } catch (error) { next(error); }
};

export const deleteTopic = async (req, res, next) => {
  try {
    const subject = await ownedSubject(req.user._id, req.params.subjectId);
    const topic = getTopic(subject, req.params.topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    await removeStoredPdf(topic.pdf?.storageName);
    topic.deleteOne();
    await Promise.all([subject.save(), ChatHistory.deleteMany({ topicId: topic._id })]);
    res.json({ ok: true });
  } catch (error) { next(error); }
};

export const uploadTopicPdf = async (req, res, next) => {
  const uploadedPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: 'Choose a PDF file first.' });
    const subject = await ownedSubject(req.user._id, req.params.subjectId);
    const topic = getTopic(subject, req.params.topicId);
    if (!topic) { await fs.unlink(uploadedPath).catch(() => {}); return res.status(404).json({ error: 'Topic not found.' }); }
    const buffer = await fs.readFile(uploadedPath);
    if (buffer.subarray(0, 5).toString() !== '%PDF-') {
      await fs.unlink(uploadedPath).catch(() => {});
      return res.status(400).json({ error: 'This file is not a valid PDF.' });
    }
    let parsed = { text: '', pageCount: 0 };
    try { parsed = await parsePdfBuffer(buffer); } catch { /* Scanned PDFs still open in the reader. */ }
    const previousPdf = topic.pdf;
    topic.pdf = {
      fileId: crypto.randomUUID(),
      storageName: path.basename(uploadedPath),
      displayName: text(req.body.displayName || req.file.originalname, 180) || 'Study notes.pdf',
      size: req.file.size,
      pageCount: parsed.pageCount,
      extractedText: parsed.text,
      uploadedAt: new Date()
    };
    await subject.save();
    await removeStoredPdf(previousPdf?.storageName);
    res.status(201).json({ topic });
  } catch (error) {
    if (uploadedPath) await fs.unlink(uploadedPath).catch(() => {});
    next(error);
  }
};

export const renameTopicPdf = async (req, res, next) => {
  try {
    const subject = await ownedSubject(req.user._id, req.params.subjectId);
    const topic = getTopic(subject, req.params.topicId);
    const displayName = text(req.body.displayName, 180);
    if (!topic?.pdf) return res.status(404).json({ error: 'PDF not found.' });
    if (!displayName) return res.status(400).json({ error: 'Add a PDF name.' });
    topic.pdf.displayName = displayName.toLowerCase().endsWith('.pdf') ? displayName : `${displayName}.pdf`;
    await subject.save();
    res.json({ topic });
  } catch (error) { next(error); }
};

export const deleteTopicPdf = async (req, res, next) => {
  try {
    const subject = await ownedSubject(req.user._id, req.params.subjectId);
    const topic = getTopic(subject, req.params.topicId);
    if (!topic?.pdf) return res.status(404).json({ error: 'PDF not found.' });
    const previousPdf = topic.pdf;
    topic.pdf = undefined;
    await subject.save();
    await removeStoredPdf(previousPdf.storageName);
    res.json({ ok: true });
  } catch (error) { next(error); }
};

export const getPdfFile = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ 'topics.pdf.fileId': req.params.fileId });
    if (!subject || (req.user.role !== 'admin' && String(subject.ownerId) !== String(req.user._id))) {
      return res.status(404).json({ error: 'PDF not found.' });
    }
    const topic = subject.topics.find((item) => item.pdf?.fileId === req.params.fileId);
    const file = path.join(uploadDirectory, path.basename(topic.pdf.storageName));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(topic.pdf.displayName)}`, 'Cache-Control': 'private, no-store' });
    res.sendFile(file, (error) => { if (error && !res.headersSent) next(error); });
  } catch (error) { next(error); }
};
