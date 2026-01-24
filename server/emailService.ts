import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true'; // true for 465, false for other ports
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): Transporter {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  return transporter;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName?: string
): Promise<boolean> {
  try {
    const transporter = getTransporter();
    
    // Get the base URL from environment or construct it
    const baseUrl = process.env.BASE_URL || 'https://packgo-d3xjbq67.manus.space';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"PACK&GO 旅行社" <${EMAIL_FROM}>`,
      to,
      subject: '重設密碼請求 - PACK&GO 旅行社',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #000;
              color: #fff;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              background-color: #000;
              color: #fff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PACK&GO 旅行社</h1>
          </div>
          <div class="content">
            <h2>重設密碼請求</h2>
            <p>親愛的 ${userName || '會員'}，</p>
            <p>我們收到了您的密碼重設請求。請點擊下方按鈕重設您的密碼：</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">重設密碼</a>
            </div>
            <p>或複製以下連結至瀏覽器：</p>
            <p style="word-break: break-all; background-color: #fff; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⚠️ 重要提醒：</strong>
              <ul>
                <li>此連結將在 <strong>1 小時後</strong>失效</li>
                <li>如果您沒有提出此請求，請忽略此郵件</li>
                <li>請勿將此連結分享給他人</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PACK&GO 旅行社. All rights reserved.</p>
            <p>如有任何問題，請聯繫我們的客服團隊</p>
          </div>
        </body>
        </html>
      `,
      text: `
親愛的 ${userName || '會員'}，

我們收到了您的密碼重設請求。請複製以下連結至瀏覽器重設您的密碼：

${resetUrl}

重要提醒：
- 此連結將在 1 小時後失效
- 如果您沒有提出此請求，請忽略此郵件
- 請勿將此連結分享給他人

© ${new Date().getFullYear()} PACK&GO 旅行社. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('[Email] Password reset email sent to:', to);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error);
    return false;
  }
}

/**
 * Send welcome email (optional)
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string
): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `"PACK&GO 旅行社" <${EMAIL_FROM}>`,
      to,
      subject: '歡迎加入 PACK&GO 旅行社！',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #000;
              color: #fff;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              background-color: #000;
              color: #fff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>歡迎加入 PACK&GO！</h1>
          </div>
          <div class="content">
            <h2>親愛的 ${userName}，</h2>
            <p>感謝您註冊 PACK&GO 旅行社會員！</p>
            <p>我們提供多樣化的旅遊服務，包括：</p>
            <ul>
              <li>精選團體旅遊行程</li>
              <li>客製化旅遊規劃</li>
              <li>簽證代辦服務</li>
              <li>機票預訂與機場接送</li>
              <li>飯店預訂服務</li>
            </ul>
            <p>現在就開始探索您的下一趟旅程吧！</p>
            <div style="text-align: center;">
              <a href="${process.env.BASE_URL || 'https://packgo-d3xjbq67.manus.space'}" class="button">開始探索</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PACK&GO 旅行社. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('[Email] Welcome email sent to:', to);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('[Email] Email configuration is valid');
    return true;
  } catch (error) {
    console.error('[Email] Email configuration test failed:', error);
    return false;
  }
}
