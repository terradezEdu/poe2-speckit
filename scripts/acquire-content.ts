import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { acquireGuide, acquisitionLockSchema, verifyGuideCandidate } from './lib/acquire-guide.ts';

export async function main(args = process.argv.slice(2)): Promise<void> {
  if (args.length > 1 || (args.length === 1 && !['--check', '--propose'].includes(args[0]!))) throw new Error('Usage: node scripts/acquire-content.ts [--check|--propose]');
  const lockPath = new URL('../content/acquisition.lock.json', import.meta.url);
  const proposal = args[0] === '--propose';
  const outputPath = fileURLToPath(new URL(proposal
    ? '../content/candidates/act1-opening.poe2overlay.proposed.json'
    : '../content/candidates/act1-opening.poe2overlay.json', import.meta.url));
  const lock = acquisitionLockSchema.parse(JSON.parse(await readFile(lockPath, 'utf8')));
  if (args[0] === '--check') {
    verifyGuideCandidate(lock, await readFile(outputPath, 'utf8'));
    console.log('Licensed source candidate integrity passed (offline). Content review and 0.5.5e compatibility remain pending.');
    return;
  }

  const candidate = await acquireGuide(lock, fetch, { proposal });
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`;
  await mkdir(dirname(outputPath), { recursive: true });
  try {
    await writeFile(temporaryPath, candidate, { encoding: 'utf8', flag: 'wx' });
    await rename(temporaryPath, outputPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
  console.log(`Staged licensed opening-segment ${proposal ? 'proposal' : 'candidate'} from ${lock.repository}@${lock.commit}. No release snapshot published.`);
  if (proposal) console.log(`Proposal SHA-256: ${createHash('sha256').update(candidate).digest('hex')}. Review before updating candidateSha256 in the lock.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Content acquisition failed.');
    process.exitCode = 1;
  });
}
