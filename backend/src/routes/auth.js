import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import environment from '../config/environment.js';
import AppError from '../utils/AppError.js';
import validate from '../middleware/validate.js';
import { authValidation } from '../utils/validation.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Route ساده برای تست
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'ماژول احراز هویت فعال است',
    endpoints: {
      register: 'POST /api/v1/auth/register',
      login: 'POST /api/v1/auth/login'
    }
  });
});

// ثبت نام کاربر جدید
router.post(
  '/register',
  validate(authValidation.register),
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, phone, password } = req.body;

      // بررسی وجود کاربر با ایمیل یا شماره تلفن
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }]
      });

      if (existingUser) {
        return next(new AppError('کاربر با این ایمیل یا شماره تلفن وجود دارد', 400));
      }

      // ایجاد کاربر جدید
      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: 'user',
        status: 'active'
      });

      await user.save();

      // تولید توکن
      const token = jwt.sign(
        { id: user._id },
        environment.JWT_SECRET,
        { expiresIn: environment.JWT_EXPIRES_IN }
      );

      logger.info(`✅ کاربر جدید ثبت نام کرد: ${email}`);

      res.status(201).json({
        status: 'success',
        message: 'ثبت نام با موفقیت انجام شد',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role
          },
          token
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ورود کاربر
router.post(
  '/login',
  validate(authValidation.login),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // پیدا کردن کاربر و شامل کردن پسورد
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('ایمیل یا رمز عبور نادرست است', 401));
      }

      // بررسی وضعیت کاربر
      if (user.status !== 'active') {
        return next(new AppError('حساب کاربری شما غیرفعال شده است', 401));
      }

      // به روزرسانی آخرین زمان ورود
      await user.updateLastLogin();

      // تولید توکن
      const token = jwt.sign(
        { id: user._id },
        environment.JWT_SECRET,
        { expiresIn: environment.JWT_EXPIRES_IN }
      );

      logger.info(`✅ کاربر وارد شد: ${email}`);

      res.json({
        status: 'success',
        message: 'ورود موفقیت‌آمیز بود',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role
          },
          token
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

export default router;
