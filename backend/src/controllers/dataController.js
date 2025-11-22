import DataRecord from '../models/DataRecord.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * ایجاد رکورد جدید
 */
export const createDataRecord = async (req, res, next) => {
  try {
    const {
      type,
      category,
      subcategory,
      title,
      description,
      data,
      metadata,
      priority,
      tags,
      relatedTo,
      expiryDate,
      accessControl,
      customFields
    } = req.body;

    const newRecord = await DataRecord.create({
      type,
      category,
      subcategory,
      title,
      description,
      data: data || new Map(),
      metadata: {
        source: 'api',
        ...metadata
      },
      priority: priority || 'medium',
      tags: tags || [],
      relatedTo,
      expiryDate,
      accessControl: {
        isPublic: false,
        allowedUsers: [req.user.id],
        allowedRoles: ['admin'],
        permissions: ['read', 'write'],
        ...accessControl
      },
      customFields: customFields || new Map(),
      createdBy: req.user.id
    });

    // لاگ کردن ایجاد
    await newRecord.logChange(
      'created',
      null,
      newRecord.toObject(),
      req.user.id,
      'رکورد جدید ایجاد شد'
    );

    res.status(201).json({
      status: 'success',
      data: {
        record: newRecord
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت لیست رکوردها با فیلتر و صفحه‌بندی
 */
export const getAllDataRecords = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      type,
      category,
      status,
      priority,
      createdBy,
      startDate,
      endDate,
      tags
    } = req.query;

    // ساخت query پایه
    let query = {};

    // جستجوی متنی
    if (search) {
      const searchResults = await DataRecord.searchRecords(search, {
        type,
        category,
        status,
        priority,
        createdBy,
        startDate,
        endDate
      });
      
      const recordIds = searchResults.map(record => record._id);
      query._id = { $in: recordIds };
    } else {
      // فیلترهای معمول
      if (type) query.type = type;
      if (category) query.category = category;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (createdBy) query.createdBy = createdBy;
      if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };

      // فیلتر تاریخ
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
    }

    // اجرای query با دسترسی‌ها
    const recordsQuery = DataRecord.find(query)
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('changelog.changedBy', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const records = await recordsQuery;
    
    // فیلتر کردن بر اساس دسترسی
    const accessibleRecords = records.filter(record => 
      record.hasAccess(req.user)
    );

    // تعداد کل
    const total = await DataRecord.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: accessibleRecords.length,
      total,
      pagination: {
        page: page * 1,
        pages: Math.ceil(total / limit),
        limit: limit * 1
      },
      data: {
        records: accessibleRecords
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت یک رکورد خاص
 */
export const getDataRecord = async (req, res, next) => {
  try {
    const record = await DataRecord.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('changelog.changedBy', 'firstName lastName');

    if (!record) {
      return next(new AppError('رکورد یافت نشد', 404));
    }

    // بررسی دسترسی
    if (!record.hasAccess(req.user)) {
      return next(new AppError('شما به این رکورد دسترسی ندارید', 403));
    }

    // افزایش تعداد بازدید
    await record.incrementView();

    res.status(200).json({
      status: 'success',
      data: {
        record
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * به‌روزرسانی رکورد
 */
export const updateDataRecord = async (req, res, next) => {
  try {
    const record = await DataRecord.findById(req.params.id);

    if (!record) {
      return next(new AppError('رکورد یافت نشد', 404));
    }

    // بررسی دسترسی
    if (!record.hasAccess(req.user)) {
      return next(new AppError('شما به این رکورد دسترسی ندارید', 403));
    }

    const allowedUpdates = [
      'title',
      'description',
      'category',
      'subcategory',
      'data',
      'priority',
      'status',
      'tags',
      'expiryDate',
      'accessControl',
      'customFields'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // ذخیره مقادیر قدیمی برای لاگ
    const oldRecord = record.toObject();

    // اعمال به‌روزرسانی‌ها
    Object.keys(updates).forEach(key => {
      if (JSON.stringify(record[key]) !== JSON.stringify(updates[key])) {
        record.logChange(
          key,
          oldRecord[key],
          updates[key],
          req.user.id,
          `فیلد ${key} به‌روزرسانی شد`
        );
        record[key] = updates[key];
      }
    });

    await record.save();

    const updatedRecord = await DataRecord.findById(record._id)
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('changelog.changedBy', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      data: {
        record: updatedRecord
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * حذف رکورد (soft delete)
 */
export const deleteDataRecord = async (req, res, next) => {
  try {
    const record = await DataRecord.findById(req.params.id);

    if (!record) {
      return next(new AppError('رکورد یافت نشد', 404));
    }

    // بررسی دسترسی
    if (!record.hasAccess(req.user)) {
      return next(new AppError('شما به این رکورد دسترسی ندارید', 403));
    }

    // soft delete
    record.status = 'deleted';
    await record.logChange(
      'status',
      'active',
      'deleted',
      req.user.id,
      'رکورد حذف شد'
    );
    await record.save();

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    next(error);
  }
};

/**
 * افزودن برچسب به رکورد
 */
export const addTagToRecord = async (req, res, next) => {
  try {
    const { tag } = req.body;
    const record = await DataRecord.findById(req.params.id);

    if (!record) {
      return next(new AppError('رکورد یافت نشد', 404));
    }

    if (!record.hasAccess(req.user)) {
      return next(new AppError('شما به این رکورد دسترسی ندارید', 403));
    }

    await record.addTag(tag);

    res.status(200).json({
      status: 'success',
      data: {
        record
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * حذف برچسب از رکورد
 */
export const removeTagFromRecord = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const record = await DataRecord.findById(req.params.id);

    if (!record) {
      return next(new AppError('رکورد یافت نشد', 404));
    }

    if (!record.hasAccess(req.user)) {
      return next(new AppError('شما به این رکورد دسترسی ندارید', 403));
    }

    await record.removeTag(tag);

    res.status(200).json({
      status: 'success',
      data: {
        record
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * افزودن امتیاز به رکورد
 */
export const addRatingToRecord = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const record = await DataRecord.findById(req.params.id);

    if (!record) {
      return next(new AppError('رکورد یافت نشد', 404));
    }

    if (!record.hasAccess(req.user)) {
      return next(new AppError('شما به این رکورد دسترسی ندارید', 403));
    }

    if (rating < 1 || rating > 5) {
      return next(new AppError('امتیاز باید بین ۱ تا ۵ باشد', 400));
    }

    await record.addRating(rating);

    res.status(200).json({
      status: 'success',
      data: {
        record,
        newAverage: record.averageRating
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت آمار رکوردها
 */
export const getDataRecordsStats = async (req, res, next) => {
  try {
    const statsByType = await DataRecord.getStatsByType();
    
    const totalRecords = await DataRecord.countDocuments();
    const activeRecords = await DataRecord.countDocuments({ status: 'active' });
    const highPriorityRecords = await DataRecord.countDocuments({ priority: 'high' });
    
    const recentActivity = await DataRecord.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'firstName lastName')
      .select('title type createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          total: totalRecords,
          active: activeRecords,
          highPriority: highPriorityRecords
        },
        byType: statsByType,
        recentActivity
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * جستجوی پیشرفته در رکوردها
 */
export const searchDataRecords = async (req, res, next) => {
  try {
    const {
      q: searchTerm,
      page = 1,
      limit = 10,
      type,
      category,
      priority
    } = req.query;

    if (!searchTerm) {
      return next(new AppError('عبارت جستجو الزامی است', 400));
    }

    const filters = { type, category, priority };
    const searchResults = await DataRecord.searchRecords(searchTerm, filters);

    // فیلتر بر اساس دسترسی
    const accessibleResults = searchResults.filter(record => 
      record.hasAccess(req.user)
    );

    // صفحه‌بندی دستی
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = accessibleResults.slice(startIndex, endIndex);

    res.status(200).json({
      status: 'success',
      results: paginatedResults.length,
      total: accessibleResults.length,
      pagination: {
        page: page * 1,
        pages: Math.ceil(accessibleResults.length / limit),
        limit: limit * 1
      },
      data: {
        records: paginatedResults
      }
    });

  } catch (error) {
    next(error);
  }
};

export default {
  createDataRecord,
  getAllDataRecords,
  getDataRecord,
  updateDataRecord,
  deleteDataRecord,
  addTagToRecord,
  removeTagFromRecord,
  addRatingToRecord,
  getDataRecordsStats,
  searchDataRecords
};
