import { z } from 'zod';

export const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'IDs must be lowercase ASCII slugs.');

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day;
}, 'Date must be a real calendar date.');

const evidenceStatusSchema = z.enum(['documented', 'uncertain', 'conflicted', 'outdated', 'unknown']);
const evidenceKindSchema = z.enum(['fact', 'editorial-advice']);
const httpUrlSchema = z.url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'Only http and https URLs are allowed.');
const evidenceValueSchemaBase = z.object({
  value: z.union([z.string(), z.number().finite(), z.boolean(), z.array(z.string())]).nullable(),
  status: evidenceStatusSchema,
  kind: evidenceKindSchema,
  sourceIds: z.array(idSchema),
  verifiedForVersion: z.string().min(1).nullable(),
  checkedAt: isoDateSchema.nullable(),
  note: z.string().nullable(),
});

export const evidenceValueSchema = evidenceValueSchemaBase.superRefine((evidence, context) => {
  if (evidence.status === 'documented') {
    if (evidence.value === null) context.addIssue({ code: 'custom', path: ['value'], message: 'Documented values must be non-null.' });
    if (evidence.sourceIds.length === 0) context.addIssue({ code: 'custom', path: ['sourceIds'], message: 'Documented values need at least one source.' });
  } else if (!evidence.note?.trim()) {
    context.addIssue({ code: 'custom', path: ['note'], message: 'Uncertain, conflicted, outdated, and unknown values need an explanation.' });
  }
});

export const stringEvidenceSchema = evidenceValueSchema.refine(
  (evidence) => evidence.value === null || typeof evidence.value === 'string',
  'This evidence value must contain text or null.',
);
export const numberEvidenceSchema = evidenceValueSchema.refine(
  (evidence) => evidence.value === null || typeof evidence.value === 'number',
  'This evidence value must contain a number or null.',
);
export const booleanEvidenceSchema = evidenceValueSchema.refine(
  (evidence) => evidence.value === null || typeof evidence.value === 'boolean',
  'This evidence value must contain a boolean or null.',
);

const identitySourceIdsSchema = z.array(idSchema).min(1, 'Plain-text identities require source evidence.');
const progressionRoleSchema = stringEvidenceSchema.refine(
  (evidence) => evidence.value === null || (typeof evidence.value === 'string' && ['town', 'main-route', 'optional'].includes(evidence.value)),
  'Progression roles must be town, main-route, optional, or unknown.',
);
const directionSchema = stringEvidenceSchema.refine(
  (evidence) => evidence.value === null || (typeof evidence.value === 'string' && ['forward-only', 'bidirectional', 'conditional'].includes(evidence.value)),
  'Traversal direction must be documented or represented as null with an evidence status.',
);
const damageTypeSchema = z.enum(['physical', 'fire', 'cold', 'lightning', 'chaos']);

export const sourceEvidenceSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1),
  publisher: z.string().trim().min(1),
  url: httpUrlSchema,
  locator: z.string().trim().min(1),
  sourceType: z.enum(['official-patch', 'first-hand-observation', 'extracted-game-data', 'community-guide']),
  accessedAt: isoDateSchema,
  publishedAt: isoDateSchema.nullable(),
  applicableGameVersion: z.string().trim().min(1).nullable(),
  applicabilityNote: z.string().trim().min(1),
  reuseNote: z.string().trim().min(1).nullable(),
});

const boundarySchema = z.object({
  fromLocationId: idSchema,
  externalDestinationName: z.string().trim().min(1),
  relationship: stringEvidenceSchema,
  accessConditions: stringEvidenceSchema,
});

export const campaignSegmentSchema = z.object({
  id: idSchema,
  actId: idSchema,
  title: z.string().trim().min(1),
  entryLocationId: idSchema,
  endpointLocationId: idSchema,
  locationIds: z.array(idSchema).min(1),
  coverageRationale: stringEvidenceSchema,
  identitySourceIds: identitySourceIdsSchema,
  boundaries: z.array(boundarySchema),
});

export const locationSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  identitySourceIds: identitySourceIdsSchema,
  summary: stringEvidenceSchema,
  progressionRole: progressionRoleSchema,
  encounterIds: z.array(idSchema),
  rewardIds: z.array(idSchema),
  pointOfInterestIds: z.array(idSchema),
  warningIds: z.array(idSchema),
});

export const connectionSchema = z.object({
  id: idSchema,
  fromLocationId: idSchema,
  toLocationId: idSchema,
  relationship: stringEvidenceSchema,
  traversalDirection: directionSchema,
  accessConditions: stringEvidenceSchema,
});

const mechanicSchema = z.object({
  id: idSchema,
  description: stringEvidenceSchema,
  trigger: stringEvidenceSchema,
  response: stringEvidenceSchema,
});

const resistanceSchema = z.object({
  damageType: damageTypeSchema,
  value: numberEvidenceSchema,
});

