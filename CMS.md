# CMS Guide

- Headless WordPress is used for easy editorial workflows.
- Content is queried via REST API in `lib/cms/queries.ts`.
- Revalidation uses Next.js tag-based ISR.
- Content is sanitized before rendering (`sanitize-html`) to prevent XSS.
