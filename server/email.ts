import { notifyOwner } from "./_core/notification";
import nodemailer, { type Transporter } from 'nodemailer';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER || 'noreply@packgo.com';
const BASE_URL = process.env.BASE_URL || 'https://packgo-d3xjbq67.manus.space';

let transporter: Transporter | null = null;

/**
 * Initialize SMTP transporter
 */
function getTransporter(): Transporter | null {
  if (!transporter && EMAIL_USER && EMAIL_PASSWORD) {
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
 * Email templates and sending logic
 */

interface BookingEmailData {
  to: string; // Customer email address
  customerName: string;
  customerEmail: string;
  bookingId: number;
  tourTitle: string;
  departureDate: string;
  returnDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
}

/**
 * Send booking confirmation email to customer
 * Uses SMTP to send actual email to customer, with notifyOwner as backup notification
 */
export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  // Always notify owner about new booking
  const emailContent = `
訂單確認通知

客戶姓名：${data.customerName}
客戶信箱：${data.customerEmail}
訂單編號：${data.bookingId}

行程資訊：
- 行程名稱：${data.tourTitle}
- 出發日期：${data.departureDate}
- 回程日期：${data.returnDate}

旅客人數：
- 成人：${data.numberOfAdults} 位
- 兒童：${data.numberOfChildren} 位
- 嬰兒：${data.numberOfInfants} 位

費用資訊：
- 總金額：NT$ ${data.totalPrice.toLocaleString()}
- 訂金：NT$ ${data.depositAmount.toLocaleString()}
- 尾款：NT$ ${data.remainingAmount.toLocaleString()}
  `.trim();

  await notifyOwner({
    title: `新訂單 #${data.bookingId} - ${data.customerName}`,
    content: emailContent,
  });

  // Try to send actual email to customer
  const smtp = getTransporter();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: `"PACK&GO 旅行社" <${EMAIL_FROM}>`,
        to: data.to,
        subject: `訂單確認 #${data.bookingId} - ${data.tourTitle}`,
        html: generateBookingConfirmationHTML(data),
        text: emailContent,
      });
      console.log('[Email] Booking confirmation email sent to:', data.to);
    } catch (error) {
      console.error('[Email] Failed to send booking confirmation email:', error);
    }
  }

  return true;
}

interface PaymentSuccessEmailData {
  customerName: string;
  customerEmail: string;
  bookingId: number;
  tourTitle: string;
  paymentAmount: number;
  paymentType: "deposit" | "balance" | "full";
}

/**
 * Send payment success email to customer
 */
export async function sendPaymentSuccessEmail(data: PaymentSuccessEmailData) {
  const paymentTypeText = {
    deposit: "訂金",
    balance: "尾款",
    full: "全額",
  }[data.paymentType];

  const emailContent = `
付款成功通知

客戶姓名：${data.customerName}
客戶信箱：${data.customerEmail}
訂單編號：${data.bookingId}
行程名稱：${data.tourTitle}

付款資訊：
- 付款類型：${paymentTypeText}
- 付款金額：NT$ ${data.paymentAmount.toLocaleString()}

感謝您的付款，我們將盡快為您安排行程。
  `.trim();

  await notifyOwner({
    title: `付款成功 #${data.bookingId} - ${data.customerName}`,
    content: emailContent,
  });

  // Try to send actual email to customer
  const smtp = getTransporter();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: `"PACK&GO 旅行社" <${EMAIL_FROM}>`,
        to: data.customerEmail,
        subject: `付款成功 #${data.bookingId} - ${data.tourTitle}`,
        html: generatePaymentSuccessHTML(data, paymentTypeText),
        text: emailContent,
      });
      console.log('[Email] Payment success email sent to:', data.customerEmail);
    } catch (error) {
      console.error('[Email] Failed to send payment success email:', error);
    }
  }

  return true;
}

/**
 * Generate HTML email template for payment success
 */
function generatePaymentSuccessHTML(data: PaymentSuccessEmailData, paymentTypeText: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>付款成功</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #000; color: #fff; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">PACK&GO</h1>
      <p style="margin: 5px 0 0 0; color: #ccc; font-size: 14px;">讓旅行更美好</p>
    </div>
    <div style="padding: 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 60px; height: 60px; background: #22c55e; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
          <span style="color: #fff; font-size: 30px;">✓</span>
        </div>
        <h2 style="color: #22c55e; margin: 0;">付款成功！</h2>
      </div>
      <p style="color: #333;">親愛的 <strong>${data.customerName}</strong>，</p>
      <p style="color: #666; line-height: 1.6;">您的付款已成功處理，以下是您的付款詳情：</p>
      
      <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>訂單編號：</strong>#${data.bookingId}</p>
        <p style="margin: 0 0 10px 0;"><strong>行程名稱：</strong>${data.tourTitle}</p>
        <p style="margin: 0 0 10px 0;"><strong>付款類型：</strong>${paymentTypeText}</p>
        <p style="margin: 0; font-size: 20px; color: #22c55e;"><strong>付款金額：</strong>NT$ ${data.paymentAmount.toLocaleString()}</p>
      </div>
      
      <p style="color: #666; line-height: 1.6;">感謝您的付款，我們的專員將盡快與您聯繫，確認行程詳情。</p>
      <p style="color: #666;">如有任何問題，請隨時與我們聯繫。</p>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; margin: 0; font-size: 12px;">祝您旅途愉快！</p>
      <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">PACK&GO 旅行社</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email template for booking confirmation
 * TODO: Implement professional HTML email template
 */
function generateBookingConfirmationHTML(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>訂單確認</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #000;">訂單確認</h1>
  <p>親愛的 ${data.customerName}，</p>
  <p>感謝您預訂 PACK&GO 旅行社的行程！以下是您的訂單詳情：</p>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0;">訂單編號：#${data.bookingId}</h2>
    <p><strong>行程名稱：</strong>${data.tourTitle}</p>
    <p><strong>出發日期：</strong>${data.departureDate}</p>
    <p><strong>回程日期：</strong>${data.returnDate}</p>
  </div>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>旅客人數</h3>
    <p>成人：${data.numberOfAdults} 位</p>
    <p>兒童：${data.numberOfChildren} 位</p>
    <p>嬰兒：${data.numberOfInfants} 位</p>
  </div>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>費用資訊</h3>
    <p><strong>總金額：</strong>NT$ ${data.totalPrice.toLocaleString()}</p>
    <p><strong>訂金：</strong>NT$ ${data.depositAmount.toLocaleString()}</p>
    <p><strong>尾款：</strong>NT$ ${data.remainingAmount.toLocaleString()}</p>
  </div>

  <p>我們的專員將盡快與您聯繫，確認訂單詳情。</p>
  <p>如有任何問題，請隨時與我們聯繫。</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  <p style="color: #666; font-size: 12px;">
    PACK&GO 旅行社<br>
    Email: info@packgo.travel<br>
    Tel: +886-2-1234-5678
  </p>
</body>
</html>
  `.trim();
}
