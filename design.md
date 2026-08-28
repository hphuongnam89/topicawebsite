# Topica Program Landing Pages

## Product character

- Genre: editorial / academic.
- Voice: precise, calm, transparent about source evidence.
- Macrostructure: Split Studio — narrative on the left, structured proof on the right.
- Avoid invented outcomes, employer logos, rankings, testimonials, or unsupported metrics.

## Typography

- Display: Lora, upright only.
- UI and body: Be Vietnam Pro.
- Headings wrap safely at narrow widths; CTA labels stay on one line.

## Colour

- Warm paper canvas, near-black ink, restrained Topica gold accent.
- All new program-page colour declarations use semantic tokens from `tokens.css`.
- Blue is reserved for focus indication; red is reserved for source warnings.

## Layout and rhythm

- Content width: 1200px maximum with fluid side gutters.
- Sections alternate between open canvas and lightly ruled paper fields.
- Corners are modest; borders and spacing carry hierarchy instead of decorative cards.
- Mobile order follows reading priority: promise, verified facts, curriculum, outcomes, careers, admissions.

## Components

- ProgramHero: split editorial lead plus verified academic proof panel.
- ProgramQuickFacts: compact definition list; unknown values display “Cần xác nhận”.
- CurriculumExplorer: native disclosure groups with complete source-backed courses.
- StudyRoadmap: nine-semester sequence using credit totals and representative content.
- LearningOutcomes: numbered PLO disclosures.
- ProgramStickyBar: persistent two-action conversion bar with safe-area support.
- PendingAcademicSections: source-status view for programs that only have current CMS copy.

## Motion and interaction

- Native disclosure transitions only; no scroll choreography or looping decoration.
- Buttons use restrained hover/press feedback and visible focus rings.
- Respect `prefers-reduced-motion`.

## Evidence rules

- `verified`: copied or faithfully condensed from the source document.
- `derived`: arithmetic or grouping directly computed from verified source rows.
- `need_confirmation`: unresolved contradiction or missing source field; never replaced by an estimate.
- A page may enter the typed registry as `cms_only`, but all academic fields remain empty or
  `need_confirmation` until its own academic source is available.
