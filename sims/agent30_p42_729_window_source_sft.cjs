"use strict";

/**
 * Source-exact independent 729-rune holdout anchored at LP2 p42. Starts after
 * all of physical pp40-41, and spans p42 (272), p43 (274), p44 (first 183).
 * The p42 272-rune original has insufficient planted power for the source
 * historical-period detector; this longer target must still pass independent
 * controls before any negative claim is made.
 *
 * Usage as a standalone source check:
 * node sims/agent30_p42_729_window_source_sft.cjs
 *
 * @typedef {{indices: number[]}} RunePage
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @param {RunePage[]} pages Canonical LP2 original physical pages 0..55.
 * @returns {{window: number[], prev: number, serialized: string, digest: string}}
 */
function buildWindow(pages) {
  assert.equal(pages[41].indices.at(-1), 11);
  assert.equal(pages[42].indices.length, 272);
  assert.equal(pages[43].indices.length, 274);
  assert.equal(pages[44].indices.length, 273);
  const prev = 11;
  const window = [...pages[42].indices, ...pages[43].indices, ...pages[44].indices.slice(0, 183)];
  assert.equal(window.length, 729);
  assert.ok(window.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
  const digest = crypto.createHash("sha256").update(Buffer.from(window)).digest("hex");
  assert.equal(digest, "728115bbc13b381be31f0ba93dd193e3108e2af9534a97ffdb000011d6020b6e");
  const serialized = "W p42_729 11\nR " + window.join(" ") + "\nL \n";
  return { window, prev, serialized, digest };
}

if (require.main === module) {
  const source = path.resolve(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
  const corpus = JSON.parse(fs.readFileSync(source, "utf8"));
  process.stdout.write(buildWindow(corpus.pages).serialized);
}

module.exports = { buildWindow };
