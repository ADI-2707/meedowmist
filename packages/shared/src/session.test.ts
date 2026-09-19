import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  SESSION_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  getSessionCookieOptions,
} from './session';

describe('Shared Session Module', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('exports correct cookie names', () => {
    expect(SESSION_COOKIE_NAME).toBe('mm_session');
    expect(ADMIN_COOKIE_NAME).toBe('mm_admin_session');
  });

  it('returns 14-day duration for customer session cookies', () => {
    const options = getSessionCookieOptions(false);
    expect(options.maxAge).toBe(60 * 60 * 24 * 14);
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.path).toBe('/');
  });

  it('returns 7-day duration for admin session cookies', () => {
    const options = getSessionCookieOptions(true);
    expect(options.maxAge).toBe(60 * 60 * 24 * 7);
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.path).toBe('/');
  });

  it('sets secure flag according to production environment', () => {
    process.env.NODE_ENV = 'production';
    expect(getSessionCookieOptions(false).secure).toBe(true);

    process.env.NODE_ENV = 'development';
    expect(getSessionCookieOptions(false).secure).toBe(false);
  });
});
