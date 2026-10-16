import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
  acquireGuide,
  prepareGuideCandidate,
  serializeGuideCandidate,
  verifyGuideCandidate,
} from '../../scripts/lib/acquire-guide.ts';
import { validateSnapshot } from '../../src/content/validate.ts';
import { acquisitionFixture, apiFileResponse, pin, syntheticGuide } from '../fixtures/acquisition.ts';

describe('licensed campaign candidate acquisition', () => {
  it('stages the opening English text, retains its license and source version, and excludes unsafe or out-of-scope content', () => {
    const { lock, guideBytes, licenseBytes } = acquisitionFixture();
    const candidate = prepareGuideCandidate(lock, guideBytes, licenseBytes);
    const serialized = serializeGuideCandidate(candidate);
    expect(candidate.steps).toHaveLength(4);
    expect(candidate.steps[0]?.text).toBe('Synthetic boss');
    expect(candidate.coverage.missingStandaloneLocations).toEqual(['act1-mud-burrow']);
    expect(candidate.upstream.gameVersion).toBe('0.5.5');
    expect(candidate.targetGameVersion).toBe('0.5.5e');
    expect(candidate.versionCompatibility).toBe('unverified');
    expect(candidate.publicationReady).toBe(false);
    expect(candidate.attribution.licenseText).toBe(licenseBytes.toString('utf8'));
    expect(serialized).not.toContain('GUARANTEED_SURVIVAL_ASSERTION');
    expect(serialized).not.toContain('LATER_CAMPAIGN_STEP');
    expect(serialized).not.toContain('do-not-download.png');
    expect(candidate).not.toHaveProperty('reviewedAt');
    expect(candidate).not.toHaveProperty('connections');
    expect(validateSnapshot(candidate).success).toBe(false);
  });

  it('uses two pinned API requests, checking the license before requesting guide text', async () => {
    const { lock, guideBytes, licenseBytes } = acquisitionFixture();
    const expected = serializeGuideCandidate(prepareGuideCandidate(lock, guideBytes, licenseBytes));
    lock.candidateSha256 = createHash('sha256').update(expected).digest('hex');
    const request = vi.fn(async (url: string) => url.includes('/LICENSE?')
      ? apiFileResponse(licenseBytes, 'LICENSE') : apiFileResponse(guideBytes, 'ui/guide.json'));
    await expect(acquireGuide(lock, request)).resolves.toBe(expected);
    expect(request.mock.calls.map(([url]) => url)).toEqual([
      `https://api.github.com/repos/maluramichael/poe2overlay/contents/LICENSE?ref=${'a'.repeat(40)}`,
      `https://api.github.com/repos/maluramichael/poe2overlay/contents/ui/guide.json?ref=${'a'.repeat(40)}`,
    ]);
  });

  it('does not fetch campaign text if the license differs', async () => {
    const { lock } = acquisitionFixture();
    const request = vi.fn(async () => apiFileResponse(Buffer.from('Changed license'), 'LICENSE'));
    await expect(acquireGuide(lock, request)).rejects.toThrow(/unexpected file|integrity/i);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('checks the license grant before guide retrieval, even if an incorrect license was hash-pinned', async () => {
    const { lock } = acquisitionFixture();
    const licenseBytes = Buffer.from('All rights reserved.');
    lock.licenseFile = { ...pin(licenseBytes, 'LICENSE'), path: 'LICENSE' };
    const request = vi.fn(async () => apiFileResponse(licenseBytes, 'LICENSE'));
    await expect(acquireGuide(lock, request)).rejects.toThrow(/reviewed MIT/i);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('can stage an update proposal without accepting it as the pinned candidate', async () => {
    const { lock, guideBytes, licenseBytes } = acquisitionFixture();
    const request = vi.fn(async (url: string) => url.includes('/LICENSE?')
      ? apiFileResponse(licenseBytes, 'LICENSE') : apiFileResponse(guideBytes, 'ui/guide.json'));
    const proposal = await acquireGuide(lock, request, { proposal: true });
    expect(JSON.parse(proposal).publicationReady).toBe(false);
    expect(() => verifyGuideCandidate(lock, proposal)).toThrow(/hash/i);
  });

  it('rejects a mutable branch or unapproved repository before any request', async () => {
    const { lock } = acquisitionFixture();
    const request = vi.fn();
    await expect(acquireGuide({ ...lock, commit: 'master' }, request)).rejects.toThrow();
    await expect(acquireGuide({ ...lock, repository: 'unknown/source' }, request)).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });

  it.each([403, 404, 429])('stops on HTTP %s without retries or alternate sources', async (status) => {
    const { lock } = acquisitionFixture();
    const request = vi.fn(async () => new Response('', { status, headers: { 'Retry-After': '60' } }));
    await expect(acquireGuide(lock, request)).rejects.toThrow(`HTTP ${status}`);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('rejects unexpected patch metadata even when file checksums are valid', () => {
    const { lock, licenseBytes } = acquisitionFixture();
    const guideBytes = Buffer.from(JSON.stringify({ ...syntheticGuide, meta: { ...syntheticGuide.meta, patch: '1.0' } }));
    lock.guideFile = { ...pin(guideBytes, 'ui/guide.json'), path: 'ui/guide.json' };
    expect(() => prepareGuideCandidate(lock, guideBytes, licenseBytes)).toThrow(/patch|metadata/i);
  });

  it('cannot relabel a parent-patch source as the requested hotfix version', () => {
    const { lock, guideBytes, licenseBytes } = acquisitionFixture();
    lock.expectedSource.gameVersion = '0.5.5e';
    expect(() => prepareGuideCandidate(lock, guideBytes, licenseBytes)).toThrow(/metadata/i);
  });

  it('detects local candidate tampering without network access', () => {
    const { lock, guideBytes, licenseBytes } = acquisitionFixture();
    const candidate = serializeGuideCandidate(prepareGuideCandidate(lock, guideBytes, licenseBytes));
    lock.candidateSha256 = createHash('sha256').update(candidate).digest('hex');
    expect(() => verifyGuideCandidate(lock, candidate)).not.toThrow();
    expect(() => verifyGuideCandidate(lock, candidate.replace('Synthetic boss', 'Different claim'))).toThrow(/hash/i);
  });
});
