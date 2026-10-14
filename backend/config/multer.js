
// rudro

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const uploadDirectory = path.resolve(backendDir, process.env.UPLOAD_DIR || 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdir(uploadDirectory, { recursive: true }).then(() => callback(null, uploadDirectory)).catch(callback);
  },
  filename: (_req, _file, callback) => callback(null, `${crypto.randomUUID()}.pdf`)
});

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    if (!isPdf) {
      const error = new Error('Choose a PDF file.');
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  }
});

export async function removeStoredPdf(storageName) {
  if (!storageName) return;
  await fs.unlink(path.join(uploadDirectory, path.basename(storageName))).catch(() => {});
}