const weaknessSchema = z.object({ id: idSchema, description: stringEvidenceSchema });

export const encounterSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  identitySourceIds: identitySourceIdsSchema,
  isCampaignBoss: booleanEvidenceSchema,
  locationId: idSchema,
  damageTypes: z.array(z.object({ type: damageTypeSchema, evidence: stringEvidenceSchema })),
  resistances: z.array(resistanceSchema),
  weaknesses: z.array(weaknessSchema),
  mechanics: z.array(mechanicSchema),
  warningIds: z.array(idSchema),
});

export const rewardSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  identitySourceIds: identitySourceIdsSchema,
  locationId: idSchema,
  handInLocationId: idSchema.nullable(),
  benefit: stringEvidenceSchema,
  conditions: stringEvidenceSchema,
  quantity: numberEvidenceSchema,
  level: numberEvidenceSchema,
  progressionRole: progressionRoleSchema,
});

export const pointOfInterestSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  identitySourceIds: identitySourceIdsSchema,
  locationId: idSchema,
  description: stringEvidenceSchema,
  benefit: stringEvidenceSchema,
  conditions: stringEvidenceSchema,
  progressionRole: progressionRoleSchema,
});

export const hardcoreWarningSchema = z.object({
  id: idSchema,
  locationId: idSchema,
  encounterId: idSchema.nullable(),
  title: z.string().trim().min(1),
  threat: stringEvidenceSchema,
  trigger: stringEvidenceSchema,
  consequence: stringEvidenceSchema,
  avoidanceAdvice: stringEvidenceSchema.nullable(),
  sourceIds: z.array(idSchema).min(1),
});

const labelPlacementSchema = z.enum(['above', 'below', 'left', 'right']);
const mapPositionSchema = z.object({
  locationId: idSchema,
  x: z.number().finite(),
  y: z.number().finite(),
  labelPlacement: labelPlacementSchema,
  assetId: idSchema.nullable().optional(),
});
const connectionPathSchema = z.object({
  connectionId: idSchema,
  points: z.array(z.object({ x: z.number().finite(), y: z.number().finite() })).default([]),
});

export const mapLayoutSchema = z.object({
  id: idSchema,
  segmentId: idSchema,
  coordinateWidth: z.number().finite().positive(),
  coordinateHeight: z.number().finite().positive(),
  backgroundAssetId: idSchema.nullable(),
  nodePositions: z.array(mapPositionSchema),
  connectionPaths: z.array(connectionPathSchema),
});

export const assetProvenanceSchema = z.object({
  id: idSchema,
  localPath: z.string().regex(/^\/assets\/[A-Za-z0-9._/-]+$/).refine((value) => !value.split('/').includes('..'), 'Asset path cannot escape the packaged assets directory.'),
  creator: z.string().trim().min(1),
  origin: z.enum(['original', 'licensed', 'permission']),
  sourceUrl: httpUrlSchema.nullable(),
  licenseOrPermission: z.string().trim().min(1),
  attribution: z.string().trim().min(1),
  modificationNote: z.string().trim().min(1),
}).superRefine((asset, context) => {
  if (asset.origin !== 'original' && asset.sourceUrl === null) {
    context.addIssue({ code: 'custom', path: ['sourceUrl'], message: 'Licensed or permitted assets require a source URL.' });
  }
});

export const contentSnapshotSchema = z.object({
  schemaVersion: z.number().int().refine((value) => value === 1, 'Only schema version 1 is supported.'),
  snapshotId: idSchema,
  targetGameVersion: z.string().trim().min(1),
  researchBaselineDate: isoDateSchema,
  reviewedAt: isoDateSchema.nullable().optional(),
  segment: campaignSegmentSchema,
  locations: z.array(locationSchema),
  connections: z.array(connectionSchema),
  encounters: z.array(encounterSchema),
  rewards: z.array(rewardSchema),
  pointsOfInterest: z.array(pointOfInterestSchema),
  warnings: z.array(hardcoreWarningSchema),
  sources: z.array(sourceEvidenceSchema),
  presentation: mapLayoutSchema,
  assets: z.array(assetProvenanceSchema),
});

export type EvidenceValue = z.infer<typeof evidenceValueSchema>;
export type SourceEvidence = z.infer<typeof sourceEvidenceSchema>;
export type CampaignSegment = z.infer<typeof campaignSegmentSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type Encounter = z.infer<typeof encounterSchema>;
export type Reward = z.infer<typeof rewardSchema>;
export type PointOfInterest = z.infer<typeof pointOfInterestSchema>;
export type HardcoreWarning = z.infer<typeof hardcoreWarningSchema>;
export type MapLayout = z.infer<typeof mapLayoutSchema>;
export type AssetProvenance = z.infer<typeof assetProvenanceSchema>;
export type ContentSnapshot = z.infer<typeof contentSnapshotSchema>;
export type DamageType = z.infer<typeof damageTypeSchema>;
