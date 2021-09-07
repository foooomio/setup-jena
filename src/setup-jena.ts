import fetch from 'node-fetch';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import path from 'path';

const CDN_PAGE_URL = 'https://dlcdn.apache.org/jena/binaries/';
const ARCHIVE_PAGE_URL = 'https://archive.apache.org/dist/jena/binaries/';

async function getLatestVersion(): Promise<string> {
  const response = await fetch(CDN_PAGE_URL);

  if (!response.ok) {
    throw new Error(
      `Could not get ${CDN_PAGE_URL}: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const [, version] =
    html.match(/href="apache-jena-(\d+\.\d+\.\d+)\.tar\.gz"/) || [];

  if (!version) {
    throw new Error('Could not get the latest version.');
  }

  return version;
}

async function installJena(version: string, baseUrl: string): Promise<string> {
  const downloadUrl = `${baseUrl}apache-jena-${version}.tar.gz`;

  const archivePath = await tc.downloadTool(downloadUrl);
  const flags = ['xz', '--strip=1'];
  const extractedPath = await tc.extractTar(archivePath, undefined, flags);
  const cachedPath = await tc.cacheDir(extractedPath, 'jena', version);

  return cachedPath;
}

async function run(): Promise<void> {
  let version = core.getInput('jena-version');
  const latest = !version || version === 'latest';
  if (latest) {
    version = await getLatestVersion();
  }

  let jenaPath = tc.find('jena', version);
  if (!jenaPath) {
    jenaPath = await installJena(
      version,
      latest ? CDN_PAGE_URL : ARCHIVE_PAGE_URL
    );
  }

  core.exportVariable('JENA_HOME', jenaPath);
  core.addPath(path.join(jenaPath, 'bin'));
}

run().catch((e: Error) => {
  core.setFailed(e.message);
});
