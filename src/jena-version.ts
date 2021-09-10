import fetch from 'node-fetch';
import semverValid from 'semver/functions/valid';
import semverSatisfies from 'semver/functions/satisfies';
import semverRSort from 'semver/functions/rsort';

const CDN_PAGE_URL = 'https://dlcdn.apache.org/jena/binaries/';
const ARCHIVE_PAGE_URL = 'https://archive.apache.org/dist/jena/binaries/';

export interface JenaVersionInfo {
  version: string;
  downloadUrl: string;
}

export class JenaVersion {
  readonly input: string;
  readonly latest: boolean;
  readonly baseUrl: string;

  constructor(input: string) {
    this.input = input;
    this.latest = !this.input || this.input === 'latest';
    this.baseUrl = this.latest ? CDN_PAGE_URL : ARCHIVE_PAGE_URL;
  }

  async getInfo(): Promise<JenaVersionInfo> {
    const version = await this.getVersion();
    const downloadUrl = this.baseUrl + `apache-jena-${version}.tar.gz`;
    return { version, downloadUrl };
  }

  async getVersion(): Promise<string> {
    if (this.latest) {
      return await this.getLatestVersion();
    } else if (semverValid(this.input)) {
      return this.input;
    } else {
      return await this.getSatisfiedVersion();
    }
  }

  async getLatestVersion(): Promise<string> {
    const [version] = await this.getAvailableVersions();

    if (!version) {
      throw new Error('Could not get the latest version.');
    }

    return version;
  }

  async getSatisfiedVersion(): Promise<string> {
    const versions = await this.getAvailableVersions();

    const satisfied = versions.find((version) =>
      semverSatisfies(version, this.input)
    );

    if (!satisfied) {
      throw new Error('No matching version was found.');
    }

    return satisfied;
  }

  async getAvailableVersions(): Promise<string[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(
        `Could not get ${this.baseUrl}: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    const versions: string[] = [];

    const regexp = /href="apache-jena-(\d+\.\d+\.\d+)\.tar\.gz"/g;
    for (const [, version] of html.matchAll(regexp)) {
      if (version) {
        versions.push(version);
      }
    }

    if (!versions.length) {
      throw new Error('Could not get the available versions.');
    }

    return semverRSort(versions);
  }
}
