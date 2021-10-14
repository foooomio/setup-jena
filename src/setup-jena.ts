import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import path from 'path';
import { getLatest, getSatisfied } from './jena-version';

async function installJena(
  version: string,
  downloadUrl: string
): Promise<string> {
  const archivePath = await tc.downloadTool(downloadUrl);
  const flags = ['xz', '--strip=1'];
  const extractedPath = await tc.extractTar(archivePath, undefined, flags);
  const cachedPath = await tc.cacheDir(extractedPath, 'jena', version);

  return cachedPath;
}

async function run(): Promise<void> {
  const version = core.getInput('jena-version');
  const isLatest = !version || version === 'latest' || version === '*';

  const jena = isLatest ? await getLatest() : await getSatisfied(version);

  let jenaPath = tc.find('jena', jena.version);
  if (!jenaPath) {
    core.info('Installing ' + jena.downloadUrl);
    jenaPath = await installJena(jena.version, jena.downloadUrl);
  }

  core.exportVariable('JENA_HOME', jenaPath);
  core.addPath(path.join(jenaPath, 'bin'));

  core.info('JENA_HOME: ' + jenaPath);
}

run().catch((e: Error) => {
  core.setFailed(e.message);
});
