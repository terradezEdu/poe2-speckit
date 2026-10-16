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

**Content review:** T013's scoped supplemental review below now provides the minimum sourced
graph, Mud Burrow reward/hand-in, and supported warning. Target-version applicability,
entry/return restrictions, and conflicting numerical fields retain individual uncertainty.
PoE2DB is a community-maintained source, not an official guarantee; its default monster views can
show other levels or variants. Prefer relevant official changes and versioned first-hand evidence
when available. Retain uncertainty on individual claims when applicability cannot be established.
Publication must satisfy the minimum sourced content; uncertainty cannot replace every useful fact.

Write original summaries and cite evidence. Source availability is not permission to copy its
prose, image assets, or bulk dataset. Preserve applicable attribution/permission records for any
material actually reused. No source image is proposed as a distributable application asset.

### Source acquisition and reuse gate

**Investigation and implementation: 2026-10-16; version and provenance review: 2026-10-16.**
The user's request authorized evaluation of the existing route before T013 continued. The pinned
GitHub snapshot is a viable source for its limited English editorial text: the importer reads
only the immutable repository commit through GitHub's documented Contents API, verifies the
root MIT license before fetching the guide, and retains its notice. The upstream README describes
the separate `poe2speedrun.malura.de/overlay/guide.json` service as the overlay's live update
endpoint and identifies that service as the guide's origin. The importer does not request that
endpoint. No separate service terms or data license were established, so this conclusion applies
to the MIT-licensed pinned repository snapshot only, not to future direct/live-service extraction.
The imported subset is occasional and small; it does not mirror or repeatedly harvest the live
service. MIT covers the snapshot's licensed material, not GGG assets or any third-party material
whose rights the repository author may not hold.

The source version is still recorded as `0.5.5`; the release target remains `0.5.5e`. Review of
the 0.5.5b, 0.5.5c, 0.5.5d, and 0.5.5e notes found no listed change to Riverbank, Clearfell
Encampment, Clearfell, Mud Burrow, Grelwood, their opening route, or the imported permanent reward
claims. The 0.5.5 base update did add Ritual encounters to campaign areas and boss Rituals, so
the snapshot does not cover that new encounter layer and cannot substantiate a current Hardcore
threat. Patch notes establish no listed conflict for the imported opening route/reward text; they
do not prove every claim or all hotfix compatibility. Keep the candidate's `versionCompatibility`
as `unverified` and retain per-claim uncertainty. Do not treat this focused comparison as a
complete version certification.

The candidate itself still does not establish the complete four-edge graph, Mud Burrow reward
conditions, or a sourced Hardcore threat. The subsequent single-publisher supplemental review
below resolves the minimum authored-content coverage without promoting the candidate itself.
`content/act1-opening.json` now has an actual review date; assembled delivery remains pending.

