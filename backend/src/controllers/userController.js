import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * فیلتر کردن فیلدهای مجاز برای به‌روزرسانی
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * دریافت لیست کاربران
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      role,
      status,
      department
    } = req.query;

    // ساخت query پایه
    let query = {};

    // جستجو
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // فیلترها
    if (role) query.role = role;
    if (status) query.status = status;
    if (department) query.department = department;

    // اجرای query
    const users = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // تعداد کل
    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: users.length,
      total,
      pagination: {
        page: page * 1,
        pages: Math.ceil(total / limit),
        limit: limit * 1
      },
      data: {
        users
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت کاربر بر اساس ID
 */
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('کاربر یافت نشد', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * به‌روزرسانی اطلاعات کاربر جاری
 */
export const updateMe = async (req, res, next) => {
  try {
    // ایجاد خطا اگر کاربر سعی در به‌روزرسانی رمز عبور داشته باشد
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError('این مسیر برای به‌روزرسانی رمز عبور نیست. لطفا از /update-password استفاده کنید', 400)
      );
    }

    // فیلتر کردن فیلدهای مجاز
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'phone',
      'department',
      'preferences'
    );

    // به‌روزرسانی کاربر
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * غیرفعال کردن حساب کاربر جاری
 */
export const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { 
      status: 'inactive',
      email: `${req.user.email}.deleted.${Date.now()}` // تغییر ایمیل برای جلوگیری از冲突
    });

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    next(error);
  }
};

/**
 * ایجاد کاربر جدید (فقط ادمین)
 */
export const createUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      phone,
      permissions
    } = req.body;

    // بررسی وجود کاربر با این ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('کاربری با این ایمیل قبلاً ثبت‌نام کرده است', 400));
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      department,
      phone,
      permissions: permissions || [],
      status: 'active', // فعال کردن مستقیم
      emailVerified: true // تأیید خودکار
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * به‌روزرسانی کاربر (فقط ادمین)
 */
export const updateUser = async (req, res, next) => {
  try {
    // فیلتر کردن فیلدهای مجاز
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'email',
      'role',
      'status',
      'department',
      'phone',
      'permissions',
      'preferences'
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return next(new AppError('کاربر یافت نشد', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * حذف کاربر (فقط ادمین)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError('کاربر یافت نشد', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت آمار کاربران
 */
export const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const admins = await User.countDocuments({ role: 'admin' });

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        summary: {
          total: totalUsers,
          active: activeUsers,
          admins
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
};
