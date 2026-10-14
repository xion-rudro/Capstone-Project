const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.name === 'MulterError'
    ? (err.code === 'LIMIT_FILE_SIZE' ? 413 : 400)
    : (err.statusCode || err.status || 500);
  if (statusCode >= 500) console.error('Request failed:', err.message);
  const message = statusCode >= 500
    ? 'Something went wrong. Please try again.'
    : (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE'
      ? 'PDFs must be 20 MB or smaller.'
      : err.message);
  res.status(statusCode).json({ success: false, error: message, statusCode });
};

export default errorHandler;
