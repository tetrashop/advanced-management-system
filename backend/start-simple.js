// فایل شروع ساده برای تست
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewareهای پایه
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route سلامت
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'سرور ساده در حال اجراست',
    timestamp: new Date().toISOString()
  });
});

// Route اصلی
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'خوش آمدید به سیستم مدیریت پیشرفته',
    version: '1.0.0'
  });
});

// Route تست API
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API در حال کار است',
    data: {
      server: 'running',
      database: 'not connected',
      time: new Date().toISOString()
    }
  });
});

// شروع سرور
app.listen(PORT, () => {
  console.log(`
🎉 سرور ساده راه‌اندازی شد!
📍 پورت: ${PORT}
🌍 آدرس: http://localhost:${PORT}
🕒 زمان: ${new Date().toLocaleString('fa-IR')}
  `);
});
