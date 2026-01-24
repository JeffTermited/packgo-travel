import { describe, it, expect } from 'vitest';
import { sendPasswordResetEmail } from './emailService';

describe('Email Service Validation', () => {
  it('should successfully send password reset email with configured credentials', async () => {
    // This test validates that EMAIL_USER, EMAIL_PASSWORD, and BASE_URL are correctly configured
    const testEmail = 'jeffhsieh09@gmail.com'; // Send to the configured email address
    const resetToken = 'test-token-' + Date.now();
    const userName = 'Test User';

    try {
      const result = await sendPasswordResetEmail(testEmail, resetToken, userName);
      
      // If email service is configured correctly, this should succeed
      expect(result).toBe(true);
      
      console.log('✅ Email service validation successful!');
      console.log('📧 Password reset email sent to:', testEmail);
      console.log('Please check your inbox to confirm email delivery.');
    } catch (error: any) {
      // If credentials are invalid, the test will fail with a descriptive error
      console.error('❌ Email service validation failed:', error.message);
      throw new Error(`Email service validation failed: ${error.message}`);
    }
  }, 30000); // 30 second timeout for email sending
});
