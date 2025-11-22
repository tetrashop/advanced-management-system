import nodemailer from 'nodemailer';
import environment from '../config/environment.js';
import logger from './logger.js';

/**
 * ایجاد transporter برای ارسال ایمیل
 */
const createTransporter = () => {
  // در محیط توسعه از Ethereal Email استفاده می‌کنیم
  if (environment.NODE_ENV === 'development') {
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'password' // این رو بعدا با اطلاعات واقعی جایگزین می‌کنیم
      }
    });
  }

  // در محیط production از SMTP واقعی استفاده می‌کنیم
  return nodemailer.createTransporter({
    host: environment.SMTP_HOST,
    port: environment.SMTP_PORT,
    secure: environment.SMTP_PORT === 465,
    auth: {
      user: environment.SMTP_USER,
      pass: environment.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

/**
 * ارسال ایمیل
 */
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: environment.SMTP_FROM || '"سیستم مدیریت" <noreply@example.com>',
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    // در محیط توسعه، ایمیل رو لاگ می‌کنیم ولی ارسال نمی‌کنیم
    if (environment.NODE_ENV === 'development') {
      logger.info('📧 ایمیل (شبیه‌سازی شده):', {
        to: options.email,
        subject: options.subject,
        text: options.text
      });
      
      // ایجاد یک پیش‌نمایش برای توسعه
      const testMessage = {
        messageId: `dev-${Date.now()}`,
        previewUrl: 'https://ethereal.email/preview'
      };
      
      return testMessage;
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ ایمیل ارسال شد:', {
      messageId: info.messageId,
      to: options.email
    });

    return info;
  } catch (error) {
    logger.error('❌ خطا در ارسال ایمیل:', error);
    throw new Error('خطا در ارسال ایمیل');
  }
};

/**
 * ارسال ایمیل تأیید
 */
export const sendVerificationEmail = async (user, verificationUrl) => {
  const subject = 'تأیید ایمیل - سیستم مدیریت پیشرفته';
  const html = `
    <div style="font-family: Tahoma; direction: rtl; text-align: right;">
      <h2>تأیید ایمیل</h2>
      <p>کاربر گرامی ${user.firstName} ${user.lastName},</p>
      <p>برای تکمیل ثبت‌نام در سیستم مدیریت پیشرفته، لطفا ایمیل خود را با کلیک روی لینک زیر تأیید کنید:</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          تأیید ایمیل
        </a>
      </p>
      <p>اگر شما این درخواست را انجام نداده‌اید، لطفا این ایمیل را نادیده بگیرید.</p>
      <br>
      <p>با تشکر</p>
      <p>سیستم مدیریت پیشرفته</p>
    </div>
  `;

  const text = `برای تأیید ایمیل خود روی این لینک کلیک کنید: ${verificationUrl}`;

  return sendEmail({
    email: user.email,
    subject,
    text,
    html
  });
};

/**
 * ارسال ایمیل بازنشانی رمز عبور
 */
export const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = 'بازنشانی رمز عبور - سیستم مدیریت پیشرفته';
  const html = `
    <div style="font-family: Tahoma; direction: rtl; text-align: right;">
      <h2>بازنشانی رمز عبور</h2>
      <p>کاربر گرامی ${user.firstName} ${user.lastName},</p>
      <p>برای بازنشانی رمز عبور خود، لطفا روی لینک زیر کلیک کنید:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          بازنشانی رمز عبور
        </a>
      </p>
      <p>این لینک تا ۱۰ دقیقه دیگر معتبر خواهد بود.</p>
      <p>اگر شما این درخواست را انجام نداده‌اید، لطفا این ایمیل را نادیده بگیرید.</p>
      <br>
      <p>با تشکر</p>
      <p>سیستم مدیریت پیشرفته</p>
    </div>
  `;

  const text = `برای بازنشانی رمز عبور خود روی این لینک کلیک کنید: ${resetUrl}`;

  return sendEmail({
    email: user.email,
    subject,
    text,
    html
  });
};

/**
 * ارسال ایمیل خوش‌آمدگویی
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'خوش آمدید - سیستم مدیریت پیشرفته';
  const html = `
    <div style="font-family: Tahoma; direction: rtl; text-align: right;">
      <h2>خوش آمدید</h2>
      <p>کاربر گرامی ${user.firstName} ${user.lastName},</p>
      <p>با تشکر از ثبت‌نام شما در سیستم مدیریت پیشرفته.</p>
      <p>حساب کاربری شما با موفقیت ایجاد شد و اکنون می‌توانید از تمامی امکانات سیستم استفاده کنید.</p>
      <br>
      <p>با تشکر</p>
      <p>سیستم مدیریت پیشرفته</p>
    </div>
  `;

  const text = `با تشکر از ثبت‌نام شما در سیستم مدیریت پیشرفته.`;

  return sendEmail({
    email: user.email,
    subject,
    text,
    html
  });
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
