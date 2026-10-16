# Quickstart and Validation Guide

This is the planned run guide for the implementation produced after task generation.
There is no package.json or runnable application at planning time. The commands below define
the script interface implementation must supply; they have not been run or claimed to pass.

## Prerequisites

- Node 24 LTS and npm; use the committed lockfile after setup.
- The reviewed content list in [research.md](research.md#game-version-and-release-content-list).
- R1/R2 and the baseline visual direction were approved on 2026-10-16 under FR-015; see
  research.md. Panel layout and information density may adapt for readability and usability.
- Published content must have its real review date, evidence, and asset provenance; see
  [data-model.md](data-model.md) and [content contract](contracts/campaign-content.md).

## Setup after implementation

Run from the repository root:

```bash
npm ci
npx playwright install chromium firefox webkit
npm run content:validate
npm run typecheck
npm run test:unit
npm run build
```

content:validate checks the authored campaign, layout, release list, sources, and provenance.
build repeats content validation, generates the combined JSON snapshot, type-checks, and builds
the application. Invalid release data must fail the command rather than manufacture defaults.

For interactive exploration:

```bash
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173/. For production behavior use:

```bash
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

## Planned automated verification

```bash
npm run test:e2e
npm run test:visual
npm run test:performance
```

Playwright starts the production preview when required; it must not test the development server
for production timing. Functional projects are chromium-desktop (1280 × 720), chromium-narrow
(390 × 844), firefox-smoke, and webkit-smoke. The visual and performance scripts select their
own test groups. Tests must not rely on installed global playwright-cli.

| Check | Expected result | Requirement coverage |
|---|---|---|
| Content validation and unit checks | Reject malformed graph/evidence/metadata/provenance; preserve unknown versus zero; verify meaningful state transitions | FR-001–FR-002, FR-007, FR-010–FR-011, FR-017–FR-018 |
| Desktop/narrow browser journeys | Select every included node, read matching details, inspect warnings/rewards/sources, and recover overview | FR-003–FR-009, FR-013 |
| Keyboard journey | Visible focus; reach all nodes and controls, open/close details, restore originating focus | FR-004–FR-005, FR-012 |
| Fault journeys | Scoped unknown/unavailable states, retry, missing artwork, source outage, and rapid selection remain usable | FR-010–FR-014, FR-018 |
| Browser screenshots and review | Actual images of five specified states; approval recorded separately | FR-015–FR-017 |
| Snapshot applicability | Target version and real review date visible globally and in details; no live source dependency | FR-018 |

Use role/name locators, isolated browser contexts, and controlled network responses for fault
cases. Test fixtures may contain fictional long/similar names and multiple encounters, but
must not be bundled into published content. Vitest checks data and state risks rather than
duplicating all browser assertions. There is no coverage percentage gate.

Browser traces and reports should identify the failing journey. A failed critical journey
blocks acceptance. Do not weaken requirements or regenerate accepted screenshots merely to
remove a failure.

## Manual acceptance journeys

1. From a fresh overview, identify coverage, open a location, and find its connected destination
   within 60 seconds without instructions (SC-001).
2. Open the release's documented boss location. Find damage, defenses or explicit unknowns,
   mechanics, and the relevant Hardcore danger within 30 seconds (SC-003).
3. Inspect Mud Burrow and its reviewed reward/hand-in conditions. Follow the evidence links
   without losing map selection. Verify that any unresolved reward level remains explicit.
4. Pan and zoom, select another node, close its details, then restore Overview. Selection,
   camera, and focus must follow [the interaction contract](contracts/map-interactions.md).
5. Repeat the core reading and selection journey with only the keyboard, then at 390 × 844.
   Confirm long text, warning meaning, source links, and map controls remain usable.

Record actual outcomes. Human discovery checks measure information findability, not just
automated element presence.

## Performance acceptance

Use a production build and fresh Chromium context with cold cache at 1280 × 720. Record build
revision, browser/OS, machine, viewport, cache condition, and a repeatable 10 Mbps download
profile with stated upload/latency settings. Do not represent these as tests on every device.

Measure from navigation start to a painted usable map with nodes, connections, controls, and
snapshot metadata: at most 3 seconds. Then measure 20 successive input-event-to-painted-correct-
details selections. Report all samples; at least 19 must complete within 300 ms. Incorrect
location details fail regardless of speed. Use browser-clock timestamps, not Playwright command
duration. Do not apply retries that hide a failing timing run.

Chromium network shaping can use the official
[CDPSession interface](https://playwright.dev/docs/api/class-cdpsession). These are local
acceptance measurements, not a new telemetry service.

## Visual acceptance

Use the concrete [R1/R2 baseline](research.md#4-visual-reference-proposal--approved-baseline)
approved by the user on 2026-10-16, including its documented coverage gaps and adaptations.
Panel layout and information density may adapt for readability and usability. Reference approval
is recorded in research.md and does not authorize copying its assets or approve implemented milestones.

After implementation, capture overview, selected details, encounter warning, keyboard focus,
and narrow-screen images. Pin the capture environment and wait for the relevant fonts/assets.
Use a meaningful approved reference comparison across layout, atmosphere, typography,
composition, colors, textures, and interaction states. Document adaptations and significant
deviations alongside the screenshots.

The human reviewer separately approves the overview and detail milestones. Record the build,
screenshot artifact locations, approved reference IDs, actual reviewer decision/date, and any
accepted deviations in the existing feature artifacts. Do not prefill approval metadata.
Only reviewed images can become regression baselines; pixel equality never supplies human
approval. See [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots).

## Completion boundary

Accept the feature only when SC-001–SC-009 have evidence, critical failures are resolved,
published facts pass source review, asset provenance is recorded, and required visual approval
is received. Functional success can be reported independently while visual acceptance remains
pending. Hosting deployment and campaign expansion are subsequent authorized work.
