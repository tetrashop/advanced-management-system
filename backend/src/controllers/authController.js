// خطوط اول فایل - اصلاح ایمپورت‌ها
import jwt from 'jsonwebtoken';
import environment from '../config/environment.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

// ایمپورت ایمیل - اگر ماژول وجود نداشت، از شبیه‌ساز استفاده کن
let emailService;
try {
  emailService = await import('../utils/email.js');
} catch (error) {
  logger.warn('ماژول ایمیل یافت نشد - از حالت شبیه‌ساز استفاده می‌شود');
  emailService = {
    sendEmail: (options) => {
      logger.info('شبیه‌سازی ارسال ایمیل:', options);
      return Promise.resolve({ messageId: 'simulated' });
    },
    sendVerificationEmail: (user, url) => {
      logger.info(`شبیه‌سازی ایمیل تأیید برای ${user.email}: ${url}`);
      return Promise.resolve({ messageId: 'simulated' });
    },
    sendPasswordResetEmail: (user, url) => {
      logger.info(`شبیه‌سازی ایمیل بازنشانی برای ${user.email}: ${url}`);
      return Promise.resolve({ messageId: 'simulated' });
    }
  };
}

// بقیه کد بدون تغییر...
// [کاملاً مشابه فایل authController.js که قبلاً ایجاد کردید]
// فقط ایمپورت‌ها اصلاح شده‌اند

/**
 * تولید توکن JWT
 */
const signToken = (id) => {
  return jwt.sign({ id }, environment.JWT_SECRET, {
    expiresIn: environment.JWT_EXPIRES_IN
  });
};

/**
 * ارسال پاسخ احراز هویت
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // تنظیمات cookie (اختیاری)
  const cookieOptions = {
    expires: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // حذف password از خروجی
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * ثبت‌نام کاربر جدید
 */
export const signup = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      phone,
      department
    } = req.body;

    // بررسی تطابق رمز عبور
    if (password !== passwordConfirm) {
      return next(new AppError('رمز عبور و تأیید آن مطابقت ندارند', 400));
    }

    // بررسی وجود کاربر با این ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('کاربری با این ایمیل قبلاً ثبت‌نام کرده است', 400));
    }

    // ایجاد کاربر جدید
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      department,
      status: 'pending' // نیاز به تأیید ایمیل
    });

    // تولید توکن تأیید ایمیل
    const emailToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // ارسال ایمیل تأیید (در محیط production)
    if (process.env.NODE_ENV === 'production') {
      try {
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${emailToken}`;
        
        await emailService.sendVerificationEmail(newUser, verificationUrl);

        logger.info(`ایمیل تأیید برای ${newUser.email} ارسال شد`);
      } catch (emailError) {
        // اگر ارسال ایمیل شکست خورد، توکن را حذف کنیم
        newUser.emailVerificationToken = undefined;
        newUser.emailVerificationExpires = undefined;
        await newUser.save({ validateBeforeSave: false });

        logger.error('خطا در ارسال ایمیل تأیید:', emailError);
        // ادامه می‌دهیم حتی اگر ایمیل ارسال نشد
      }
    } else {
      // در محیط توسعه، توکن رو در پاسخ برگردون
      logger.info(`توکن تأیید ایمیل (توسعه): ${emailToken}`);
    }

    // ارسال پاسخ
    createSendToken(newUser, 201, res);

  } catch (error) {
    next(error);
  }
};

/**
 * ورود به سیستم
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // بررسی وجود ایمیل و رمز عبور
    if (!email || !password) {
      return next(new AppError('لطفا ایمیل و رمز عبور را وارد کنید', 400));
    }

    // پیدا کردن کاربر و شامل کردن password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');

    // بررسی وجود کاربر و صحت رمز عبور
    if (!user || !(await user.correctPassword(password, user.password))) {
      // افزایش تعداد تلاش‌های ناموفق
      if (user) {
        await user.incrementLoginAttempts();
      }

      return next(new AppError('ایمیل یا رمز عبور نادرست است', 401));
    }

    // بررسی وضعیت حساب کاربری
    if (user.status !== 'active') {
      if (user.status === 'pending') {
        return next(new AppError('لطفا ابتدا ایمیل خود را تأیید کنید', 401));
      }
      return next(new AppError('حساب کاربری شما غیرفعال شده است', 401));
    }

    // بررسی قفل بودن حساب
    if (user.isLocked()) {
      return next(new AppError('حساب کاربری شما به دلیل تلاش‌های ناموفق قفل شده است', 423));
    }

    // reset تلاش‌های ناموفق
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save({ validateBeforeSave: false });
    }

    // به‌روزرسانی آخرین ورود
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // ارسال توکن
    createSendToken(user, 200, res);

  } catch (error) {
    next(error);
  }
};

/**
 * خروج از سیستم
 */
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'با موفقیت از سیستم خارج شدید'
  });
};

/**
 * تأیید ایمیل
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // پیدا کردن کاربر با توکن معتبر
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('توکن تأیید نامعتبر یا منقضی شده است', 400));
    }

    // به‌روزرسانی وضعیت کاربر
    user.emailVerified = true;
    user.status = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'ایمیل شما با موفقیت تأیید شد'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * درخواست بازنشانی رمز عبور
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // پیدا کردن کاربر
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // برای امنیت بیشتر، حتی اگر کاربر وجود نداشت پیام موفقیت بدهیم
      return res.status(200).json({
        status: 'success',
        message: 'اگر ایمیل در سیستم وجود داشته باشد، لینک بازنشانی ارسال شد'
      });
    }

    // تولید توکن بازنشانی
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // ارسال ایمیل بازنشانی
    try {
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
      
      await emailService.sendPasswordResetEmail(user, resetURL);

      res.status(200).json({
        status: 'success',
        message: 'لینک بازنشانی رمز عبور به ایمیل شما ارسال شد'
      });

    } catch (emailError) {
      // اگر ارسال ایمیل شکست خورد، توکن را حذف کنیم
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error('خطا در ارسال ایمیل بازنشانی:', emailError);
      return next(new AppError('خطا در ارسال ایمیل. لطفا بعدا تلاش کنید', 500));
    }

  } catch (error) {
    next(error);
  }
};

/**
 * بازنشانی رمز عبور
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    // بررسی تطابق رمز عبور
    if (password !== passwordConfirm) {
      return next(new AppError('رمز عبور و تأیید آن مطابقت ندارند', 400));
    }

    // پیدا کردن کاربر با توکن معتبر
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('توکن بازنشانی نامعتبر یا منقضی شده است', 400));
    }

    // به‌روزرسانی رمز عبور
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    // ورود خودکار کاربر
    createSendToken(user, 200, res);

  } catch (error) {
    next(error);
  }
};

/**
 * تغییر رمز عبور (برای کاربران لاگین کرده)
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // بررسی تطابق رمز عبور جدید
    if (newPassword !== newPasswordConfirm) {
      return next(new AppError('رمز عبور جدید و تأیید آن مطابقت ندارند', 400));
    }

    // گرفتن کاربر با password
    const user = await User.findById(req.user.id).select('+password');

    // بررسی صحت رمز عبور فعلی
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError('رمز عبور فعلی نادرست است', 401));
    }

    // به‌روزرسانی رمز عبور
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    
    await user.save();

    // ارسال توکن جدید
    createSendToken(user, 200, res);

  } catch (error) {
    next(error);
  }
};

/**
 * بررسی وضعیت احراز هویت
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

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

export default {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  getMe
};
