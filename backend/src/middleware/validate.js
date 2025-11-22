import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

const validate = (validations) => {
  return async (req, res, next) => {
    // اجرای تمام validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // استخراج پیام‌های خطا
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    next(new AppError('داده‌های ارسالی معتبر نیستند', 400, errorMessages));
  };
};

export default validate;
