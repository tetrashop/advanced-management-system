// ثابت‌های عمومی برنامه

export const APP_CONFIG = {
  NAME: 'سیستم مدیریت پیشرفته',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  DEFAULT_LANGUAGE: 'fa',
  SUPPORTED_LANGUAGES: ['fa', 'en'],
  DEFAULT_THEME: 'light',
  THEMES: ['light', 'dark', 'auto'],
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  DEFAULT_PAGE_SIZE: 25,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  DEBOUNCE_DELAY: 300,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_EDIT: 'dashboard.edit',
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit'
};

export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

export const STATUS_CONFIG = {
  [STATUS_TYPES.ACTIVE]: {
    label: 'فعال',
    color: 'success',
    icon: '✅'
  },
  [STATUS_TYPES.INACTIVE]: {
    label: 'غیرفعال',
    color: 'secondary',
    icon: '⚪'
  },
  [STATUS_TYPES.PENDING]: {
    label: 'در انتظار',
    color: 'warning',
    icon: '🟡'
  },
  [STATUS_TYPES.SUSPENDED]: {
    label: 'معلق',
    color: 'error',
    icon: '🔴'
  },
  [STATUS_TYPES.DELETED]: {
    label: 'حذف شده',
    color: 'error',
    icon: '🗑️'
  }
};

export const DATE_FORMATS = {
  SHORT: 'YYYY/MM/DD',
  MEDIUM: 'YYYY/MM/DD HH:mm',
  LONG: 'YYYY/MM/DD HH:mm:ss',
  DISPLAY: 'DD MMMM YYYY',
  DISPLAY_FULL: 'dddd، DD MMMM YYYY - HH:mm'
};

export const TABLE_CONFIG = {
  DEFAULT_COLUMNS: {
    id: { width: 80, minWidth: 60 },
    name: { width: 200, minWidth: 150 },
    email: { width: 250, minWidth: 200 },
    status: { width: 120, minWidth: 100 },
    createdAt: { width: 150, minWidth: 120 },
    actions: { width: 120, minWidth: 100 }
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  FILTER_OPERATORS: {
    EQUALS: 'equals',
    CONTAINS: 'contains',
    STARTS_WITH: 'startsWith',
    ENDS_WITH: 'endsWith',
    GREATER_THAN: 'greaterThan',
    LESS_THAN: 'lessThan',
    BETWEEN: 'between'
  }
};

export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_SUGGESTIONS: 5,
  SEARCH_DELAY: 300,
  SEARCH_FIELDS: ['name', 'email', 'title', 'description'],
  FILTER_TYPES: {
    TEXT: 'text',
    SELECT: 'select',
    DATE: 'date',
    NUMBER: 'number',
    BOOLEAN: 'boolean'
  }
};

export const VALIDATION_RULES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  PHONE: 'phone',
  URL: 'url',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  CUSTOM: 'custom'
};

export const ERROR_MESSAGES = {
  REQUIRED: 'این فیلد اجباری است',
  EMAIL: 'لطفا یک ایمیل معتبر وارد کنید',
  PHONE: 'لطفا یک شماره تلفن معتبر وارد کنید',
  URL: 'لطفا یک آدرس اینترنتی معتبر وارد کنید',
  MIN_LENGTH: 'حداقل {min} کاراکتر لازم است',
  MAX_LENGTH: 'حداکثر {max} کاراکتر مجاز است',
  PATTERN: 'قالب وارد شده معتبر نیست',
  NETWORK_ERROR: 'خطا در ارتباط با سرور',
  UNAUTHORIZED: 'دسترسی غیرمجاز',
  FORBIDDEN: 'شما مجوز انجام این عمل را ندارید',
  NOT_FOUND: 'منبع مورد نظر یافت نشد',
  SERVER_ERROR: 'خطای سرور',
  UNKNOWN_ERROR: 'خطای ناشناخته'
};

export const SUCCESS_MESSAGES = {
  CREATE: 'با موفقیت ایجاد شد',
  UPDATE: 'با موفقیت به‌روزرسانی شد',
  DELETE: 'با موفقیت حذف شد',
  SAVE: 'با موفقیت ذخیره شد',
  UPLOAD: 'با موفقیت آپلود شد',
  EXPORT: 'با موفقیت خروجی گرفته شد'
};

export const LOCAL_STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  DASHBOARD_SETTINGS: 'dashboardSettings',
  TABLE_SETTINGS: 'tableSettings',
  SEARCH_HISTORY: 'searchHistory',
  AUTH_TOKEN: 'authToken',
  THEME: 'theme',
  LANGUAGE: 'language'
};

export const EVENT_TYPES = {
  DATA_UPDATED: 'dataUpdated',
  USER_SESSION_CHANGED: 'userSessionChanged',
  THEME_CHANGED: 'themeChanged',
  LANGUAGE_CHANGED: 'languageChanged',
  NOTIFICATION_RECEIVED: 'notificationReceived'
};

// ثابت‌های مربوط به ریسپانسیو
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
};

export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

export default {
  APP_CONFIG,
  USER_ROLES,
  PERMISSIONS,
  STATUS_TYPES,
  STATUS_CONFIG,
  DATE_FORMATS,
  TABLE_CONFIG,
  SEARCH_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOCAL_STORAGE_KEYS,
  EVENT_TYPES,
  BREAKPOINTS,
  DEVICE_TYPES
};
