---
description: "Executable tasks for the opening Act 1 interactive campaign map"
---

# Tasks: Interactive Campaign Map

**Input**: Design documents from `/specs/001-campaign-map/`: spec.md, plan.md, research.md, data-model.md, contracts/campaign-content.md, contracts/map-interactions.md, and quickstart.md; constitution v1.0.0.

**Prerequisites**: Design artifacts, application setup, schemas, validators, and reviewed authored content exist. Release layout/provenance and delivery generation remain pending. Actual Git branch is `main`; `001-campaign-map` is the feature identifier, not an instruction to create or switch branches.

**Tests**: Include meaningful Vitest and Playwright checks because the specification's acceptance scenarios, interface contracts, and constitution require automated verification of critical journeys. Add the relevant checks before implementation and confirm they expose the missing behavior. This does not impose an additional project-wide TDD process or a coverage target.

**Organization**: Setup → shared foundations → US1 (P1) → US2 (P1) → US3 (P2) → cross-cutting acceptance. T029 is complete following actual user approval on 2026-10-16. T013 is complete after review of the pinned MIT guide and one user-authorized supplemental publisher, PoE2DB, for a small set of opening facts. The real authored dataset has the required graph, optional reward and sourced Hardcore threat, with individual unknowns/conflicts preserved. The acquisition candidate remains unreviewed and unpublished; delivery generation is pending. No game assets were acquired. Other tasks remain unchecked until their work and verification are complete.

## Format: `[ID] [P?] [Story] Description`

- `[P]` identifies work on different files that can run concurrently once its stated prerequisites are complete. It does not override phase or explicit task dependencies.
- `[US1]`, `[US2]`, and `[US3]` map to the numbered stories in spec.md. Shared phases have no story label.
- Paths are relative to the repository root. Application files use `src/`, authoring uses `content/`, generated delivery uses `public/content/`, and verification uses `tests/`.
- Quoted model rules below are verbatim constraints from data-model.md; implement all fields listed there, not just the quoted examples.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the smallest runnable static React/TypeScript application and its verification tools.

- [X] T001 Initialize the Vite React application in `package.json`, `package-lock.json`, `.nvmrc`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `src/main.tsx`, and `src/app/App.tsx`; use Node 24 LTS, strict/erasable TypeScript, native CSS, focused d3-zoom/d3-selection, Zod, and compatible React tooling from plan.md; verify actual stable package availability/compatibility before pinning exact versions, document any necessary baseline correction in `specs/001-campaign-map/plan.md`, and keep the app runnable.
- [X] T002 Configure linting and scripts for `dev`, `preview`, `typecheck`, and `lint` in `eslint.config.js`, `package.json`, and the TypeScript configurations; permit explicit `.ts` imports for Node-side shared modules without a new script runner and exclude generated/build/test output in `.gitignore`.
- [X] T003 Configure Vitest in `vitest.config.ts` and `package.json` with `test:unit`, deterministic fixture loading, and tests under `tests/unit/`; do not introduce a duplicate component-testing framework or percentage gate.
- [X] T004 Configure Playwright Test in `playwright.config.ts` and `package.json` with `test:e2e`, `test:visual`, and `test:performance`, production-build/preview startup, Chromium 1280 × 720 and 390 × 844 projects, Firefox/WebKit selection-input-focus smoke projects, isolated contexts, and useful failure traces; timing must use production output and test fixtures must stay outside the shipped bundle.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide schemas, reviewed release inputs, and a reproducible content build shared by all stories. This phase blocks story implementation, but requires no reference approval or visual styling.

**T013 source preparation and completion (2026-10-16)**: Audited official APIs/exports, community datasets, access
policies, and licenses in research.md. Implemented `scripts/acquire-content.ts` and
`scripts/lib/acquire-guide.ts` with an immutable source lock, MIT notice, scoped text candidate,
update-proposal mode, and offline build checks. The real two-request import passed. This resolves
permission for the selected pinned GitHub snapshot only; the external live guide service is a
separate source and is not requested by the importer. Focused review found no listed 0.5.5b–e
change to imported opening route/reward claims, but the base patch added campaign Ritual content
not covered by the candidate. The user then authorized one narrow supplemental source. A small
PoE2DB factual review supplied the four connections, Mud Burrow conditions and Beira campaign
damage evidence. Authored `content/act1-opening.json` with a real review date, original summaries,
and individual uncertainty. The authored schema and graph/reference/release-minimum checks passed
using an in-memory validation layout. No claim is silently marked verified for the exact hotfix.
T013 is complete; no real public snapshot was generated. Keep T014–T016 unchecked.

