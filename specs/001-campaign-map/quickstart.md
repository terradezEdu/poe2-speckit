# Quickstart and Validation Guide

This guide records the current implementation and its verification status. The application setup,
synthetic validation, licensed-source candidate acquisition, reviewed authored content, and Vite
production build now exist. T013 is complete; layout/provenance, publication commands and full
foundation verification remain pending under T014–T016.

## Implementation progress — 2026-10-16

Actual setup, acquisition, and validation checks:

| Command | Result |
|---|---|
| `npm install` | Passed; lockfile generated, 0 vulnerabilities reported. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm run test:unit` | Passed: 26 checks across acquisition, content validation, and deterministic assembly. |
| `npm run build` | Passed: Vite production build created `dist/`. |
| `npm run content:acquire` | Passed against the documented GitHub API: license first, then pinned JSON; four opening records staged. |
| `npm run content:acquisition:check` | Passed offline: candidate integrity and retained MIT notice. This is not factual approval. |
| `npm run content:acquire -- --propose` | Passed against the API; proposal matched the pinned candidate and did not replace it. |

The checked dependency set uses Node 24.21.0, Vite 8.3.4, React 19.3.1, Zod 4.6.7,
TypeScript 6.0.3, Vitest 5.0.5, and Playwright Test 1.64.1. TypeScript was moved from the
planned 7.0 line because the resolved `typescript-eslint` peer range excludes TypeScript 7.

Licensed editorial candidate text is acquired from the pinned GitHub repository snapshot under
the source-specific review in [research.md](research.md#source-acquisition-and-reuse-gate). The
importer does not fetch the separate live guide service. Focused review of 0.5.5b–e patch notes
found no listed change to the imported opening route/reward claims; exact compatibility remains
unverified, and the base 0.5.5 campaign Ritual changes are not covered by the guide. The user
authorized one narrow supplemental publisher; PoE2DB's relevant opening records provided the
missing connections, Mud Burrow hand-in and Beira campaign cold-area threat. T013 is complete
with individual uncertainty preserved in `content/act1-opening.json`. No game images, fonts,
or other game assets were downloaded. `content:validate`, release-snapshot generation, browser
journeys, visual capture, and performance measurement are not yet available or claimed passed.

### T013 authored-content verification

Reviewed on 2026-10-16: five real locations, four sourced connections, three encounters, three
rewards, one point of interest and one sourced Hardcore warning. The root review date records
actual review, while individual exact-hotfix verification remains null. Return-travel rules,
unreviewed combat properties and conflicting reward/defense values remain explicit gaps.

The one-off authored-part schema and shared publication validation passed. The layout below
exists only in memory for checking references and release minima; T014 still owns the actual
layout/provenance files. No public content or fictional fixture records were generated.

```bash
node --input-type=module -e '
import { readFile } from "node:fs/promises";
import { contentSnapshotSchema } from "./src/content/schema.ts";
import { validateAuthoredSnapshot } from "./src/content/validate.ts";
const content = JSON.parse(await readFile("content/act1-opening.json", "utf8"));
contentSnapshotSchema.omit({ presentation: true, assets: true }).parse(content);
const layout = {
  id: "t013-validation-layout", segmentId: content.segment.id,
  coordinateWidth: 1200, coordinateHeight: 800, backgroundAssetId: null,
  nodePositions: content.locations.map(({ id }, index) => ({
    locationId: id, x: 100 + index * 200, y: 200, labelPlacement: "above"
  })),
  connectionPaths: content.connections.map(({ id }) => ({ connectionId: id, points: [] }))
};
const result = validateAuthoredSnapshot({ ...content, presentation: layout, assets: [] }, new Set());
if (!result.success) throw new Error(result.issues.join("\n"));
console.log("T013 schema, graph, references and release minima passed; nothing published.");
'
```

## Licensed source acquisition and updates

The checked-in source lock and candidate live at `content/acquisition.lock.json` and
`content/candidates/act1-opening.poe2overlay.json`. The candidate embeds its MIT notice and
source JSON pointers. It is never served as campaign content. There is no reviewedAt date;
source version 0.5.5 remains distinct from target 0.5.5e. Only original guide text is selected,
and the upstream numerical survival guarantee is excluded.

```bash
npm run content:acquire
npm run content:acquisition:check
```

Acquisition is optional for ordinary builds: the committed candidate supports offline builds.
The acquisition command needs network access to `api.github.com`, makes two public read-only
Contents requests, uses no credentials, and stops on restrictions or rate limits without retries.
It checks the license hash before obtaining game-related text. A failed acquisition leaves the
previous candidate intact. `npm run build` performs only the offline candidate check.

To review a new upstream revision:

1. Recheck GitHub's API terms/access policy and the source's root, directory, and file licenses
   and notices. Inspect changes in provenance; a code license does not authorize extracted game
   tables or third-party assets. Use the documented API, never a denied website endpoint.
2. Select a full immutable commit. Review and update its license/data Git blob and SHA-256 pins,
   declared source patch/update metadata, permission-review date, and any excluded locators in
   the lock. Keep the existing target 0.5.5e and baseline date unless explicitly changed in the
   Spec Kit artifacts with the required approval.
3. Run `npm run content:acquire -- --propose`. It verifies the source pins and stages a separate,
   ignored `.proposed.json`, printing its SHA-256. It does not replace the pinned candidate.
   Compare the proposal against the current candidate and review changed claims and exclusions.
4. Record the reviewed proposal hash in `candidateSha256`, rerun `npm run content:acquire`, then
   the offline check and affected unit/type/lint checks. Commit the lock and candidate together.
5. Independently review facts, patch/variant applicability, graph relationships, and publication
   minima before authoring `content/act1-opening.json`. Preserve unknown/conflict/outdated states,
   source locators, version/date evidence, and license notices. An acquisition/proposal is not a
   source-truth certification or a publication decision.

The authored T013 content combines this pinned guide with one small PoE2DB factual review.
Original versioned observations can resolve the remaining per-claim gaps later. Fully automatic
coverage would require a suitable licensed export/API; no monitoring service, CMS, client-file
extractor or live game integration is introduced.

## Prerequisites

- Node 24 LTS and npm; use the committed lockfile after setup.
- The reviewed content list in [research.md](research.md#game-version-and-release-content-list).
- R1/R2 and the baseline visual direction were approved on 2026-10-16 under FR-015; see
  research.md. Panel layout and information density may adapt for readability and usability.
- Published content must have its real review date, evidence, and asset provenance; see
  [data-model.md](data-model.md) and [content contract](contracts/campaign-content.md).

## Planned release setup after T013–T016

The final release scripts below remain planned until T013–T016 are complete. Current setup,
unit, and build scripts can already be run from the repository root:

```bash
npm ci
npx playwright install chromium firefox webkit
npm run content:validate
npm run typecheck
npm run test:unit
npm run build
```

After T015, content:validate will check the authored campaign, layout, release list, sources,
and provenance; build will also generate the reviewed delivery snapshot. Today, build checks
local acquisition integrity, type-checks, and compiles the application shell. It does not publish
the candidate or manufacture defaults for missing real content.

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
