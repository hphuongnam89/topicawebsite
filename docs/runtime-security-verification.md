# Runtime / security verification — 2026-10-08

## Scope

The current application runtime uses PostgreSQL for CRUD, authentication, analytics,
rate limits, and lead delivery. Its schema is `migrations/100_runtime_schema.sql`.
The SQLite reader is retained only for the explicit, read-only data import command.

The user approved closing the verified runtime scope while another process continues
writing the separate CMS repositories. The final runtime build snapshot at
`/tmp/topica-runtime-build` excludes `lib/repositories/`; existing application routes
do not import those drafts. This is a scoped verification, not a successful release
gate for the entire concurrently edited working tree.

## Checks

| Check                                         | Evidence                                                                                                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supported runtime                             | Node **22.14.0** locally, in CI and production image                                                                                                                                                            |
| Release gate before concurrent CMS repository | Format, type generation, typecheck, lint, 45 unit tests, reliability, PostgreSQL migration/CRUD, program data, Next production build and worker bundles passed                                                  |
| Regression after ingress origin fix           | 46 unit tests passed, including external host/port, HTTPS scheme and cross-origin rejection                                                                                                                     |
| Final scoped release gate                     | Snapshot excluding concurrent `lib/repositories/` passed format, type generation, typecheck, lint, all 46 unit tests, reliability, PostgreSQL migration/CRUD, program data, production build and worker bundles |
| Shared rate limits                            | Atomic PostgreSQL updates; ten concurrent clients, multiple processes, restart persistence, distinct identities, forged cookies and forwarding headers tested                                                   |
| Body limits                                   | Actual streamed bytes, Unicode, false/missing Content-Length and stream cancellation tested; nginx QA rejected chunked oversized requests with 413 on lead/hit/event routes                                     |
| Analytics paths                               | Canonical routes and published CMS paths accepted; traversal, external URLs and private paths rejected                                                                                                          |
| Lead persistence                              | Lead and outbox commit together; insertion failure rolls both back; real SIGKILL after commit preserves the delivery                                                                                            |
| Worker concurrency                            | SKIP LOCKED claims, fencing tokens, expired lease recovery, SIGKILL after claim, timeout, six-attempt exhaustion, backoff and bounded manual retries tested                                                     |
| Database migration                            | Disposable SQLite fixture imported into disposable PostgreSQL schema; rollback, source checksum, counts, sequences, existing password/session, CRUD, FK cascade/SET NULL and analytics deduplication passed     |
| Deployment                                    | PostgreSQL health gate, migration job, web, nginx and scheduler worker started in isolated Compose project                                                                                                      |
| Production dependencies                       | Node 22.14.0 and pg present; eslint, TypeScript, Vitest, tsx, jsdom and Tailwind build plugin absent                                                                                                            |

The final tested Docker image is `topica-edu:reliability-check` (`11e24f7cc339`).
Separate TCP peers received separate quotas; web restart retained the original
quota. Real Chromium login showed failed/pending states, errors and attempts;
controlled retry returned 200 and changed failed to pending. Admin screenshots
were visually inspected: `.work/pg-admin-before-retry.png` and
`.work/pg-admin-after-retry.png`.

## Dependency audit

The initial audit reported **7 high** findings. The resulting full audit reports
**5 high** package findings in one development-only dependency chain:

`eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`

The remaining advisory is
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
(stack exhaustion from deeply nested glob patterns). The audited registry has no
patched braces release for this chain. These five findings are dependency-chain
entries, not five separate root vulnerabilities. Exposure is in tooling processing
glob patterns during development/CI; it is excluded from the production image.
CI records the full audit and fails on high production findings.

`npm audit --omit=dev --json` reports **0 vulnerabilities**. The brace-expansion
advisories were resolved with patched transitive versions. jsdom 29 and its patched
undici dependency keep the test tooling compatible with Node 22.14.0.

## Remaining CMS release blocker

The latest whole-working-tree `npm run verify` stopped at format parsing:

`lib/repositories/content.repository.ts:376` has a `throw new Error(...)` statement
missing a closing parenthesis. These concurrent CMS repositories also depend on a
separate data model and `~/` imports that have not been integrated or verified with
the existing application. `migrations/001_initial_schema.sql` is that separate CMS
draft; the runtime migration command does not execute it.

The entire working tree must pass its release gate after that process finishes and
the CMS model is integrated. The scoped runtime checks do not certify those drafts.

## Operational limits

No production service was deployed and no real SQLite database was migrated.
Migration tests used disposable fixtures; deployment tests used an isolated local
Compose project. Telegram responses/timeouts were simulated; no real Telegram
message was sent.

Delivery is **at least once**: if Telegram accepts a message and the worker crashes
before recording success, retry can send a duplicate. Telegram sendMessage has no
idempotency key. Leases prevent simultaneous ownership and saved leads remain
recoverable, but they cannot guarantee exactly-once external delivery.

Configure HTTPS directly at the trusted nginx ingress before public exposure.
nginx overwrites client IP, forwarded host and scheme; web has no published port.
An additional proxy requires an explicit trusted-peer policy and new ingress tests.
Follow `DEPLOYMENT.md` for backups, import validation and production cutover.

Local logs: `/tmp/topica-pg-verify.log`, `/tmp/topica-pg-tests-origin.log`,
`/tmp/topica-runtime-snapshot-verify.log`, `/tmp/topica-pg-image-origin.log`,
`/tmp/topica-ingress-qa.log`, `/tmp/topica-admin-qa.log`,
`/tmp/topica-pg-audit-full.json`, `/tmp/topica-pg-audit-prod.json`.
These `/tmp` artifacts are temporary; this report records their relevant results.
