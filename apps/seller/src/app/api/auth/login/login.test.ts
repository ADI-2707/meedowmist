import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/password';
import { signToken } from '@/lib/auth';
import { setAdminSessionCookie } from '@/lib/session';
import {
  checkLoginAttempt,
  recordFailedAttempt,
  resetFailedAttempts,
} from '@meadowmist/shared';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/password', () => ({
  comparePassword: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  signToken: vi.fn(),
}));

vi.mock('@/lib/session', () => ({
  setAdminSessionCookie: vi.fn(),
}));

vi.mock('@meadowmist/shared', async () => {
  const actual = await vi.importActual<typeof import('@meadowmist/shared')>('@meadowmist/shared');
  return {
    ...actual,
    checkLoginAttempt: vi.fn(),
    recordFailedAttempt: vi.fn(),
    resetFailedAttempts: vi.fn(),
  };
});

describe('Seller Portal Login API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email or password is empty', async () => {
    const req = new Request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Email and password are required');
  });

  it('returns 429 when seller account is temporarily locked', async () => {
    vi.mocked(checkLoginAttempt).mockReturnValue({
      allowed: false,
      remainingSeconds: 60,
      attemptCount: 6,
    });

    const req = new Request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '198.51.100.12',
      },
      body: JSON.stringify({
        email: 'admin@meadowmist.in',
        password: 'Password123!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');

    const body = await res.json();
    expect(body.remainingSeconds).toBe(60);
    expect(body.error).toContain('Account temporarily locked');
  });

  it('records failed attempt and returns 401 when user is not admin or inactive', async () => {
    vi.mocked(checkLoginAttempt).mockReturnValue({
      allowed: true,
      remainingSeconds: 0,
      attemptCount: 0,
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u_customer',
      email: 'customer@meadowmist.in',
      passwordHash: 'hashed_pw',
      name: 'Customer User',
      role: 'CUSTOMER',
      isActive: true,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(recordFailedAttempt).mockReturnValue({
      allowed: true,
      remainingSeconds: 0,
      attemptCount: 1,
    });

    const req = new Request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@meadowmist.in',
        password: 'SecretPassword123!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(recordFailedAttempt).toHaveBeenCalledWith('127.0.0.1', 'customer@meadowmist.in');
  });

  it('authenticates admin successfully, resets lockouts, sets admin session cookie, and returns 200', async () => {
    vi.mocked(checkLoginAttempt).mockReturnValue({
      allowed: true,
      remainingSeconds: 0,
      attemptCount: 0,
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin_1',
      email: 'artisan@meadowmist.in',
      passwordHash: 'valid_hashed_pw',
      name: 'Master Artisan',
      role: 'ADMIN',
      isActive: true,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(comparePassword).mockResolvedValue(true);
    vi.mocked(signToken).mockResolvedValue('admin_jwt_token');

    const req = new Request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'artisan@meadowmist.in',
        password: 'AdminPassword123!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(resetFailedAttempts).toHaveBeenCalledWith('127.0.0.1', 'artisan@meadowmist.in');
    expect(setAdminSessionCookie).toHaveBeenCalledWith('admin_jwt_token');

    const body = await res.json();
    expect(body.user.role).toBe('ADMIN');
    expect(body.user.email).toBe('artisan@meadowmist.in');
  });
});
