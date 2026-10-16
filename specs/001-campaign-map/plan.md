# Implementation Plan: Interactive Campaign Map

**Branch**: `main` (actual Git branch) | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-campaign-map/spec.md`

Spec Kit resolves the active feature identifier as `001-campaign-map` through its feature
context; this does not create or switch a Git branch. The actual branch remains `main`.

## Summary

Deliver the confirmed opening Act 1 slice with five connected locations, useful encounter
information, an optional reward destination, and a sourced Hardcore warning. Preserve eventual
full-campaign expansion by keeping content identity, map layout, behavior, and visual assets
separate.

Build a static React/TypeScript application with Vite. Native HTML node buttons and SVG routes
share a D3-controlled camera. A reviewed, validated JSON snapshot supplies all gameplay details
and source metadata. No backend or live game integration is required.

Phase 0 research and Phase 1 design are complete. The named content scope and concrete visual
proposal are in [research.md](research.md). Visual references remain unapproved; FR-015 blocks
visual implementation until actual human approval. Task generation and nonvisual foundations
can proceed. This plan creates no application code or test implementation.

## Technical Context

**Language/Version**: TypeScript 7.0, strict mode; React 19.3; Node 24 LTS; npm lockfile.
Use erasable TypeScript for Node-side content scripts.

**Primary Dependencies**: Vite 8.3 with its compatible React plugin; d3-zoom 3 and d3-selection 3;
Zod 4.6; native CSS. Development dependencies: compatible Vitest, Playwright Test, TypeScript,
React/D3 types, and standard React/TypeScript lint tooling. Resolve stable exact versions and
commit package-lock.json during implementation; dependency compatibility is not yet installed.

**Storage**: Versioned campaign JSON, separate layout JSON, asset provenance, and a generated
same-origin JSON snapshot. Transient browser selection/camera only; no database, cookies,
account state, or persistent player tracking.

**Testing**: Vitest for schema/graph/evidence/state invariants; Playwright Test for user journeys,
fault recovery, screenshots, and timing. Human source review and visual milestone approval
remain distinct from automated checks.

**Target Platform**: Static HTTPS website. Primary Chromium desktop 1280 × 720 and narrow
390 × 844; Firefox and WebKit smoke checks for selection/input/focus. Browser versions and
capture environment are recorded with evidence.

**Project Type**: Single frontend web application, built/deployed as static assets.

**Performance Goals**: Usable map within 3 seconds on the stated baseline; at least 19 of 20
selections show matching details within 300 ms. Preserve the 60-second orientation and
30-second encounter-discovery outcomes. See [quickstart.md](quickstart.md).

**Constraints**: Sources and explicit uncertainty for gameplay claims; no live third-party
content dependency; identifiable asset provenance; human reference approval before visual
implementation and milestone approval before visual acceptance. Keyboard-operable map,
nonmodal readable details, and recoverable failures.

**Scale/Scope**: Exactly the five named first-slice locations and their internal relationships
defined in research.md, ending at The Grelwood with the Mud Burrow branch. Additional acts or
locations are later increments. Data IDs and per-segment layout allow expansion without a
new service architecture or a hard-coded global location limit.

## Constitution Check

*Gate evaluated before Phase 0 and re-evaluated after Phase 1.*

| Principle | Before research | After design and evidence |
|---|---|---|
| I. Visual fidelity | Pass for planning; missing references explicitly recorded | Pass for planning: inspected R1/R2 proposal and coverage gaps in research.md; human approval pending before visual implementation; screenshots/review required later |
| II. Incremental software | Pass: first slice confirmed | Pass: five-location scope and independently demonstrable journeys; expansion deferred |
| III. Specification first | Pass: three clarification answers integrated | Pass: decisions and contracts trace to FR-001–FR-018; no feature code generated |
| IV. Evidence-based quality | Pass: behavioral outcomes specified | Pass: proportional data/browser checks and SC-001–SC-009 validation guide; none falsely reported executed |
| V. Simplicity/maintainability | Pass: no existing stack to preserve | Pass: alternatives evaluated; single app, existing gesture library, separate data/layout, no speculative backend |
| VI. Effective skills | Pass: standard Spec Kit workflow | Pass: focused planning research; design, React, and browser skills inform decisions; no added methodology or mandatory TDD layer |
| VII. Content/assets | Pass: facts and reuse require evidence | Pass for planning: named/source-linked segment, version target, explicit remaining source review, original/licensed asset policy |

No constitutional waivers or unjustified violations are proposed. Pending delivery approvals
are not claimed as passed. The plan proceeds because the specification expressly permits
functional/technical planning while the visual-reference dependency is recorded.

## Project Structure

### Documentation (this feature)

```text
specs/001-campaign-map/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── campaign-content.md
    └── map-interactions.md
