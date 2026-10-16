import { z } from 'zod';
import {
  assetProvenanceSchema,
  campaignSegmentSchema,
  connectionSchema,
  contentSnapshotSchema,
  encounterSchema,
  hardcoreWarningSchema,
  locationSchema,
  mapLayoutSchema,
  pointOfInterestSchema,
  rewardSchema,
  sourceEvidenceSchema,
  type ContentSnapshot,
} from './schema.ts';

const EXPECTED_LOCATION_IDS = [
  'act1-riverbank',
  'act1-clearfell-encampment',
  'act1-clearfell',
  'act1-mud-burrow',
  'act1-grelwood',
] as const;

const EXPECTED_CONNECTIONS = [
  ['act1-riverbank', 'act1-clearfell-encampment'],
  ['act1-clearfell-encampment', 'act1-clearfell'],
  ['act1-clearfell', 'act1-mud-burrow'],
  ['act1-clearfell', 'act1-grelwood'],
] as const;

const optionalCategoryNames = ['encounters', 'rewards', 'pointsOfInterest', 'warnings'] as const;
type OptionalCategory = (typeof optionalCategoryNames)[number];
export type CategoryAvailability = Record<OptionalCategory, 'available' | 'unavailable'>;
export type ValidationMode = 'draft' | 'publication' | 'runtime';

export interface ValidationOptions {
  mode?: ValidationMode;
  packagedAssetPaths?: ReadonlySet<string>;
}

export interface ValidationResult {
  success: boolean;
  issues: string[];
  snapshot?: ContentSnapshot;
  categoryAvailability: CategoryAvailability;
}

const coreSnapshotSchema = contentSnapshotSchema
  .omit({ encounters: true, rewards: true, pointsOfInterest: true, warnings: true })
  .extend({
    encounters: z.unknown().optional(),
    rewards: z.unknown().optional(),
    pointsOfInterest: z.unknown().optional(),
    warnings: z.unknown().optional(),
  });

const categorySchemas = {
  encounters: z.array(encounterSchema),
  rewards: z.array(rewardSchema),
  pointsOfInterest: z.array(pointOfInterestSchema),
  warnings: z.array(hardcoreWarningSchema),
} satisfies Record<OptionalCategory, z.ZodType>;

