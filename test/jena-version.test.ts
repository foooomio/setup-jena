import assert from "node:assert/strict";
import test from "node:test";
import { getLatest, getSatisfied } from "../src/jena-version.ts";

test("latest", async () => {
  const info = await getLatest();
  assert.ok(info.version);
});

test("range", async () => {
  const info = await getSatisfied("3.x");
  assert.equal(info.version, "3.17.0");
});

test("2.7.0-incubating", async () => {
  const info = await getSatisfied("2.7.0");
  assert.equal(info.version, "2.7.0-incubating");
});
