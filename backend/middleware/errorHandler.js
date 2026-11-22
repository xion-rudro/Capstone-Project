const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} is already in use` : 'A record with these details already exists';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
  });
};

export default errorHandler;
