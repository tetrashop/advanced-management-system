import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { userValidation } from '../utils/validation.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const router = express.Router();

// اعتبارسنجی پارامترهای ID
router.param('id', async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('کاربر یافت نشد', 404));
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

// دریافت لیست کاربران
router.get(
  '/',
  auth,
  authorize('admin'),
  validate(userValidation.getUsers),
  async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        search = '',
        role = '',
        status = ''
      } = req.query;

      // ساخت شرط جستجو
      const searchCondition = {};
      
      if (search) {
        searchCondition.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      if (role) {
        searchCondition.role = role;
      }

      if (status) {
        searchCondition.status = status;
      }

      // تنظیمات pagination
      const sortOption = { [sort]: order === 'desc' ? -1 : 1 };
      
      const result = await User.paginate(searchCondition, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortOption,
        select: '-password -refreshToken'
      });

      res.json({
        status: 'success',
        data: {
          users: result.docs,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalUsers: result.totalDocs,
            hasNext: result.hasNext,
            hasPrev: result.hasPrev
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// دریافت اطلاعات کاربر جاری
router.get(
  '/me',
  auth,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id)
        .select('-password -refreshToken')
        .lean();

      if (!user) {
        return next(new AppError('کاربر یافت نشد', 404));
      }

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
);

// دریافت کاربر بر اساس ID
router.get(
  '/:id',
  auth,
  authorize('admin'),
  validate(userValidation.getUser),
  async (req, res, next) => {
    try {
      const user = req.user.toObject();
      delete user.password;
      delete user.refreshToken;

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
);

// به روزرسانی کاربر جاری
router.put(
  '/me',
  auth,
  validate(userValidation.updateMe),
  async (req, res, next) => {
    try {
      const { firstName, lastName, phone, avatar } = req.body;
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          firstName,
          lastName,
          phone,
          avatar,
          updatedAt: new Date()
        },
        {
          new: true,
          runValidators: true,
          select: '-password -refreshToken'
        }
      );

      res.json({
        status: 'success',
        message: 'پروفایل با موفقیت به روزرسانی شد',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }
);

// به روزرسانی کاربر توسط ادمین
router.put(
  '/:id',
  auth,
  authorize('admin'),
  validate(userValidation.updateUser),
  async (req, res, next) => {
    try {
      const { firstName, lastName, phone, avatar, role, status } = req.body;
      
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          firstName,
          lastName,
          phone,
          avatar,
          role,
          status,
          updatedAt: new Date()
        },
        {
          new: true,
          runValidators: true,
          select: '-password -refreshToken'
        }
      );

      logger.info(`کاربر ${updatedUser.email} توسط ادمین به روزرسانی شد`);

      res.json({
        status: 'success',
        message: 'کاربر با موفقیت به روزرسانی شد',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }
);

// تغییر رمز عبور
router.patch(
  '/me/password',
  auth,
  validate(userValidation.changePassword),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id).select('+password');

      // بررسی رمز عبور فعلی
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return next(new AppError('رمز عبور فعلی نادرست است', 400));
      }

      // به روزرسانی رمز عبور
      user.password = newPassword;
      user.updatedAt = new Date();
      await user.save();

      logger.info(`رمز عبور کاربر ${user.email} تغییر یافت`);

      res.json({
        status: 'success',
        message: 'رمز عبور با موفقیت تغییر یافت'
      });
    } catch (error) {
      next(error);
    }
  }
);

// حذف کاربر
router.delete(
  '/:id',
  auth,
  authorize('admin'),
  validate(userValidation.deleteUser),
  async (req, res, next) => {
    try {
      const user = req.user;

      // جلوگیری از حذف خود ادمین
      if (req.user.id === req.params.id) {
        return next(new AppError('شما نمی‌توانید حساب خود را حذف کنید', 400));
      }

      await User.findByIdAndDelete(req.params.id);

      logger.warn(`کاربر ${user.email} توسط ادمین حذف شد`);

      res.json({
        status: 'success',
        message: 'کاربر با موفقیت حذف شد'
      });
    } catch (error) {
      next(error);
    }
  }
);

// غیرفعال کردن حساب کاربری
router.patch(
  '/:id/deactivate',
  auth,
  authorize('admin'),
  validate(userValidation.deactivateUser),
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          status: 'inactive',
          updatedAt: new Date()
        },
        {
          new: true,
          select: '-password -refreshToken'
        }
      );

      logger.warn(`کاربر ${user.email} غیرفعال شد`);

      res.json({
        status: 'success',
        message: 'حساب کاربری با موفقیت غیرفعال شد',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
);

// فعال کردن حساب کاربری
router.patch(
  '/:id/activate',
  auth,
  authorize('admin'),
  validate(userValidation.activateUser),
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          status: 'active',
          updatedAt: new Date()
        },
        {
          new: true,
          select: '-password -refreshToken'
        }
      );

      logger.info(`کاربر ${user.email} فعال شد`);

      res.json({
        status: 'success',
        message: 'حساب کاربری با موفقیت فعال شد',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
