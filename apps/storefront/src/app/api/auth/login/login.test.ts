import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/password';
import { signToken } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';
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
  setSessionCookie: vi.fn(),
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

describe('Storefront Login API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email or password is missing', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Email and password are required');
  });

  it('returns 429 with Retry-After when account is locked', async () => {
    vi.mocked(checkLoginAttempt).mockReturnValue({
      allowed: false,
      remainingSeconds: 30,
      attemptCount: 5,
    });

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.195',
      },
      body: JSON.stringify({
        email: 'locked@example.com',
        password: 'Password123!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');

    const body = await res.json();
    expect(body.remainingSeconds).toBe(30);
    expect(body.error).toContain('Account temporarily locked');
  });

  it('records failed attempt and returns 401 on invalid credentials', async () => {
    vi.mocked(checkLoginAttempt).mockReturnValue({
      allowed: true,
      remainingSeconds: 0,
      attemptCount: 1,
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(recordFailedAttempt).mockReturnValue({
      allowed: true,
      remainingSeconds: 0,
      attemptCount: 2,
    });

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(recordFailedAttempt).toHaveBeenCalledWith('127.0.0.1', 'nonexistent@example.com');
  });

  it('resets failed attempts and returns 200 on valid credentials', async () => {
    vi.mocked(checkLoginAttempt).mockReturnValue({
      allowed: true,
      remainingSeconds: 0,
      attemptCount: 0,
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_1',
      email: 'valid@example.com',
      passwordHash: 'hashed_pw',
      name: 'Ananya',
      role: 'CUSTOMER',
      isActive: true,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(comparePassword).mockResolvedValue(true);
    vi.mocked(signToken).mockResolvedValue('jwt_token_123');

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'valid@example.com',
        password: 'CorrectPassword123!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(resetFailedAttempts).toHaveBeenCalledWith('127.0.0.1', 'valid@example.com');
    expect(setSessionCookie).toHaveBeenCalledWith('jwt_token_123', false);

    const body = await res.json();
    expect(body.user.email).toBe('valid@example.com');
  });
});