const availableCategories = (): CategoryAvailability => ({
  encounters: 'available',
  rewards: 'available',
  pointsOfInterest: 'available',
  warnings: 'available',
});

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join('.') || 'snapshot'}: ${issue.message}`);
}

function addUniqueIdIssues(collection: readonly { id: string }[], path: string, issues: string[]): void {
  const seen = new Set<string>();
  for (const entity of collection) {
    if (seen.has(entity.id)) issues.push(`${path}: duplicate ID "${entity.id}".`);
    seen.add(entity.id);
  }
}

function addReferenceIssues(references: readonly string[], allowed: ReadonlySet<string>, path: string, issues: string[]): void {
  for (const reference of references) {
    if (!allowed.has(reference)) issues.push(`${path}: references unknown ID "${reference}".`);
  }
}

function inspectEvidence(value: unknown, sourceIds: ReadonlySet<string>, path: string, issues: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((child, index) => inspectEvidence(child, sourceIds, `${path}[${index}]`, issues));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const record = value as Record<string, unknown>;
  if (typeof record.status === 'string' && Array.isArray(record.sourceIds)) {
    for (const sourceId of record.sourceIds) {
      if (typeof sourceId === 'string' && !sourceIds.has(sourceId)) {
        issues.push(`${path}: evidence references unknown source "${sourceId}".`);
      }
    }
    if (record.status === 'documented' && record.sourceIds.length === 0) {
      issues.push(`${path}: documented claims require source evidence.`);
    }
    if (['uncertain', 'conflicted', 'outdated', 'unknown'].includes(record.status) && !(typeof record.note === 'string' && record.note.trim())) {
      issues.push(`${path}: ${record.status} claims require an explanation.`);
    }
  }
  for (const [key, child] of Object.entries(record)) {
    if (key !== 'sourceIds') inspectEvidence(child, sourceIds, `${path}.${key}`, issues);
  }
}

function addCoreIntegrityIssues(
  snapshot: Omit<ContentSnapshot, OptionalCategory> & Partial<Pick<ContentSnapshot, OptionalCategory>>,
  options: ValidationOptions,
  issues: string[],
): void {
  const { segment, locations, connections, presentation, sources, assets } = snapshot;
  const locationIds = new Set(locations.map(({ id }) => id));
  const connectionIds = new Set(connections.map(({ id }) => id));
  const sourceIds = new Set(sources.map(({ id }) => id));
  const assetIds = new Set(assets.map(({ id }) => id));

  addUniqueIdIssues([segment], 'segment', issues);
  addUniqueIdIssues(locations, 'locations', issues);
  addUniqueIdIssues(connections, 'connections', issues);
  addUniqueIdIssues(sources, 'sources', issues);
  addUniqueIdIssues(assets, 'assets', issues);

  if (segment.id !== presentation.segmentId) issues.push('presentation.segmentId must match segment.id.');
  if (segment.id !== 'act1-opening' || segment.actId !== 'act1') issues.push('The release segment must be the act1-opening segment.');
  if (snapshot.targetGameVersion !== '0.5.5e') issues.push('targetGameVersion must match the reviewed 0.5.5e research target.');
  if (snapshot.researchBaselineDate !== '2026-10-16') issues.push('researchBaselineDate must match the 2026-10-16 research baseline.');
  if (segment.locationIds.length !== EXPECTED_LOCATION_IDS.length || segment.locationIds.some((id, index) => id !== EXPECTED_LOCATION_IDS[index])) {
    issues.push(`segment.locationIds must match the required five-location reading order: ${EXPECTED_LOCATION_IDS.join(', ')}.`);
  }
  if (locations.length !== EXPECTED_LOCATION_IDS.length || locations.some(({ id }, index) => id !== EXPECTED_LOCATION_IDS[index])) {
    issues.push('locations must match segment.locationIds in the required five-location order.');
  }
  if (segment.entryLocationId !== EXPECTED_LOCATION_IDS[0]) issues.push('segment.entryLocationId must be act1-riverbank.');
  if (segment.endpointLocationId !== 'act1-grelwood') issues.push('segment endpoint must be act1-grelwood.');
  if (snapshot.researchBaselineDate > (snapshot.reviewedAt ?? '9999-12-31')) {
    issues.push('researchBaselineDate must not follow reviewedAt.');
  }
  if (options.mode === 'publication' && !snapshot.reviewedAt) {
    issues.push('reviewedAt is required for publication after actual content review.');
  }

  const connectionPairs = new Set<string>();
  for (const connection of connections) {
    if (!locationIds.has(connection.fromLocationId) || !locationIds.has(connection.toLocationId)) {
      issues.push(`connections.${connection.id} must connect two included locations.`);
    }
    if (connection.fromLocationId === connection.toLocationId) issues.push(`connections.${connection.id} cannot be a self-loop.`);
    const pair = [connection.fromLocationId, connection.toLocationId].sort().join('::');
    if (connectionPairs.has(pair)) issues.push(`connections.${connection.id} duplicates an existing relationship.`);
    connectionPairs.add(pair);
  }
  const expectedPairs = EXPECTED_CONNECTIONS.map((pair) => [...pair].sort().join('::'));
  if (connectionPairs.size !== expectedPairs.length || expectedPairs.some((pair) => !connectionPairs.has(pair))) {
    issues.push('connections must contain the four listed internal relationships.');
  }

  const reached = new Set<string>([segment.entryLocationId]);
  let advanced = true;
  while (advanced) {
    advanced = false;
    for (const { fromLocationId, toLocationId } of connections) {
      if (reached.has(fromLocationId) && !reached.has(toLocationId)) {
        reached.add(toLocationId);
        advanced = true;
      }
      if (reached.has(toLocationId) && !reached.has(fromLocationId)) {
        reached.add(fromLocationId);
        advanced = true;
      }
    }
  }
  if (reached.size !== locationIds.size) issues.push('Internal location coverage must be connected.');

  for (const boundary of segment.boundaries) {
    if (!locationIds.has(boundary.fromLocationId)) issues.push(`Boundary ${boundary.externalDestinationName} must start at an included location.`);
  }

  const positionById = new Map<string, (typeof presentation.nodePositions)[number]>();
  for (const position of presentation.nodePositions) {
    if (positionById.has(position.locationId)) issues.push(`presentation has duplicate position for ${position.locationId}.`);
    positionById.set(position.locationId, position);
    if (!locationIds.has(position.locationId)) issues.push(`presentation position references unknown location ${position.locationId}.`);
    if (position.x < 0 || position.x > presentation.coordinateWidth || position.y < 0 || position.y > presentation.coordinateHeight) {
      issues.push(`presentation position for ${position.locationId} is outside the coordinate space.`);
    }
    if (position.assetId && !assetIds.has(position.assetId)) issues.push(`presentation position references unlisted asset ${position.assetId}.`);
  }
  for (const locationId of locationIds) {
    if (!positionById.has(locationId)) issues.push(`presentation is missing a position for ${locationId}.`);
  }

  const pathIds = new Set<string>();
  for (const path of presentation.connectionPaths) {
    if (!connectionIds.has(path.connectionId)) issues.push(`presentation path references unknown connection ${path.connectionId}.`);
    if (pathIds.has(path.connectionId)) issues.push(`presentation has duplicate path for ${path.connectionId}.`);
    pathIds.add(path.connectionId);
    for (const point of path.points) {
      if (point.x < 0 || point.x > presentation.coordinateWidth || point.y < 0 || point.y > presentation.coordinateHeight) {
        issues.push(`presentation path for ${path.connectionId} leaves the coordinate space.`);
      }
    }
  }
  for (const connectionId of connectionIds) {
    if (!pathIds.has(connectionId)) issues.push(`presentation needs a path or straight-path default for ${connectionId}.`);
  }

  if (presentation.backgroundAssetId && !assetIds.has(presentation.backgroundAssetId)) {
    issues.push(`presentation.backgroundAssetId references unlisted asset ${presentation.backgroundAssetId}.`);
  }
  for (const asset of assets) {
    if (options.packagedAssetPaths && !options.packagedAssetPaths.has(asset.localPath)) {
      issues.push(`assets.${asset.id} path is not present in the packaged asset list.`);
    }
  }

  for (const entity of [segment, ...locations, ...connections]) {
    if ('identitySourceIds' in entity) addReferenceIssues(entity.identitySourceIds, sourceIds, 'identitySourceIds', issues);
  }
  inspectEvidence({ segment, locations, connections }, sourceIds, 'core', issues);
}

function categoryIssues(snapshot: ContentSnapshot, category: OptionalCategory): string[] {
  const issues: string[] = [];
  const sourceIds = new Set(snapshot.sources.map(({ id }) => id));
  const locationIds = new Set(snapshot.locations.map(({ id }) => id));
  const encounterIds = new Set(snapshot.encounters.map(({ id }) => id));
  const rewardIds = new Set(snapshot.rewards.map(({ id }) => id));
  const poiIds = new Set(snapshot.pointsOfInterest.map(({ id }) => id));
  const warningIds = new Set(snapshot.warnings.map(({ id }) => id));
  const categoryRecords = snapshot[category] as readonly { id: string }[];
  addUniqueIdIssues(categoryRecords, category, issues);

  if (category === 'encounters') {
    for (const encounter of snapshot.encounters) {
      if (!locationIds.has(encounter.locationId)) issues.push(`encounters.${encounter.id} references an unknown location.`);
      addReferenceIssues(encounter.identitySourceIds, sourceIds, `encounters.${encounter.id}.identitySourceIds`, issues);
      addUniqueIdIssues(encounter.mechanics, `encounters.${encounter.id}.mechanics`, issues);
      addUniqueIdIssues(encounter.weaknesses, `encounters.${encounter.id}.weaknesses`, issues);
      const location = snapshot.locations.find(({ id }) => id === encounter.locationId);
      if (!location?.encounterIds.includes(encounter.id)) issues.push(`locations.${encounter.locationId} must list encounter ${encounter.id}.`);
      inspectEvidence(encounter, sourceIds, `encounters.${encounter.id}`, issues);
    }
    for (const location of snapshot.locations) {
      addReferenceIssues(location.encounterIds, encounterIds, `locations.${location.id}.encounterIds`, issues);
    }
  }

  if (category === 'rewards') {
    for (const reward of snapshot.rewards) {
      if (!locationIds.has(reward.locationId)) issues.push(`rewards.${reward.id} references an unknown location.`);
      if (reward.handInLocationId && !locationIds.has(reward.handInLocationId)) issues.push(`rewards.${reward.id} has an unknown hand-in location.`);
      addReferenceIssues(reward.identitySourceIds, sourceIds, `rewards.${reward.id}.identitySourceIds`, issues);
      const origin = snapshot.locations.find(({ id }) => id === reward.locationId);
      if (!origin?.rewardIds.includes(reward.id)) issues.push(`locations.${reward.locationId} must list reward ${reward.id}.`);
      if (reward.handInLocationId) {
        const handIn = snapshot.locations.find(({ id }) => id === reward.handInLocationId);
        if (!handIn?.rewardIds.includes(reward.id)) issues.push(`locations.${reward.handInLocationId} must list hand-in reward ${reward.id}.`);
      }
      inspectEvidence(reward, sourceIds, `rewards.${reward.id}`, issues);
    }
    for (const location of snapshot.locations) {
      addReferenceIssues(location.rewardIds, rewardIds, `locations.${location.id}.rewardIds`, issues);
      for (const rewardId of location.rewardIds) {
        const reward = snapshot.rewards.find(({ id }) => id === rewardId);
        if (reward && reward.locationId !== location.id && reward.handInLocationId !== location.id) {
          issues.push(`locations.${location.id} cannot list unrelated reward ${rewardId}.`);
        }
      }
    }
  }

  if (category === 'pointsOfInterest') {
    for (const point of snapshot.pointsOfInterest) {
      if (!locationIds.has(point.locationId)) issues.push(`pointsOfInterest.${point.id} references an unknown location.`);
      addReferenceIssues(point.identitySourceIds, sourceIds, `pointsOfInterest.${point.id}.identitySourceIds`, issues);
      const location = snapshot.locations.find(({ id }) => id === point.locationId);
      if (!location?.pointOfInterestIds.includes(point.id)) issues.push(`locations.${point.locationId} must list point of interest ${point.id}.`);
      inspectEvidence(point, sourceIds, `pointsOfInterest.${point.id}`, issues);
    }
    for (const location of snapshot.locations) {
      addReferenceIssues(location.pointOfInterestIds, poiIds, `locations.${location.id}.pointOfInterestIds`, issues);
    }
  }

  if (category === 'warnings') {
    for (const warning of snapshot.warnings) {
      if (!locationIds.has(warning.locationId)) issues.push(`warnings.${warning.id} references an unknown location.`);
      addReferenceIssues(warning.sourceIds, sourceIds, `warnings.${warning.id}.sourceIds`, issues);
      const location = snapshot.locations.find(({ id }) => id === warning.locationId);
      if (!location?.warningIds.includes(warning.id)) issues.push(`locations.${warning.locationId} must list warning ${warning.id}.`);
      if (warning.encounterId !== null) {
        if (!encounterIds.has(warning.encounterId)) issues.push(`warnings.${warning.id} references an unknown encounter.`);
        const encounter = snapshot.encounters.find(({ id }) => id === warning.encounterId);
        if (encounter && encounter.locationId !== warning.locationId) issues.push(`warnings.${warning.id} encounter must belong to the same location.`);
        if (encounter && !encounter.warningIds.includes(warning.id)) issues.push(`encounters.${warning.encounterId} must list warning ${warning.id}.`);
      }
      inspectEvidence(warning, sourceIds, `warnings.${warning.id}`, issues);
    }
    for (const location of snapshot.locations) {
      addReferenceIssues(location.warningIds, warningIds, `locations.${location.id}.warningIds`, issues);
    }
  }

  if (category === 'warnings' && snapshot.warnings.some((warning) => warning.encounterId && !encounterIds.has(warning.encounterId))) {
    issues.push('Warning encounter references must resolve within the encounter category.');
  }
  if (category === 'rewards' && snapshot.rewards.some((reward) => reward.handInLocationId && !locationIds.has(reward.handInLocationId))) {
    issues.push('Reward hand-in references must resolve to included locations.');
  }
  return issues;
}

function addReleaseMinimumIssues(snapshot: ContentSnapshot, issues: string[]): void {
  if (!snapshot.encounters.some((encounter) => encounter.isCampaignBoss.value === true && encounter.isCampaignBoss.status === 'documented')) {
    issues.push('Publication requires at least one sourced campaign boss encounter.');
  }
  const optionalLocation = snapshot.locations.find(({ id }) => id === 'act1-mud-burrow');
  const optionalBenefit = snapshot.rewards.some((reward) => reward.locationId === optionalLocation?.id)
    || snapshot.pointsOfInterest.some((point) => point.locationId === optionalLocation?.id);
  if (!optionalBenefit || !optionalLocation || optionalLocation.progressionRole.value !== 'optional' || optionalLocation.progressionRole.status !== 'documented') {
    issues.push('Publication requires a documented optional Mud Burrow destination with a reward or point of interest and benefit/condition records.');
  }
  const sourcedThreat = snapshot.warnings.some((warning) =>
    warning.threat.status === 'documented' && warning.trigger.status === 'documented'
      && warning.consequence.status === 'documented' && warning.sourceIds.length > 0,
  );
  if (!sourcedThreat) issues.push('Publication requires at least one sourced, documented Hardcore threat.');
}

function addCrossCategoryIssues(snapshot: ContentSnapshot, issues: string[]): void {
  const warningById = new Map(snapshot.warnings.map((warning) => [warning.id, warning]));
  for (const encounter of snapshot.encounters) {
    for (const warningId of encounter.warningIds) {
      const warning = warningById.get(warningId);
      if (!warning) issues.push(`encounters.${encounter.id} references unknown warning ${warningId}.`);
      else if (warning.encounterId !== encounter.id) issues.push(`warnings.${warningId} must identify encounter ${encounter.id} when listed by that encounter.`);
    }
  }
}

export function validateSnapshot(input: unknown, options: ValidationOptions = {}): ValidationResult {
  const mode = options.mode ?? 'publication';
  let categoryAvailability = availableCategories();
  const issues: string[] = [];

  if (mode !== 'runtime') {
    const parsed = contentSnapshotSchema.safeParse(input);
    if (!parsed.success) return { success: false, issues: formatZodIssues(parsed.error), categoryAvailability };
    const snapshot = parsed.data;
    addCoreIntegrityIssues(snapshot, { ...options, mode }, issues);
    for (const category of optionalCategoryNames) issues.push(...categoryIssues(snapshot, category));
    if (mode === 'publication') {
      addCrossCategoryIssues(snapshot, issues);
      addReleaseMinimumIssues(snapshot, issues);
    }
    return { success: issues.length === 0, issues, snapshot: issues.length === 0 ? snapshot : undefined, categoryAvailability };
  }

  const parsedCore = coreSnapshotSchema.safeParse(input);
  if (!parsedCore.success) return { success: false, issues: formatZodIssues(parsedCore.error), categoryAvailability };
  const core = parsedCore.data;
  const partialSnapshot = {
    ...core,
    encounters: [],
    rewards: [],
    pointsOfInterest: [],
    warnings: [],
  } as unknown as ContentSnapshot;
  addCoreIntegrityIssues(partialSnapshot, { ...options, mode }, issues);
  if (issues.length > 0) return { success: false, issues, categoryAvailability, snapshot: undefined };

  const mutableSnapshot = { ...partialSnapshot };
  for (const category of optionalCategoryNames) {
    const rawCategory = core[category];
    const parsedCategory = categorySchemas[category].safeParse(rawCategory);
    if (!parsedCategory.success) {
      categoryAvailability = { ...categoryAvailability, [category]: 'unavailable' };
      continue;
    }
    (mutableSnapshot[category] as unknown[]) = parsedCategory.data;
    const validationIssues = categoryIssues(mutableSnapshot, category);
    if (validationIssues.length > 0) {
      categoryAvailability = { ...categoryAvailability, [category]: 'unavailable' };
      (mutableSnapshot[category] as unknown[]) = [];
      continue;
    }
  }
  return { success: true, issues: [], snapshot: mutableSnapshot, categoryAvailability };
}

export function validateAuthoredSnapshot(snapshot: unknown, packagedAssetPaths?: ReadonlySet<string>): ValidationResult {
  return validateSnapshot(snapshot, { mode: 'publication', packagedAssetPaths });
}

export const contentSnapshotPartSchemas = {
  segment: campaignSegmentSchema,
  locations: z.array(locationSchema),
  connections: z.array(connectionSchema),
  sources: z.array(sourceEvidenceSchema),
  presentation: mapLayoutSchema,
  assets: z.array(assetProvenanceSchema),
};
