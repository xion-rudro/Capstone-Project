import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 12000 },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, default: 'Study conversation', maxlength: 100 },
  messages: { type: [messageSchema], default: [] }
}, { timestamps: true });

chatHistorySchema.index({ userId: 1, topicId: 1, updatedAt: -1 });
export default mongoose.model('ChatHistory', chatHistorySchema);
