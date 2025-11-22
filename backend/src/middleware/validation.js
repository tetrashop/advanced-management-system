import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

/**
 * میان‌افزار برای اعتبارسنجی request
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return next(new AppError('داده‌های ورودی نامعتبر هستند', 400, errorMessages));
  }

  next();
};

/**
 * میان‌افزار برای اعتبارسنجی ObjectId
 */
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('شناسه ارائه شده معتبر نیست', 400));
  }

  next();
};

/**
 * میان‌افزار برای اعتبارسنجی query parameters
 */
export const validatePagination = (req, res, next) => {
  const { page, limit, sort } = req.query;

  if (page && (isNaN(page) || page < 1)) {
    return next(new AppError('شماره صفحه باید یک عدد مثبت باشد', 400));
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return next(new AppError('تعداد در هر صفحه باید بین ۱ تا ۱۰۰ باشد', 400));
  }

  if (sort) {
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'status'];
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    
    if (!allowedSortFields.includes(sortField)) {
      return next(new AppError(`فیلد مرتب‌سازی '${sortField}' مجاز نیست`, 400));
    }
  }

  next();
};

/**
 * میان‌افزار برای اعتبارسنجی فایل‌ها
 */
export const validateFileUpload = (allowedTypes, maxSize) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    // بررسی نوع فایل
    if (!allowedTypes.includes(req.file.mimetype)) {
      return next(new AppError('نوع فایل مجاز نیست', 400));
    }

    // بررسی سایز فایل
    if (req.file.size > maxSize) {
      return next(new AppError('حجم فایل بیش از حد مجاز است', 400));
    }

    next();
  };
};

/**
 * میان‌افزار برای اعتبارسنجی تاریخ‌ها
 */
export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && isNaN(Date.parse(startDate))) {
    return next(new AppError('تاریخ شروع معتبر نیست', 400));
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return next(new AppError('تاریخ پایان معتبر نیست', 400));
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return next(new AppError('تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد', 400));
  }

  next();
};

/**
 * میان‌افزار برای اعتبارسنجی جستجو
 */
export const validateSearch = (req, res, next) => {
  const { q: searchTerm } = req.query;

  if (searchTerm && searchTerm.length < 2) {
    return next(new AppError('عبارت جستجو باید حداقل ۲ کاراکتر باشد', 400));
  }

  if (searchTerm && searchTerm.length > 100) {
    return next(new AppError('عبارت جستجو نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد', 400));
  }

  next();
};

export default {
  validateRequest,
  validateObjectId,
  validatePagination,
  validateFileUpload,
  validateDateRange,
  validateSearch
};
