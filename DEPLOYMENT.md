# PostgreSQL deployment

Node.js 22.14.0 is pinned in Docker, `.node-version`, CI, and the release gate.
All application records, quotas and deliveries use PostgreSQL. SQLite is used only
by the read-only migration CLI and its fixtures; the running web/worker never opens it.
Production dependencies are pruned with `npm prune --omit=dev`. Worker and migration
CLIs are bundled before pruning.

## Start a fresh deployment

Set `POSTGRES_PASSWORD` to a long URL-safe random value (hex is suitable),
`ADMIN_INITIAL_PASSWORD` to 12+ characters and `ADMIN_SESSION_SECRET` to 32+ characters:

```bash
docker compose up -d --build
```

`db` has a persistent named volume and health check. `schema-migrate` completes
before web and worker start. Only nginx publishes a host port. Configure HTTPS
at this ingress before exposing the site publicly. The PostgreSQL service has
no host port. Back up PostgreSQL and the uploads volume; validate restore routinely.
For an external managed DB, set the same `DATABASE_URL` and `DATABASE_SCHEMA` on web,
worker, and migration jobs, with verified TLS and suitable network access controls.
Each process has a bounded pool (`DATABASE_POOL_MAX`, default 10).

The applied schema is `migrations/100_runtime_schema.sql`, in `topica_runtime` by
default. Migration application and first-user/default seeding hold a PostgreSQL
advisory lock. Existing users, passwords, and settings are preserved. The separate
`001_initial_schema.sql` draft belongs to the concurrent CMS redesign and is not
executed by this runtime; it has a different domain/ID model.

## Import the existing SQLite database

Stop the old writer and snapshot SQLite with its backup API or `sqlite3 .backup`
so committed WAL data is included. Keep the original and backup untouched. Use an
empty PostgreSQL target before starting web or the seeding job. Review the source's
foreign keys; the importer refuses orphan records, unmapped columns, and nonempty
application tables. It copies IDs, admin hashes/session versions, consent fields,
settings, CMS records, analytics and delivery state in one transaction, verifies
counts, resets sequences, and records a fingerprint. A failed import rolls back.

For a host with dependencies installed:

```bash
DATABASE_URL='<target-url>' DATABASE_SCHEMA=topica_runtime npm run migrate:sqlite -- /absolute/path/topica-backup.db
```

For Docker, build first and start only the DB, then run the import before the stack:

```bash
docker compose build
docker compose up -d db
docker compose run --rm --no-deps -v /absolute/path/topica-backup.db:/legacy/topica.db:ro schema-migrate node --conditions=react-server dist/sqlite-migration.mjs /legacy/topica.db
docker compose up -d
```

Verify source/target counts, preserved admin login, article/page routes, lead status,
and uploads before switching traffic. After cutover, PostgreSQL is authoritative;
rolling back to the SQLite snapshot would omit new PostgreSQL writes. Do not switch
back after accepting new writes without a reviewed reconciliation/export.

## Ingress and quotas

Only the private nginx ingress may supply `X-Topica-Client-IP`. It overwrites that
header with the TCP peer and drops client-supplied forwarding headers. Set
`TRUSTED_INGRESS=nginx` only on a web instance reachable exclusively through this
configuration. Do not publish the web port or add another proxy in front without
verifying the new trust boundary. Production rejects public writes if that IP is
missing. Development uses signed anonymous cookies plus a lead-phone quota.

Quotas persist in PostgreSQL across clients, processes, restarts and hosts, using
the DB clock. Analytics has independent hit/event namespaces and no global low
`unknown` quota. Shared NAT users still share the IP quota. Request limits count
bytes actually consumed, and cancel oversized streams; `Content-Length` is only
an early rejection. Analytics paths must resolve to a configured or published
CMS route; admin/API paths, traversal and arbitrary paths are rejected.

## Lead delivery and operations

Lead + outbox commit on one PostgreSQL connection in one transaction. Claims use
`FOR UPDATE SKIP LOCKED`, one delivery per worker at a time, a 30-second lease and
5-second Telegram timeout. Attempts are recorded at claim time, so crashes cannot
reset the six-attempt budget. Expired leases recover; exhausted deliveries become
failed. Backoff is 5, 10, 20, 40, then 60 minutes, using the DB clock.

The `lead-worker` service runs immediately and schedules subsequent batches every
minute, with `restart: always` and graceful SIGTERM handling. Its default batch is
10; `LEAD_DELIVERY_BATCH_SIZE` accepts 1–100. JSON logs contain processed counts and
counts by status. Alert on worker exits and increases in failed deliveries. Admin
shows pending/processing/sent/failed, attempts, last error and next attempt; an admin
can schedule up to three further retry cycles after cooldown, with an audit entry.

Delivery is at least once: Telegram has no idempotency key. If Telegram accepts a
message and the worker dies before marking sent, retry can duplicate a notification.
Lease ownership prevents ordinary concurrent workers from sending the same delivery;
the saved lead remains available in admin regardless of delivery failure.

Retention is an operator-scheduled job with approved periods and audit output:

```bash
LEAD_RETENTION_DAYS=<approved-days> RETENTION_AUDIT_LOG=/var/log/topica/lead-retention.jsonl npm run retention:leads
ANALYTICS_RETENTION_DAYS=<approved-days> RETENTION_AUDIT_LOG=/var/log/topica/analytics-retention.jsonl npm run retention:analytics
```

Run `npm run verify` with a disposable PostgreSQL `DATABASE_URL`. Test schemas are
isolated; reliability and migration tests use fixtures and simulated Telegram.
See `docs/runtime-security-verification.md` for evidence and the remaining dev-only advisory chain.
