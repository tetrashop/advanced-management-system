import jwt from 'jsonwebtoken';
import environment from '../config/environment.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // دریافت توکن از header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('لطفا وارد حساب کاربری خود شوید', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('لطفا وارد حساب کاربری خود شوید', 401));
    }

    // بررسی اعتبار توکن
    const decoded = jwt.verify(token, environment.JWT_SECRET);
    
    // پیدا کردن کاربر
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user) {
      return next(new AppError('کاربر مربوط به این توکن یافت نشد', 401));
    }

    // بررسی وضعیت کاربر
    if (user.status !== 'active') {
      return next(new AppError('حساب کاربری شما غیرفعال شده است', 401));
    }

    // اضافه کردن کاربر به request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('توکن معتبر نیست', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('توکن منقضی شده است', 401));
    }

    next(error);
  }
};

export default auth;
