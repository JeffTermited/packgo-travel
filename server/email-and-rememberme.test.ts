import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';
import * as auth from './auth';
import { createToken, verifyToken } from './jwt';
import type { Context } from './_core/context';

// Mock context helper
function createMockContext(user: any = null): Context {
  return {
    req: {
      headers: {},
      get: () => undefined,
    } as any,
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as any,
    user,
  };
}

describe('Email Service and Remember Me Feature', () => {
  let testUser: any;

  beforeAll(async () => {
    // Create a test user for authentication tests
    const testEmail = `test-email-${Date.now()}@example.com`;
    testUser = await auth.createUser(testEmail, 'test123', 'Test Email User');
  });

  describe('Remember Me Feature', () => {
    it('should create token with 7 days expiry when rememberMe is false', async () => {
      const testEmail = `test-remember-false-${Date.now()}@example.com`;
      await auth.createUser(testEmail, 'test123', 'Test User');

      let capturedToken: string | undefined;
      let capturedMaxAge: number | undefined;

      const mockRes = {
        cookie: (name: string, value: string, options: any) => {
          if (name === 'app_session_id') {
            capturedToken = value;
            capturedMaxAge = options.maxAge;
          }
        },
        clearCookie: () => {},
      };

      const caller = appRouter.createCaller({
        req: {
          headers: {},
          get: () => undefined,
        } as any,
        res: mockRes as any,
        user: null,
      });

      await caller.auth.login({
        email: testEmail,
        password: 'test123',
        rememberMe: false,
      });

      expect(capturedToken).toBeTruthy();
      expect(capturedMaxAge).toBe(7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

      // Verify token is valid
      if (capturedToken) {
        const payload = verifyToken(capturedToken);
        expect(payload).toBeTruthy();
        expect(payload?.email).toBe(testEmail);
      }
    });

    it('should create token with 30 days expiry when rememberMe is true', async () => {
      const testEmail = `test-remember-true-${Date.now()}@example.com`;
      await auth.createUser(testEmail, 'test123', 'Test User');

      let capturedToken: string | undefined;
      let capturedMaxAge: number | undefined;

      const mockRes = {
        cookie: (name: string, value: string, options: any) => {
          if (name === 'app_session_id') {
            capturedToken = value;
            capturedMaxAge = options.maxAge;
          }
        },
        clearCookie: () => {},
      };

      const caller = appRouter.createCaller({
        req: {
          headers: {},
          get: () => undefined,
        } as any,
        res: mockRes as any,
        user: null,
      });

      await caller.auth.login({
        email: testEmail,
        password: 'test123',
        rememberMe: true,
      });

      expect(capturedToken).toBeTruthy();
      expect(capturedMaxAge).toBe(30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds

      // Verify token is valid
      if (capturedToken) {
        const payload = verifyToken(capturedToken);
        expect(payload).toBeTruthy();
        expect(payload?.email).toBe(testEmail);
      }
    });

    it('should default to 7 days expiry when rememberMe is not provided', async () => {
      const testEmail = `test-remember-default-${Date.now()}@example.com`;
      await auth.createUser(testEmail, 'test123', 'Test User');

      let capturedMaxAge: number | undefined;

      const mockRes = {
        cookie: (name: string, value: string, options: any) => {
          if (name === 'app_session_id') {
            capturedMaxAge = options.maxAge;
          }
        },
        clearCookie: () => {},
      };

      const caller = appRouter.createCaller({
        req: {
          headers: {},
          get: () => undefined,
        } as any,
        res: mockRes as any,
        user: null,
      });

      await caller.auth.login({
        email: testEmail,
        password: 'test123',
        // rememberMe not provided, should default to false
      });

      expect(capturedMaxAge).toBe(7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    });
  });

  describe('Password Reset Email', () => {
    it('should request password reset and generate token', async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.auth.requestPasswordReset({
        email: testUser.email,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('如果該電子郵件已註冊');

      // Verify token was stored in database
      const user = await db.getUserByEmail(testUser.email);
      expect(user?.resetPasswordToken).toBeTruthy();
      expect(user?.resetPasswordExpires).toBeTruthy();
    });

    it('should not reveal if user does not exist', async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.auth.requestPasswordReset({
        email: 'nonexistent@example.com',
      });

      // Should still return success to avoid revealing user existence
      expect(result.success).toBe(true);
      expect(result.message).toContain('如果該電子郵件已註冊');
    });

    it('should reset password with valid token', async () => {
      const caller = appRouter.createCaller(createMockContext());

      // Request password reset
      await caller.auth.requestPasswordReset({
        email: testUser.email,
      });

      // Get the token from database
      const user = await db.getUserByEmail(testUser.email);
      expect(user?.resetPasswordToken).toBeTruthy();

      // Reset password with token
      const result = await caller.auth.resetPassword({
        token: user!.resetPasswordToken!,
        newPassword: 'newpassword123',
      });

      expect(result.success).toBe(true);

      // Verify can login with new password
      let loginSuccess = false;
      const mockRes = {
        cookie: () => {
          loginSuccess = true;
        },
        clearCookie: () => {},
      };

      const loginCaller = appRouter.createCaller({
        req: {
          headers: {},
          get: () => undefined,
        } as any,
        res: mockRes as any,
        user: null,
      });

      await loginCaller.auth.login({
        email: testUser.email,
        password: 'newpassword123',
      });

      expect(loginSuccess).toBe(true);
    });
  });

  describe('JWT Token Expiry', () => {
    it('should create token with custom expiry time', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      // Create token with 7 days expiry
      const token7d = createToken(payload, '7d');
      expect(token7d).toBeTruthy();

      // Create token with 30 days expiry
      const token30d = createToken(payload, '30d');
      expect(token30d).toBeTruthy();

      // Tokens should be different
      expect(token7d).not.toBe(token30d);

      // Both tokens should be valid
      const payload7d = verifyToken(token7d);
      const payload30d = verifyToken(token30d);

      expect(payload7d).toBeTruthy();
      expect(payload30d).toBeTruthy();
      expect(payload7d?.email).toBe('test@example.com');
      expect(payload30d?.email).toBe('test@example.com');
    });
  });
});
