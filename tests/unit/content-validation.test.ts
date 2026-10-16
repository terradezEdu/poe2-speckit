import { describe, expect, it } from 'vitest';
import { cloneCampaign, syntheticEvidence, validCampaign } from '../fixtures/campaign.ts';
import {
  danglingSourceReference,
  disconnectedCoverage,
  invalidSnapshotDate,
  invalidSourceProtocol,
  longAndSimilarNames,
  malformedCoreLocation,
  malformedOptionalEncounterCategory,
  missingAssetProvenance,
  multipleEntries,
} from '../fixtures/content-faults.ts';
import { validateSnapshot } from '../../src/content/validate.ts';

describe('campaign snapshot validation', () => {
  it('accepts the synthetic five-location minimum release fixture', () => {
    expect(validateSnapshot(validCampaign, { mode: 'publication' }).success).toBe(true);
  });

  it('keeps the required release IDs, endpoint, and reading order explicit', () => {
    const wrongList = cloneCampaign();
    wrongList.segment.locationIds.reverse();
    expect(validateSnapshot(wrongList, { mode: 'publication' }).issues.join(' ')).toMatch(/location|order/i);

    const wrongEndpoint = cloneCampaign();
    wrongEndpoint.segment.endpointLocationId = 'act1-mud-burrow';
    expect(validateSnapshot(wrongEndpoint, { mode: 'publication' }).issues.join(' ')).toMatch(/endpoint/i);
  });

  it('rejects unsupported schema versions and incomplete release minima', () => {
    const unsupported = { ...cloneCampaign(), schemaVersion: 2 };
    expect(validateSnapshot(unsupported).issues.join(' ')).toMatch(/schema/i);

    for (const omit of ['encounters', 'rewards', 'warnings'] as const) {
      const incomplete = cloneCampaign();
      incomplete[omit] = [] as never;
      expect(validateSnapshot(incomplete, { mode: 'publication' }).success).toBe(false);
    }
  });

  it('allows an unreviewed draft and requires a real review date for publication', () => {
    const draft = cloneCampaign();
    draft.reviewedAt = null;
    expect(validateSnapshot(draft, { mode: 'draft' }).success).toBe(true);
    expect(validateSnapshot(draft, { mode: 'publication' }).issues.join(' ')).toMatch(/review/i);
    const unreviewed = { ...cloneCampaign() };
    delete (unreviewed as Partial<typeof unreviewed>).reviewedAt;
    expect(validateSnapshot(unreviewed, { mode: 'draft' }).success).toBe(true);
    expect(validateSnapshot(invalidSnapshotDate()).success).toBe(false);
    const reversedDates = cloneCampaign();
    reversedDates.reviewedAt = '2026-10-15';
    expect(validateSnapshot(reversedDates).issues.join(' ')).toMatch(/baseline/i);
  });

  it('rejects missing asset provenance, invalid protocols, and dangling references', () => {
    expect(validateSnapshot(missingAssetProvenance()).success).toBe(false);
    expect(validateSnapshot(invalidSourceProtocol()).success).toBe(false);
    expect(validateSnapshot(danglingSourceReference()).success).toBe(false);
  });

  it('requires every referenced decorative asset to be packaged and licensed as declared', () => {
    const campaign = cloneCampaign();
    campaign.assets = [{
      id: 'synthetic-background',
      localPath: '/assets/synthetic.png',
      creator: 'Synthetic fixture author',
      origin: 'original',
      sourceUrl: null,
      licenseOrPermission: 'Original synthetic test asset.',
      attribution: 'No attribution required for this fictional fixture.',
      modificationNote: 'Unmodified synthetic fixture.',
    }];
    campaign.presentation.backgroundAssetId = 'synthetic-background';
    expect(validateSnapshot(campaign, { packagedAssetPaths: new Set() }).issues.join(' ')).toMatch(/packaged/i);
    expect(validateSnapshot(campaign, { packagedAssetPaths: new Set(['/assets/synthetic.png']) }).success).toBe(true);
  });

  it('rejects disconnected coverage and malformed core entities', () => {
    expect(validateSnapshot(disconnectedCoverage()).success).toBe(false);
    expect(validateSnapshot(malformedCoreLocation()).success).toBe(false);
    expect(validateSnapshot(malformedCoreLocation(), { mode: 'runtime' }).success).toBe(false);
  });

  it('keeps a malformed optional category unavailable while core locations remain usable at runtime', () => {
    const result = validateSnapshot(malformedOptionalEncounterCategory(), { mode: 'runtime' });
    expect(result.success).toBe(true);
    expect(result.categoryAvailability.encounters).toBe('unavailable');
    expect(result.categoryAvailability.rewards).toBe('available');
    expect(result.snapshot?.locations).toHaveLength(5);
  });

  it('accepts long similar labels and multiple distinct records without collapsing identity', () => {
    expect(validateSnapshot(longAndSimilarNames()).success).toBe(true);
    expect(validateSnapshot(multipleEntries()).success).toBe(true);
  });

  it('preserves documented zero separately from unknown and conflicted values', () => {
    expect(syntheticEvidence.documentedZero.value).toBe(0);
    expect(syntheticEvidence.documentedZero.status).toBe('documented');
    expect(syntheticEvidence.unknownNumber.value).toBeNull();
    expect(syntheticEvidence.unknownNumber.status).toBe('unknown');
    expect(syntheticEvidence.conflicted.value).toBeNull();
    expect(syntheticEvidence.conflicted.status).toBe('conflicted');
    expect(validCampaign.rewards[0]?.conditions.value).toBe('Complete the synthetic side encounter.');
    expect(validCampaign.rewards[0]?.quantity.value).toBeNull();
    expect(validCampaign.rewards[0]?.level.value).toBeNull();
  });

  it('requires a warning and its encounter to belong to the same included location', () => {
    const warningAtWrongLocation = cloneCampaign();
    warningAtWrongLocation.warnings[0]!.locationId = 'act1-riverbank';
    expect(validateSnapshot(warningAtWrongLocation).issues.join(' ')).toMatch(/warning|location/i);

    const encounterAtWrongLocation = cloneCampaign();
    encounterAtWrongLocation.encounters[0]!.warningIds = ['grelwood-warning'];
    encounterAtWrongLocation.warnings[0]!.encounterId = encounterAtWrongLocation.encounters[0]!.id;
    expect(validateSnapshot(encounterAtWrongLocation).issues.join(' ')).toMatch(/same location/i);
  });

  it('isolates an unavailable warning category from otherwise valid encounter facts', () => {
    const campaign = cloneCampaign();
    campaign.warnings = [{ id: 'broken-warning' }] as typeof campaign.warnings;
    const result = validateSnapshot(campaign, { mode: 'runtime' });
    expect(result.success).toBe(true);
    expect(result.categoryAvailability.warnings).toBe('unavailable');
    expect(result.categoryAvailability.encounters).toBe('available');
  });
});
