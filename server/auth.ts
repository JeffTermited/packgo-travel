import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as db from './db';
import { sendPasswordResetEmail } from './emailService';

const SALT_ROUNDS = 10;

/**
 * Create a new user with email and password
 */
export async function createUser(email: string, password: string, name?: string) {
  // Check if user already exists
  const existingUser = await db.getUserByEmail(email);
  if (existingUser) {
    throw new Error('此電子郵件已被註冊');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await db.createUserWithPassword({
    email,
    password: hashedPassword,
    name: name || email.split('@')[0],
  });

  return user;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  const user = await db.getUserByEmail(email);
  
  if (!user) {
    throw new Error('電子郵件或密碼錯誤');
  }

  if (!user.password) {
    throw new Error('此帳號使用第三方登入，請使用 Google 登入');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    throw new Error('電子郵件或密碼錯誤');
  }

  return user;
}

/**
 * Request password reset - generates token and stores it
 */
export async function requestPasswordReset(email: string) {
  const user = await db.getUserByEmail(email);
  
  if (!user) {
    // Don't reveal if user exists for security
    return { success: true, message: '如果該電子郵件已註冊，您將收到重設密碼的連結' };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

  // Store token in database
  await db.setPasswordResetToken(user.id, resetToken, resetTokenExpires);

  // Send password reset email
  try {
    const emailSent = await sendPasswordResetEmail(email, resetToken, user.name || undefined);
    if (emailSent) {
      console.log('[Auth] Password reset email sent successfully to:', email);
    } else {
      console.error('[Auth] Failed to send password reset email to:', email);
    }
  } catch (error) {
    console.error('[Auth] Error sending password reset email:', error);
  }

  return { 
    success: true, 
    message: '如果該電子郵件已註冊，您將收到重設密碼的連結'
  };
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  const user = await db.getUserByResetToken(token);
  
  if (!user) {
    throw new Error('重設密碼連結無效或已過期');
  }

  // Check if token has expired
  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    throw new Error('重設密碼連結已過期');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset token
  await db.updatePassword(user.id, hashedPassword);
  await db.clearPasswordResetToken(user.id);

  return { success: true };
}

/**
 * Create or get user from Google OAuth
 */
export async function createOrGetGoogleUser(googleId: string, email: string, name: string) {
  // Check if user exists with this Google ID
  let user = await db.getUserByGoogleId(googleId);
  
  if (user) {
    return user;
  }

  // Check if user exists with this email
  user = await db.getUserByEmail(email);
  
  if (user) {
    // Link Google account to existing user
    const updatedUser = await db.linkGoogleAccount(user.id, googleId);
    return updatedUser || user;
  }

  // Create new user
  user = await db.createUserWithGoogle({
    googleId,
    email,
    name,
  });

  return user;
}
