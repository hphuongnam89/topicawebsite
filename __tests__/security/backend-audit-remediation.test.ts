import { describe, expect, test, vi, beforeEach } from "vitest";
import { BoundedRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { MIN_PASSWORD_LENGTH, hashPassword, verifyPassword } from "@/lib/auth/password";
import { ALL_MIGRATIONS, computeMigrationChecksum, verifyAppliedMigrationChecksums } from "@/lib/db/migrations";
import { DatabaseSync } from "node:sqlite";

describe("Backend Audit Remediation Verification (F-01..F-10)", () => {
  describe("F-03 / F-10: BoundedRateLimiter & Safe IP Extraction", () => {
    test("BoundedRateLimiter enforces limit and recovers after window", () => {
      const limiter = new BoundedRateLimiter({
        windowMs: 1000,
        maxAttempts: 3,
        maxKeys: 5,
      });

      expect(limiter.increment("client1").allowed).toBe(true);
      expect(limiter.increment("client1").allowed).toBe(true);
      expect(limiter.increment("client1").allowed).toBe(true);
      const fourth = limiter.increment("client1");
      expect(fourth.allowed).toBe(false);
      expect(fourth.retryAfterSeconds).toBeGreaterThan(0);

      // Other clients are not affected
      expect(limiter.increment("client2").allowed).toBe(true);
    });

    test("BoundedRateLimiter respects maxKeys capacity and evicts LRU entries", () => {
      const limiter = new BoundedRateLimiter({
        windowMs: 60000,
        maxAttempts: 5,
        maxKeys: 3,
      });

      limiter.increment("k1");
      limiter.increment("k2");
      limiter.increment("k3");
      // Access k1 and k2 to make k3 the least recently used
      limiter.increment("k1");
      limiter.increment("k2");

      // Adding k4 must evict k3
      limiter.increment("k4");

      // k3 was evicted so check returns full attempts
      expect(limiter.check("k3").remaining).toBe(5);
    });

    test("getClientIp safely extracts valid IP from headers and rejects malformed values", () => {
      const reqWithCf = new Request("http://localhost", {
        headers: { "cf-connecting-ip": "203.0.113.195" },
      });
      expect(getClientIp(reqWithCf)).toBe("203.0.113.195");

      const reqWithForwarded = new Request("http://localhost", {
        headers: { "x-forwarded-for": "198.51.100.1, 10.0.0.1" },
      });
      expect(getClientIp(reqWithForwarded)).toBe("198.51.100.1");

      const reqWithSpoofedHeader = new Request("http://localhost", {
        headers: { "x-forwarded-for": "<script>alert(1)</script>, 192.168.1.1" },
      });
      expect(getClientIp(reqWithSpoofedHeader)).toBe("192.168.1.1");
    });
  });

  describe("F-06: Password Policy Enforcement", () => {
    test("MIN_PASSWORD_LENGTH is 12 and PBKDF2 hash verifies correctly", () => {
      expect(MIN_PASSWORD_LENGTH).toBe(12);

      const shortPwd = "abc123";
      expect(shortPwd.length).toBeLessThan(MIN_PASSWORD_LENGTH);

      const strongPwd = "SuperSecurePassword2026!";
      expect(strongPwd.length).toBeGreaterThanOrEqual(MIN_PASSWORD_LENGTH);

      const hashed = hashPassword(strongPwd);
      expect(verifyPassword(strongPwd, hashed)).toBe(true);
      expect(verifyPassword("WrongPassword123!", hashed)).toBe(false);
    });
  });

  describe("F-07: Migration Content Checksum & Drift Detection", () => {
    test("computeMigrationChecksum incorporates function implementation", () => {
      const m1 = {
        version: 99,
        name: "test_migration",
        up: () => "up_v1",
        down: () => "down_v1",
      };
      const m2 = {
        version: 99,
        name: "test_migration",
        up: () => "up_v2_altered",
        down: () => "down_v1",
      };

      const hash1 = computeMigrationChecksum(m1 as any);
      const hash2 = computeMigrationChecksum(m2 as any);
      expect(hash1).not.toBe(hash2);
    });

    test("verifyAppliedMigrationChecksums detects modified migrations in ledger", () => {
      const db = new DatabaseSync(":memory:");
      db.exec(`
        CREATE TABLE schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL,
          checksum TEXT NOT NULL,
          execution_time_ms INTEGER NOT NULL
        );
      `);

      // Insert a tampered checksum for migration 1
      db.prepare(`
        INSERT INTO schema_migrations VALUES (1, '001_core_legacy_baseline', '2026-10-14', 'tampered_bad_checksum', 10);
      `).run();

      const verification = verifyAppliedMigrationChecksums(db);
      expect(verification.valid).toBe(false);
      expect(verification.drifted.length).toBe(1);
      expect(verification.drifted[0].version).toBe(1);

      db.close();
    });
  });
});
