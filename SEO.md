# SEO Strategy

- **Metadata**: Generated dynamically in `layout.tsx` and `page.tsx` using `generateMetadata`.
- **Schema.org**: Injected via JSON-LD in `layout.tsx` (EducationalOrganization) and Article pages.
- **Sitemap**: Auto-generated via `app/sitemap.ts`.
- **Robots**: Controlled via `app/robots.ts`. Admin and private API routes are disallowed.
