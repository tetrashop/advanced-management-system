import { body, param, query } from 'express-validator';

// اعتبارسنجی کاربران
export const userValidation = {
  // دریافت لیست کاربران
  getUsers: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('صفحه باید عددی مثبت باشد'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('تعداد در هر صفحه باید بین ۱ تا ۱۰۰ باشد'),
    
    query('sort')
      .optional()
      .isIn(['firstName', 'lastName', 'email', 'role', 'status', 'createdAt', 'updatedAt'])
      .withMessage('فیلد مرتب سازی معتبر نیست'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('ترتیب مرتب سازی باید asc یا desc باشد'),
    
    query('search')
      .optional()
      .isLength({ min: 0, max: 50 })
      .withMessage('متن جستجو نباید بیشتر از ۵۰ کاراکتر باشد'),
    
    query('role')
      .optional()
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('نقش کاربر معتبر نیست'),
    
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('وضعیت کاربر معتبر نیست')
  ],

  // دریافت کاربر
  getUser: [
    param('id')
      .isMongoId()
      .withMessage('شناسه کاربر معتبر نیست')
  ],

  // به روزرسانی کاربر جاری
  updateMe: [
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('نام باید بین ۲ تا ۵۰ کاراکتر باشد')
      .matches(/^[\u0600-\u06FFa-zA-Z\s]+$/)
      .withMessage('نام فقط می‌تواند شامل حروف فارسی و انگلیسی باشد'),
    
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('نام خانوادگی باید بین ۲ تا ۵۰ کاراکتر باشد')
      .matches(/^[\u0600-\u06FFa-zA-Z\s]+$/)
      .withMessage('نام خانوادگی فقط می‌تواند شامل حروف فارسی و انگلیسی باشد'),
    
    body('phone')
      .optional()
      .matches(/^09[0-9]{9}$/)
      .withMessage('شماره تلفن معتبر نیست')
  ],

  // به روزرسانی کاربر توسط ادمین
  updateUser: [
    param('id')
      .isMongoId()
      .withMessage('شناسه کاربر معتبر نیست'),
    
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('نام باید بین ۲ تا ۵۰ کاراکتر باشد'),
    
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('نام خانوادگی باید بین ۲ تا ۵۰ کاراکتر باشد'),
    
    body('phone')
      .optional()
      .matches(/^09[0-9]{9}$/)
      .withMessage('شماره تلفن معتبر نیست'),
    
    body('role')
      .optional()
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('نقش کاربر معتبر نیست'),
    
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('وضعیت کاربر معتبر نیست')
  ],

  // تغییر رمز عبور
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('رمز عبور فعلی الزامی است')
      .isLength({ min: 6 })
      .withMessage('رمز عبور فعلی باید حداقل ۶ کاراکتر باشد'),
    
    body('newPassword')
      .notEmpty()
      .withMessage('رمز عبور جدید الزامی است')
      .isLength({ min: 6 })
      .withMessage('رمز عبور جدید باید حداقل ۶ کاراکتر باشد')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('رمز عبور جدید باید شامل حروف بزرگ، کوچک و اعداد باشد')
  ],

  // حذف کاربر
  deleteUser: [
    param('id')
      .isMongoId()
      .withMessage('شناسه کاربر معتبر نیست')
  ],

  // غیرفعال کردن کاربر
  deactivateUser: [
    param('id')
      .isMongoId()
      .withMessage('شناسه کاربر معتبر نیست')
  ],

  // فعال کردن کاربر
  activateUser: [
    param('id')
      .isMongoId()
      .withMessage('شناسه کاربر معتبر نیست')
  ]
};

// اعتبارسنجی احراز هویت
export const authValidation = {
  // ثبت نام
  register: [
    body('firstName')
      .notEmpty()
      .withMessage('نام الزامی است')
      .isLength({ min: 2, max: 50 })
      .withMessage('نام باید بین ۲ تا ۵۰ کاراکتر باشد')
      .matches(/^[\u0600-\u06FFa-zA-Z\s]+$/)
      .withMessage('نام فقط می‌تواند شامل حروف فارسی و انگلیسی باشد'),
    
    body('lastName')
      .notEmpty()
      .withMessage('نام خانوادگی الزامی است')
      .isLength({ min: 2, max: 50 })
      .withMessage('نام خانوادگی باید بین ۲ تا ۵۰ کاراکتر باشد')
      .matches(/^[\u0600-\u06FFa-zA-Z\s]+$/)
      .withMessage('نام خانوادگی فقط می‌تواند شامل حروف فارسی و انگلیسی باشد'),
    
    body('email')
      .notEmpty()
      .withMessage('ایمیل الزامی است')
      .isEmail()
      .withMessage('ایمیل معتبر نیست')
      .normalizeEmail(),
    
    body('phone')
      .notEmpty()
      .withMessage('شماره تلفن الزامی است')
      .matches(/^09[0-9]{9}$/)
      .withMessage('شماره تلفن معتبر نیست'),
    
    body('password')
      .notEmpty()
      .withMessage('رمز عبور الزامی است')
      .isLength({ min: 6 })
      .withMessage('رمز عبور باید حداقل ۶ کاراکتر باشد')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد')
  ],

  // ورود
  login: [
    body('email')
      .notEmpty()
      .withMessage('ایمیل الزامی است')
      .isEmail()
      .withMessage('ایمیل معتبر نیست')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('رمز عبور الزامی است')
      .isLength({ min: 1 })
      .withMessage('رمز عبور الزامی است')
  ]
};

// اعتبارسنجی عمومی
export const generalValidation = {
  idParam: [
    param('id')
      .isMongoId()
      .withMessage('شناسه معتبر نیست')
  ],

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('صفحه باید عددی مثبت باشد'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('تعداد در هر صفحه باید بین ۱ تا ۱۰۰ باشد')
  ]
};