- [X] T005 Create synthetic valid/invalid snapshot fixtures in `tests/fixtures/campaign.ts` and `tests/fixtures/content-faults.ts` covering long/similar names, multiple encounters/rewards/warnings, unknown versus documented zero, conflicting/outdated claims, broken core/optional categories, invalid dates/protocols/references, and disconnected coverage; separate these from real authored content.
- [X] T006 Write schema, graph, evidence, publication, and deterministic assembly checks in `tests/unit/content-validation.test.ts` and `tests/unit/content-build.test.ts` against the campaign-content contract; cover the five-location list, unsupported schema, every minimum release condition, draft versus publishable dates, missing provenance, and rejection without replacing an existing delivery artifact.
- [X] T007 Define shared EvidenceValue and identity primitives in `src/content/schema.ts`, including "IDs are immutable ASCII slugs, unique within an entity collection", "null for unknown", "documented, uncertain, conflicted, outdated, or unknown", "fact or editorial-advice", "nonempty for documented values", "Exact supported version if established; otherwise null", "ISO date of the claim review if performed; otherwise null", and "Required explanation for uncertain, conflicted, outdated, or unknown values"; preserve documented zero independently from unknown and require identitySourceIds for plain-text identities.
- [X] T008 Extend `src/content/schema.ts` with ContentSnapshot, CampaignSegment, Location, and Connection fields and constraints: schemaVersion "Integer 1; contract compatibility, independent of game version", snapshotId "Unique release slug; changes whenever reviewed content changes", targetGameVersion "Nonempty exact game version; research target currently 0.5.5e", researchBaselineDate "ISO date; current research baseline 2026-10-16", reviewedAt "ISO date assigned after actual review; required for publication", "Dates must be real dates and researchBaselineDate must not follow reviewedAt", "The release's included IDs must match the five-location list; endpoint is act1-grelwood", progressionRole "town, main-route, or optional", and traversalDirection "forward-only, bidirectional, conditional, or unknown"; preserve unknown roles, evidence-bearing descriptions/conditions, informational external boundaries, and deliberate ID reading order.
- [X] T009 Extend `src/content/schema.ts` with Encounter and mechanics fields, preserving "physical, fire, cold, lightning, or chaos evidence entries", "include a percentage only if applicable to the reviewed campaign variant", "Weaknesses are independently evidenced descriptions, never computed from an omitted resistance", and "Mechanics have stable local IDs and evidence-bearing description, trigger, and response guidance"; keep distinct encounter identities and unknown properties representable.
- [X] T010 Extend `src/content/schema.ts` with all Reward, PointOfInterest, and HardcoreWarning fields, including "handInLocationId (nullable)", "encounterId (nullable)", "avoidanceAdvice (nullable)", and "Threat, trigger, consequence, and any avoidance advice carry evidence status"; require evidence-bearing benefit/conditions/progressionRole and preserve known acquisition conditions separately from unknown reward quantity/level.
- [X] T011 Extend `src/content/schema.ts` with SourceEvidence, MapLayout, and AssetProvenance, preserving "publishedAt (nullable)", "applicableGameVersion (nullable)", "reuseNote (nullable)", sourceType "official-patch, first-hand-observation, extracted-game-data, and community-guide", "Only http/https links are allowed", "backgroundAssetId (nullable)", "finite x/y coordinates", "optional assetId", "Every included location needs one position; every internal route needs a path or a straight-path default", origin "original, licensed, or permission", and "sourceUrl (nullable for original work)"; require source locators and all creator/license/attribution/modification metadata without requiring remote source access.
- [X] T012 Implement publication and runtime-boundary validation in `src/content/validate.ts` using the shared schemas: reject duplicate/dangling IDs, self-loops/duplicate relationships, disconnected internal coverage, invalid segment membership or layout, unexplained/unsourced documented claims and routes, unlisted/nonpackaged asset paths, missing origin, and incomplete release minima; enforce "A warning belongs to the location and, when specified, an encounter at that same location"; keep build validation strict while runtime can isolate unavailable optional categories without treating them as unknown knowledge or verified absence.
- [X] T013 Review the existing research sources and relevant current/versioned evidence, then author the minimum real dataset in `content/act1-opening.json` and record review outcomes in `specs/001-campaign-map/research.md`: exactly Riverbank, Clearfell Encampment, Clearfell, Mud Burrow, and Grelwood; the four listed relationships; endpoint Grelwood; nonactionable continuation notices; at least one campaign boss, optional Mud Burrow benefit/conditions or explicit gaps, and one actually sourced Hardcore threat; reconcile variants, travel restrictions, and reward-level conflicts, retain individual uncertainty, write original summaries, and assign reviewedAt only after review. Keep the established 0.5.5e/2026-10-16 research target unless evidence requires an explicit artifact correction; do not silently retarget to a later patch.
- [ ] T014 Author the five-node coordinate layout in `content/act1-opening.layout.json` and the initial provenance manifest in `content/assets.json`; use one coordinate system, explicit label placements and route control points where needed, reference only licensed/original packaged assets, and allow a null background plus an empty asset collection for the functional checkpoint. Later approved artwork extends these same inputs.
- [ ] T015 Implement `scripts/validate-content.ts` and `scripts/build-content.ts` and wire `content:validate`, `content:build`, and `build` in `package.json`; validate authored inputs and the exact release list before atomically generating `public/content/act1-opening.json`, consume no live third-party facts during builds, preserve prior output on validation failure, and make build run content validation/generation, typechecking, and Vite compilation.
- [ ] T016 Run the foundational checks and record actual commands/results plus any source gaps in `specs/001-campaign-map/quickstart.md`; verify a clean lockfile install, content validation, typechecking, unit checks, and production build, and ensure generated content contains no fictional fixture records or fabricated review dates.

