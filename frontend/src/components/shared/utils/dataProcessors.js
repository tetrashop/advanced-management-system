// پردازشگرهای داده برای کامپوننت‌های مختلف

/**
 * پردازش داده‌های داشبورد
 */
export const processDashboardData = (rawData, preferences) => {
  if (!rawData || typeof rawData !== 'object') {
    return getDefaultDashboardData();
  }

  try {
    const processed = {
      ...rawData,
      widgets: processWidgets(rawData.widgets, preferences),
      analytics: processAnalytics(rawData.analytics),
      userStats: processUserStats(rawData.userStats),
      lastProcessed: new Date().toISOString()
    };

    // اعتبارسنجی داده‌های پردازش شده
    return validateDashboardData(processed) ? processed : getDefaultDashboardData();
  } catch (error) {
    console.error('Error processing dashboard data:', error);
    return getDefaultDashboardData();
  }
};

/**
 * پردازش ویجت‌های داشبورد
 */
const processWidgets = (widgets = [], preferences) => {
  return widgets.map(widget => ({
    ...widget,
    visible: shouldShowWidget(widget, preferences),
    order: getWidgetOrder(widget.type),
    config: mergeWidgetConfig(widget.config, preferences?.widgetSettings?.[widget.type])
  })).filter(widget => widget.visible)
    .sort((a, b) => a.order - b.order);
};

/**
 * پردازش داده‌های تحلیلی
 */
const processAnalytics = (analytics = {}) => {
  const defaultAnalytics = {
    visits: 0,
    conversions: 0,
    revenue: 0,
    growth: 0
  };

  if (!analytics || typeof analytics !== 'object') {
    return defaultAnalytics;
  }

  return {
    ...defaultAnalytics,
    ...analytics,
    growth: calculateGrowth(analytics),
    trend: analyzeTrend(analytics)
  };
};

/**
 * پردازش آمار کاربران
 */
const processUserStats = (userStats = {}) => {
  return {
    total: userStats.total || 0,
    active: userStats.active || 0,
    new: userStats.new || 0,
    retention: calculateRetentionRate(userStats),
    segments: processUserSegments(userStats.segments)
  };
};

/**
 * محاسبه نرخ رشد
 */
const calculateGrowth = (analytics) => {
  if (!analytics.previous || !analytics.current) {
    return 0;
  }

  const previous = analytics.previous.visits || 0;
  const current = analytics.current.visits || 0;

  if (previous === 0) return current > 0 ? 100 : 0;

  return ((current - previous) / previous) * 100;
};

/**
 * محاسبه نرخ نگهداری کاربران
 */
const calculateRetentionRate = (userStats) => {
  const total = userStats.total || 0;
  const active = userStats.active || 0;

  if (total === 0) return 0;

  return (active / total) * 100;
};

/**
 * پردازش بخش‌های کاربران
 */
const processUserSegments = (segments = []) => {
  return segments.map(segment => ({
    ...segment,
    percentage: calculateSegmentPercentage(segment),
    trend: analyzeSegmentTrend(segment)
  }));
};

/**
 * محاسبه درصد هر بخش
 */
const calculateSegmentPercentage = (segment) => {
  if (!segment.count || !segment.totalCount) return 0;
  return (segment.count / segment.totalCount) * 100;
};

/**
 * تحلیل روند بخش
 */
const analyzeSegmentTrend = (segment) => {
  if (!segment.historicalData) return 'stable';

  const recentData = segment.historicalData.slice(-3);
  const isGrowing = recentData.every((val, idx, arr) => 
    idx === 0 || val > arr[idx - 1]
  );
  const isDeclining = recentData.every((val, idx, arr) => 
    idx === 0 || val < arr[idx - 1]
  );

  return isGrowing ? 'growing' : isDeclining ? 'declining' : 'stable';
};

/**
 * تحلیل روند کلی
 */
const analyzeTrend = (analytics) => {
  if (!analytics.historical) return 'stable';

  const recent = analytics.historical.slice(-3);
  const avgRecent = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const avgPrevious = analytics.historical.slice(-6, -3).reduce((sum, val) => sum + val, 0) / 3;

  if (avgRecent > avgPrevious * 1.1) return 'up';
  if (avgRecent < avgPrevious * 0.9) return 'down';
  return 'stable';
};

/**
 * تعیین نمایش ویجت بر اساس تنظیمات کاربر
 */
const shouldShowWidget = (widget, preferences) => {
  if (!widget.visible !== undefined) return widget.visible;
  
  const widgetSettings = preferences?.widgetSettings?.[widget.type];
  return widgetSettings?.enabled !== false;
};

/**
 * تعیین ترتیب ویجت‌ها
 */
const getWidgetOrder = (widgetType) => {
  const orderMap = {
    stats: 1,
    chart: 2,
    table: 3,
    activity: 4,
    notifications: 5
  };
  
  return orderMap[widgetType] || 99;
};

/**
 * ادغام تنظیمات ویجت
 */
const mergeWidgetConfig = (widgetConfig, userConfig) => {
  return {
    refreshInterval: 30000,
    showTitle: true,
    compact: false,
    ...widgetConfig,
    ...userConfig
  };
};

/**
 * داده‌های پیش‌فرض داشبورد
 */
const getDefaultDashboardData = () => ({
  widgets: [],
  analytics: {
    visits: 0,
    conversions: 0,
    revenue: 0,
    growth: 0,
    trend: 'stable'
  },
  userStats: {
    total: 0,
    active: 0,
    new: 0,
    retention: 0,
    segments: []
  },
  lastProcessed: new Date().toISOString()
});

/**
 * اعتبارسنجی داده‌های داشبورد
 */
const validateDashboardData = (data) => {
  if (!data || typeof data !== 'object') return false;
  
  const required = ['widgets', 'analytics', 'userStats'];
  return required.every(key => key in data);
};

/**
 * پردازش داده‌های جدول
 */
export const processTableData = (data, columns, options = {}) => {
  const {
    sortBy,
    sortDirection = 'asc',
    filters = {},
    pagination = {}
  } = options;

  let processedData = [...data];

  // اعمال فیلترها
  if (Object.keys(filters).length > 0) {
    processedData = processedData.filter(row =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const cellValue = row[key];
        return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
      })
    );
  }

  // اعمال مرتب‌سازی
  if (sortBy) {
    processedData.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  // اعمال صفحه‌بندی
  if (pagination.pageSize && pagination.currentPage) {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    processedData = processedData.slice(startIndex, startIndex + pagination.pageSize);
  }

  return processedData;
};

/**
 * فرمت‌کردن اعداد برای نمایش
 */
export const formatNumber = (number, options = {}) => {
  const {
    style = 'decimal',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'fa-IR'
  } = options;

  if (typeof number !== 'number') {
    number = parseFloat(number) || 0;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(number);
  } catch (error) {
    return number.toString();
  }
};

/**
 * فرمت‌کردن تاریخ
 */
export const formatDate = (date, options = {}) => {
  const {
    locale = 'fa-IR',
    timeZone = 'Asia/Tehran',
    ...formatOptions
  } = options;

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...formatOptions
  };

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      ...defaultOptions
    }).format(dateObj);
  } catch (error) {
    return 'تاریخ نامعتبر';
  }
};
