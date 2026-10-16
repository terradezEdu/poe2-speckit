# Contract: Reviewed Campaign Content

Status: planned interface, schema version 1. No content endpoint exists yet.
See [data-model.md](../data-model.md) for entity definitions and
[research.md](../research.md#game-version-and-release-content-list) for the first release list.

## Interface

The application exposes one read-only same-origin resource:

| Request | Successful response | Behavior |
|---|---|---|
| GET /content/act1-opening.json | 200, application/json, ContentSnapshot v1 | Whole reviewed slice, evidence, layout, and asset provenance |

Resolve the resource against the configured deployment base path, so a subdirectory deployment
does not accidentally request a different site's root. There are no write endpoints,
authentication requirements, game account calls, or live third-party content requests.

## Payload boundary

The root document contains schemaVersion, snapshotId, targetGameVersion, researchBaselineDate,
reviewedAt, segment, locations, connections, encounters, rewards, pointsOfInterest, warnings,
sources, presentation, and assets. Types and required invariants are defined in data-model.md.
The schema implementation will be the shared source of runtime and inferred TypeScript types;
this document does not establish a separate competing schema.

snapshotId identifies a content release, not a player session. targetGameVersion identifies
reviewed game applicability, not the content contract version. All user-visible facts and advice
retain their status and evidence, including gaps; absence is not synthesized into zero values.
Publish only valid, actually reviewed content. Fictional acceptance fixtures are not served here.

## Authoring and publication

Campaign content, map layout, and asset provenance are authored separately. The build validator
resolves references and combines them into the single delivery file. It verifies the
five-location release list, graph, documented claims, metadata, and provenance before publishing.
Source review establishes factual correctness; validation establishes document consistency.

Serve the snapshot with revalidation rather than an indefinitely cached stable URL. Deploy
HTML, application assets, and the snapshot as one release. Hashed application/image assets may
be cached immutably. Never mix different snapshot versions within a loaded session. A later
patch of the game does not silently update this resource or its applicability label.

Exact package lock and shipped snapshot remain reproducible from version control. Do not fetch
or scrape game facts during builds; a reproducible build consumes the reviewed authored inputs.

## Loading, failure, and retry

The first request produces a visible loading state. On success, all location selections resolve
from the loaded document. A failed HTTP request, invalid JSON, unsupported schema, invalid core
metadata, or broken location graph produces a user-facing content error with Retry.
Retry requests fresh content and prevents an older request from replacing a newer result.

Validate optional encounter, reward, and point-of-interest records by category with the same
schemas used for publication. If an unrelated category is malformed at runtime, show that
category as unavailable while preserving readable valid location information. Do not show
unvalidated category claims or label a technical failure as verified absence. Bad optional
artwork falls back without suppressing labels or routes.

External evidence URLs are links, not dependencies of the content request. If such a URL is
unavailable, local source identity, locator, and published encounter facts remain readable.
No link-check network request is needed on every page load or content validation run.

## Safety and browser behavior

Render authored text as text, not executable HTML. Allow only http/https evidence URLs;
outbound links opened in another tab use appropriate opener isolation. Asset paths refer only
to packaged resources listed in the provenance manifest. Do not embed remote scripts, cookies,
credentials, game-account tokens, or telemetry in this interface.

## Compatibility

Consumers reject unsupported schemaVersion values with the recoverable error state.
Additive optional properties may be ignored within version 1. Changes that remove required
fields or change their meaning require a new schema version and a coordinated application
release. A content-only snapshot update does not automatically require a schema change.
