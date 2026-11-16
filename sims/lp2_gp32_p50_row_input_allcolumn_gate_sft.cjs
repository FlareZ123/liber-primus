"use strict";

/**
 * Key-free falsification of the literal 32×8 table transition oracle.
 * A preceding GP29 ciphertext rune chooses one of 32 table rows. Even if a
 * different SECRET column (one of eight) is chosen independently at every
 * step, the next GP29 rune must occur among that row's eight byte projections.
 * No English scoring, guessed column clock or fitted key enters the proof.
 *
 * Original-source SFT: node sims/lp2_gp32_p50_row_input_allcolumn_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const source = json("resources/liber-primus/lp2-corpus.json");
const table = json("resources/liber-primus/lp2-grid-256.json");
assert.equal(table.bytes.length, 256);
assert.equal(source.pages.slice(0, 56).reduce((s, p) => s + p.indices.length, 0), 12956);
const original = source.pages.filter((p) => p.page < 56 && p.indices.length);
assert.equal(original.length, 55);

/**
 * @param {number} byte
 * @param {"base29"|"low5"|"high5"} projection
 */
function project(byte, projection) {
  if (projection === "base29") return byte % 29;
  if (projection === "low5") return byte & 31;
  return byte >> 3;
}

/** @param {number} previous @param {"base29"|"low5"|"high5"} projection */
function possibleSuccessors(previous, projection) {
  assert.ok(Number.isInteger(previous) && previous >= 0 && previous < 29);
  return table.bytes.slice(8 * previous, 8 * previous + 8)
    .map((byte) => project(byte, projection));
}

/**
 * @param {number[][]} pages
 * @param {"base29"|"low5"|"high5"} projection
 */
function countSupported(pages, projection) {
  let pairs = 0;
  let supported = 0;
  /** @type {null|{page:number,offset:number,previous:number,observed:number,possible:number[]}} */
  let firstImpossible = null;
  for (const [page, indices] of pages.entries()) {
    for (let offset = 1; offset < indices.length; offset++) {
      pairs++;
      const previous = indices[offset - 1];
      const observed = indices[offset];
      const possible = possibleSuccessors(previous, projection);
      if (possible.includes(observed)) supported++;
      else if (firstImpossible === null) {
        firstImpossible = {page, offset, previous, observed, possible};
      }
    }
  }
  return {projection, pairs, supported, impossible: pairs - supported, firstImpossible};
}

function main() {
  const physical = Array.from({length: 56}, (_, i) => source.pages[i].indices);
  const results = ["base29", "low5", "high5"].map(
    (projection) => countSupported(physical, projection)
  );
  assert.deepEqual(results.map((r) => [r.pairs, r.supported]),
    [[12901, 3234], [12901, 3031], [12901, 3005]]);
  assert.deepEqual(results[0].firstImpossible, {
    page: 0, offset: 1, previous: 15, observed: 8,
    possible: [13, 5, 28, 25, 13, 20, 18, 19],
  });

  // Source-native synthetic positives: each step can be re-generated from
  // its original row when secret columns vary arbitrarily.
  const positive = [];
  for (const projection of ["base29", "low5", "high5"]) {
    const planted = [15];
    for (let i = 1; i < 400; i++) {
      const candidates = possibleSuccessors(planted[i - 1], projection)
        .filter((value) => value < 29);
      assert.ok(candidates.length);
      planted.push(candidates[i % candidates.length]);
    }
    const test = countSupported([planted], projection);
    assert.deepEqual([test.pairs, test.supported, test.impossible], [399,399,0]);
    positive.push({projection, pairs: test.pairs, allTransitionsSupported: true});
  }

  const report = {
    hypothesis: "Previous ciphertext GP29 index selects table row. A hidden eight-choice column selects next rune as one of three literal byte projections.",
    originalPages: 56,
    runeBearingPages: 55,
    runsOnOriginal: results,
    positive,
    decision: "All three source-shaped row-transition consumers are impossible for the original unchanged ciphertext even with arbitrary secret columns at every rune. A different state-row function is untested.",
  };
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) main();
module.exports = { project, possibleSuccessors, countSupported };
