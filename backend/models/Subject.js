import mongoose from 'mongoose';

const pdfSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  storageName: { type: String, required: true },
  displayName: { type: String, required: true, maxlength: 180 },
  size: { type: Number, required: true },
  pageCount: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  pdf: { type: pdfSchema, default: undefined }
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  topics: [topicSchema]
}, { timestamps: true });

subjectSchema.index({ ownerId: 1, updatedAt: -1 });
export default mongoose.model('Subject', subjectSchema);
