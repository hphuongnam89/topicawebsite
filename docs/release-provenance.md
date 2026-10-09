# Release provenance and change boundaries

The working tree contains four change classes that must be reviewed and
released separately:

1. Runtime/security: consent, rate limiting, lead delivery, database checks.
2. Analytics/SEO: event consent/deduplication, retention, sitemap/canonical.
3. Content governance: claim registry gates and source-backed copy.
4. Design/audit artifacts: demo assets and generated files under
   `docs/content-audit-2026-10-08/`.

Retention is executable through the `retention-scheduler` Compose service. It logs
success/failure JSON, applies the configured lead and analytics windows, and can
send a failure alert through `RETENTION_ALERT_WEBHOOK`. Set both retention owners
and windows in the deployment record before enabling the service.

PostgreSQL backup is executable through `deploy/backup-postgres.sh`; it writes an
atomic custom-format dump, removes dumps older than `BACKUP_RETENTION_DAYS`, and
logs a machine-readable success record. Schedule it on the deployment host and
perform a restore drill before production cutover.

Generated audit HTML/TXT/JSON is evidence only. Before release, retain only
artifacts named in the release checklist and redact personal data, local paths,
credentials, and internal URLs. `public/demo-assets/topica-learning.jpg` must
carry an owner, source URL, license/consent record, and capture date before it
is treated as a production asset.

Required evidence for a release: `npm run runtime:check`, `npm run verify`,
browser E2E/a11y results, dependency audit, and the exact commit or review
bundle containing only the approved change class.
