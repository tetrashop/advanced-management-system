# 🚀 استقرار نطق مصطلح روی Vercel

## تنظیمات ضروری برای اتصال به Google Drive

### 1. فعال کردن Google Drive API
- به [Google Cloud Console](https://console.cloud.google.com) بروید
- پروژه جدید ایجاد کنید یا از پروژه موجود استفاده کنید
- Google Drive API را فعال کنید

### 2. ایجاد Credentials
- به بخش "Credentials" بروید
- "Create Credentials" → "OAuth 2.0 Client IDs"
- نوع برنامه: "Web application"
- Authorized redirect URIs: `https://your-domain.vercel.app`

### 3. تنظیم Environment Variables در Vercel
در Vercel Dashboard → Project → Settings → Environment Variables:

```env
GOOGLE_CREDENTIALS={"your_credentials_json_here"}
GOOGLE_DRIVE_FOLDER_IDS=your_folder_id_1,your_folder_id_2
