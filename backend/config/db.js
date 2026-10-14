import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGO_URI in backend/.env before starting the server.');

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'ai_learning_assistant'
  });
  console.log(`MongoDB connected (${mongoose.connection.name}).`);
}
