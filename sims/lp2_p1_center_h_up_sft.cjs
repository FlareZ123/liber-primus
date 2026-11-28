"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const referenceText = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8"
);
const model = buildSourceNativeTrigramModel({ corpus, referenceText });

const MOD = 29;
const UP = [1, 13];
const HISTORICAL_2014_ORDER = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];

/** @param {number} a @param {number} b @returns {[number,number]} */
function H(a, b) {
  return [(a - b + MOD) % MOD, (a + b) % MOD];
}

/** @param {number[]} values @returns {number[]} */
function historicalRowPermutation(values) {
  assert.equal(values.length % 14, 0);
  const out = [];
  for (let r = 0; r < values.length / 14; r++) {
    const row = values.slice(14 * r, 14 * r + 14);
    for (const c of HISTORICAL_2014_ORDER) out.push(row[c]);
  }
  return out;
}

/** @param {number[]} values @returns {number[]} */
function historicalColumnUp(values) {
  assert.equal(values.length % 14, 0);
  const rows = values.length / 14;
  const out = [];
  for (const c of HISTORICAL_2014_ORDER) {
    for (let r = rows - 1; r >= 0; r--) out.push(values[14 * r + c]);
  }
  return out;
}

/**
 * Pair the 180-degree counterparts, start at the center, and emerge outward.
 * The upright/right member is first, so H(right,left)=[difference,sum].
 * @param {number[]} values
 * @returns {number[]}
 */
function centerOutH(values) {
  assert.equal(values.length % 2, 0);
  const out = [];
  for (let i = values.length / 2 - 1; i >= 0; i--) {
    const left = values[i];
    const right = values[values.length - 1 - i];
    out.push(...H(right, left));
  }
  return out;
}

const p1 = corpus.pages.find(p => p.page === 1);
assert(p1);
assert.equal(p1.indices.length, 266);
assert.equal(266, 14 * 19);

const leftCenter = p1.indices[132];
const rightCenter = p1.indices[133];
assert.deepEqual([leftCenter, rightCenter], [6, 7]);
assert.equal(corpus.translit[leftCenter], "G");
assert.equal(corpus.translit[rightCenter], "W");
const centerH = H(rightCenter, leftCenter);
assert.deepEqual(centerH, UP);
assert.equal(model.spell(centerH), "UP");

// Complete control over all nonempty unsolved physical pages with an even rune count.
const evenCenters = corpus.pages
  .filter(p => p.page < 56 && p.indices.length > 0 && p.indices.length % 2 === 0)
  .map(p => {
    const m = p.indices.length / 2;
    const output = H(p.indices[m], p.indices[m - 1]);
    return { page: p.page, n: p.indices.length, output, spell: model.spell(output) };
  });
assert.equal(evenCenters.length, 23);
const upHits = evenCenters.filter(row => row.output[0] === UP[0] && row.output[1] === UP[1]);
assert.deepEqual(upHits.map(row => row.page), [1]);

const divisibleBy14 = corpus.pages
  .filter(p => p.page < 56 && p.indices.length > 0 && p.indices.length % 14 === 0)
  .map(p => [p.page, p.indices.length, p.indices.length / 14]);
assert.deepEqual(divisibleBy14, [[1, 266, 19], [6, 196, 14], [36, 238, 17]]);

const rowPermuted = historicalRowPermutation(p1.indices);
const columnUp = historicalColumnUp(p1.indices);
const emerged = centerOutH(p1.indices);
assert.deepEqual(emerged.slice(0, 2), UP);
assert.equal(model.spell(emerged.slice(0, 2)), "UP");

// A genuine local UP result does not make the obvious whole-page consumers prose.
const scores = {
  training: model.trainingScore,
  solvedP57: model.p57Score,
  p1Printed: model.scoreStream(p1.indices).mean,
  historical2014RowPermutation: model.scoreStream(rowPermuted).mean,
  historical2014ColumnUp: model.scoreStream(columnUp).mean,
  centerOutH: model.scoreStream(emerged).mean
};
const expected = {
  training: -2.260728012730832,
  solvedP57: -2.468144714244746,
  p1Printed: -3.440978878397509,
  historical2014RowPermutation: -3.416230853368736,
  historical2014ColumnUp: -3.422646357226988,
  centerOutH: -3.42560360331045
};
for (const [name, value] of Object.entries(expected)) {
  assert(Math.abs(scores[name] - value) < 1e-12, name);
}

console.log(JSON.stringify({
  p1: {
    runes: p1.indices.length,
    factorization: "14x19",
    centerIndices: [132, 133],
    centerValuesLeftRight: [leftCenter, rightCenter],
    directedHRightLeft: centerH,
    directedHSpell: model.spell(centerH)
  },
  evenCenterCount: evenCenters.length,
  exactUpCenterPages: upHits.map(row => row.page),
  divisibleBy14,
  historical2014Order: HISTORICAL_2014_ORDER,
  scores
}, null, 2));
