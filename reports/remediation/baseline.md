# Remediation Baseline

Date: 2026-08-28

## Repository

- Working tree was already dirty before remediation.
- Existing user and generated changes are preserved.
- Remediation prompt: `MASTER_REMEDIATION_PROMPT.md`.

## Install

- `npm ci`: completed.
- Audit result: 9 vulnerabilities, including 8 moderate and 1 high.
- Sanity-related packages are still installed at baseline.

## Static Gates

| Gate                   | Baseline |
| ---------------------- | -------- |
| `npm run format:check` | PASS     |
| `npm run typecheck`    | PASS     |
| `npm run lint`         | PASS     |
| `npm run build`        | PASS     |
| `npm run test:seo`     | FAIL     |

Build warnings:

- Deprecated default export from `@sanity/image-url`.
- Experimental `localStorage` warning while generating pages.

## Runtime

- Homepage: 200, with a React hydration mismatch in `ProgramsSection` / `Button`.
- News index `/tin-tuc`: 500 because `picsum.photos` is not in the Next Image allowlist.
- Sanity Studio `/admin`: HTTP 200 shell, but the UI is blank and browser requests fail because of CSP, CORS and `demo-project-id`.
- `/logo.png`: 404.
- `/og-image.jpg`: 404.
- `/favicon.ico`: 404.
- Mobile header at 375 px exceeds the viewport and shows the CTA that was intended to be hidden.

## Route Inventory

`docs/architecture/NAVIGATION.json` contains 54 unique internal URLs.

| Result | Count |
| ------ | ----- |
| 200    | 13    |
| 404    | 40    |
| 500    | 1     |

The 500 route is `/tin-tuc`. Missing routes cover most nested introduction, admissions, study, learning-system, news-category and quality-assurance destinations.

## Live WordPress Contract

- `GET /wp-json/wp/v2/pages?slug=gioi-thieu`: valid published page, ID 404.
- `GET /wp-json/wp/v2/posts`: valid published posts.
- WordPress reports 31 published posts at baseline.
- Active categories are available from `/wp-json/wp/v2/categories`.

## Baseline Decision

WordPress REST is reachable and contains the official source content. Phase R1 will restore the WordPress server-only client documented in `docs/foundation/PHASE_4.md` and remove the conflicting Sanity/mock production path.
