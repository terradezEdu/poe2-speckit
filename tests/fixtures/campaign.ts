import type { ContentSnapshot } from '../../src/content/schema.ts';

const commonEvidence = {
  status: 'documented' as const,
  kind: 'fact' as const,
  sourceIds: ['synthetic-reference'],
  verifiedForVersion: '0.5.5e',
  checkedAt: '2026-10-16',
  note: null,
};

const textEvidence = (value: string) => ({ ...commonEvidence, value });
const numberEvidence = (value: number | null, status: 'documented' | 'unknown' = 'documented') => ({
  ...commonEvidence,
  value,
  status,
  note: status === 'documented' ? null : 'The synthetic fixture intentionally leaves this value unknown.',
});

const locationIds = [
  'act1-riverbank',
  'act1-clearfell-encampment',
  'act1-clearfell',
  'act1-mud-burrow',
  'act1-grelwood',
];

const locations = [
  { id: locationIds[0], name: 'The Riverbank', identitySourceIds: ['synthetic-reference'], summary: textEvidence('A synthetic opening location.'), progressionRole: textEvidence('main-route'), encounterIds: ['riverbank-sentinel'], rewardIds: [], pointOfInterestIds: [], warningIds: [] },
  { id: locationIds[1], name: 'Clearfell Encampment', identitySourceIds: ['synthetic-reference'], summary: textEvidence('A synthetic town location.'), progressionRole: textEvidence('town'), encounterIds: [], rewardIds: ['burrow-reward'], pointOfInterestIds: [], warningIds: [] },
  { id: locationIds[2], name: 'Clearfell', identitySourceIds: ['synthetic-reference'], summary: textEvidence('A synthetic route junction.'), progressionRole: textEvidence('main-route'), encounterIds: [], rewardIds: [], pointOfInterestIds: [], warningIds: [] },
  { id: locationIds[3], name: 'Mud Burrow', identitySourceIds: ['synthetic-reference'], summary: textEvidence('A synthetic optional location.'), progressionRole: textEvidence('optional'), encounterIds: [], rewardIds: ['burrow-reward', 'burrow-token'], pointOfInterestIds: ['burrow-shrine'], warningIds: [] },
  { id: locationIds[4], name: 'The Grelwood', identitySourceIds: ['synthetic-reference'], summary: textEvidence('A synthetic segment endpoint.'), progressionRole: textEvidence('main-route'), encounterIds: [], rewardIds: [], pointOfInterestIds: [], warningIds: ['grelwood-warning'] },
];

const connections = [
  ['riverbank-encampment', locationIds[0], locationIds[1]],
  ['encampment-clearfell', locationIds[1], locationIds[2]],
  ['clearfell-mud-burrow', locationIds[2], locationIds[3]],
  ['clearfell-grelwood', locationIds[2], locationIds[4]],
].map(([id, fromLocationId, toLocationId]) => ({
  id,
  fromLocationId,
  toLocationId,
  relationship: textEvidence('synthetic adjacent-area relationship'),
  traversalDirection: { ...commonEvidence, value: null, status: 'unknown' as const, note: 'The fixture does not establish travel direction.' },
  accessConditions: textEvidence('No synthetic access restriction is asserted.'),
}));

const syntheticSource = {
  id: 'synthetic-reference',
  title: 'Synthetic Fixture Reference',
  publisher: 'Example Invalid',
  url: 'https://example.invalid/campaign-fixture',
  locator: 'Synthetic fixture only; not a real source',
  sourceType: 'community-guide' as const,
  accessedAt: '2026-10-16',
  publishedAt: null,
  applicableGameVersion: null,
  applicabilityNote: 'Fictional test data; no game-version claim is made.',
  reuseNote: 'Synthetic test fixture; not derived from the linked website.',
};

