import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { ADMIN_COOKIE_NAME } from '@meadowmist/shared';
import * as shared from '@meadowmist/shared';

vi.mock('@meadowmist/shared', async () => {
  const actual = await vi.importActual<typeof shared>('@meadowmist/shared');
  return {
    ...actual,
    verifyToken: vi.fn(),
  };
});

describe('Seller Portal Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows public paths without authentication', async () => {
    const publicUrls = [
      'http://localhost:3001/api/auth/login',
      'http://localhost:3001/_next/static/chunk.js',
      'http://localhost:3001/favicon.ico',
    ];

    for (const url of publicUrls) {
      const req = new NextRequest(url);
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    }
  });

  it('returns 401 JSON for unauthenticated /api/ routes', async () => {
    const req = new NextRequest('http://localhost:3001/api/products');
    const res = await middleware(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('redirects unauthenticated page navigations to /login', async () => {
    const req = new NextRequest('http://localhost:3001/products');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3001/login');
  });

  it('returns 401 JSON when token is invalid or user is not ADMIN', async () => {
    vi.mocked(shared.verifyToken).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3001/api/orders', {
      headers: {
        cookie: `${ADMIN_COOKIE_NAME}=invalid_token`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('redirects page navigation to /login when token is not ADMIN', async () => {
    vi.mocked(shared.verifyToken).mockResolvedValue({
      userId: 'u1',
      email: 'user@test.com',
      name: 'User',
      role: 'CUSTOMER',
    });

    const req = new NextRequest('http://localhost:3001/orders', {
      headers: {
        cookie: `${ADMIN_COOKIE_NAME}=customer_token`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3001/login');
  });

  it('allows access when token is valid and user is ADMIN', async () => {
    vi.mocked(shared.verifyToken).mockResolvedValue({
      userId: 'admin_1',
      email: 'admin@meadowmist.in',
      name: 'Admin',
      role: 'ADMIN',
    });

    const req = new NextRequest('http://localhost:3001/api/products', {
      headers: {
        cookie: `${ADMIN_COOKIE_NAME}=valid_admin_token`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(200);
  });
});