The initial acquisition hold should not be interpreted as a ban on all APIs. GGG's
[developer policy](https://www.pathofexile.com/developer/docs) supports documented APIs and
named exports, subject to its conditions; undocumented endpoints and game-file tools are
excluded. Its [API reference](https://www.pathofexile.com/developer/docs/reference) exposes
account, league, character, stash and economy resources, with limited PoE2 coverage, but no
campaign-area/quest/boss database endpoint. Its [data exports](https://www.pathofexile.com/developer/docs/data)
list only the passive skill tree for PoE2. OAuth registration would not supply this feature's
missing data. The [website robots file](https://www.pathofexile.com/robots.txt) excludes website
`/api/` crawling; that is distinct from authorized documented API usage.

#### Alternatives evaluated

| Candidate | Permission and acquisition evidence | Coverage, version, reliability, and decision |
|---|---|---|
| GGG supported APIs / exports | Official policies and resources linked above permit supported API access under their requirements. | Strongest authority and publisher longevity, but no campaign dataset or monster/quest export. No unofficial endpoints used. |
| Michael Malura's `poe2overlay` guide JSON | [Pinned MIT license](https://github.com/maluramichael/poe2overlay/blob/07b241f30f0c0b3b47959030e08c314731f3cc2e/LICENSE), [README](https://github.com/maluramichael/poe2overlay/blob/07b241f30f0c0b3b47959030e08c314731f3cc2e/README.md), and [structured file](https://github.com/maluramichael/poe2overlay/blob/07b241f30f0c0b3b47959030e08c314731f3cc2e/ui/guide.json). The root MIT license is included and checked before guide retrieval; no nested `ui` license or data exclusion was present. Acquired only from the immutable GitHub commit through the documented Contents API. | Suitable for occasional use of its pinned editorial snapshot, with attribution and notice retained. It is not permission to harvest the separate live service or any GGG/game asset. The pinned snapshot's source metadata declares `0.5.5 (Forbidden Rites)`, updated 2026-09-30; the commit is dated 2026-10-09. The focused 0.5.5b–e patch-note comparison found no listed change to imported opening route/reward claims, but the broader 0.5.5 campaign Ritual additions are outside the guide and prevent using it as evidence for those encounters or a Hardcore threat. Keep exact compatibility unverified. |
| Malura's original speedrun site repository | [Apache-2.0 license](https://github.com/maluramichael/poe2campaignspeedrun.malura.de/blob/19789377f908c914fbd356531f1193738aebc6eb/LICENSE) and [NOTICE](https://github.com/maluramichael/poe2campaignspeedrun.malura.de/blob/19789377f908c914fbd356531f1193738aebc6eb/NOTICE) identify the same author. | Provenance context. Last observed update 2026-08-14; the overlay JSON is newer and separately distributed under MIT. No website scraping or original-site assets imported. |
| RePoE / `repoe-fork/poe2` | [RePoE license](https://github.com/repoe-fork/repoe/blob/master/LICENSE.md) gives MIT for tooling but expressly reserves generated `data` contents to GGG under GGG terms; PoE2 data repository reports no license. | Rich structured tables, PoE2 repository pushed 2026-10-14. Tooling rights do not grant redistribution rights to game data. Reject automatic table import without additional permission. |
| PoE2DB | [robots.txt](https://poe2db.tw/robots.txt) does not exclude the consulted ordinary area/quest/monster pages. The [disclaimer](https://poe2db.tw/us/General_disclaimer) identifies wiki text as CC BY-NC-SA 3.0 and reserves GGG-derived material; neither is treated as a blanket data-export license. | Selected as the sole supplemental publisher after the user's instruction. Consult only opening area connections, the Mud Burrow quest, and Beira's campaign skill categories; write original factual summaries. No wiki prose, dialogue, scripts, raw tables or assets copied; no ongoing or bulk import. Exact version archives remain unavailable. |
| PoE2 Wiki / Cargo API | Policy/robots could not be verified; privacy-policy request returned HTTP 403. Its [file-license picker](https://www.poe2wiki.net/wiki/MediaWiki:Licenses) does not grant rights over all article or Cargo data. | Promising relational queries and revisions, but selected-data rights and access policy remain unverified. No content API requests or access-control bypass attempted. |
| `path2maps/poe2maps.github.io` | [MIT license](https://github.com/path2maps/poe2maps.github.io/blob/main/LICENSE); `guide.json` root metadata inspected through the Contents API. | Last push 2026-01-10, two commits observed, no patch/update metadata. Useful fallback format, weaker freshness and sustainability evidence; not selected. |
| `juddisjudd/exilecompass` | [AGPL-3.0 license](https://github.com/juddisjudd/exilecompass/blob/main/LICENSE), [campaign documentation](https://github.com/juddisjudd/exilecompass/blob/main/src/lib/data/campaign/README.md). | Active (push 2026-10-15), structured objectives. Adaptation needs a separate licensing/provenance audit, including game-log material and AGPL obligations. No campaign dataset imported or application license changed. |
| `svhlDev/poe2-data` and mixed-source guides | [`poe2-data`](https://github.com/svhlDev/poe2-data) reports no license and describes PoE2DB-derived records. [Domistae's guide](https://github.com/domistae/poe2-leveling) declares mixed external references and incomplete patch reconciliation. | Public hosting, an MCP wrapper, or an open-source scraper does not establish upstream rights. These alternatives do not improve the selected source's permission/freshness combination. |

#### Selected access and reuse evidence

GitHub's [API terms, section H](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#h-api-terms)
govern API data access and request limits. Its [robots.txt](https://github.com/robots.txt)
points to the API and restricts several HTML crawling paths. `https://api.github.com/robots.txt`
returned HTTP 404 during review. We use the deliberately documented
[public Contents endpoint](https://docs.github.com/en/rest/repos/contents#get-repository-content),
which permits unauthenticated public-file reads and commit refs. This is not a fallback around
a denied source endpoint. Two files are requested: LICENSE first, then guide JSON.

The source lock records the full immutable commit and both file hashes:

| Evidence | Pinned value |
|---|---|
| Repository / commit | `maluramichael/poe2overlay` / `07b241f30f0c0b3b47959030e08c314731f3cc2e` |
| LICENSE Git blob | `7b5614a2741886876a4bf01b875560ca2ff57667` |
| LICENSE SHA-256 | `5b6097b9ab73e14c9fb07d22d334a88af65459c2449c183b67828055b5b6e7a7` |
| Guide Git blob | `001db59f130deb694020dbfcace7b970b95c2df8` |
| Guide SHA-256 | `f62b30241797911fe7005424220dcfae426f8881ae6b4e157c1ce2f376a6da24` |

The candidate embeds the complete MIT notice. Only original English editorial text through
the first Grelwood step is retained; images, icons, fonts, dialogue, game-file tables, source
code, and later campaign steps are excluded. Source field locators remain attached. The
guide's numerical survival guarantee is expressly excluded; it is not adopted as a Hardcore
safety threshold. The license establishes a route for this text, not the truth of every claim
or permission for GGG artwork.

#### Reliability, versioning, and update decision

`npm run content:acquire` is an explicit maintenance operation, separate from builds/runtime.
It verifies the pinned license before requesting text, checks Git blob and SHA-256 integrity,
checks patch/update metadata, and atomically replaces only the review candidate. Denied,
redirected, rate-limited, oversized, or invalid responses stop the operation without retries
or alternate sources. Normal import checks the candidate hash; `--propose` stages an update
separately without replacing the pinned candidate.

[GitHub's rate-limit documentation](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
allows 60 unauthenticated requests per hour; two per reviewed update fit this slice. The updater
uses documented API version `2026-03-10` and an identifiable User-Agent. No polling service,
OAuth dependency, HTML parser, backend, or runtime third-party request is introduced. Local
pins preserve availability if the source disappears. Upstream review and occasional adapter
maintenance remain necessary.

The candidate has `publicationReady: false`, `versionCompatibility: unverified`, and no
`reviewedAt`. Source version 0.5.5 is preserved separately from target 0.5.5e. The focused
intervening-patch review found no listed change to its imported route/reward claims, while the
base patch's campaign Ritual changes remain outside the candidate. There are four
standalone opening records; Mud Burrow appears only in a Clearfell note. Sequence adjacency
does not prove every direct route or return-travel restriction, so the importer generates no
graph edges. Damage, resistances, weaknesses, triggers, and safe thresholds are not inferred.
Routing tags such as must/skip do not establish progression roles; onward Grelwood instructions
must be adapted to informational boundary notices before any release use.
No release minima or target version were changed to make this candidate publishable.

**Outcome:** The pinned GitHub snapshot import is supported for the limited MIT-licensed text it
contains; do not generalize that permission to the live service endpoint. The patch-note review
supports using the imported opening route/reward claims as candidate evidence for the 0.5.5e
review, with individual uncertainty retained, but does not certify all claims. The supplemental
review below completes T013's minimum authored content. The target, acceptance criteria, and
unpublished status of the acquisition candidate remain as established.

**Further verification option:** Supplement the reviewed content with original, versioned first-hand
observations for the five-location graph, Mud Burrow conditions, and a supported danger.
Record patch/variant, date, original notes, source locator, and explicit reuse grant. Existing
SourceEvidence/EvidenceValue fields support normal review and release. GGG's policy permits
informed reading of game logs, but a log cannot establish combat damage or quest semantics.
No log reader, live integration, private player-data collection, or gameplay automation is added.

**Alternative for broader automation:** Obtain written permission from GGG or a publisher that
covers the underlying material, automated API/export acquisition, redistribution, intended
commercial/noncommercial use, attribution, limits, update cadence, and version archives. No
request was sent. Changing the target, widening coverage, or shipping an incomplete warning
is not a substitute for the existing requirements.

### T013: one scoped supplemental publisher and authored outcome

**Actual review completed: 2026-10-16.** The user authorized one narrow supplemental source.
PoE2DB is that one publisher; the consulted pages are the five included area records, the
opening sections of Act 1, Treacherous Ground, and the Beira campaign monster record already
identified above. No additional campaign publisher or live guide service was introduced.

**Proportional reuse decision:** This is an occasional, small factual consultation, with
original summaries and citations. Do not reuse the community article's expressive prose,
game dialogue, assets, scripts, or table collections. The wiki license does not establish rights
over GGG material; robots access permission does not establish redistribution rights.
The [EU Database Directive, Articles 7–8](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A31996L0009)
distinguishes substantial extraction from lawful use of insubstantial portions, while retaining
restrictions on repeated/systematic extraction and third-party content rights. This small set of
opening facts neither reproduces the site's collection nor substitutes for its service. No
qualitatively substantial selection or repeated accumulation of the database is intended. This
supports the limited factual use here; it is not permission for a database mirror or export.
MIT attribution/notice remains in the authored guide SourceEvidence records. No project-wide
license change or noncommercial restriction is inferred from factual citation.

| Review item | Evidence and authored decision |
|---|---|
| Five locations and four connections | The included area's `Attr / Connected` fields establish Riverbank–Encampment, Encampment–Clearfell, Clearfell–Mud Burrow, and Clearfell–Grelwood. Roles use town metadata and the opening quest/route evidence, rather than interpreting guide routing tags as proof. Return direction and complete access conditions remain unknown. |
| Optional Mud Burrow reward | Act 1's quest list labels Treacherous Ground optional. The quest stages establish the Devourer kill and Renly hand-in in Clearfell Encampment. The guide and quest list support an Uncut Support Gem plus gold; no combined quantity or verified gold amount is selected. |
| Reward notation | The community opening notes say Level 1; the Treacherous Ground table uses iLv4. These may refer to different concepts. The authored level is null/conflicted with both locators; no automatic conversion is made. |
| Beira variant and defenses | Use the record with metadata `UrchinHagBossCampaignSTANDALONE`, separate from generic `UrchinHagBoss` and spectre/reservation views. Their fire/cold values differ from the Clearfell table. Exact resistance percentages and independently applicable weaknesses are unresolved. |
| Hardcore threat | In the campaign record, `HagBossDetonateDead` identifies cold area damage. The warning's trigger is being hit within that damaging area; it does not claim an activation telegraph or literal on-screen corpse cue. The consequence is cold damage and, if fatal, the end of a Hardcore run, supported separately by the official Hardcore rules. Preparation advice is explicitly editorial and uncertain. No damage amount, timing, freezing, lethal threshold, or survival guarantee is asserted. |
| Other mechanics | The Beira record also identifies cold projectile and physical spike damage categories. Other boss properties are explicit unknowns; empty content categories are scoped omissions, not verified absence. No skill code or numeric base table is retained. |
| Endpoint and boundaries | Grelwood stays the endpoint. Red Vale, Grim Tangle and Lost Catacombs are informational notices from its connection list, with no playable/selectable extra locations. The guide's entrance visit and the quest list's blocked onward path do not establish identical access points; that condition remains uncertain. |
| Version review | Keep the target 0.5.5e and baseline 2026-10-16. The source guide remains 0.5.5; PoE2DB has no reviewed exact-version archive. Individual `verifiedForVersion` fields remain null. Official 0.5.5b–e notes provide supporting review context, not blanket certification. The 0.5.5 Forbidden Rites Ritual layer is not silently mapped to these base campaign mechanics. |

**Authored result:** `content/act1-opening.json` contains five real locations, the four sourced
connections, three campaign encounters, three reward records, one Grelwood point of interest,
and one sourced Hardcore warning. Its `reviewedAt` is 2026-10-16, assigned after this review;
unknowns and conflicts retain their notes and source locators. All summaries are original.
The raw import candidate and source lock are unchanged.

The intervening staff lists reviewed were [0.5.5b](https://www.pathofexile.com/forum/view-thread/4004106),
[0.5.5c](https://www.pathofexile.com/forum/view-thread/4006357),
[0.5.5d](https://www.pathofexile.com/forum/view-thread/4008534) and
[0.5.5e](https://www.pathofexile.com/forum/view-thread/4009785).
[0.5.5's league rules](https://www.pathofexile.com/forum/view-thread/4000864) support the
Hardcore-death consequence and identify the separate Forbidden Rites encounter layer.

**Validation:** The authored-part schema and existing publication validator passed on the real
content with a temporary in-memory layout and empty asset list. This checks graph, references,
evidence and release minima without creating T014 layout files or a public snapshot. There are
zero claims marked independently verified for 0.5.5e, three conflicted fields, and explicit
unknown fields. T013 is complete; T014–T016 and delivery publication remain pending. The
reproducible one-off validation command is recorded in quickstart.md.

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