export const validCampaign: ContentSnapshot = {
  schemaVersion: 1,
  snapshotId: 'synthetic-fixture-v1',
  targetGameVersion: '0.5.5e',
  researchBaselineDate: '2026-10-16',
  reviewedAt: '2026-10-16',
  segment: {
    id: 'act1-opening',
    actId: 'act1',
    title: 'Synthetic Opening Segment',
    entryLocationId: locationIds[0],
    endpointLocationId: locationIds[4],
    locationIds,
    coverageRationale: textEvidence('A five-node synthetic graph for schema checks.'),
    identitySourceIds: ['synthetic-reference'],
    boundaries: [{
      fromLocationId: locationIds[4],
      externalDestinationName: 'Unincluded synthetic area',
      relationship: textEvidence('An informational synthetic boundary.'),
      accessConditions: { ...commonEvidence, value: null, status: 'unknown', note: 'The synthetic fixture leaves this condition unknown.' },
    }],
  },
  locations,
  connections,
  encounters: [{
    id: 'riverbank-sentinel',
    name: 'Synthetic Sentinel',
    identitySourceIds: ['synthetic-reference'],
    isCampaignBoss: { ...commonEvidence, value: true },
    locationId: locationIds[0],
    damageTypes: [{ type: 'cold', evidence: textEvidence('cold') }],
    resistances: [
      { damageType: 'cold', value: numberEvidence(0) },
      { damageType: 'fire', value: numberEvidence(null, 'unknown') },
    ],
    weaknesses: [{ id: 'sentinel-weakness', description: textEvidence('An independently documented synthetic weakness.') }],
    mechanics: [{
      id: 'sentinel-dash',
      description: textEvidence('A synthetic charge attack.'),
      trigger: textEvidence('The sentinel lowers its shoulders.'),
      response: { ...textEvidence('Move away from its path.'), kind: 'editorial-advice' },
    }],
    warningIds: [],
  }],
  rewards: [
    { id: 'burrow-reward', name: 'Synthetic Reward', identitySourceIds: ['synthetic-reference'], locationId: locationIds[3], handInLocationId: locationIds[1], benefit: textEvidence('A synthetic skill point benefit.'), conditions: textEvidence('Complete the synthetic side encounter.'), quantity: numberEvidence(null, 'unknown'), level: numberEvidence(null, 'unknown'), progressionRole: textEvidence('optional') },
    { id: 'burrow-token', name: 'Synthetic Token', identitySourceIds: ['synthetic-reference'], locationId: locationIds[3], handInLocationId: null, benefit: textEvidence('A synthetic collectible.'), conditions: { ...textEvidence('Acquisition notes are from an older synthetic record.'), status: 'outdated', value: null, note: 'The older synthetic record does not establish current acquisition conditions.' }, quantity: numberEvidence(1), level: numberEvidence(null, 'unknown'), progressionRole: textEvidence('optional') },
  ],
  pointsOfInterest: [{
    id: 'burrow-shrine',
    name: 'Synthetic Shrine',
    identitySourceIds: ['synthetic-reference'],
    locationId: locationIds[3],
    description: textEvidence('A synthetic point of interest.'),
    benefit: textEvidence('Offers an optional synthetic interaction.'),
    conditions: textEvidence('No synthetic condition is asserted.'),
    progressionRole: textEvidence('optional'),
  }],
  warnings: [{
    id: 'grelwood-warning',
    locationId: locationIds[4],
    encounterId: null,
    title: 'Synthetic warning',
    threat: textEvidence('A clearly fictional test hazard.'),
    trigger: textEvidence('Entering the synthetic test area.'),
    consequence: textEvidence('The fixture has no real gameplay consequence.'),
    avoidanceAdvice: { ...textEvidence('Inspect the fixture before use.'), kind: 'editorial-advice' },
    sourceIds: ['synthetic-reference'],
  }],
  sources: [syntheticSource],
  presentation: {
    id: 'synthetic-layout',
    segmentId: 'act1-opening',
    coordinateWidth: 1200,
    coordinateHeight: 800,
    backgroundAssetId: null,
    nodePositions: locationIds.map((locationId, index) => ({
      locationId,
      x: 120 + index * 230,
      y: index === 3 ? 600 : 240 + index * 45,
      labelPlacement: index === 3 ? 'below' : 'above',
      assetId: null,
    })),
    connectionPaths: connections.map(({ id }) => ({ connectionId: id, points: [] })),
  },
  assets: [],
};

export function cloneCampaign(): ContentSnapshot {
  return structuredClone(validCampaign);
}

export const syntheticEvidence = {
  documentedZero: numberEvidence(0),
  unknownNumber: numberEvidence(null, 'unknown'),
  conflicted: {
    ...commonEvidence,
    value: null,
    status: 'conflicted' as const,
    note: 'Synthetic sources disagree; no single value is selected.',
  },
};
