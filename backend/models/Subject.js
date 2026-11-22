import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a topic name'],
      trim: true,
    },
  },
  { timestamps: true }
);

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a subject name'],
      trim: true,
    },
    topics: {
      type: [topicSchema],
      default: [],
    },
  },
  { timestamps: true }
);

subjectSchema.index({ userId: 1, createdAt: -1 });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
