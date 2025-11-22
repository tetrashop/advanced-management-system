import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const router = express.Router();

// آمار داشبورد
router.get('/stats', auth, authorize('admin'), async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayLogins = await User.countDocuments({
            lastLogin: { $gte: today }
        });

        res.json({
            status: 'success',
            data: {
                totalUsers,
                activeUsers,
                adminUsers,
                todayLogins,
                systemHealth: {
                    database: 'connected',
                    server: 'healthy',
                    performance: 'optimal'
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// کاربران اخیر
router.get('/recent-users', auth, authorize('admin'), async (req, res, next) => {
    try {
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('-password -refreshToken')
            .lean();

        res.json({
            status: 'success',
            data: { users: recentUsers }
        });
    } catch (error) {
        next(error);
    }
});

// گزارش‌های سیستمی
router.get('/system-reports', auth, authorize('admin'), async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const userRegistrations = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        const roleDistribution = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                userRegistrations,
                roleDistribution,
                reportTime: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
