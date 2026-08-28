# Architecture

## App Router
This project uses Next.js 16 App Router for optimized Server Components and layout-based routing.

## Server / Client Boundaries
Most UI components (`components/sections/*`, pages in `app/`) are strict Server Components.
Only interactive components (Carousels, Accordions, Forms) use `"use client"` and are isolated in `components/ui/*`.

## CMS Service Layer
Located in `lib/cms`. Fetches from Headless WordPress. Uses standard Next.js `fetch` caching and ISR for high performance.
