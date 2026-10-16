import { createHash } from 'node:crypto';
import { z } from 'zod';
import { isoDateSchema } from '../../src/content/schema.ts';

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const gitShaSchema = z.string().regex(/^[a-f0-9]{40}$/);
const filePinSchema = z.object({ path: z.string(), gitBlobSha: gitShaSchema, sha256: sha256Schema });

export const acquisitionLockSchema = z.object({
  schemaVersion: z.literal(1),
  sourceId: z.literal('malura-campaign-guide'),
  repository: z.literal('maluramichael/poe2overlay'),
  commit: gitShaSchema,
  apiVersion: z.literal('2026-03-10'),
  permissionReview: z.object({
    checkedAt: isoDateSchema,
    license: z.literal('MIT'),
    scope: z.string().min(1),
    termsUrl: z.literal('https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#h-api-terms'),
    robotsUrl: z.literal('https://github.com/robots.txt'),
    apiRobotsUrl: z.literal('https://api.github.com/robots.txt'),
    apiRobotsHttpStatus: z.literal(404),
    accessBasis: z.string().min(1),
  }),
  licenseFile: filePinSchema.extend({ path: z.literal('LICENSE') }),
  guideFile: filePinSchema.extend({ path: z.literal('ui/guide.json') }),
  expectedSource: z.object({ gameVersion: z.string().min(1), patchLabel: z.string().min(1), updatedAt: isoDateSchema }),
  targetGameVersion: z.literal('0.5.5e'),
  researchBaselineDate: z.literal('2026-10-16'),
  exclusions: z.array(z.object({ pointer: z.string().regex(/^\/steps\/\d+\/notes\/\d+$/), reason: z.string().min(1) })),
  candidateSha256: sha256Schema,
}).strict();

export type AcquisitionLock = z.infer<typeof acquisitionLockSchema>;
type FilePin = z.infer<typeof filePinSchema>;
export type ApiRequest = (url: string, options: RequestInit) => Promise<Response>;

const locations = [
  { id: 'act1-riverbank', zone: 'The Riverbank' },
  { id: 'act1-clearfell-encampment', zone: 'Clearfell Encampment' },
  { id: 'act1-clearfell', zone: 'Clearfell' },
  { id: 'act1-mud-burrow', zone: 'Mud Burrow' },
  { id: 'act1-grelwood', zone: 'The Grelwood' },
] as const;

const englishTextSchema = z.object({ en: z.string() });
const guideSchema = z.object({
  meta: z.object({ patch: z.string(), updated: isoDateSchema, source: z.string() }),
  steps: z.array(z.object({
    act: z.number().int(),
    zone: z.string(),
    text: englishTextSchema,
    hint: englishTextSchema.nullable(),
    notes: z.array(englishTextSchema),
    tags: z.array(z.string()),
  })),
});

function sha256(value: Uint8Array | string): string {
  return createHash('sha256').update(value).digest('hex');
}

function assertFile(bytes: Uint8Array, pin: FilePin): void {
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (blob !== pin.gitBlobSha || sha256(bytes) !== pin.sha256) {
    throw new Error(`Pinned integrity check failed for ${pin.path}. Re-review upstream before updating the source lock.`);
  }
}

const plainText = (value: string) => value.replaceAll('**', '').trim();

/** Only stages licensed editorial text. This does not create or approve a ContentSnapshot. */
export function prepareGuideCandidate(lock: AcquisitionLock, guideBytes: Uint8Array, licenseBytes: Uint8Array) {
  assertFile(licenseBytes, lock.licenseFile);
  assertFile(guideBytes, lock.guideFile);
  const licenseText = Buffer.from(licenseBytes).toString('utf8');
  if (!licenseText.startsWith('MIT License\n')) throw new Error('The pinned license is not the reviewed MIT notice.');
  const guide = guideSchema.parse(JSON.parse(Buffer.from(guideBytes).toString('utf8')));
  const declaredGameVersion = guide.meta.patch.split(/\s+/)[0];
  if (guide.meta.patch !== lock.expectedSource.patchLabel || guide.meta.updated !== lock.expectedSource.updatedAt
    || declaredGameVersion !== lock.expectedSource.gameVersion) {
    throw new Error('Upstream patch or update metadata differs from the reviewed source lock.');
  }

  const endpointIndex = guide.steps.findIndex((step) => step.act === 0 && step.zone === 'The Grelwood');
  if (endpointIndex < 0) throw new Error('The source has no opening Grelwood endpoint; review its structure.');
  const exclusions = new Map(lock.exclusions.map((entry) => [entry.pointer, entry.reason]));
  const appliedExclusions = new Set<string>();
  const steps = guide.steps.slice(0, endpointIndex + 1).flatMap((step, index) => {
    const location = locations.find(({ zone }) => zone === step.zone);
    if (step.act !== 0 || !location) return [];
    const pointer = `/steps/${index}`;
    return [{
      locationId: location.id,
      pointer,
      text: plainText(step.text.en),
      hint: step.hint ? plainText(step.hint.en) : null,
      notes: step.notes.flatMap((note, noteIndex) => {
        const notePointer = `${pointer}/notes/${noteIndex}`;
        if (exclusions.has(notePointer)) {
          appliedExclusions.add(notePointer);
          return [];
        }
        return [{ pointer: notePointer, text: plainText(note.en) }];
      }),
      tags: step.tags,
    }];
  });
  if (!steps.some((step) => step.locationId === 'act1-riverbank')) throw new Error('The opening Riverbank step is missing.');
  if (lock.exclusions.some(({ pointer }) => !appliedExclusions.has(pointer))) {
    throw new Error('A reviewed exclusion no longer matches an opening note. Re-review its locator.');
  }

  return {
    schemaVersion: 1,
    sourceId: lock.sourceId,
    reviewStatus: 'requires-content-review',
    publicationReady: false,
    targetGameVersion: lock.targetGameVersion,
    researchBaselineDate: lock.researchBaselineDate,
    versionCompatibility: 'unverified',
    upstream: {
      repository: lock.repository,
      commit: lock.commit,
      path: lock.guideFile.path,
      gitBlobSha: lock.guideFile.gitBlobSha,
      sha256: lock.guideFile.sha256,
      gameVersion: declaredGameVersion,
      ...guide.meta,
    },
    attribution: {
      publisher: 'Michael Malura',
      license: lock.permissionReview.license,
      licensePath: lock.licenseFile.path,
      licenseSha256: lock.licenseFile.sha256,
      licenseText,
      modificationNote: 'English opening-segment text only; bold markup removed, unsupported survival guarantee excluded. No assets, code, game dialogue, or later campaign steps imported.',
    },
    coverage: {
      includedLocationIds: locations.map(({ id }) => id),
      missingStandaloneLocations: locations.filter(({ id }) => !steps.some((step) => step.locationId === id)).map(({ id }) => id),
    },
    steps,
    excluded: lock.exclusions,
    openIssues: [
      'Source declares 0.5.5, not the 0.5.5e research target. Retrieval date is not patch verification.',
      'Step sequence and notes do not establish all four direct area relationships or return-travel restrictions.',
      'Mud Burrow has no standalone opening step; confirm acquisition and hand-in conditions without inferring them from a skip recommendation.',
      'No independently verified Hardcore threat, trigger, damage, defenses, or safe threshold is supplied by this import.',
      'Source must/skip tags are routing labels, not verified progression roles. Onward Grelwood instructions must become informational coverage boundaries, not additional actionable destinations.',
    ],
  };
}

