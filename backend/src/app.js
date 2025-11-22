import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import environment from './config/environment.js';
import database from './config/database.js';
import AppError from './utils/AppError.js';
import globalErrorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import dataRoutes from './routes/data.js';

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // CORS - اول از همه
    this.app.use(cors({
      origin: true, // اجازه به همه domainها
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // امنیت
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: environment.RATE_LIMIT_WINDOW_MS,
      max: environment.RATE_LIMIT_MAX_REQUESTS,
      message: {
        status: 'error',
        message: 'تعداد درخواست‌های شما از حد مجاز بیشتر شده است. لطفا بعدا تلاش کنید.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api', limiter);

    // Compression
    this.app.use(compression());

    // Logging
    if (environment.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: { write: message => logger.info(message.trim()) }
      }));
    }

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  setupRoutes() {
    // Health check - بدون احراز هویت
    this.app.get('/health', (req, res) => {
      const dbStatus = database.getStatus();
      
      res.status(200).json({
        status: 'success',
        message: 'سرور در حال اجراست',
        timestamp: new Date().toISOString(),
        environment: environment.NODE_ENV,
        database: dbStatus
      });
    });

    // Route اصلی
    this.app.get('/', (req, res) => {
      res.json({
        status: 'success',
        message: 'خوش آمدید به سیستم مدیریت پیشرفته',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          auth: '/api/v1/auth',
          users: '/api/v1/users',
          dashboard: '/api/v1/dashboard',
          data: '/api/v1/data'
        }
      });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/dashboard', dashboardRoutes);
    this.app.use('/api/v1/data', dataRoutes);

    // 404 handler
    this.app.all('*', (req, res, next) => {
      next(new AppError(`مسیر ${req.originalUrl} در این سرور یافت نشد`, 404));
    });
  }

  setupErrorHandling() {
    this.app.use(globalErrorHandler);
  }

  async start() {
    try {
      // اتصال به دیتابیس
      await database.connect();

      // راه‌اندازی سرور
      this.server = this.app.listen(environment.PORT, '0.0.0.0', () => {
        logger.info(`
🚀 سرور در حال اجراست
📍 پورت: ${environment.PORT}
🌍 محیط: ${environment.NODE_ENV}
📊 دیتابیس: ${database.isConnected ? 'متصل' : 'قطع'}
🕒 زمان: ${new Date().toLocaleString('fa-IR')}
📡 آدرس: http://localhost:${environment.PORT} و http://192.168.1.102:${environment.PORT}
        `);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

      return this.server;

    } catch (error) {
      logger.error('❌ خطا در راه‌اندازی سرور:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    process.on('SIGTERM', () => {
      logger.info('👋 دریافت SIGTERM. بستن سرور به صورت graceful...');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('👋 دریافت SIGINT. بستن سرور به صورت graceful...');
      this.shutdown();
    });
  }

  async shutdown() {
    if (this.server) {
      this.server.close(() => {
        logger.info('💥 سرور بسته شد');
        database.close();
        process.exit(0);
      });
    } else {
      database.close();
      process.exit(0);
    }
  }
}

export default App;
