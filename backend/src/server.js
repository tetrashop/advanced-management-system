import App from './app.js';
import logger from './utils/logger.js';

/**
 * تابع اصلی برای راه‌اندازی سرور
 */
const startServer = async () => {
  try {
    const app = new App();
    await app.start();
  } catch (error) {
    logger.error('❌ خطا در راه‌اندازی سرور:', error);
    process.exit(1);
  }
};

// هندل کردن خطاهای catch نشده
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 خطای catch نشده در Promise:', {
    reason: reason.message,
    stack: reason.stack,
    promise
  });
  
  // بستن graceful سرور
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('💥 خطای catch نشده:', {
    message: error.message,
    stack: error.stack
  });
  
  // بستن graceful سرور
  process.exit(1);
});

// شروع سرور
startServer();