**Checkpoint**: A runnable app and validated, source-reviewed minimum snapshot exist. Data preparation already satisfies release minima; US2/US3 add useful specialist reading experiences and any reviewed enrichment. This avoids shipping a fictional US1 dataset while deferring detailed rendering.

---

## Phase 3: User Story 1 — Explore connected campaign locations (Priority: P1) — MVP

**Goal**: Explore the bounded map, follow truthful connections, select matching location information, and recover camera/focus reliably.

**Independent Test**: Open the map, identify Act 1 coverage/version/review date, select two locations, identify a connected destination, pan/zoom, close details, and restore Overview. Repeat by keyboard and at both required viewports. Selection, camera, focus, source identity, and loading/retry behavior remain consistent without specialist boss/reward panels.

### Tests for User Story 1

- [ ] T017 [P] [US1] Write the campaign-content loading contract checks in `tests/unit/load-snapshot.test.ts` and `tests/e2e/content-loading.spec.ts`: deployment-base-aware GET, loading, HTTP/JSON/schema/core failures, fresh Retry, superseded response suppression, same-session snapshot consistency, unavailable optional categories, broken decorative assets, and offline external evidence; valid local identity/details must remain readable and unvalidated claims must never render.
- [ ] T018 [P] [US1] Write exploration and interaction-contract checks in `tests/e2e/map-exploration.spec.ts` and `tests/e2e/map-keyboard.spec.ts`: every real node maps to matching details, single/rapid/repeated selection, long labels, sourced routes with direction/access uncertainty, outside-coverage notices, synchronized SVG/HTML camera, stage/node drag suppression, wheel/pinch/control zoom, Overview, resize, focus-only reveal, close/Escape focus return (including after scrolling narrow-screen details: returned focus is visible, page scrolling occurs only as needed, and the map camera transform is preserved), normal page/detail scrolling, reduced motion, 44 CSS-pixel targets, and desktop/narrow reachability; tag a small Firefox/WebKit selection-input-focus subset.
- [ ] T019 [US1] Implement `src/content/loadSnapshot.ts` with a deployment-base-relative same-origin request, shared core/category validation, abort/request-generation protection, fresh Retry, and explicit available/unavailable categories; keep one accepted snapshot per session and serve selection details from it without per-location or external requests.
- [ ] T020 [US1] Implement the application load/selection shell in `src/app/App.tsx`: "loading → ready or error; error → loading via Retry; ignore superseded request completions", selectedLocationId "null or one valid included ID; selecting another replaces details synchronously", focusedLocationId "Independent from selection; focus alone does not open details", and lastActivatedLocationId "Most recently activated node; close returns focus there"; preserve still-valid selection and usable camera on retry, reset to unselected overview on page reload, and render affected-content feedback with Retry.
- [ ] T021 [US1] Implement functional `src/features/campaign-map/CampaignMap.tsx` and `src/features/campaign-map/MapStage.tsx` with native named node buttons in segment reading order, stable IDs, SVG connections and boundary notices, snapshot/coverage labels, source-backed route information, and one shared authored coordinate space; establish a plain usable map before approved appearance work.
- [ ] T022 [US1] Implement `src/features/campaign-map/useMapCamera.ts` using focused D3 listeners and refs for camera "One finite x/y/scale transform owned by map behavior; independent of detail selection"; handle stage pan/wheel/pinch, bounded explicit transforms, initial/Overview fitting that includes labels, keyboard controls and minimal focus reveal, stable viewport resizing, node-drag click suppression, listener cleanup, and gesture exclusions for controls/links/detail scrolling without high-frequency detail rerenders.
- [ ] T023 [US1] Implement reusable plain-text evidence presentation in `src/content/EvidenceValue.tsx` and `src/content/SourceDetails.tsx`: adjacent status/advice/conflict/outdated/unknown labels, relevant version/review metadata, source title/publisher/locator readable offline, protocol-validated links with opener isolation, and no inferred patch compatibility from source access dates.
- [ ] T024 [US1] Implement `src/features/campaign-map/LocationDetails.tsx` with location heading, summary, campaign context, available categories and explicit no-documented-information/unavailable states, per-location snapshot applicability, connected-destination evidence, and nonmodal region semantics; derive all displayed content from the selected ID so no stale location facts persist.
- [ ] T025 [US1] Integrate camera, selection, and accessible detail behavior in `src/features/campaign-map/CampaignMap.tsx` and `src/features/campaign-map/MapStage.tsx`: keyboard activation focuses the detail heading, pointer activation retains node focus, focus alone never selects, close/Escape clears selection and restores focus to the latest origin while preserving the map camera transform and scrolling the page only as much as needed to make returned focus visible, and Overview changes camera without changing selection.
- [ ] T026 [US1] Add the minimum functional layout in `src/styles/map.css` and `src/styles/details.css` and import it in `src/main.tsx`: reserve desktop detail space, place narrow details below a stable stage, keep labels/controls readable and reachable at 44 CSS-pixel minimum hit size, show visible focus/selection, and honor reduced motion; defer terrain, palette, typography, textures, and ornamental decisions until T029.
- [ ] T027 [US1] Add camera invariant checks in `tests/unit/map-camera.test.ts` and run the US1 loading/exploration/keyboard suites against the built app; cover finite bounded transforms, label-inclusive fit and minimal reveal, then record actual core/fault/narrow/browser results in `specs/001-campaign-map/quickstart.md` without duplicating the browser suite with component snapshots.
- [ ] T028 [US1] Record the functional US1 checkpoint and unresolved visual dependencies in `specs/001-campaign-map/quickstart.md`; confirm the reviewer can identify coverage and inspect two connected locations, distinguish functional progress from visual acceptance, and keep specialist features out of this checkpoint's completion claim.

