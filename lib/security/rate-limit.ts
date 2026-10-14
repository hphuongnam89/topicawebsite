import "server-only";

export interface RateLimitOptions {
  windowMs: number;
  maxAttempts: number;
  maxKeys?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export class BoundedRateLimiter {
  private store = new Map<string, { count: number; resetAt: number; lastAccess: number; seq: number }>();
  private readonly windowMs: number;
  private readonly maxAttempts: number;
  private readonly maxKeys: number;
  private lastSweep = Date.now();
  private seq = 0;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.maxAttempts = options.maxAttempts;
    this.maxKeys = options.maxKeys ?? 5000;
  }

  public check(key: string): RateLimitResult {
    const now = Date.now();
    this.maybeSweep(now);

    const entry = this.store.get(key);
    if (!entry || entry.resetAt <= now) {
      return {
        allowed: true,
        remaining: this.maxAttempts,
        resetAt: now + this.windowMs,
        retryAfterSeconds: 0,
      };
    }

    const remaining = Math.max(0, this.maxAttempts - entry.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return {
      allowed: entry.count < this.maxAttempts,
      remaining,
      resetAt: entry.resetAt,
      retryAfterSeconds: entry.count >= this.maxAttempts ? retryAfterSeconds : 0,
    };
  }

  public increment(key: string): RateLimitResult {
    const now = Date.now();
    this.maybeSweep(now);

    let entry = this.store.get(key);
    if (!entry || entry.resetAt <= now) {
      this.ensureCapacity();
      entry = { count: 1, resetAt: now + this.windowMs, lastAccess: now, seq: ++this.seq };
      this.store.set(key, entry);
      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
        resetAt: entry.resetAt,
        retryAfterSeconds: 0,
      };
    }

    entry.count += 1;
    entry.lastAccess = now;
    entry.seq = ++this.seq;
    const remaining = Math.max(0, this.maxAttempts - entry.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return {
      allowed: entry.count <= this.maxAttempts,
      remaining,
      resetAt: entry.resetAt,
      retryAfterSeconds: entry.count > this.maxAttempts ? retryAfterSeconds : 0,
    };
  }

  public reset(key: string): void {
    this.store.delete(key);
  }

  public getResetAt(key: string): number | null {
    const entry = this.store.get(key);
    return entry ? entry.resetAt : null;
  }

  private maybeSweep(now: number): void {
    if (now - this.lastSweep > 60_000) {
      this.lastSweep = now;
      for (const [k, v] of this.store.entries()) {
        if (v.resetAt <= now) {
          this.store.delete(k);
        }
      }
    }
  }

  private ensureCapacity(): void {
    if (this.store.size < this.maxKeys) return;
    const now = Date.now();
    // 1. Evict expired entries
    for (const [k, v] of this.store.entries()) {
      if (v.resetAt <= now) {
        this.store.delete(k);
      }
    }
    // 2. If still at or above capacity, evict oldest by seq (strict LRU)
    if (this.store.size >= this.maxKeys) {
      let oldestKey: string | null = null;
      let oldestSeq = Infinity;
      for (const [k, v] of this.store.entries()) {
        if (v.seq < oldestSeq) {
          oldestSeq = v.seq;
          oldestKey = k;
        }
      }
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }
  }
}

/**
 * Sanitize and extract client IP safely.
 * In production behind reverse proxy (Cloudflare, Railway, Nginx),
 * safely inspect proxy headers and validate format to prevent spoofing or memory exhaustion.
 */
export function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && isValidIp(cfIp)) return cfIp;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (isValidIp(part)) return part;
    }
  }

  return "127.0.0.1";
}

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || ipv6.test(ip);
}
