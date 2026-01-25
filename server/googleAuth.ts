import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Express } from 'express';
import * as auth from './auth';
import { createToken } from './jwt';
import { getSessionCookieOptions } from './_core/cookies';
import { COOKIE_NAME } from '@shared/const';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '117887318388-n3cqkvtic44sjsd3kmogohah9a373ivd.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'https://packgo-d3xjbq67.manus.space/api/auth/google/callback';

/**
 * Initialize Google OAuth strategy
 */
export function initializeGoogleAuth(app: Express) {
  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // Create or get user
          const user = await auth.createOrGetGoogleUser(googleId, email, name);

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Initialize passport
  app.use(passport.initialize());

  // Google OAuth routes
  app.get(
    '/api/auth/google',
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      session: false 
    })
  );

  app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', { 
      session: false,
      failureRedirect: '/login?error=google_auth_failed' 
    }),
    async (req, res) => {
      try {
        const user = req.user as any;

        if (!user) {
          return res.redirect('/login?error=no_user');
        }

        // Create JWT token
        const token = createToken({
          userId: user.id,
          email: user.email,
          name: user.name || undefined,
          role: user.role,
        });

        // Set cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        // Redirect to home page
        res.redirect('/');
      } catch (error) {
        console.error('[Google Auth] Callback error:', error);
        res.redirect('/login?error=auth_failed');
      }
    }
  );
}