### Reference approval and visual implementation for User Story 1

**Existing required gate — satisfied**: T029 was completed by actual user approval on 2026-10-16, recorded in research.md. T030–T034 may proceed when their technical prerequisites are ready. Panel layout and information density may adapt for readability and usability; do not request the same baseline approval again. Later overview/detail milestone reviews remain required.

- [x] T029 [US1] Present the concrete R1/R2 reference proposal and accompanying baseline direction from `specs/001-campaign-map/research.md` and record actual user approval dated 2026-10-16 in that file; panel layout and information density may adapt for readability and usability, coverage gaps remain documented, and artwork permissions and implemented overview/detail milestone approvals remain separate.
- [ ] T030 [US1] After T029 approval, prepare original or appropriately licensed terrain, markers, textures, and approved self-hosted fonts in `public/assets/` with their license notices; update `content/assets.json` and `content/act1-opening.layout.json` with provenance for every distributed visual asset. Apply frontend-design guidance and imagegen only if a raster asset is chosen; do not redistribute reference screenshots or assume proprietary asset permission.
- [ ] T031 [US1] After T030, implement the approved map composition, atmosphere, title/body typography, terrain, marker/route/focus/selected states, and restrained framing in `src/styles/tokens.css` and `src/styles/map.css`; calibrate to approved R1/R2 coverage and documented adaptations, preserve contrast/readable labels and functional fallbacks, and keep ornamental UI limited to working product controls.
- [ ] T032 [US1] After T030, implement the approved desktop reading surface and narrow details composition in `src/styles/details.css` and `src/features/campaign-map/LocationDetails.tsx`; preserve the camera, nonmodal reading/focus flow, scrolling, text hierarchy, source accessibility, and long-name behavior rather than making selection resize the map stage.
- [ ] T033 [US1] After T031–T032, add actual-browser overview, selected-location, keyboard-focus, and narrow screenshot capture in `tests/visual/campaign-map.spec.ts`; pin browser/OS/viewport/font readiness and capture metadata, compare against the approved references across all FR-015 visual dimensions, and link artifacts/deviations in `specs/001-campaign-map/quickstart.md` without calling capture or pixel equality human approval.
- [ ] T034 [US1] Obtain and record the actual human overview milestone decision against T033 evidence in `specs/001-campaign-map/quickstart.md`, implement reviewed corrections in `src/styles/map.css` and related map files as needed, and recapture affected images; keep selected-detail milestone acceptance explicitly pending until the complete encounter/reward experience is reviewed in T055.

