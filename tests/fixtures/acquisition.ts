import { createHash } from 'node:crypto';
import type { AcquisitionLock } from '../../scripts/lib/acquire-guide.ts';

export const syntheticLicense = Buffer.from('MIT License\n\nCopyright (c) Synthetic acquisition fixture author\n');
export const syntheticGuide = {
  meta: { patch: '0.5.5 (Forbidden Rites)', updated: '2026-09-30', source: 'https://example.invalid/never-request-this' },
  steps: [
    { act: 0, zone: 'The Riverbank', text: { en: '**Synthetic boss**' }, hint: { en: 'Synthetic advice.' }, tags: ['boss'], notes: [{ en: 'GUARANTEED_SURVIVAL_ASSERTION' }], image: 'https://example.invalid/do-not-download.png' },
    { act: 0, zone: 'Clearfell Encampment', text: { en: 'Synthetic town step.' }, hint: { en: 'Synthetic hint.' }, tags: ['town'], notes: [] },
    { act: 0, zone: 'Clearfell', text: { en: 'Synthetic junction.' }, hint: { en: 'Synthetic hint.' }, tags: [], notes: [{ en: 'A synthetic optional destination mention.' }] },
    { act: 0, zone: 'The Grelwood', text: { en: 'Synthetic endpoint.' }, hint: { en: 'Synthetic hint.' }, tags: [], notes: [] },
    { act: 0, zone: 'Clearfell Encampment', text: { en: 'LATER_CAMPAIGN_STEP' }, hint: { en: '' }, tags: [], notes: [] },
  ],
};

export function pin(bytes: Uint8Array, path: string) {
  return {
    path,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    gitBlobSha: createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),
  };
}

export function acquisitionFixture() {
  const guideBytes = Buffer.from(JSON.stringify(syntheticGuide));
  const lock: AcquisitionLock = {
    schemaVersion: 1,
    sourceId: 'malura-campaign-guide',
    repository: 'maluramichael/poe2overlay',
    commit: 'a'.repeat(40),
    apiVersion: '2026-03-10',
    permissionReview: {
      checkedAt: '2026-10-16', license: 'MIT', scope: 'Synthetic test only.',
      termsUrl: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#h-api-terms',
      robotsUrl: 'https://github.com/robots.txt', apiRobotsUrl: 'https://api.github.com/robots.txt',
      apiRobotsHttpStatus: 404, accessBasis: 'Synthetic API fixture; no requests are sent.',
    },
    licenseFile: { ...pin(syntheticLicense, 'LICENSE'), path: 'LICENSE' },
    guideFile: { ...pin(guideBytes, 'ui/guide.json'), path: 'ui/guide.json' },
    expectedSource: { gameVersion: '0.5.5', patchLabel: '0.5.5 (Forbidden Rites)', updatedAt: '2026-09-30' },
    targetGameVersion: '0.5.5e', researchBaselineDate: '2026-10-16',
    exclusions: [{ pointer: '/steps/0/notes/0', reason: 'Synthetic unsupported survival guarantee.' }],
    candidateSha256: '0'.repeat(64),
  };
  return { lock, guideBytes, licenseBytes: syntheticLicense };
}

export function apiFileResponse(bytes: Uint8Array, path: string): Response {
  return Response.json({
    type: 'file', path, encoding: 'base64', size: bytes.length,
    sha: pin(bytes, path).gitBlobSha,
    content: Buffer.from(bytes).toString('base64'),
  });
}
