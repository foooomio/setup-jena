import fetch from 'node-fetch';
import compareVersions from 'compare-versions';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import path from 'path';

const ARCHIVE_PAGE_URL = 'https://archive.apache.org/dist/jena/binaries/';

async function getLatestVersion(): Promise<string> {
  const response = await fetch(ARCHIVE_PAGE_URL);

  if (!response.ok) {
    throw new Error('Could not get the archive page.');
  }

  const html = await response.text();

  const versions: string[] = [];

  const regexp = /href="apache-jena-(\d+\.\d+\.\d+)\.tar\.gz"/g;
  for (const [, version] of html.matchAll(regexp)) {
    if (version) {
      versions.push(version);
    }
  }

  const [latest] = versions.sort((a, b) => compareVersions(b, a));

  if (!latest) {
    throw new Error('Could not get the latest version.');
  }

  return latest;
}

async function installJena(version: string): Promise<string> {
  const downloadUrl = `${ARCHIVE_PAGE_URL}apache-jena-${version}.tar.gz`;

  const archivePath = await tc.downloadTool(downloadUrl);
  const flags = ['xz', '--strip=1'];
  const extractedPath = await tc.extractTar(archivePath, undefined, flags);
  const cachedPath = await tc.cacheDir(extractedPath, 'jena', version);

  return cachedPath;
}

async function run(): Promise<void> {
  let version = core.getInput('jena-version');
  if (!version || version === 'latest') {
    version = await getLatestVersion();
  }

  let jenaPath = tc.find('jena', version);
  if (!jenaPath) {
    jenaPath = await installJena(version);
  }

  core.exportVariable('JENA_HOME', jenaPath);
  core.addPath(path.join(jenaPath, 'bin'));
}

run().catch((e: Error) => {
  core.setFailed(e.message);
});