**Checkpoint**: US1 is independently usable. Its functional checkpoint is T028; its full visual work also requires T029–T034. MVP delivery must not claim the later detail milestone or the full feature is accepted.

---

## Phase 4: User Story 2 — Prepare for a boss and recognize Hardcore dangers (Priority: P1)

**Goal**: Present useful boss preparation information, explicit evidence gaps, and sourced Hardcore dangers without a separate mode.

**Independent Test**: Open a reviewed boss location and find damage, mechanics, independent defenses/weaknesses or explicit unknowns, and its Hardcore threat. Open a no-documented-boss location, inspect a source without losing selection, and verify an unknown resistance never becomes zero or a safety promise. A reviewer must find the boss preparation information within 30 seconds.

### Tests for User Story 2

- [ ] T035 [P] [US2] Write encounter/evidence contract checks in `tests/unit/encounter-evidence.test.ts` covering separately sourced defenses/weaknesses, documented zero versus null, multiple mechanics/warnings, unsupported campaign variants, advice labels, and no inference of safety or weakness from absent records.
- [ ] T036 [P] [US2] Write browser acceptance checks in `tests/e2e/encounter-preparation.spec.ts` for labeled boss properties, adjacent uncertainty/conflict/outdated evidence, visible text/icon Hardcore threats and sourced advice, source links and offline identity, snapshot version/date globally and in details, no documented boss, multiple encounters, category-isolated failures, and rapid cross-location switching at both viewports.

### Implementation for User Story 2

- [ ] T037 [US2] Review and enrich encounter/warning claims in `content/act1-opening.json`, updating source locators, actual claim review dates and `specs/001-campaign-map/research.md`; distinguish the relevant campaign variants, independently source damage/resistance/weakness/mechanic claims, validate the Beira danger candidate before use, retain unsupported percentages/timings as unknown, label preparation advice editorial, and update snapshotId/reviewedAt after the reviewed content change.
- [ ] T038 [US2] Implement `src/features/campaign-map/EncounterDetails.tsx` using shared evidence components to display distinct encounter identities and labeled damage, resistances, weaknesses, and mechanics with description/trigger/response guidance; include explicit unknown properties, no-documented-boss and category-unavailable states, and never infer missing numeric values or variant applicability.
- [ ] T039 [US2] Implement `src/features/campaign-map/HardcoreWarning.tsx` with individually identifiable threat/trigger/consequence, optional sourced avoidance advice, textual danger meaning plus an icon, adjacent evidence/advice labels, and explicit no-documented-warning wording that promises no safety; apply reference-dependent styles only after T029.
- [ ] T040 [US2] Integrate encounter and location/encounter warnings into `src/features/campaign-map/LocationDetails.tsx` and `src/styles/details.css` without a mode switch, duplicate warnings, stale location identity, or camera changes; keep source metadata and snapshot applicability reachable in the reading flow, and preserve other categories when encounter content is unavailable.
- [ ] T041 [US2] Extend `tests/visual/campaign-map.spec.ts` with an actual-browser encounter-warning state after T029 and US2 integration, verifying warning meaning without color alone and readable long encounter content; compare to approved reference coverage/adaptations and record screenshots, deviations, and actual unit/browser outcomes in `specs/001-campaign-map/quickstart.md`.
- [ ] T042 [US2] Run the independent boss preparation journey with a human reviewer and record actual discovery time and any information gaps in `specs/001-campaign-map/quickstart.md`; resolve critical findability/content problems in `src/features/campaign-map/EncounterDetails.tsx`, `src/features/campaign-map/HardcoreWarning.tsx`, or `content/act1-opening.json` and repeat the affected checks until SC-003 is evidenced, without claiming a visual milestone approval from this timing check.

**Checkpoint**: US2 is independently demonstrable on the shared map; source-backed danger and unknown properties remain understandable even when external pages fail.

---

## Phase 5: User Story 3 — Discover useful rewards and points of interest (Priority: P2)

**Goal**: Explain a connected optional destination's benefit and known conditions while preserving uncertainty and distinct reward identities.

