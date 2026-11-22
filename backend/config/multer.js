import multer from 'multer';

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    const error = new Error('Only PDF files are allowed');
    error.statusCode = 400;
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
});

export default upload;
