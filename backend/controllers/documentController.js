import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import Subject from '../models/Subject.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { getGridFSBucket } from '../config/gridfs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const savePDFToGridFS = (file, userId) => new Promise((resolve, reject) => {
  const stream = getGridFSBucket().openUploadStream(file.originalname, {
    contentType: 'application/pdf',
    metadata: { userId: new mongoose.Types.ObjectId(userId) },
  });

  stream.once('error', reject);
  stream.once('finish', () => resolve(stream.id));
  stream.end(file.buffer);
});

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  let storedFileId;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF file',
        statusCode: 400,
      });
    }

    const { title, subjectId, topicId } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a document title',
        statusCode: 400,
      });
    }

    if (!mongoose.isValidObjectId(subjectId) || !mongoose.isValidObjectId(topicId)) {
      return res.status(400).json({
        success: false,
        error: 'Choose a subject and topic before uploading a PDF',
        statusCode: 400,
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    const topic = subject?.topics.id(topicId);
    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        error: 'The selected subject or topic could not be found',
        statusCode: 400,
      });
    }

    storedFileId = await savePDFToGridFS(req.file, req.user._id);

    const document = await Document.create({
      userId: req.user._id,
      subjectId: subject._id,
      topicId: topic._id,
      title: title.trim(),
      fileName: req.file.originalname,
      fileId: storedFileId,
      fileSize: req.file.size,
      status: 'processing',
    });
    storedFileId = null;

    processPDF(document._id, req.file.buffer).catch((err) => {
      console.error('PDF processing error:', err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully and is being processed',
    });
  } catch (error) {
    if (storedFileId) {
      await getGridFSBucket().delete(storedFileId).catch(() => {});
    }
    next(error);
  }
};

// Extract and chunk the PDF after its bytes have been safely stored in GridFS.
const processPDF = async (documentId, pdfBuffer) => {
  try {
    const { text } = await extractTextFromPDF(pdfBuffer);

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    // Update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: 'ready',
    });

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
    });
  }
};

// @desc    Stream a PDF from MongoDB GridFS (or an older local upload)
// @route   GET /api/documents/:id/file
// @access  Private
export const getDocumentFile = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('fileId filePath fileName');

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const safeName = path.basename(document.fileName || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_') || 'document.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (document.fileId) {
      const bucket = getGridFSBucket();
      const [storedFile] = await bucket.find({ _id: document.fileId }).limit(1).toArray();
      if (!storedFile) {
        return res.status(404).json({ success: false, error: 'PDF file not found' });
      }
      res.setHeader('Content-Length', storedFile.length);
      const stream = bucket.openDownloadStream(document.fileId);
      stream.once('error', (error) => {
        if (!res.headersSent) next(error);
        else res.destroy(error);
      });
      stream.pipe(res);
      return;
    }

    // Support existing records created before PDF files were stored in GridFS.
    if (document.filePath) {
      const legacyFilePath = path.join(__dirname, '../uploads/documents', path.basename(document.filePath));
      const stream = createReadStream(legacyFilePath);
      stream.once('error', (error) => {
        if (error.code === 'ENOENT') {
          res.status(404).json({ success: false, error: 'PDF file not found' });
        } else if (!res.headersSent) {
          next(error);
        } else {
          res.destroy(error);
        }
      });
      stream.pipe(res);
      return;
    }

    return res.status(404).json({ success: false, error: 'PDF file not found' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents for logged-in user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'documentId',
          as: 'flashcardSets',
        },
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: 'documentId',
          as: 'quizzes',
        },
      },
      {
        $addFields: {
          flashcardCount: {
            $sum: {
              $map: {
                input: '$flashcardSets',
                as: 'set',
                in: { $size: '$$set.cards' },
              },
            },
          },
          quizCount: { $size: '$quizzes' },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404,
      });
    }

    // Get counts of associated flashcards and quizzes
    const flashcardSets = await Flashcard.find({
      documentId: document._id,
      userId: req.user._id,
    })
      .select('cards')
      .lean();
    const flashcardCount = flashcardSets.reduce(
      (total, set) => total + set.cards.length,
      0
    );
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    // Update last accessed timestamp
    document.lastAccessed = Date.now();
    await document.save();

    // Combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404,
      });
    }

    if (document.fileId) {
      const bucket = getGridFSBucket();
      const [storedFile] = await bucket.find({ _id: document.fileId }).limit(1).toArray();
      if (storedFile) await bucket.delete(document.fileId);
    } else if (document.filePath) {
      const localFilePath = path.join(__dirname, '../uploads/documents', path.basename(document.filePath));
      await fs.unlink(localFilePath).catch(() => {});
    }

    // Delete document
    await document.deleteOne();
    await Promise.all([
      Flashcard.deleteMany({ documentId: document._id, userId: req.user._id }),
      Quiz.deleteMany({ documentId: document._id, userId: req.user._id }),
      ChatHistory.deleteMany({ documentId: document._id, userId: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document title
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid document title',
        statusCode: 400,
      });
    }

    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title: title.trim() },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};