**Independent Test**: Inspect Mud Burrow, identify its reviewed benefit, acquisition/hand-in conditions or explicit gaps, optional role and connected location; inspect a location without a documented reward, and verify incomplete conditions and unknown progression roles are labeled. This does not depend on the specialist US2 UI.

### Tests for User Story 3

- [ ] T043 [P] [US3] Write reward/point-of-interest relationship and evidence checks in `tests/unit/reward-evidence.test.ts` covering shared town hand-ins, nullable handInLocationId, independently unknown level/quantity versus known conditions, distinct multiple records, unknown progressionRole, and no invented guaranteed benefits.
- [ ] T044 [P] [US3] Write browser acceptance checks in `tests/e2e/reward-discovery.spec.ts` for Mud Burrow benefits/conditions and Clearfell Encampment hand-in context, sourced optional/main-route/town labels with explicit unknown roles, connected-destination navigation, missing/incomplete rewards and points of interest, multiple entries, source access without camera loss, and isolated unavailable categories at both viewports.

### Implementation for User Story 3

- [ ] T045 [US3] Review and enrich reward/point-of-interest records and progression evidence in `content/act1-opening.json` and `specs/001-campaign-map/research.md`; reconcile the Treacherous Ground narrative/table level discrepancy or leave the exact level explicitly unknown, preserve known acquisition/hand-in conditions, reuse one reward identity across Mud Burrow and town, leave absent points of interest honestly undocumented, and update actual review metadata/snapshotId after review.
- [ ] T046 [US3] Implement `src/features/campaign-map/RewardDetails.tsx` and `src/features/campaign-map/PointOfInterestDetails.tsx` using shared evidence presentation for identity, benefit, known/incomplete conditions, verified progression role, optional hand-in destination, distinct multiple entries, and explicit no-documentation versus unavailable states; do not turn missing information into guaranteed rewards.
- [ ] T047 [US3] Integrate reward/point-of-interest sections and progression/boundary labels into `src/features/campaign-map/LocationDetails.tsx` and `src/features/campaign-map/MapStage.tsx`, sharing IDs rather than duplicating town rewards and keeping documented optional/main-route roles distinct from unknown; preserve truthful connection direction/access semantics, camera, focus, and explicit unavailable-category feedback.
- [ ] T048 [US3] After T029, apply the approved reading hierarchy and role/warning-independent cues in `src/styles/details.css` and `src/styles/map.css`, retaining text alternatives, readable long conditions, source links and scroll behavior at 390 × 844 without adding uncovered act controls or player-progress features.
- [ ] T049 [US3] Run the independent reward journey and its unit/browser checks and refresh selected-detail/narrow captures in `tests/visual/campaign-map.spec.ts`; record actual outcomes and remaining source gaps in `specs/001-campaign-map/quickstart.md`, confirming an optional benefit is useful and all missing conditions remain explicit.

**Checkpoint**: All three stories work on the same bounded reviewed snapshot. US3 requires the shared US1 selection/detail shell, but not US2 specialist components.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Demonstrate full-slice quality, timing, asset rights, snapshot behavior, and required visual acceptance without expanding scope or deploying.

