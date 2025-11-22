import dotenv from 'dotenv';

// بارگذاری متغیرهای محیطی
dotenv.config();

const environment = {
  // سرور
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),

  // دیتابیس
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/advanced_management',
  DB_NAME: process.env.DB_NAME || 'advanced_management',

  // احراز هویت
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // امنیت
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // آپلود فایل
  UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
  UPLOAD_ALLOWED_TYPES: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,application/pdf').split(','),

  // لاگ
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// اعتبارسنجی متغیرهای اجباری
const requiredEnvVars = [
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!environment[envVar] || environment[envVar] === 'fallback-jwt-secret-change-in-production') {
    console.warn(`⚠️  Warning: ${envVar} is not set or using default value`);
  }
}

// لاگ کردن تنظیمات (بدون اطلاعات حساس)
if (environment.NODE_ENV === 'development') {
  console.log('🔧 Environment Configuration:', {
    NODE_ENV: environment.NODE_ENV,
    PORT: environment.PORT,
    DB_NAME: environment.DB_NAME,
    CORS_ORIGIN: environment.CORS_ORIGIN,
    LOG_LEVEL: environment.LOG_LEVEL
  });
}

export default environment;
