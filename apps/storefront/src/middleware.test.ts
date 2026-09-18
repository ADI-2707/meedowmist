import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { SESSION_COOKIE_NAME } from '@meadowmist/shared';
import * as shared from '@meadowmist/shared';

vi.mock('@meadowmist/shared', async () => {
  const actual = await vi.importActual<typeof shared>('@meadowmist/shared');
  return {
    ...actual,
    verifyToken: vi.fn(),
  };
});

describe('Storefront Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows public pages without authentication', async () => {
    const publicUrls = [
      'http://localhost:3000/',
      'http://localhost:3000/shop',
      'http://localhost:3000/product/amber-moss-candle',
    ];

    for (const url of publicUrls) {
      const req = new NextRequest(url);
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    }
  });

  it('returns 401 JSON for unauthenticated /api/account routes', async () => {
    const req = new NextRequest('http://localhost:3000/api/account/profile');
    const res = await middleware(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('redirects unauthenticated /account to /login with redirect parameter', async () => {
    const req = new NextRequest('http://localhost:3000/account');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?redirect=%2Faccount');
  });

  it('redirects unauthenticated /checkout to /login with redirect parameter', async () => {
    const req = new NextRequest('http://localhost:3000/checkout');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?redirect=%2Fcheckout');
  });

  it('returns 401 JSON when session token is invalid on protected API route', async () => {
    vi.mocked(shared.verifyToken).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/account/orders', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=corrupt_or_expired_token`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('allows protected route when session token is valid', async () => {
    vi.mocked(shared.verifyToken).mockResolvedValue({
      userId: 'user_123',
      email: 'buyer@example.com',
      role: 'CUSTOMER',
    });

    const req = new NextRequest('http://localhost:3000/account', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=valid_jwt_token`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(200);
  });
});