- [ ] T050 Add production timing verification in `tests/performance/campaign-map.spec.ts` using a fresh cold-cache Chromium context at 1280 × 720, a repeatable 10 Mbps download profile with stated upload/latency, and browser-clock input-to-painted-correct-details timestamps; require usable nodes/routes/controls/metadata within 3 seconds and at least 19 of 20 successive correct selections within 300 ms, report every sample with build/browser/OS/machine/cache metadata in `specs/001-campaign-map/quickstart.md`, and disable retries that hide failure.
- [ ] T051 Extend `tests/e2e/content-loading.spec.ts` with final-release fault and applicability regression journeys: later patch/source responses cannot silently change the loaded target version, external evidence outages leave facts/locators readable, retry ignores stale completions while preserving valid selection/camera, malformed optional content stays unavailable, missing terrain/fonts preserve navigation, and no fictional test record is served from `public/content/act1-opening.json`.
- [ ] T052 Audit final `content/act1-opening.json`, `content/act1-opening.layout.json`, `content/assets.json`, and `public/assets/` against research.md and the content contract; resolve factual/source-variant/provenance gaps, check all distributed asset license notices and all three release minima, retain explicit unknowns, regenerate the snapshot through `scripts/build-content.ts`, and record the actual final source review/version/date in `specs/001-campaign-map/research.md`.
- [ ] T053 Review the completed interface using relevant React, browser, and UX/accessibility skills, resolving measured or observed issues in `src/features/campaign-map/`, `src/content/`, and `src/styles/`; verify focus/keyboard/narrow reachability, reading/contrast, long labels, source links, reduced motion, scoped gestures, and ref-based camera updates without adding speculative abstractions or repeating already-passing checks without a changed risk.
- [ ] T054 After final changes, capture all five required states through `tests/visual/campaign-map.spec.ts`: overview, selected details, encounter warning, keyboard focus, and narrow layout; record build/environment, approved reference IDs, actual image paths, comparison across layout/atmosphere/typography/composition/colors/textures/states, and justified significant deviations in `specs/001-campaign-map/quickstart.md`; only human-reviewed captures may become accepted regression baselines.
- [ ] T055 Present final overview and complete location-detail milestone evidence from T054 for actual human visual review and record reviewer decision/date and accepted deviations in `specs/001-campaign-map/quickstart.md`; retain T034 overview approval only if still applicable to the final build, fix reviewed issues in `src/styles/` and related feature components, and recapture affected evidence. Leave visual acceptance pending until the required decisions actually arrive.
- [ ] T056 Run the final clean-install/content/type/lint/unit/build, desktop/narrow browser, Firefox/WebKit smoke, visual capture, and production timing commands defined in `package.json`; perform the unguided 60-second orientation journey and final 30-second encounter check after material changes, and record SC-001–SC-009 results, artifact paths, critical failures and limitations in `specs/001-campaign-map/quickstart.md` without weakening acceptance criteria or claiming unexecuted checks.
- [ ] T057 Update `README.md` and `specs/001-campaign-map/quickstart.md` with actual setup/run/build/verification instructions, coverage, snapshot update procedure, provenance/attribution, deployment-base and cache guidance (revalidate stable JSON, immutable hashed assets, publish app/content atomically), and the final functional/visual acceptance status; explain later campaign expansion without adding a backend, new acts, or hosting deployment to this feature.

---

## Dependencies & Execution Order

### Phase and task dependencies

1. Setup T001 → T002 → T003 → T004 establishes all tooling. Shared-file changes to package.json are sequential.
2. Foundations: T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012. Then reviewed content T013 and layout/provenance T014 feed T015; T016 verifies the complete foundation. Source review can be prepared while schemas are built, but authored release records must satisfy their final schemas.
3. US1: after T016, T017 and T018 can be written concurrently. Then T019 → T020 → T021 → T022 → T023 → T024 → T025 → T026 → T027 → T028 produces the runnable functional checkpoint. T023 can also be prepared after schemas stabilize, but integration still follows T024/T025.
4. Visual branch: T029 is complete with the user's 2026-10-16 approval. T030 can proceed after its shared foundations; T031/T032 require T030; T033 requires both visual implementations; T034 requires T033 and the actual overview review. No elapsed wait or automated screenshot comparison supplies milestone approval.
5. US2: T035/T036 can be authored concurrently after foundations; implementation T037 → T038 → T039 → T040 uses the US1 functional shell/evidence components (T019–T026). T041 requires approved-reference visual work and integration; T042 requires the rendered useful encounter. Reference approval is already recorded; implementation prerequisites remain.
6. US3: T043/T044 can be authored concurrently after foundations; T045 → T046 → T047 requires the same US1 functional shell/evidence components. T048 additionally requires reference approval and the shared visual foundation; T049 verifies the integrated story. There is no logical US2 dependency.
7. Polish follows the three integrated stories. T050/T051 may be developed on separate files; T052/T053 corrections precede final T054 screenshots, T055 approval and T056 final evidence. If later corrections change accepted visual states, recapture and obtain the affected review again. T057 records the final state.

### User story dependency graph

```text
Setup → Foundations → US1 functional map (T028)
                            ├── US1 approved appearance/overview (T029–T034)
                            ├── US2 encounter preparation (T035–T042)
                            └── US3 reward discovery (T043–T049)
                                      ↓
                Integrated slice → final checks + visual milestones
```

The US2/US3 visual tasks also depend on the reference/asset branch. US1 provides the core map used to demonstrate either later story independently; their specialist implementations do not require each other. Both P1 stories precede the P2 story in the normal sequential delivery order.

### Parallel opportunities

