import environment from '../config/environment.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // لاگ کردن خطا
  logger.error('💥 خطای سرور:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: environment.NODE_ENV === 'development' ? req.body : undefined
  });

  // خطای Mongoose - ObjectId نامعتبر
  if (err.name === 'CastError') {
    const message = 'منبع یافت نشد';
    error = new AppError(message, 404);
  }

  // خطای Mongoose - تکراری
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `مقدار '${value}' برای فیلد '${field}' تکراری است`;
    error = new AppError(message, 400);
  }

  // خطای Mongoose - اعتبارسنجی
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `داده‌های ورودی معتبر نیستند: ${errors.join('. ')}`;
    error = new AppError(message, 400);
  }

  // خطای JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'توکن معتبر نیست';
    error = new AppError(message, 401);
  }

  // خطای منقضی شدن JWT
  if (err.name === 'TokenExpiredError') {
    const message = 'توکن منقضی شده است';
    error = new AppError(message, 401);
  }

  // پاسخ خطا
  res.status(error.statusCode).json({
    status: error.status || 'error',
    message: error.message || 'خطای سرور',
    ...(environment.NODE_ENV === 'development' && {
      stack: error.stack,
      error: error
    }),
    ...(error.details && { details: error.details })
  });
};

export default globalErrorHandler;
