import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { getLatest, getSatisfied } from '../src/jena-version';

test('latest', async () => {
  const info = await getLatest();
  assert.ok(info.version);
});

test('range', async () => {
  const info = await getSatisfied('3.x');
  assert.is(info.version, '3.17.0');
});

test('2.7.0-incubating', async () => {
  const info = await getSatisfied('2.7.0');
  assert.is(info.version, '2.7.0-incubating');
});

test.run();
