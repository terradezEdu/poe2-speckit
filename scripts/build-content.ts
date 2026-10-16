import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { AssetProvenance, ContentSnapshot, MapLayout } from '../src/content/schema.ts';
import { validateAuthoredSnapshot } from '../src/content/validate.ts';

export type CampaignContentInput = Omit<ContentSnapshot, 'presentation' | 'assets'>;

export function assembleSnapshot(
  content: CampaignContentInput,
  layout: MapLayout,
  assets: AssetProvenance[],
): ContentSnapshot {
  return { ...content, presentation: layout, assets };
}

export async function publishSnapshotAtomically(outputPath: string, snapshot: unknown): Promise<void> {
  const validation = validateAuthoredSnapshot(snapshot);
  if (!validation.success || !validation.snapshot) {
    throw new Error(`Content snapshot is not valid for publication:\n${validation.issues.join('\n')}`);
  }

  const directory = dirname(outputPath);
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`;
  await mkdir(directory, { recursive: true });
  try {
    await writeFile(temporaryPath, `${JSON.stringify(validation.snapshot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    await rename(temporaryPath, outputPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}
