# Feature Specification: Interactive Campaign Map

**Feature Branch**: `main` (no branch hook configured; feature directory is independent)

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: "Build an interactive campaign-map companion for Path of Exile 2.
Players should be able to explore the campaign map and discover useful information about
locations, bosses, combat mechanics, resistances, weaknesses, rewards, and Hardcore dangers."

## Clarifications

### Session 2026-10-16

- Q: What campaign coverage should the first release include? → A: An opening Act 1 segment,
  ending once it includes at least five connected locations, a boss, an optional reward
  destination, and a Hardcore warning.
- Q: How should we establish the visual references for the first release? → A: The agent
  researches PoE2 campaign-map references and proposes a reference set for human approval
  before visual implementation.
- Q: What freshness promise should the first release make about its gameplay information? → A:
  A reviewed snapshot targeting the game version current during content research, clearly dated
  and updated through later reviewed releases.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explore connected campaign locations (Priority: P1)

As a campaign player, I want to explore a recognizable campaign map, understand which locations
connect, and select a location to learn what I can encounter there.

**Why this priority**: The map and its locations are the core experience and provide useful
orientation before richer encounter information is added.

**Independent Test**: Open the companion, identify the covered campaign segment, explore its
connections, and inspect two different locations. This demonstrates a useful map independently
of detailed boss or reward content.

**Acceptance Scenarios**:

1. **Given** the companion has opened, **When** the map is ready, **Then** the covered campaign
   segment, named location nodes, and their connections are visible, and the initial view fits
   the included segment.
2. **Given** a visible location, **When** the player selects it, **Then** that location is visibly
   selected and its matching name, summary, and available information categories are shown.
3. **Given** an inspected location, **When** the player selects another node or closes the
   details, **Then** selection and details agree, no old information remains under the new
   location, and the explored map position is preserved.
4. **Given** the player has moved or enlarged the map, **When** they request the overview,
   **Then** all included locations return into view without changing the selected location.
5. **Given** keyboard-only interaction, **When** the player navigates nodes and activates one,
   **Then** focus is visible, the matching details are available, and closing details returns
   focus to the originating node.
6. **Given** the overview or selected-location state, **When** its visual milestone is reviewed,
   **Then** browser screenshots are compared with approved references across layout, atmosphere,
   typography, composition, colors, textures, and interaction states. Missing reference coverage
   is recorded, and visual acceptance remains pending until human approval.

---

### User Story 2 - Prepare for a boss and recognize Hardcore dangers (Priority: P1)

As a player approaching an encounter, especially in Hardcore, I want to inspect its damage,
defenses, mechanics, and dangerous situations so I can decide how to prepare.

**Why this priority**: Encounter preparation supplies the practical value of the companion;
missing or misleading danger information can undermine that value.

**Independent Test**: Inspect a known boss location in the release content and identify its
documented mechanics, damage types, defensive properties, and Hardcore warning. Include an
encounter with an unknown property to verify that uncertainty is explicit.

**Acceptance Scenarios**:

1. **Given** a location with a documented boss, **When** the player opens its encounter details,
   **Then** the boss identity, damage types, resistances, weaknesses, and combat mechanics are
   grouped under clear labels, with an explicit unknown state for unsupported properties.
2. **Given** an encounter with a documented Hardcore danger, **When** the player inspects it,
   **Then** the warning is visible alongside the encounter information without enabling a
   separate mode, identifies the dangerous event, and includes sourced avoidance guidance when
   available.
3. **Given** a gameplay claim, **When** the player inspects its supporting information, **Then**
   they can identify the source and its applicable game version or verification date when known.
4. **Given** missing, conflicting, or potentially outdated information, **When** it is shown,
   **Then** its uncertainty is visible beside the affected claim; an unknown resistance is not
   presented as zero resistance, and no known warning is not presented as a guarantee of safety.
5. **Given** a location with no documented boss, **When** its details are opened, **Then** the
   player sees that no boss is documented there and can continue exploring normally.
6. **Given** the published content snapshot, **When** the player checks its applicability,
   **Then** its target game version and review date are visible from the map and location
   details, and its information is identified as a reviewed snapshot.

---

### User Story 3 - Discover useful rewards and points of interest (Priority: P2)

As a campaign player, I want to find useful rewards and points of interest in connected locations
so I can decide whether a destination is worth visiting.

**Why this priority**: Rewards make exploration useful beyond progressing toward the next boss
while reusing the core map experience.

**Independent Test**: Inspect a reward-bearing location and a location without a documented
reward, identify the benefit and its conditions where known, and locate a connected destination.

**Acceptance Scenarios**:

1. **Given** a location with documented rewards or points of interest, **When** its details are
   opened, **Then** their names, benefits, and known acquisition conditions are shown.
2. **Given** documented optional and required destinations, **When** the player explores their
   map connections and details, **Then** those roles are distinguishable without implying that
   an unknown progression role has been verified.
3. **Given** a location with no documented reward or point of interest, **When** it is inspected,
   **Then** the companion explicitly indicates the information gap and remains usable.
