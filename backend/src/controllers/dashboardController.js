import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * دریافت داده‌های داشبورد
 */
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { timeframe = '7d' } = req.query;

    // محاسبه تاریخ‌ها بر اساس timeframe
    const getDateRange = (range) => {
      const now = new Date();
      const from = new Date();

      switch (range) {
        case '1d':
          from.setDate(now.getDate() - 1);
          break;
        case '7d':
          from.setDate(now.getDate() - 7);
          break;
        case '30d':
          from.setDate(now.getDate() - 30);
          break;
        case '90d':
          from.setDate(now.getDate() - 90);
          break;
        default:
          from.setDate(now.getDate() - 7);
      }

      return { from, to: now };
    };

    const { from, to } = getDateRange(timeframe);

    // آمار کاربران (مثال)
    const userStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // داده‌های نمونه برای ویجت‌ها
    const dashboardData = {
      overview: {
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ status: 'active' }),
        newUsers: await User.countDocuments({
          createdAt: { $gte: from, $lte: to }
        }),
        pendingUsers: await User.countDocuments({ status: 'pending' })
      },
      charts: {
        userGrowth: {
          labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
          datasets: [
            {
              label: 'کاربران جدید',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2
            }
          ]
        },
        userDistribution: {
          labels: ['فعال', 'غیرفعال', 'در انتظار', 'معلق'],
          datasets: [
            {
              data: [65, 15, 10, 10],
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(156, 163, 175, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
              ]
            }
          ]
        }
      },
      recentActivity: [
        {
          id: 1,
          type: 'user_registered',
          title: 'کاربر جدید ثبت‌نام کرد',
          description: 'علی محمدی در سیستم ثبت‌نام کرد',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          user: {
            name: 'علی محمدی',
            avatar: null
          }
        },
        {
          id: 2,
          type: 'user_updated',
          title: 'پروفایل به‌روزرسانی شد',
          description: 'فاطمه احمدی اطلاعات پروفایل خود را به‌روزرسانی کرد',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          user: {
            name: 'فاطمه احمدی',
            avatar: null
          }
        },
        {
          id: 3,
          type: 'system',
          title: 'پشتیبان‌گیری انجام شد',
          description: 'پشتیبان‌گیری خودکار از دیتابیس انجام شد',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          user: null
        }
      ],
      quickStats: {
        avgSession: '12:34',
        bounceRate: '23.5%',
        conversionRate: '4.2%',
        satisfaction: '94%'
      },
      widgets: [
        {
          id: 'user-overview',
          type: 'stats',
          title: 'مرور کاربران',
          data: {
            total: await User.countDocuments(),
            active: await User.countDocuments({ status: 'active' }),
            growth: '+12.5%'
          },
          layout: { x: 0, y: 0, w: 4, h: 2 }
        },
        {
          id: 'recent-activity',
          type: 'activity',
          title: 'فعالیت‌های اخیر',
          data: [],
          layout: { x: 4, y: 0, w: 4, h: 3 }
        },
        {
          id: 'user-growth',
          type: 'chart',
          title: 'رشد کاربران',
          data: {},
          layout: { x: 0, y: 2, w: 8, h: 3 }
        }
      ],
      lastUpdated: new Date()
    };

    res.status(200).json({
      status: 'success',
      data: dashboardData
    });

  } catch (error) {
    next(error);
  }
};

/**
 * ذخیره تنظیمات داشبورد کاربر
 */
export const saveDashboardSettings = async (req, res, next) => {
  try {
    const { layout, widgets, preferences } = req.body;

    const updateData = {};
    
    if (layout) updateData['preferences.dashboard.layout'] = layout;
    if (widgets) updateData['preferences.dashboard.widgets'] = widgets;
    if (preferences) {
      Object.keys(preferences).forEach(key => {
        updateData[`preferences.${key}`] = preferences[key];
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت تنظیمات داشبورد کاربر
 */
export const getDashboardSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');

    res.status(200).json({
      status: 'success',
      data: {
        settings: user.preferences || {}
      }
    });

  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardData,
  saveDashboardSettings,
  getDashboardSettings
};
