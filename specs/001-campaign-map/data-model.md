# Data Model: Interactive Campaign Map

Status: Phase 1 design. Implements FR-001–FR-018; this is a model, not production game data.
The canonical release list and evidence are in [research.md](research.md#game-version-and-release-content-list).

## Storage and boundaries

Maintain one authored campaign document, a separate presentation layout, and an asset provenance
manifest in version control. The build produces one validated JSON delivery document described in
[the content contract](contracts/campaign-content.md). There is no database or player record.
Schemas are ordinary TypeScript/Zod modules, shared by the build validator and runtime loader;
do not introduce a generic content-management framework.

IDs are immutable ASCII slugs, unique within an entity collection. Cross-entity references use
IDs, never display names, array positions, or map coordinates. Names can change without breaking
relationships. Array order defines deliberate reading order, not identity.

## Evidence-bearing values

Acquisition inputs are separate from the runtime model. `content/acquisition.lock.json` pins
the audited transport/license, immutable upstream revision, content hashes, source version,
and excluded locators. `content/candidates/act1-opening.poe2overlay.json` retains source metadata
and the MIT notice with opening editorial text. It is unreviewed, has no `reviewedAt`, and is
not a ContentSnapshot. Integrity does not establish facts or target-version compatibility.
Authoring/publication still require the evidence and invariants below. Candidates are never
shipped by Vite.

Use one small EvidenceValue shape for gameplay properties that can be unknown:

| Field | Meaning |
|---|---|
| value | String, number, boolean, or typed list appropriate to the property; null for unknown |
| status | documented, uncertain, conflicted, outdated, or unknown |
| kind | fact or editorial-advice |
| sourceIds | Supporting SourceEvidence IDs; nonempty for documented values |
| verifiedForVersion | Exact supported version if established; otherwise null |
| checkedAt | ISO date of the claim review if performed; otherwise null |
| note | Required explanation for uncertain, conflicted, outdated, or unknown values |

Documented fact values may be shown as verified only when the source actually supports that
claim. A source's access date alone never establishes patch compatibility. Editorial advice
retains its label even when based on documented mechanics. A conflict note identifies the
disagreeing claims and sources; do not select a numeric value as authoritative.

Zero resistance is an explicit documented numeric value. Null does not mean zero, immunity,
safety, or absence. Each defensive property is independent; weakness requires its own evidence.

Names and identity fields use plain text plus the entity's identitySourceIds. Descriptions,
progression roles, conditions, mechanics, and benefits use evidence-bearing values. This avoids
wrapping structural IDs while keeping gameplay claims attributable.

## ContentSnapshot

| Field | Type and rules |
|---|---|
| schemaVersion | Integer 1; contract compatibility, independent of game version |
| snapshotId | Unique release slug; changes whenever reviewed content changes |
| targetGameVersion | Nonempty exact game version; research target currently 0.5.5e |
| researchBaselineDate | ISO date; current research baseline 2026-10-16 |
| reviewedAt | ISO date assigned after actual review; required for publication |
| segment | CampaignSegment |
| locations, connections, encounters, rewards, pointsOfInterest, warnings, sources | Entity collections |
| presentation | MapLayout; assembled from separately authored layout |
| assets | AssetProvenance collection for distributed visual assets |

Dates must be real dates and researchBaselineDate must not follow reviewedAt. Draft authoring can omit a
review date; a publishable snapshot cannot. The snapshot's version is visible globally and in
location details; it is not evidence that every property is known.

## CampaignSegment

Fields: id, actId, title, entryLocationId, endpointLocationId, locationIds in reading order,
coverageRationale, identitySourceIds, boundaries.

Each boundary has an included fromLocationId, external destination name, relationship evidence,
and access-condition evidence. It is informational, never an internal actionable node. The
release's included IDs must match the five-location list; endpoint is act1-grelwood. Later
coverage changes update the content list and specification as appropriate.

## Location

Fields: id, name, identitySourceIds, summary, progressionRole, encounterIds, rewardIds,
pointOfInterestIds, warningIds.

Progression role is an EvidenceValue with a documented value of town, main-route, or optional;
unknown remains possible. Empty encounter/reward lists mean no entries are documented in this
snapshot, not that the game guarantees none exist. Relevant town reward hand-ins can reference
the same Reward as its optional destination without duplicating identity.

## Connection

Fields: id, fromLocationId, toLocationId, relationship evidence, traversalDirection evidence,
accessConditions evidence.

The included graph is connected when treated as an area-relationship graph. Actual traversal
can be forward-only, bidirectional, conditional, or unknown; connectedness is not a promise of
return travel. Both endpoints of internal connections must exist in the segment. Boundaries
remain in CampaignSegment.boundaries. Duplicate relationships and self-loops are rejected.

## Encounter

Fields: id, name, identitySourceIds, isCampaignBoss, locationId, damageTypes, resistances,
weaknesses, mechanics, warningIds. `isCampaignBoss` is an evidence-bearing boolean so publication
can verify the boss minimum without treating an arbitrary encounter as a boss.

Damage types are explicit physical, fire, cold, lightning, or chaos evidence entries.
Resistances are separately evidenced properties; include a percentage only if applicable to the
reviewed campaign variant. Weaknesses are independently evidenced descriptions, never computed
from an omitted resistance. Mechanics have stable local IDs and evidence-bearing description,
trigger, and response guidance. A missing property remains visible as unknown.

Multiple encounters at a location are distinct records. Metadata names, encounter level, and
source sections must distinguish campaign bosses from similarly named variants before a
claim is marked documented.

## Reward and PointOfInterest

Reward fields: id, name, identitySourceIds, locationId, handInLocationId (nullable), benefit,
conditions, quantity, level, progressionRole. Quantity and level are separate EvidenceValues,
so their unknown values do not erase known acquisition conditions. Optional destinations can
point to an included town for hand-in.

PointOfInterest fields: id, name, identitySourceIds, locationId, description, benefit,
conditions, progressionRole. A point of interest may have no known material reward; its
description still needs source support.

## HardcoreWarning

Fields: id, locationId, encounterId (nullable), title, threat, trigger, consequence,
avoidanceAdvice (nullable), sourceIds.

Threat, trigger, consequence, and any avoidance advice carry evidence status. At least one
warning in the release must describe an actually documented threat with source support.
Editorial advice must be explicit; do not invent death probability, required defensive values,
or guarantees. A warning belongs to the location and, when specified, an encounter at that
same location.

## SourceEvidence

Fields: id, title, publisher, url, locator, sourceType, accessedAt, publishedAt (nullable),
applicableGameVersion (nullable), applicabilityNote, reuseNote (nullable).

sourceType distinguishes official-patch, first-hand-observation, extracted-game-data, and
community-guide. The locator identifies the relevant section, record variant, or video timestamp.
Only http/https links are allowed. Source titles, locators, and review metadata stay available
when a source page is offline. No remote HTML or image embedding is required.

## MapLayout

Fields: id, segmentId, coordinateWidth, coordinateHeight, backgroundAssetId (nullable),
nodePositions, connectionPaths.

Each node position has locationId, finite x/y coordinates, labelPlacement, and optional assetId.
Each connection path has connectionId and authored intermediate points, if required.
Use the same coordinate space for terrain, routes, and button anchors. Coordinates are
presentation decisions, not gameplay geography or entity identity. Every included location
needs one position; every internal route needs a path or a straight-path default.

Keep label sizes and hit areas readable at overview scale. Adjust placement and control points
for this authored slice before considering an automatic layout engine.

## AssetProvenance and VisualReference

AssetProvenance fields: id, localPath, creator, origin (original, licensed, or permission),
sourceUrl (nullable for original work), licenseOrPermission, attribution, modificationNote.
All distributed terrain, icons, textures, and fonts require a provenance entry. External
reference screenshots are not distributed runtime assets.

VisualReference is a documentation record in research.md: id, source URL, image URL,
inspection hash, observed dimensions, coverage, limitations, approvalStatus, and approvalNote.
The actual human approval decision/date is recorded only when received. No application
database or approval service is needed.

## Publication invariants

Publication fails for invalid structure, duplicate/dangling IDs, non-finite coordinates,
missing layout nodes, disconnected coverage, unsourced documented claims or routes, invalid
source protocols, missing snapshot metadata, unexplained claim status, or missing asset origin.
It also fails if the release list differs from research.md or the minimum boss/optional
reward/sourced-warning coverage is absent.

Publication consistency checks cannot prove source truth or earliest endpoint selection.
Content review must establish those, reconcile conflicting sources, and preserve individual
unknowns. Fixture data stays outside shipped content; source pages need not be online at build
or application runtime.

Runtime uses the same schemas by boundary: invalid core metadata, locations, or graph shows
an error with retry. A malformed unrelated encounter/reward category is isolated as unavailable;
valid location identity and remaining categories stay readable. An unavailable category is not
relabeled as unknown game knowledge. Broken optional decoration falls back to a plain map surface.

## Transient application state

| State | Transitions and invariants |
|---|---|
| loadStatus | loading → ready or error; error → loading via Retry; ignore superseded request completions |
| selectedLocationId | null or one valid included ID; selecting another replaces details synchronously |
| focusedLocationId | Independent from selection; focus alone does not open details |
| lastActivatedLocationId | Most recently activated node; close returns focus there |
| camera | One finite x/y/scale transform owned by map behavior; independent of detail selection |
| categoryAvailability | available or unavailable per category; separate from evidence statuses |

Close clears selection, retains camera, and restores focus. Overview fits the scene and retains
selection. Keyboard focus may minimally reveal an offscreen node without selecting it.
Resizing updates viewport bounds without resetting selection or deliberately re-fitting the map.
A page reload starts at the overview with no selection; personal progress and persistent camera
history are outside this feature.

Content lifecycle is ordinary reviewed source change → validated snapshot → release. A failed
new build leaves the previous release intact. A later game patch changes neither the published
snapshot nor its declared target version.
