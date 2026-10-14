# Backend remediation baseline — Wave 0

Date: 2026-10-14 (Asia/Ho_Chi_Minh)

## Source snapshot

- Repository: `/Users/nam/Downloads/topica-edu`
- Branch / HEAD: `main` / `322a8719e7d3a36e3da62fbb317a89c1b48e5791`
- Working tree: dirty before remediation (39 tracked/untracked status entries); preserve all pre-existing edits.
- Runtime: Node `v26.7.0`, npm `11.19.0`; project engine declares Node `22.x`.
- Installed Next.js: `16.4.0`.

## Evidence boundary

- The supplied audit is a static-source audit plus local checks, not a production assessment.
- Earlier same-day audit reported 291/291 tests, backend lint, and typecheck passing on Node 26; those results are historical and do not validate this remediation.
- The current tree includes uncommitted dependency updates to Next.js 16.4.0; a prior same-day `npm audit --omit=dev` on that updated dependency tree reported zero advisories. Re-run on the final tree before release.
- No production database, `.env`, backups, uploads, proxy/WAF, or hosting configuration was inspected or changed.
- No build, migration, mutation/integration test, backup/restore, or production action is authorized or evidenced by this baseline.

## Release boundaries

- Do not execute migrations against a real database as part of source remediation.
- Mutation tests must use a disposable DB and isolated uploads/backups, with outbound notifications stubbed.
- Node 22 compatibility, clean-checkout Docker build, deployment proxy trust, and production restore remain unverified.
