import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'نام الزامی است'],
    trim: true,
    minlength: [2, 'نام باید حداقل ۲ کاراکتر باشد'],
    maxlength: [50, 'نام نمی‌تواند بیشتر از ۵۰ کاراکتر باشد']
  },
  
  lastName: {
    type: String,
    required: [true, 'نام خانوادگی الزامی است'],
    trim: true,
    minlength: [2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'],
    maxlength: [50, 'نام خانوادگی نمی‌تواند بیشتر از ۵۰ کاراکتر باشد']
  },
  
  email: {
    type: String,
    required: [true, 'ایمیل الزامی است'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'ایمیل معتبر نیست'
    }
  },
  
  phone: {
    type: String,
    required: [true, 'شماره تلفن الزامی است'],
    unique: true,
    trim: true,
    validate: {
      validator: function(phone) {
        return /^09[0-9]{9}$/.test(phone);
      },
      message: 'شماره تلفن معتبر نیست'
    }
  },
  
  password: {
    type: String,
    required: [true, 'رمز عبور الزامی است'],
    minlength: [6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'],
    select: false
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  refreshToken: {
    type: String,
    select: false
  },
  
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.refreshToken;
      return ret;
    }
  }
});

// ایندکس برای جستجو
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// هش کردن رمز عبور قبل از ذخیره
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// مقایسه رمز عبور
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// به روزرسانی آخرین زمان ورود
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

// پلاگین pagination
userSchema.plugin(mongoosePaginate);

const User = mongoose.model('User', userSchema);

export default User;
