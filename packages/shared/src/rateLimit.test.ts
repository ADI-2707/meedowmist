import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkLoginAttempt,
  recordFailedAttempt,
  resetFailedAttempts,
  _clearRateLimitStore,
} from './rateLimit';

describe('Incremental Account Lockout Engine', () => {
  beforeEach(() => {
    _clearRateLimitStore();
  });

  const ip = '192.168.1.50';
  const email = 'artisan@meadowmist.in';

  it('allows attempts 1 through 4 without lockout', () => {
    for (let i = 1; i <= 4; i++) {
      const res = recordFailedAttempt(ip, email);
      expect(res.allowed).toBe(true);
      expect(res.remainingSeconds).toBe(0);
      expect(res.attemptCount).toBe(i);

      const check = checkLoginAttempt(ip, email);
      expect(check.allowed).toBe(true);
      expect(check.remainingSeconds).toBe(0);
    }
  });

  it('locks for 30 seconds on 5th failure', () => {
    for (let i = 1; i <= 4; i++) {
      recordFailedAttempt(ip, email);
    }

    const fifth = recordFailedAttempt(ip, email);
    expect(fifth.allowed).toBe(false);
    expect(fifth.remainingSeconds).toBe(30);
    expect(fifth.attemptCount).toBe(5);

    const check = checkLoginAttempt(ip, email);
    expect(check.allowed).toBe(false);
    expect(check.remainingSeconds).toBeGreaterThan(0);
    expect(check.remainingSeconds).toBeLessThanOrEqual(30);
  });

  it('scales lock to 60 seconds on 6th consecutive failure', () => {
    for (let i = 1; i <= 5; i++) {
      recordFailedAttempt(ip, email);
    }

    const sixth = recordFailedAttempt(ip, email);
    expect(sixth.allowed).toBe(false);
    expect(sixth.remainingSeconds).toBe(60);
    expect(sixth.attemptCount).toBe(6);
  });

  it('scales lock to 300 seconds on 7th failure and 900 seconds on 8th failure', () => {
    for (let i = 1; i <= 6; i++) {
      recordFailedAttempt(ip, email);
    }

    const seventh = recordFailedAttempt(ip, email);
    expect(seventh.allowed).toBe(false);
    expect(seventh.remainingSeconds).toBe(300);

    const eighth = recordFailedAttempt(ip, email);
    expect(eighth.allowed).toBe(false);
    expect(eighth.remainingSeconds).toBe(900);

    const ninth = recordFailedAttempt(ip, email);
    expect(ninth.allowed).toBe(false);
    expect(ninth.remainingSeconds).toBe(3600);
  });

  it('resets lockout on successful login', () => {
    for (let i = 1; i <= 5; i++) {
      recordFailedAttempt(ip, email);
    }

    expect(checkLoginAttempt(ip, email).allowed).toBe(false);

    resetFailedAttempts(ip, email);

    const check = checkLoginAttempt(ip, email);
    expect(check.allowed).toBe(true);
    expect(check.attemptCount).toBe(0);
    expect(check.remainingSeconds).toBe(0);
  });

  it('tracks distinct IP and email pairs independently', () => {
    for (let i = 1; i <= 5; i++) {
      recordFailedAttempt('1.1.1.1', 'user@example.com');
    }

    expect(checkLoginAttempt('1.1.1.1', 'user@example.com').allowed).toBe(false);
    expect(checkLoginAttempt('2.2.2.2', 'user@example.com').allowed).toBe(true);
    expect(checkLoginAttempt('1.1.1.1', 'other@example.com').allowed).toBe(true);
  });
});
