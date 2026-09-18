interface AttemptRecord {
  count: number;
  lockedUntil: number;
  lastAttemptAt: number;
}

const store = new Map<string, AttemptRecord>();

function getLockDurationSeconds(failureCount: number): number {
  if (failureCount < 5) return 0;
  if (failureCount === 5) return 30;
  if (failureCount === 6) return 60;
  if (failureCount === 7) return 300;
  if (failureCount === 8) return 900;
  return 3600;
}

function makeKey(ip: string, email: string): string {
  const safeIp = ip.trim().toLowerCase() || 'unknown-ip';
  const safeEmail = email.trim().toLowerCase() || 'unknown-email';
  return `${safeIp}:${safeEmail}`;
}

export function checkLoginAttempt(
  ip: string,
  email: string
): { allowed: boolean; remainingSeconds: number; attemptCount: number } {
  const key = makeKey(ip, email);
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    return { allowed: true, remainingSeconds: 0, attemptCount: 0 };
  }

  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingSeconds,
      attemptCount: record.count,
    };
  }

  return {
    allowed: true,
    remainingSeconds: 0,
    attemptCount: record.count,
  };
}

export function recordFailedAttempt(
  ip: string,
  email: string
): { allowed: boolean; remainingSeconds: number; attemptCount: number } {
  const key = makeKey(ip, email);
  const now = Date.now();
  const current = store.get(key);
  const nextCount = (current?.count || 0) + 1;
  const lockDuration = getLockDurationSeconds(nextCount);
  const lockedUntil = lockDuration > 0 ? now + lockDuration * 1000 : 0;

  store.set(key, {
    count: nextCount,
    lockedUntil,
    lastAttemptAt: now,
  });

  return {
    allowed: lockDuration === 0,
    remainingSeconds: lockDuration,
    attemptCount: nextCount,
  };
}

export function resetFailedAttempts(ip: string, email: string): void {
  const key = makeKey(ip, email);
  store.delete(key);
}

export function _clearRateLimitStore(): void {
  store.clear();
}
