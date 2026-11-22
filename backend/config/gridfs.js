import mongoose from 'mongoose';

export const getGridFSBucket = () => {
  const database = mongoose.connection.db;
  if (!database) {
    throw new Error('MongoDB connection is not ready');
  }

  return new mongoose.mongo.GridFSBucket(database, { bucketName: 'pdfs' });
};
