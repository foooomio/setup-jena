import fetch from 'node-fetch';
import semverSatisfies from 'semver/functions/satisfies';
import semverCompare from 'semver/functions/compare';

export const CDN_PAGE_URL = 'https://dlcdn.apache.org/jena/binaries/';
export const ARCHIVE_PAGE_URL =
  'https://archive.apache.org/dist/jena/binaries/';

export interface JenaInfo {
  version: string;
  downloadUrl: string;
}

export async function getLatest(): Promise<JenaInfo> {
  const [info] = await getAvailableList(CDN_PAGE_URL);

  if (!info) {
    throw new Error('Could not find the latest version.');
  }

  return info;
}

export async function getSatisfied(input: string): Promise<JenaInfo> {
  const list = await getAvailableList(ARCHIVE_PAGE_URL);

  const info = list.find((candidate) =>
    semverSatisfies(candidate.version, input)
  );

  if (!info) {
    throw new Error(`Could not find a version that matches '${input}'.`);
  }

  return info;
}

export async function getAvailableList(url: string): Promise<JenaInfo[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `${url} is currently unavailable: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();

  const list: JenaInfo[] = [];

  const regexp = /href="apache-jena-(\d+\.\d+\.\d+)\.tar\.gz"/g;
  for (const [, version] of html.matchAll(regexp)) {
    if (version) {
      list.push({
        version,
        downloadUrl: `${url}apache-jena-${version}.tar.gz`,
      });
    }
  }

  if (!list.length) {
    throw new Error('Could not find any available versions.');
  }

  return list.sort((a, b) => semverCompare(b.version, a.version));
}