- Explicit `[P]` pairs are T017/T018 (US1 loading versus exploration), T035/T036 (US2 evidence versus browser journeys), and T043/T044 (US3 relationship evidence versus browser journeys), after their shared prerequisites.
- Additional optional work after prerequisites: T031 map styling and T032 details styling use separate files; T050 timing and T051 fault regressions use separate test files. Coordinate imports and final integration sequentially.
- US2/US3 specialist test/component work can proceed concurrently after the US1 functional shell exists. Serialize edits to `content/act1-opening.json`, `specs/001-campaign-map/research.md`, `LocationDetails.tsx`, `MapStage.tsx`, shared CSS, and `quickstart.md` rather than assuming entire stories are conflict-free.
- Schema extensions deliberately remain sequential because they share `src/content/schema.ts`; later integration/review tasks also have no `[P]` marker.

## Parallel Example: User Story 1

After T016, write T017 (`tests/unit/load-snapshot.test.ts`, `tests/e2e/content-loading.spec.ts`) and T018 (`tests/e2e/map-exploration.spec.ts`, `tests/e2e/map-keyboard.spec.ts`) concurrently, then implement the loader and interactive map. After T030, map styling T031 and details styling T032 can run independently before their combined screenshot check.

## Parallel Example: User Story 2

After foundations, write T035 (`tests/unit/encounter-evidence.test.ts`) and T036 (`tests/e2e/encounter-preparation.spec.ts`) concurrently. Complete the reviewed encounter content and sequential component integration before executing the acceptance journey or capturing warning evidence.

## Parallel Example: User Story 3

After foundations, write T043 (`tests/unit/reward-evidence.test.ts`) and T044 (`tests/e2e/reward-discovery.spec.ts`) concurrently. US3 can reuse the US1 shell without waiting for US2 components, but coordinate the shared authored snapshot, detail integration, and styles.

## Implementation Strategy

### MVP first

Complete Setup and Foundations, then US1's functional checkpoint through T028. Demonstrate real reviewed locations, truthful routes, matching details, input/focus/camera behavior, and recovery. Reference approval T029 is complete; implement the approved baseline through T030–T034 for the visual MVP, adapting panel layout and information density for readability and usability. This MVP is an increment, not full feature acceptance: implemented milestone reviews and SC-001–SC-009 remain outstanding.

### Incremental delivery

Add US2's useful sourced encounter preparation and warning journey, then US3's optional reward journey. Preserve a runnable application and completed journeys at each checkpoint. Apply relevant frontend-design, vercel-react-best-practices, and playwright-cli skills when implementing their respective work; use a UX/accessibility review once the UI exists. Record source reviews and visual decisions within existing feature artifacts without creating another methodology or approval service.

### Final acceptance

Resolve critical failures, complete the source/provenance audit, gather browser and timing evidence, and obtain actual required visual milestone decisions. A missing human decision leaves the corresponding task and visual acceptance pending while independent authorized work continues. Publication requires the entire minimum sourced slice; deployment and later campaign expansion require their own subsequent task scope. Do not deploy, commit, create issues, or expand campaign coverage as a side effect of generating this task list.

## Coverage and completion notes

| Scope | Primary tasks | Observable evidence |
|---|---|---|
| FR-001–FR-002, FR-011 | T008, T012–T016, T021, T052 | Exact five-location graph, endpoint/boundaries, reviewed minimum boss/optional reward/warning |
| FR-003–FR-006, FR-012–FR-014 | T017–T028, T030–T034, T051, T053 | Correct details, input/camera/focus/retry, readable desktop/narrow journeys |
| FR-007–FR-008 | T009–T010, T035–T042 | Useful sourced boss preparation, independent unknown defenses, visible meaningful danger |
| FR-009 | T010, T043–T049 | Optional benefit, conditions/gaps, shared hand-in identity, honest progression roles |
| FR-010, FR-018 | T007–T013, T017, T019, T023–T024, T036–T037, T045, T051–T052 | Adjacent claim status/evidence, visible version/date, stable offline-readable reviewed snapshot |
| FR-015–FR-017 | T011, T014, T029–T034, T041, T048–T049, T052–T055 | Approved references, licensed/original assets, five actual screenshots, human milestone decisions |
| SC-001–SC-004, SC-006, SC-008–SC-009 | Story checks, T042, T049, T051–T052, T056 | Actual automated outcomes and human discovery journeys |
| SC-005 | T050, T056 | Production cold-load and all 20 correct-selection timing samples |
| SC-007 | T029–T034, T041, T049, T054–T055 | Final browser artifacts and actual overview/detail visual approvals |

There are 57 tasks: Setup 4, Foundations 12, US1 18, US2 8, US3 7, and Polish 8. All task IDs are sequential and all task descriptions identify implementation or evidence file paths. Check a task only when its work and stated verification/decision have actually completed; planning source links are not source truth certification, and automated screenshots are not visual approval.