export function serializeGuideCandidate(candidate: ReturnType<typeof prepareGuideCandidate>): string {
  return `${JSON.stringify(candidate, null, 2)}\n`;
}

/** An offline integrity check, not a factual review or release approval. */
export function verifyGuideCandidate(lock: AcquisitionLock, candidateText: string): void {
  if (sha256(candidateText) !== lock.candidateSha256) throw new Error('Candidate hash differs from the reviewed source lock.');
  const candidate = z.object({
    reviewStatus: z.literal('requires-content-review'),
    publicationReady: z.literal(false),
    versionCompatibility: z.literal('unverified'),
    targetGameVersion: z.literal('0.5.5e'),
    upstream: z.object({ commit: gitShaSchema, sha256: sha256Schema }),
    attribution: z.object({ license: z.literal('MIT'), licenseText: z.string() }),
  }).parse(JSON.parse(candidateText));
  if (candidate.upstream.commit !== lock.commit || candidate.upstream.sha256 !== lock.guideFile.sha256
    || sha256(candidate.attribution.licenseText) !== lock.licenseFile.sha256) {
    throw new Error('Candidate provenance or embedded license differs from the source lock.');
  }
}

async function readApiFile(lock: AcquisitionLock, pin: FilePin, request: ApiRequest): Promise<Buffer> {
  const path = pin.path.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${lock.repository}/contents/${path}?ref=${lock.commit}`;
  let response: Response;
  try {
    response = await request(url, {
      method: 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(20_000),
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': lock.apiVersion,
        'User-Agent': 'poe2-campaign-companion-content-import/0.1.0',
      },
    });
  } catch (error: unknown) {
    throw new Error(`GitHub API request failed for ${pin.path}; stopped without fallback: ${error instanceof Error ? error.message : 'network error'}`, { cause: error });
  }
  if (response.status !== 200) {
    const retryAfter = response.headers.get('retry-after');
    const retryHint = retryAfter && /^\d+$/.test(retryAfter) ? ` Retry-After: ${retryAfter} seconds.` : '';
    throw new Error(`GitHub API returned HTTP ${response.status} for ${pin.path}; stopped without retry or fallback.${retryHint}`);
  }
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('GitHub API response is not JSON.');
  if (!response.body) throw new Error('GitHub API returned an empty response body.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > 2_000_000) {
        await reader.cancel();
        throw new Error('GitHub API response exceeds the allowed text-file limit.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const file = z.object({
    type: z.literal('file'), encoding: z.literal('base64'), path: z.string(),
    sha: gitShaSchema, size: z.number().int().nonnegative().max(1_000_000), content: z.string(),
  }).parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
  if (file.path !== pin.path || file.sha !== pin.gitBlobSha) throw new Error(`GitHub API returned an unexpected file for ${pin.path}.`);
  const bytes = Buffer.from(file.content, 'base64');
  if (bytes.length !== file.size) throw new Error(`Decoded size differs for ${pin.path}.`);
  assertFile(bytes, pin);
  return bytes;
}

export async function acquireGuide(lockInput: unknown, request: ApiRequest = fetch, options: { proposal?: boolean } = {}): Promise<string> {
  const lock = acquisitionLockSchema.parse(lockInput);
  // Permission evidence is verified before requesting any campaign text.
  const licenseBytes = await readApiFile(lock, lock.licenseFile, request);
  if (!licenseBytes.toString('utf8').startsWith('MIT License\n')) throw new Error('The pinned license is not the reviewed MIT notice.');
  const guideBytes = await readApiFile(lock, lock.guideFile, request);
  const candidate = serializeGuideCandidate(prepareGuideCandidate(lock, guideBytes, licenseBytes));
  if (!options.proposal) verifyGuideCandidate(lock, candidate);
  return candidate;
}
