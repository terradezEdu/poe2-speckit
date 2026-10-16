# Research: Interactive Campaign Map

Research baseline: 2026-10-16. Decisions support [spec.md](spec.md) and constitution v1.0.0.
This document records planning evidence, a bounded content list, and the approved baseline visual direction.
It is not a verified production dataset or a record of human visual approval.

## 1. Application and dependency baseline

**Decision:** A static React application using TypeScript, Vite, native CSS, and npm. Use Node
24 LTS; the local environment reports Node 24.21.0 and npm 11.19.0. The official documentation
currently lists React 19.3, TypeScript 7.0, Vite 8.3, and Zod 4.6. Resolve compatible stable patch
versions, React tooling, D3 types, Vitest, and Playwright during setup and commit the lockfile.
Do not install floating versions on every build.

**Rationale:** The product is a read-only interactive scene with a reviewed content snapshot.
There are no accounts, writes, live integrations, or independently navigated pages in this slice.
A single build and deployment keep UI, behavior, and data separable without introducing services.
Use explicit local state and a small loader; selection requires no additional network request.

**Alternatives considered:** A full-stack React framework provides routing and server rendering,
but those requirements are absent here. Reconsider if searchable public location pages or
server-rendered content become requirements. Vanilla DOM would reduce framework dependencies
but add manual coordination across selection, accessible details, and content states. Do not
introduce a router, global state store, query cache, or styling framework for this slice.

