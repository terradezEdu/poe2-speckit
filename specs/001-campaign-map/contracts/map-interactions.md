# Contract: Map Exploration and Details

Status: planned user interface contract. Applies to the three stories in [spec.md](../spec.md).
Visual implementation follows the [approved baseline](../research.md#4-visual-reference-proposal--approved-baseline)
(user approval 2026-10-16); panel layout and information density may adapt for readability
and usability. Implemented overview/detail milestone approvals remain pending.

## Entry, navigation, and identity

Opening the application loads the reviewed snapshot and fits the included segment into the map
stage. Display covered act/segment, target game version, and review date. Nodes are native
buttons with meaningful location names, stable location IDs, visible focus, and a visible
selected state. SVG routes and artwork do not replace button semantics.

Each included node is reachable with normal Tab/Shift+Tab navigation in the segment's deliberate
reading order. Enter or Space selects it. Focus alone does not select. If keyboard focus reaches
an offscreen node, minimally pan to reveal its button and label. Provide keyboard-operable Zoom
in, Zoom out, Overview, and directional Pan controls; do not capture global page arrow keys.

An outside-coverage notice is not a selectable node. A documented one-way or conditional route
must not visually promise unrestricted bidirectional travel. These relationships are campaign
connections, not generated terrain directions or in-game travel actions.

## Interaction/state mapping

| Action | Selection/details | Camera/focus |
|---|---|---|
| Activate node A | A becomes the sole selection; show A's matching details | Preserve camera; retain originating node for close |
| Activate node B | Replace with B synchronously | Preserve camera; B becomes latest origin |
| Activate already selected node | Remain selected; no duplicate panel | Preserve camera |
| Move keyboard focus to node | Selection unchanged | Show visible focus; minimally reveal if needed |
| Drag empty terrain | Selection unchanged | Pan stage; do not activate a node on release |
| Zoom control, wheel, or pinch on stage | Selection unchanged | Zoom within limits around the interaction anchor |
| Overview | Selection unchanged | Fit included nodes and readable labels |
| Close details, or Escape within map/details | Clear selection and details | Preserve camera transform; restore focus to latest origin, scrolling the page only as much as needed to make returned focus visible |
| Resize or change viewport orientation | Preserve selection and matching details | Preserve transform; update viewport bounds |
| Retry a failed content load | Preserve any still-valid selection | Retain usable camera; ignore superseded request completion |

A pointer movement starting on a node must not activate it after a drag threshold has been
crossed. Nodes never become draggable graph-editing handles. Gesture interception is limited to
the map stage; controls, links, and detail scrolling retain their normal behavior. All input
paths must update the same canonical camera so HTML node anchors and SVG routes stay aligned.

After initial fit, changing/closing details never re-fits the map. On desktop, reserve detail
space; on narrow screens, place details below a stable map stage so selection does not resize
the stage. Keyboard reveal and explicit camera actions are the exceptions to camera preservation.

## Detail content and source behavior

Location heading, selected button, and visible facts always refer to the same location ID.
Show summary, encounters, rewards, and points of interest with explicit no-information states.
The relevant Hardcore warning is visible in the encounter reading flow without a special mode.
Use text and an icon as well as color to communicate danger.

Boss details distinguish damage, resistances, weaknesses, and mechanics. Unknown resistance
never renders as zero. Editorial advice and conflicting/outdated information are labeled
beside the claim. Source identity and applicable version/review metadata can be reached from
the relevant details without losing selection or map position.

Details are a labeled nonmodal region. Do not use aria-modal, make the map inert, or trap focus
while the map remains operable. Move focus to the detail heading on keyboard activation, and
leave pointer focus on the activated node. Focus return must remain visible, including at a
narrow viewport.

## Viewports and readable presentation

Validate desktop at 1280 × 720 and narrow layout at 390 × 844. At both sizes every included node,
camera control, source link, and Close control is reachable. Use at least 44 CSS-pixel pointer
targets for map buttons/controls and readable text at overview scale; do not shrink labels with
the terrain until they cannot be read. Labels may wrap without obscuring node identity.
Long details scroll normally, while map controls remain accessible.

Honor reduced-motion preferences. Transitions communicate user actions and do not continually
animate the background. Show a meaningful loading state, an affected-content error with Retry,
and a scoped unavailable state for a broken optional category. Missing decoration never hides
location labels, connections, or readable details.

## Acceptance evidence

Use automated browser checks for identity, selection, camera preservation, drag suppression,
overview, keyboard focus, content labels, narrow-screen reachability, and fault recovery.
Capture overview, selected details, warning, focus, and narrow states using actual browser images.
Compare the overview and detail milestone images with the human-approved references; reference
approval and milestone approval are distinct. Capture alone does not constitute either approval.

Timing endpoints are visible usability: ready means nodes, controls, routes, and snapshot
metadata are usable; selection-ready means the correct location heading and required detail
categories have painted. Do not use request completion or idle network alone as the measure.
