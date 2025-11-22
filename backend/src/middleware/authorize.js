import AppError from '../utils/AppError.js';

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('دسترسی غیرمجاز: کاربر احراز هویت نشده', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('شما دسترسی لازم برای انجام این عمل را ندارید', 403)
      );
    }

    next();
  };
};

export default authorize;
