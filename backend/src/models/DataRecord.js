import mongoose from 'mongoose';

const dataRecordSchema = new mongoose.Schema({
  // شناسه اصلی
  recordId: {
    type: String,
    required: [true, 'شناسه رکورد الزامی است'],
    unique: true,
    trim: true
  },

  // نوع داده
  type: {
    type: String,
    required: [true, 'نوع داده الزامی است'],
    enum: [
      'user_activity',
      'system_log', 
      'business_metric',
      'audit_trail',
      'performance_data',
      'error_log'
    ],
    index: true
  },

  // دسته‌بندی
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  // زیر دسته
  subcategory: {
    type: String,
    trim: true
  },

  // عنوان
  title: {
    type: String,
    required: [true, 'عنوان رکورد الزامی است'],
    trim: true,
    maxlength: [200, 'عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد']
  },

  // توضیحات
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد']
  },

  // داده اصلی (انعطاف‌پذیر)
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },

  // متادیتا
  metadata: {
    version: {
      type: String,
      default: '1.0'
    },
    source: {
      type: String,
      required: true,
      trim: true
    },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      timezone: String
    }
  },

  // اهمیت
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },

  // وضعیت
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted', 'pending_review'],
    default: 'active',
    index: true
  },

  // برچسب‌ها برای جستجوی بهتر
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // ارجاع به کاربر
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ایجاد کننده رکورد الزامی است'],
    index: true
  },

  // ارجاع به موجودیت مرتبط
  relatedTo: {
    model: {
      type: String,
      enum: ['User', 'Product', 'Order', 'System']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },

  // تاریخ‌های مهم
  eventDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  expiryDate: {
    type: Date,
    index: true
  },

  // آمار و ارقام
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    rating: {
      value: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },

  // فایل�های پیوست
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // لاگ تغییرات
  changelog: [{
    field: {
      type: String,
      required: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],

  // تنظیمات دسترسی
  accessControl: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    allowedRoles: [{
      type: String,
      enum: ['user', 'manager', 'admin']
    }],
    permissions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'share']
    }]
  },

  // سفارشی‌سازی
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // تبدیل Map به Object برای خروجی JSON
      if (ret.data instanceof Map) {
        ret.data = Object.fromEntries(ret.data);
      }
      if (ret.customFields instanceof Map) {
        ret.customFields = Object.fromEntries(ret.customFields);
      }
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Virtual برای مدت زمان باقیمانده تا انقضا
dataRecordSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = this.expiryDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual برای امتیاز متوسط
dataRecordSchema.virtual('averageRating').get(function() {
  if (this.metrics.rating.count === 0) return 0;
  return this.metrics.rating.value / this.metrics.rating.count;
});

// ایندکس‌های ترکیبی برای جستجوی بهینه
dataRecordSchema.index({ type: 1, category: 1, status: 1 });
dataRecordSchema.index({ createdBy: 1, createdAt: -1 });
dataRecordSchema.index({ eventDate: -1, priority: 1 });
dataRecordSchema.index({ tags: 1 });
dataRecordSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });
dataRecordSchema.index({ expiryDate: 1 }, { 
  expireAfterSeconds: 0, 
  partialFilterExpression: { expiryDate: { $exists: true } } 
});

// متدهای instance
dataRecordSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag.toLowerCase())) {
    this.tags.push(tag.toLowerCase());
  }
  return this.save();
};

dataRecordSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag.toLowerCase());
  return this.save();
};

dataRecordSchema.methods.logChange = function(field, oldValue, newValue, changedBy, reason = '') {
  this.changelog.push({
    field,
    oldValue,
    newValue,
    changedBy,
    reason
  });
  return this.save();
};

dataRecordSchema.methods.incrementView = function() {
  this.metrics.views += 1;
  return this.save();
};

dataRecordSchema.methods.addRating = function(ratingValue) {
  this.metrics.rating.value += ratingValue;
  this.metrics.rating.count += 1;
  return this.save();
};

dataRecordSchema.methods.hasAccess = function(user) {
  // اگر عمومی باشد
  if (this.accessControl.isPublic) return true;
  
  // اگر کاربر ادمین باشد
  if (user.role === 'admin') return true;
  
  // اگر کاربر ایجاد کننده باشد
  if (this.createdBy.toString() === user._id.toString()) return true;
  
  // اگر کاربر در لیست کاربران مجاز باشد
  if (this.accessControl.allowedUsers.some(id => id.toString() === user._id.toString())) {
    return true;
  }
  
  // اگر نقش کاربر در لیست نقش‌های مجاز باشد
  if (this.accessControl.allowedRoles.includes(user.role)) {
    return true;
  }
  
  return false;
};

// متدهای static
dataRecordSchema.statics.findByTypeAndCategory = function(type, category) {
  return this.find({ type, category, status: 'active' }).sort({ createdAt: -1 });
};

dataRecordSchema.statics.findByUser = function(userId, options = {}) {
  const query = { createdBy: userId };
  
  if (options.type) query.type = options.type;
  if (options.status) query.status = options.status;
  
  return this.find(query).sort({ createdAt: -1 });
};

dataRecordSchema.statics.getStatsByType = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

dataRecordSchema.statics.searchRecords = function(searchTerm, filters = {}) {
  const query = {
    $and: [
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  };

  // اعمال فیلترها
  if (filters.type) query.$and.push({ type: filters.type });
  if (filters.category) query.$and.push({ category: filters.category });
  if (filters.status) query.$and.push({ status: filters.status });
  if (filters.priority) query.$and.push({ priority: filters.priority });
  if (filters.createdBy) query.$and.push({ createdBy: filters.createdBy });

  if (filters.startDate || filters.endDate) {
    const dateFilter = {};
    if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);
    query.$and.push({ createdAt: dateFilter });
  }

  return this.find(query).sort({ createdAt: -1 });
};

// هوک‌های middleware
dataRecordSchema.pre('save', function(next) {
  // تولید خودکار recordId اگر وجود نداشته باشد
  if (!this.recordId) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.recordId = `rec_${timestamp}_${randomStr}`;
  }

  // به‌روزرسانی خودکار tags از title و description
  if (this.isModified('title') || this.isModified('description')) {
    const text = `${this.title} ${this.description}`.toLowerCase();
    const words = text.split(/\W+/).filter(word => word.length > 2);
    const uniqueWords = [...new Set(words)];
    this.tags = [...new Set([...this.tags, ...uniqueWords])];
  }

  next();
});

dataRecordSchema.pre('find', function(next) {
  // پیش‌فرض: فقط رکوردهای active را نشان بده
  if (this.getFilter().status === undefined) {
    this.where({ status: 'active' });
  }
  next();
});

export default mongoose.model('DataRecord', dataRecordSchema);