Sources: [React build-tool guidance](https://react.dev/learn/build-a-react-app-from-scratch),
[React versions](https://react.dev/versions), [TypeScript](https://www.typescriptlang.org/download/),
[Vite releases](https://vite.dev/releases), [Node release status](https://nodejs.org/en/about/previous-releases).
React documents the maintenance trade-offs of choosing a build tool; this decision accepts them
for the bounded single-screen application.

## 2. Map rendering and camera ownership

**Decision:** React owns native HTML node buttons and an SVG route layer. Both share authored
map coordinates and one camera transform. Use the focused d3-zoom and d3-selection packages,
rather than the whole D3 bundle, for gesture handling. D3 owns listeners and camera transforms;
it does not add/remove React children.

**Rationale:** This permits distinctive map artwork with normal button semantics and established
pan/zoom behavior. Store high-frequency camera values in refs; derive selected details from one
selected location ID. Keep scene rendering independent of the detail panel.

**Alternatives considered:** Leaflet CRS.Simple is designed for image-based non-geographical
maps, but its map/layer conventions add little to five authored nodes. React Flow offers
accessible graph tooling, but its editing and graph-layout capabilities exceed this scene's needs.
Canvas/WebGL would require extra hit testing and accessible equivalents. Bespoke gesture handling
would duplicate a proven library. Revisit rendering only after measured limits or new requirements.

D3's programmatic zoom.transform does not enforce configured extents: fit and reveal operations
must constrain their transforms explicitly. Document keyboard controls and drag/click behavior
in [the interaction contract](contracts/map-interactions.md).

Sources: [D3 zoom](https://d3js.org/d3-zoom),
[Leaflet CRS.Simple](https://leafletjs.com/examples/crs-simple/crs-simple.html),
[React Flow accessibility](https://reactflow.dev/learn/advanced-use/accessibility).
Installed React guidance informs transient camera refs, derived details, and analyzable imports.

## 3. Content delivery, trust, and freshness

**Decision:** Author campaign facts, layout, and asset provenance separately in versioned files.
A build step validates and combines them into one same-origin JSON snapshot. Fetch that once;
all details and evidence are then readable without fetching external source pages. Use shared
Zod schemas for build-time validation and runtime loading, plus explicit graph/reference checks.

**Rationale:** A reviewed snapshot fits the accepted freshness policy and avoids runtime scraping,
external service credentials, and stale responses when switching locations. Zod supplies runtime
validation and inferred TypeScript types. Unknown, conflicting, and outdated fields remain explicit.

**Alternatives considered:** Live wiki/API queries cannot provide the agreed reviewed-release
boundary or reliable availability. A database/CMS is unnecessary for a small maintained dataset.
Ajv/JSON Schema becomes attractive if language-neutral authoring or third-party interchange is
needed; it is not required now.

Source: [Zod](https://zod.dev/), [Ajv](https://ajv.js.org/guide/getting-started.html).

Run the small content scripts with Node's built-in support for erasable TypeScript, explicit
relative import extensions, and a separate compiler check; avoid path aliases and runtime enums
in these shared modules. This avoids an additional script runner. Source:
[Node TypeScript support](https://nodejs.org/api/typescript.html).

### Game version and release content list

**Decision:** Establish the research target as PoE2 0.5.5e, baseline date 2026-10-16, using the
[official patch index](https://www.pathofexile.com/forum/view-forum/2212) and
[0.5.5e staff announcement](https://www.pathofexile.com/forum/view-thread/4009785).
This establishes the target version, not blanket compatibility of every external guide.
The final review date is set only after the content is actually reviewed.

The planned segment contains exactly these five locations:

| Stable location ID | Location | Purpose and source |
|---|---|---|
| act1-riverbank | The Riverbank | Entry; documented encounter and connection to town. [Area](https://poe2db.tw/us/The_Riverbank) |
| act1-clearfell-encampment | Clearfell Encampment | Town and reward hand-in context. [Area](https://poe2db.tw/us/Clearfell_Encampment) |
| act1-clearfell | Clearfell | Branch junction and encounter information. [Area](https://poe2db.tw/us/Clearfell) |
| act1-mud-burrow | Mud Burrow | Optional branch with encounter/reward journey. [Area](https://poe2db.tw/us/Mud_Burrow) |
| act1-grelwood | The Grelwood | Main-route endpoint and continuation boundary. [Area](https://poe2db.tw/us/The_Grelwood) |

Included relationships: Riverbank–Clearfell Encampment, Clearfell Encampment–Clearfell,
Clearfell–Mud Burrow, and Clearfell–The Grelwood, supported by the linked area records.
Topology does not establish unrestricted return travel: direction/access conditions require
review; retain a labeled unknown where the source is insufficient.

The fifth included area reaches The Grelwood while retaining the optional Mud Burrow branch.
That supplies the smallest proposed opening set meeting the location count and branch requirement.
Do not add later areas merely to enrich the first release. Grelwood exits to uncovered areas
are boundary notices, not selectable empty locations.

The [Act 1 source](https://poe2db.tw/us/Act_1) identifies the Mud Burrow quest as optional.
[Treacherous Ground](https://poe2db.tw/us/Treacherous_Ground) provides reward and hand-in evidence.
The area's narrative guide and quest reward table differ in their level notation; omit an exact
reward level until reconciled rather than choosing one silently.

For a sourced danger candidate, the [Beira record](https://poe2db.tw/us/Beira_of_the_Rotten_Pack)
documents cold-damage attacks and a detonation mechanic. Review the relevant campaign variant
and behavior before publishing a Hardcore warning. Explain the documented threat; label any
preparation advice as editorial and cite its supporting mechanic. Do not invent lethality
thresholds, guaranteed avoidance, timings, or current resistance values.

**Remaining content work:** Reconcile target-version applicability, entry/return restrictions,
quest conditions, encounter variants, source conflicts, and at least one supported warning.
PoE2DB is a community-maintained source, not an official guarantee; its default monster views can
show other levels or variants. Prefer relevant official changes and versioned first-hand evidence
when available. Retain uncertainty on individual claims when applicability cannot be established.
Publication must satisfy the minimum sourced content; uncertainty cannot replace every useful fact.

Write original summaries and cite evidence. Source availability is not permission to copy its
prose, image assets, or bulk dataset. Preserve applicable attribution/permission records for any
material actually reused. No source image is proposed as a distributable application asset.

## 4. Visual reference proposal — approved baseline

**Human approval recorded: 2026-10-16.** The user approved the presented R1/R2 reference set
and accompanying design direction as the baseline for the first release:

> Approved as the baseline visual direction for the first release.
> The implementation may adapt panel layout and information density as needed to preserve readability and usability

This approval covers the reference roles, palette, typography, and proposed usability adaptations
described below. Panel layout and information density may be adapted within this direction
without requesting the same baseline approval again. Coverage gaps remain implementation and
review considerations; they are not a pending reference-approval gate. Asset permissions and
the later overview/detail visual milestone decisions remain separate and are not granted here.

**Decision:** Use R1 for overview atmosphere/composition and R2 for marker and information-panel
treatment. Both images were downloaded to a temporary inspection folder and viewed at their
available resolution. No proprietary images have been added to the repository or approved for
redistribution. These are historical appearance references, not evidence of current game facts.

| ID | Concrete reference | Observed coverage | Limitations and status |
|---|---|---|---|
| R1 | [Overview image](https://volx.jp/wp-content/uploads/2024/12/path-of-exile-2-act1-map-list-2.jpg), [source page](https://volx.jp/path-of-exile-2-act1-map-list/) | 960 × 540; dense forest relief, muted olive/brown terrain, dark frame, blue circular markers, pale dotted path | Historical screenshot with Japanese annotations; ignore annotation typography. Approved baseline, 2026-10-16. |
| R2 | [Selected-location image](https://i.imgur.com/7rd970m.png), [first-hand forum post](https://www.pathofexile.com/forum/view-thread/3672899) | 1920 × 1080; aged-metal marker rims, warm title text, dark layered information plaque, map remains the dominant surface | Post dated 2024-12-30; includes third-party overlay and old repeated act tabs. Approved baseline, 2026-10-16. |

Inspection SHA-256: R1 dccbc1ccce7f56b26a2e2e3de7c8146ae9ce603562dc8c3078835485ff6e5147;
R2 84e512afb53ef15e3fac3cd4fad9dfb6475a0d9a36926c68e64d11309b6009eb.
The hashes identify inspected material if remote files change; temporary local copies are not
required repository artifacts.

**Approved baseline design direction:** Give the map the dominant area; retain landscape structure,
rivers/forest masses, subdued ground colors, distinct markers, and restrained metal framing.
Use original illustrated terrain, not a uniform dark surface behind generic cards. Companion
details need greater reading space than the game's hover plaque. A nonmodal desktop side panel
and narrow-screen panel below the map are approved baseline adaptations; panel layout and
information density may change as needed for readability and usability.

Baseline palette, authored rather than sampled: lampblack #100F0C, forest #34382A, aged brass
#AA9063, bone #E7D7B0, waypoint blue #70B6D6, warning ember #BA6455. Check contrast and calibrate
against the approved references before committing visual values.

Use Cinzel for restrained location titles and Source Sans 3 for readable encounter text
as the approved baseline. Self-host font files with their original license notices:
[Cinzel license](https://github.com/google/fonts/blob/main/ofl/cinzel/OFL.txt),
[Source Sans license](https://github.com/adobe-fonts/source-sans/blob/release/LICENSE.md).
No imitation of proprietary game font files is assumed.

Desktop concept: a map stage at left with a stable detail region at right; reserve the region's
space so selecting a location does not shift the camera. Narrow concept: map and controls above,
scrollable details below. Both use left-aligned reading text and minimal non-interactive chrome.
Do not add nonfunctional game HUD, travel buttons, quest progress, or uncovered act tabs.

**Review against brief:** A generic dashboard/card grid would lose the terrain-led character of
both references. The proposal instead concentrates visual detail on the map and uses quieter
reading surfaces. Persistent labels, stronger focus, readable warnings, and responsive details
are approved baseline accessibility/usability adaptations to verify in the later milestone review.

**Coverage gaps:** Neither reference establishes the companion's long encounter text, Hardcore
warning presentation, keyboard focus, touch behavior, or narrow composition. Present those
adaptations within the approved direction and document significant deviations for milestone review.
Baseline reference approval is complete under FR-015; visual implementation may proceed when
its technical prerequisites are ready. The later overview/detail milestone approvals remain pending.

**Alternatives considered:** Endgame Atlas images do not establish Act 1 campaign appearance.
Historical annotated guides can inform appearance but cannot dictate current routes or facts.
AI-generated terrain could be evaluated later as original bitmap artwork with the imagegen skill;
no asset generation is needed in this planning phase.

## 5. Verification and operation

**Decision:** Playwright Test for visible journeys and screenshots; Vitest for content consistency,
claim formatting, and meaningful state/camera invariants. Use Chromium at both required viewports,
with Firefox/WebKit smoke checks for selection, input, and focus. No arbitrary coverage target or
duplicate component-test layer is planned.

**Rationale:** The critical risks are wrong-location information, unsupported game claims, map
input/focus failures, and visual mismatch. Automated correctness checks, source review, and actual
human screenshot assessment address distinct risks.

**Alternatives considered:** Source inspection alone cannot verify the map; screenshot equality
alone cannot establish approval. Large snapshot suites and full cross-browser duplication would
add maintenance without matching this slice's risk.

Sources: [Playwright behavior testing](https://playwright.dev/docs/best-practices),
[visual comparisons](https://playwright.dev/docs/test-snapshots),
[Vitest](https://vitest.dev/guide/).
[WAI modal guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) supports avoiding
modal/focus-trap semantics when the map must remain operable.

Static hosting serves the application and reviewed snapshot together over HTTPS. No deployment
provider is required by the product; deployment is outside this planning command. Use no account
data, telemetry, credentials, or third-party runtime calls in the first slice. Render plain text,
validate source-link protocols, and provide local error/retry feedback. Console diagnostics and
Playwright traces suffice initially; no monitoring service or backend is introduced.

All technical unknowns have decisions. Baseline reference approval was received on 2026-10-16.
Content review, artwork preparation, implementation verification, and overview/detail milestone
approval remain delivery dependencies, not claimed completions.
