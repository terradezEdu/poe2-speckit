import { cloneCampaign } from './campaign.ts';

export function longAndSimilarNames() {
  const campaign = cloneCampaign();
  campaign.locations[0]!.name = 'The Riverbank of the Long and Very Similar Synthetic Name';
  campaign.locations[1]!.name = 'The Riverbank of the Long and Very Similar Synthetic Names';
  return campaign;
}

export function multipleEntries() {
  const campaign = cloneCampaign();
  campaign.encounters.push({
    ...structuredClone(campaign.encounters[0]!),
    id: 'riverbank-sentinel-echo',
    name: 'Synthetic Sentinel Echo',
  });
  campaign.locations[0]!.encounterIds.push('riverbank-sentinel-echo');
  campaign.warnings.push({
    ...structuredClone(campaign.warnings[0]!),
    id: 'grelwood-warning-second',
    title: 'Second synthetic warning',
  });
  campaign.locations[4]!.warningIds.push('grelwood-warning-second');
  campaign.rewards.push({
    ...structuredClone(campaign.rewards[0]!),
    id: 'burrow-reward-second',
    name: 'Second synthetic reward',
  });
  campaign.locations[3]!.rewardIds.push('burrow-reward-second');
  campaign.locations[1]!.rewardIds.push('burrow-reward-second');
  return campaign;
}

export function malformedOptionalEncounterCategory() {
  const campaign = cloneCampaign();
  campaign.encounters = [
    ...campaign.encounters,
    { id: 'bad-encounter', locationId: 'missing-location', damageTypes: 'not-an-array' },
  ] as typeof campaign.encounters;
  return campaign;
}

export function malformedCoreLocation() {
  const campaign = cloneCampaign();
  campaign.locations[0] = { ...campaign.locations[0]!, id: 'not a slug' };
  return campaign;
}

export function invalidSnapshotDate() {
  const campaign = cloneCampaign();
  campaign.reviewedAt = '2026-02-30';
  return campaign;
}

export function invalidSourceProtocol() {
  const campaign = cloneCampaign();
  campaign.sources[0]!.url = 'javascript:alert(1)';
  return campaign;
}

export function danglingSourceReference() {
  const campaign = cloneCampaign();
  campaign.locations[0]!.summary.sourceIds = ['missing-source'];
  return campaign;
}

export function disconnectedCoverage() {
  const campaign = cloneCampaign();
  campaign.connections.pop();
  return campaign;
}

export function missingAssetProvenance() {
  const campaign = cloneCampaign();
  campaign.presentation.backgroundAssetId = 'unlisted-background';
  return campaign;
}