4. **Given** a reward or point of interest with incomplete conditions, **When** it is displayed,
   **Then** the known information and its source are available and the missing conditions are
   labeled rather than invented.

---

### Edge Cases

- Long or similar location names remain readable and distinguishable; selecting one never opens
  another location's content.
- Multiple bosses, rewards, or warnings at one location remain individually identifiable.
- A missing field affects only its category; the rest of the location stays available.
- An unavailable or unverified connection is not shown as a confirmed route. Connections to
  uncovered content are labeled as outside this release and do not open empty destinations.
- Rapid changes of selection never leave mismatched details or multiple active selections.
- Map movement beyond the useful area can be recovered using the overview control.
- On narrow screens, details remain reachable and readable without obscuring all map controls.
- If the map or location information cannot be loaded, an understandable message and retry
  action replace the affected view; retrying successfully restores normal exploration.
- Missing decorative artwork never removes location labels, connections, or encounter information.
- A later game update does not silently change the snapshot's declared target version or
  freshness. An unavailable external source page does not prevent reading the published
  snapshot or identifying the source that supported its claims.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The release MUST provide one contiguous opening segment of Act 1 with at least five
  connected, real campaign locations, at least one documented boss encounter, one documented
  reward or point of interest at an optional destination, and one sourced Hardcore warning.
  The segment MUST end at the earliest progression point where all these conditions are met,
  including the necessary optional destination and its connecting locations.
  A release content list MUST enumerate the included locations and endpoint before content
  implementation; it MUST include intervening locations needed for truthful connections.
- **FR-002**: The covered act, included locations, and coverage boundary MUST be identifiable.
  Content outside this segment is deferred to subsequent increments, without limiting eventual
  full-campaign coverage.
- **FR-003**: The primary experience MUST be a dark-fantasy campaign map with named interactive
  nodes and sourced connections. Location labels and route relationships MUST remain legible
  against decorative artwork.
- **FR-004**: Players MUST be able to move around the map, enlarge or reduce its view, and restore
  an overview. Map exploration MUST preserve selection and provide a way to recover from moving
  away from the covered locations.
- **FR-005**: Selecting a location MUST show its matching details and a visible selected state.
  Changing or closing details MUST preserve the map view and remove stale information.
- **FR-006**: Location details MUST present its name, summary, campaign context, encounters,
  rewards, and points of interest, identifying categories with no documented information.
- **FR-007**: Encounter details MUST distinguish boss identity, damage dealt, resistances,
  weaknesses, and combat mechanics. Unsupported properties MUST be explicitly unknown;
  a weakness MUST NOT be inferred solely from an absent resistance entry.
- **FR-008**: Documented Hardcore warnings MUST appear with the relevant location or encounter
  without a mode switch, describe the dangerous event, and show sourced preparation or avoidance
  guidance when available. Warning meaning MUST NOT depend on color alone.
- **FR-009**: Reward and point-of-interest details MUST identify the benefit, known conditions,
  and optional or required progression role where verified, with unknown conditions explicit.
- **FR-010**: Every gameplay claim and confirmed route MUST be traceable to an identifiable
  source accessible from the relevant details. Applicable game version or verification date
  MUST be shown when known; unknown freshness, conflicting claims, and suspected outdated
  information MUST be labeled. Editorial advice MUST be distinguished from verified game facts.
- **FR-011**: The initial release MUST contain actual sourced gameplay content satisfying FR-001.
  Sample or invented content MUST NOT be presented to players as verified campaign information.
  Missing knowledge MUST NOT imply no danger, no resistance, or guaranteed rewards.
- **FR-012**: Core exploration, node selection, reading details, and closing details MUST work
  using keyboard and pointer input. Focus MUST be visible; controls and locations MUST have
  meaningful accessible names, and focus MUST return predictably after closing details.
- **FR-013**: The experience MUST support a 1280 × 720 desktop viewport and remain usable at a
  390 × 844 narrow viewport: text and controls remain readable and reachable, details can scroll,
  and every included location can be reached and selected without hover-only information.
- **FR-014**: Loading and recoverable failure states MUST identify the affected content and offer
  retry. Available location information MUST remain readable when an unrelated category or
  decorative asset is unavailable.
- **FR-015**: Approved visual references MUST guide the map and details. The overview,
  selected-location details, encounter warning, keyboard focus, and narrow-screen states MUST
  have actual browser screenshot evidence. Major UI milestones require human visual approval;
  significant deviations require documented justification and review.
  The agent MUST research PoE2 campaign-map references and propose a reference set, recording
  its sources and intended visual coverage. That set MUST receive human approval before visual
  implementation begins; approval of a reference does not grant permission to reuse its artwork.
- **FR-016**: Missing or incomplete visual references MUST be recorded as unresolved visual
  dependencies. Functional completion MUST NOT be reported as visual acceptance, and no exact
  reference-specific acceptance criteria may be invented before references are approved.
- **FR-017**: All displayed artwork MUST have an identified permission or license basis, or be
  original. Visual resemblance MUST NOT depend on assuming permission to reuse proprietary art.
