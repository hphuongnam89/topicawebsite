<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Topica completion and remediation workflow

For website completion, design/UI/UX remediation, CMS, QA, or release work, read
`docs/agent-execution/README.md` and the relevant task in
`docs/agent-execution/IMPLEMENTATION_BACKLOG.md` before implementation. Follow
`DESIGN_UX_SPEC.md`, `ACCEPTANCE_AND_EVIDENCE.md`, and `AGENT_HANDOFF.md` in that
directory for the assigned scope. User instructions remain authoritative.

Treat phase reports as claims to verify. Do not invent research participants,
measurements, Lighthouse scores, official tuition/admission data, or approvals.
Do not mark a task accepted without the required evidence. Before running
mutation/integration tests, isolate DB, uploads, backups, and outbound notifications
from real data; existing CMS tests need this remediation. Preserve other changes.
