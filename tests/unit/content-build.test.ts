import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validCampaign } from '../fixtures/campaign.ts';
import { assembleSnapshot, publishSnapshotAtomically } from '../../scripts/build-content.ts';

const temporaryDirectories: string[] = [];

async function makeTemporaryDirectory() {
  const directory = await mkdtemp(join(tmpdir(), 'campaign-content-test-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('content snapshot assembly', () => {
  it('assembles separate content, layout, and asset inputs deterministically', () => {
    const content = structuredClone(validCampaign);
    const layout = content.presentation;
    const assets = content.assets;
    delete (content as Partial<typeof content>).presentation;
    delete (content as Partial<typeof content>).assets;

    const first = assembleSnapshot(content, layout, assets);
    const second = assembleSnapshot(content, layout, assets);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('does not replace a previous delivery artifact when validation rejects new content', async () => {
    const directory = await makeTemporaryDirectory();
    const output = join(directory, 'act1-opening.json');
    const oldArtifact = '{"snapshotId":"previous-reviewed-release"}\n';
    await writeFile(output, oldArtifact, 'utf8');

    const invalid = structuredClone(validCampaign);
    invalid.sources[0]!.url = 'javascript:alert(1)';
    await expect(publishSnapshotAtomically(output, invalid)).rejects.toThrow(/valid|source|protocol/i);
    await expect(readFile(output, 'utf8')).resolves.toBe(oldArtifact);
  });
});
