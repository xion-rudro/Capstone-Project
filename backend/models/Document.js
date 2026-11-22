import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: {
      type: String,
      required: [true, 'Please provide a document title'],
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // Kept for PDFs uploaded before GridFS storage was added.
    filePath: {
      type: String,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    chunks: [
      {
        content: {
          type: String,
          required: true,
        },
        pageNumber: {
          type: Number,
          default: 0,
        },
        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
