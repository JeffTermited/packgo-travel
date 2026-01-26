import { notifyOwner } from "./_core/notification";

/**
 * Email templates and sending logic
 */

interface BookingEmailData {
  to?: string; // Email recipient (optional, defaults to customerEmail)
  customerName?: string;
  customerEmail?: string;
  bookingId: number;
  tourTitle: string;
  departureDate?: string;
  returnDate?: string;
  numberOfAdults?: number;
  numberOfChildren?: number;
  numberOfInfants?: number;
  totalPrice?: number;
  depositAmount?: number;
  remainingAmount?: number;
  participants?: any; // Participant details
  totalAmount?: number; // Total amount (alias for totalPrice)
}

/**
 * Send booking confirmation email to customer
 * Note: Currently using notifyOwner as a fallback since we don't have direct email sending capability
 * In production, integrate with email service like Resend or SendGrid
 */
export async function sendBookingConfirmationEmail(data: BookingEmailData) {
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

請盡快與客戶聯繫確認訂單詳情。
  `.trim();

  // Send notification to owner (as a workaround)
  await notifyOwner({
    title: `新訂單 #${data.bookingId} - ${data.customerName}`,
    content: emailContent,
  });

  // TODO: Integrate with actual email service
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'PACK&GO <noreply@packgo.travel>',
  //   to: data.customerEmail,
  //   subject: `訂單確認 #${data.bookingId} - ${data.tourTitle}`,
  //   html: generateBookingConfirmationHTML(data),
  // });

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

  return true;
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