```

tasks.md is produced by the subsequent $speckit-tasks command and is not generated here.

### Source Code (repository root)

Planned layout only; these application files do not exist yet.

```text
content/
├── act1-opening.json
├── act1-opening.layout.json
└── assets.json
scripts/
├── validate-content.ts
└── build-content.ts
src/
├── main.tsx
├── app/App.tsx
├── content/
│   ├── schema.ts
│   ├── validate.ts
│   └── loadSnapshot.ts
├── features/campaign-map/
│   ├── CampaignMap.tsx
│   ├── MapStage.tsx
│   ├── LocationDetails.tsx
│   └── useMapCamera.ts
└── styles/
    ├── tokens.css
    ├── map.css
    └── details.css
public/
├── content/act1-opening.json   (generated, not hand-edited)
└── assets/                   (original/licensed images, fonts, and notices)
tests/
├── fixtures/
├── unit/
├── e2e/
├── visual/
└── performance/
```

**Structure Decision**: One application at the root. Source content and presentation remain
separate during authoring; shared schemas validate a combined delivery snapshot. Keep all
first-slice map behavior in a small feature module rather than introducing packages, framework
layers, or a server. Deployment provider selection is not required for implementation.

## Design Decisions and Delivery Boundaries

### Content and runtime

Research establishes 0.5.5e as the target version at baseline 2026-10-16. This is a version
selection, not certification of every claim. Finish source/variant review and assign the real
review date before publishing content. Keep unsupported mechanics and defensive values labeled;
the minimum useful sourced encounter/reward/warning coverage must still be met.

Validate core identity/graph strictly; isolate malformed unrelated optional categories at
runtime. Distinguish unavailable content from unknown gameplay facts. Build validation rejects
all invalid release records. Published details and source identities remain readable when
external source pages are unavailable. No remote facts are fetched on selection or during builds.

### Interaction and rendering

Keep selected location ID independent of the camera; derive visible details from that ID.
D3 handles established gestures; React owns node/detail elements. High-frequency transforms
use refs rather than rerendering every detail section on every pointer movement. Only initial
fit, explicit camera actions, and keyboard reveal reposition the map.

Use native node buttons, normal Tab navigation, explicit camera controls, deterministic close
and focus return, and a nonmodal detail region. Scope gesture interception to the stage.
Reserve desktop detail space and place narrow details below the map to preserve its camera.
See [map-interactions.md](contracts/map-interactions.md) for the observable state contract.

### Visual work and skills

R1/R2 and the provisional palette/type/layout in research.md are concrete candidates for human
review. They are historical appearance references and not reusable product assets. Do not
implement those visual choices as approved until the user's reference decision is recorded.

The frontend-design skill informed terrain-led composition and restrained reading surfaces.
React best-practice rules informed ref-based camera updates and derived selection. The
playwright-cli skill informed real-browser evidence, test locators, and fault validation.
Use these during relevant implementation work; use UX/a11y review skills once an interface
exists. Test-first development can be selected for risky interactions without imposing an
additional project-wide workflow.

### Increment sequence for task generation

1. Establish the runnable toolchain, shared schemas, source-reviewed content, and nonvisual
   functional map foundation. Preserve runnable checkpoints.
2. After reference approval, implement the referenced map appearance and selected-location
   experience, completing keyboard/camera/recovery behavior with browser evidence.
3. Complete useful boss information, sourced Hardcore warning, optional reward details, and
   explicit evidence/uncertainty states within the same slice.
4. Verify timing, narrow viewport, supported-browser smoke checks, asset provenance, and the
   required visual milestones. Expand coverage only after the vertical slice is accepted.

This sequence guides $speckit-tasks; it is not an implementation task list or authorization to
deploy. No additional mandatory approval gates are added.

## Complexity Tracking

No violations require exceptions. Existing library integrations, explicit evidence fields,
and separate layout data address demonstrated requirements; no custom framework, generic CMS,
live scraper, or multi-service architecture is introduced.
