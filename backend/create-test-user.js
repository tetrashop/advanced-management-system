import mongoose from 'mongoose';
import environment from './src/config/environment.js';
import User from './src/models/User.js';

const createTestUser = async () => {
  try {
    await mongoose.connect(environment.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // حذف کاربر موجود اگر وجود دارد
    await User.deleteOne({ email: 'admin@test.com' });

    // ایجاد کاربر ادمین جدید
    const testUser = new User({
      firstName: 'ادمین',
      lastName: 'سیستم',
      email: 'admin@test.com',
      phone: '09123456789',
      password: 'Password123',
      role: 'admin',
      status: 'active'
    });

    await testUser.save();
    console.log('✅ کاربر تست ایجاد شد:');
    console.log('📧 ایمیل: admin@test.com');
    console.log('🔑 رمز عبور: Password123');
    console.log('👤 نقش: ادمین');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ خطا در ایجاد کاربر:', error);
  }
};

createTestUser();
