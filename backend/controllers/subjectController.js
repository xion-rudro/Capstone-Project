import mongoose from 'mongoose';
import Subject from '../models/Subject.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get subjects and their topics for the logged-in user
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide a subject name' });
    }

    const duplicate = await Subject.findOne({
      userId: req.user._id,
      name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    });
    if (duplicate) {
      return res.status(409).json({ success: false, error: 'A subject with this name already exists' });
    }

    const subject = await Subject.create({ userId: req.user._id, name });
    res.status(201).json({ success: true, data: subject, message: 'Subject created' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a topic to a subject
// @route   POST /api/subjects/:subjectId/topics
// @access  Private
export const createTopic = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide a topic name' });
    }
    if (!mongoose.isValidObjectId(req.params.subjectId)) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      userId: req.user._id,
    });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const duplicate = subject.topics.some((topic) => topic.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return res.status(409).json({ success: false, error: 'A topic with this name already exists in this subject' });
    }

    subject.topics.push({ name });
    await subject.save();
    res.status(201).json({ success: true, data: subject, message: 'Topic created' });
  } catch (error) {
    next(error);
  }
};
