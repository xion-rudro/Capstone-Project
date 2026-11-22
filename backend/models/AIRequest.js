import mongoose from 'mongoose';

const aiRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatHistory' },
  status: { type: String, enum: ['success', 'error', 'not_configured'], required: true },
  durationMs: { type: Number, default: null }
}, { timestamps: true });

export default mongoose.model('AIRequest', aiRequestSchema);