- **FR-018**: Gameplay information MUST be published as a reviewed content snapshot targeting
  the game version current when its research baseline is established. Its target game version
  and review date MUST be visible from the map and location details. Subsequent content updates
  MUST be published through reviewed releases; a new game patch MUST NOT silently change the
  snapshot's declared applicability. Reading published information MUST NOT depend on the
  availability of its external source pages.

### Key Entities *(include if feature involves data)*

- **Campaign segment**: The act and bounded release coverage, its included locations, starting
  context, endpoint, and connections to content outside the release.
- **Content snapshot**: A reviewed release of campaign information with a target game version,
  research baseline date, and review date. Updated content is delivered in a later reviewed
  release while individual claims retain their supporting evidence and uncertainty labels.
- **Location**: An identifiable campaign area with a name, summary, progression role where known,
  connected locations, encounters, rewards, and points of interest.
- **Connection**: A sourced relationship between locations, including direction or access
  conditions where documented; it does not imply an exact generated in-game terrain layout.
- **Encounter**: A boss or notable combat encounter belonging to a location, with documented
  damage, resistances, weaknesses, mechanics, and related warnings.
- **Reward or point of interest**: A benefit or notable destination associated with a location,
  including known acquisition conditions and progression relevance.
- **Hardcore warning**: A sourced danger associated with a location or encounter, its trigger,
  consequences, and preparation or avoidance guidance where supported.
- **Source evidence**: Source identity and locator, the claims it supports, game version or
  verification date where known, and any uncertainty or conflicting information.
- **Visual reference**: A reference with recorded approval status and intended coverage of
  visual dimensions and states; reference permission for reuse is distinct from visual approval.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the initial overview, a reviewer can identify the covered segment, inspect a
  location, and locate a connected destination within 60 seconds without guided instructions.
- **SC-002**: All included locations and confirmed connections match the release content list
  and their sources; every included node opens the matching location details.
- **SC-003**: For the included boss encounter, a reviewer can find its documented damage types,
  mechanics, defensive properties or explicit unknowns, and Hardcore danger within 30 seconds
  of opening its location.
- **SC-004**: At least one optional destination exposes a sourced benefit and known acquisition
  conditions or explicit gaps; every missing or uncertain gameplay property is visibly labeled,
  and every verified claim has identifiable supporting evidence.
- **SC-005**: Under the baseline desktop condition below, the map is usable within 3 seconds of
  opening and at least 95% of 20 successive selections display matching details within 300
  milliseconds. Timing is measured from the player's action to the usable visible result.
- **SC-006**: Every core journey can be completed with keyboard-only interaction at the desktop
  baseline and with pointer input at both specified viewport sizes, without inaccessible
  controls, unreadable detail text, or loss of the selected location.
- **SC-007**: Every visual state listed in FR-015 has browser screenshot evidence, and the human
  reviewer approves the overview and location-detail milestones against the approved references,
  with significant deviations documented and reviewed. This outcome remains pending while
  required reference coverage or human approval is missing.
- **SC-008**: The missing-information, unavailable-content, retry, and rapid-selection scenarios
  preserve a usable path back to map exploration and never show one location's facts under
  another location's name.
- **SC-009**: The published snapshot exposes its target game version and review date from both
  the map and location details. A later game patch leaves that declaration unchanged until a
  reviewed content update is released, and unavailable source pages do not make published
  encounter information unreadable.

## Assumptions

- **Initial coverage**: The confirmed first slice is a connected opening segment of Act 1,
  ending once the coverage conditions in FR-001 are met. Exact location names and gameplay
  facts require source verification for the targeted game version before content implementation.
  The release content list records that selection; a materially different segment or expansion
  beyond this slice requires a specification update.
- **Audience and access**: Players can browse without an account. The first slice is an English
  reference companion; personal progress tracking, build calculation, live game integration,
  multiplayer features, and content editing interfaces are outside this feature.
- **Map meaning**: The map represents campaign location relationships, not an exact terrain
  layout or a guarantee that every playthrough has identical generated geography.
- **Visual dependency**: No visual references have been supplied or approved. The agent will
  research and propose the reference set for human approval before visual implementation.
  Functional and technical planning can proceed while this dependency is recorded; visual
  acceptance also requires usable assets and the milestone reviews defined in FR-015.
- **Content dependency**: The first snapshot targets the game version current when the research
  baseline is established. Identifiable sources are needed to select and populate the real
  segment; the target version, research baseline date, and review date are recorded with that
  snapshot. Later changes are delivered through reviewed content releases. This specification
  makes no claims about particular bosses, rewards, resistance values, or current campaign facts.
- **Device baseline**: Desktop use is primary; a narrower viewport must support the same core
  reading and selection journeys, without requiring identical composition or advanced gestures.
- **Performance baseline**: Timing targets assume a typical current laptop, a supported desktop
  browser, a fresh visit, and a stable connection of at least 10 Mbps. Targets are initial product
  defaults, subject to an explicit specification amendment if evidence warrants a change.
- **Delivery boundary**: This command creates specification artifacts only. Architecture,
  technology selection, content research, implementation, and browser verification follow in
  their appropriate phases.
