---
target: Topica homepage and remediation-plan completeness
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\Hp\\Downloads\\topica\\topica\\topica-edu\\app\\(main)\\page.tsx"
target_fingerprint: "sha256:6dd6552a60a088af10aeb553c3aed2a5bef7e5b7823fc774012d0c7651f26891"
target_path: "C:\\Users\\Hp\\Downloads\\topica\\topica\\topica-edu\\app\\(main)\\page.tsx"
timestamp: 2026-10-12T14-02-01Z
slug: app-main-page-tsx
---
# Critique — Topica homepage and remediation plan

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 2/4 | Admission status differs between homepage and program catalogue in the reviewed fixture. |
| 2 | Match System / Real World | 2/4 | The program-page “Xem trạng thái hồ sơ” CTA leads to a program anchor; the homepage application CTA destination and degree claim still need source verification. |
| 3 | User Control and Freedom | 2/4 | Menu Escape/focus return worked in the sampled state, but the long mobile page raises the cost of finding another path. |
| 4 | Consistency and Standards | 2/4 | Typography, CTA colors and heading sizes vary across templates. |
| 5 | Error Prevention | 2/4 | Misleading CTA semantics and inconsistent admission state can cause a wrong next step. |
| 6 | Recognition Rather Than Recall | 3/4 | The navy hero and primary paths are visible; decision information remains spread across the page. |
| 7 | Flexibility and Efficiency | 1/4 | The sampled marketing path offers few shortcuts; this is a lower priority than trust and clarity. |
| 8 | Aesthetic and Minimalist Design | 2/4 | The hero is clear, while the colored floating actions compete and the mobile page is long. |
| 9 | Error Recovery | 2/4 | Form/network recovery states were not fully checked in the baseline review. |
| 10 | Help and Documentation | 2/4 | Support is present, but contextual findability has not been verified. |
| **Total** | | **20/40** | **Acceptable; material improvements are needed before the full experience is ready.** |

These are provisional ratings of the current interface based on source, saved screenshots and the 12 October baseline review. No fresh live browser review was possible, so they are not a runtime or usability-study result. They do not score the written plan itself.

## Design Specificity Verdict

The visual direction is strongly Topica-specific: navy and selective Lora support an academic tone, and the review identifies a useful bento region and mobile tuition cards. The plan correctly treats Topica’s design spec and verified content as authoritative instead of imposing generic neon, OKLCH, Shadcn or animation recipes. The updated plan now explicitly records Narrative Workflow (#15), the token authority, restrained visual focus and motion policy.

The plan maps all nine findings to seven owner-scoped packages and now includes an exact T01 component-order crosswalk, source checks for the homepage degree claim and “Đăng ký xét tuyển” destination, and a single HUI-08 integration owner. Remaining admissions, degree and media confirmations are external content gates, not omissions from the plan.

**Deterministic scan:** the bundled detector scanned `app/(main)/page.tsx` and returned `[]` with exit code 0: zero findings, no rules or locations, and no detector false positives. This checks markup patterns only; it cannot establish copy truth, runtime destinations or visual quality.

## Overall Impression

The original plan was nearly complete but left room for different agents to reorder the homepage differently, miss the high-stakes hero claim/action check, or conflict over floating-action ownership. Those gaps are now explicit in the remediation plan. It is ready to hand off for implementation, with business-dependent subparts remaining blocked until a named Topica owner supplies evidence.

## What’s Working

- The plan separates work that can proceed with fixtures from decisions that need official content, rights or service URLs.
- It preserves existing interaction behavior worth keeping, including menu Escape/focus return and accordion behavior observed in the sampled baseline.
- It records a safe screenshot strategy after two full-page CDP timeouts and requires isolated DB/storage/notification behavior for tests.

## Priority Issues

1. **[P1] Homepage order and mobile decision path.** The baseline puts the program catalogue around y=2467px and the consultation form around y=9220px on the measured mobile capture; these are positions, not conversion or time measures. The updated plan maps `HeroSection` → `CurrentAdmissions` → `ProgramsSection` → verified trust proof → learning experience → tuition/admissions path → approved stories → news → one contact/form section, while preserving the T01 spec and anchors. Keep all five programs comparable; do not apply an arbitrary four-option limit. Suggested command: `$impeccable layout`.
2. **[P1] High-stakes hero claim and application action.** The source says the bachelor’s degree is recognized by Bộ GD&ĐT and labels the CTA “Đăng ký xét tuyển.” The evidence does not establish that the claim is false, but the exact claim, applicable program, official source, reviewer and final CTA URL must be checked before public acceptance. The updated plan adds these records and a neutral fallback. Suggested command: `$impeccable clarify`.
3. **[P2] Floating-action ownership and consistency.** Three cyan/blue/red desktop support buttons compete with the navy/gold system, while sticky actions also appear on program pages. The updated plan assigns HU-02 token/color work and HU-04 placement, stacking, focus and integration ownership. Suggested command: `$impeccable adapt`.

## Persona Red Flags

- **Jordan, first-time visitor:** may take “Đăng ký xét tuyển” literally and rely on the degree-recognition statement. Check the destination and source before relying on either.
- **Casey, distracted mobile visitor:** may not reach the consultation form after a long sequence of sections. Check the shortened content order, contextual CTA and sticky behavior.
- **Riley, deliberate tester:** will try an absent/expired admission round, mislabelled CTA, missing anchor and missing source. Check fallback, final URL and recovery behavior.

These persona walkthroughs are design scenarios, not recruited participants or R20 user research.

## Minor Observations

The five-program catalogue should remain visible and comparable, as required by `DESIGN_UX_SPEC.md`; reduce cognitive load through grouping and visual hierarchy instead of removing a program. Do not treat the detector’s zero findings as evidence that the page is correct.

## Questions to Consider

- What exact source and program scope must be visible or linked before the degree-recognition statement can stay in the hero?
- Does the shorter T01 journey help the learner decide before asking for contact details, while retaining the five-program comparison?
- Should support actions become one grouped control, or stay separate with quieter visual weight?
