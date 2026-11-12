'use strict';

/**
 * LP2 p23–26 five-dot / padding-free quintet source SFT.
 *
 * A 16-rune red heading on p23 and a five-dot source illustration bound
 * the remaining 1005 runes to 201 complete groups of five.
 * Tests fixed natural five-rune consumers without searching phases or keys.
 * Run: node sims/lp2_p23_26_quintet_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8')
);
const pages = corpus.pages.filter(page => page.page >= 23 && page.page <= 26);
assert.deepEqual(pages.map(p => p.indices.length), [213, 270, 273, 265]);
const source = pages.flatMap(p => p.indices);
assert.equal(source.length, 1021);
const redHeading = [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26];
assert.deepEqual(source.slice(0, 16), redHeading);
const body = source.slice(16);
assert.equal(body.length, 1005);
const quints = Array.from({ length: 201 }, (_, i) => body.slice(i * 5, i * 5 + 5));
assert.ok(quints.every(q => q.length === 5));

/** @param {number[]} values */
const sum = values => values.reduce((a, b) => a + b, 0);
/** @param {number} n */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number[]} values */
function summary(values) {
  const n = values.length;
  const hist = Array.from({ length: 29 }, (_, k) => values.filter(v => v === k).length);
  return {
    length: n,
    ioc: sum(hist.map(x => x * (x - 1))) / (n * (n - 1)),
    equalAdjacent: values.filter((v, i) => i > 0 && values[i - 1] === v).length,
    first40: values.slice(0, 40).map(v => corpus.translit[v]).join('-'),
  };
}
const consumers = {
  body: body,
  indexSum: quints.map(q => mod29(sum(q))),
  indexAlternating: quints.map(q => mod29(q[0] - q[1] + q[2] - q[3] + q[4])),
  gpPrimeSum: quints.map(q => mod29(sum(q.map(v => corpus.prime[v])))),
  gpPrimeAlternating: quints.map(q => mod29(
    q.reduce((s, v, i) => s + (i % 2 ? -1 : 1) * corpus.prime[v], 0)
  )),
};
const strides = Array.from({ length: 5 }, (_, k) => body.filter((_, j) => j % 5 === k));
const blocks = Array.from({ length: 5 }, (_, k) => body.slice(201 * k, 201 * (k + 1)));
// Historical 2013 five-share Shamir clue: interpolate f(0) over GF(29) at
// fixed share abscissae 1,2,3,4,5. The source supplies no actual x labels,
// so these are only the natural zero-parameter literal reading.
const shamir = [5, -10, 10, -5, 1];
const blockQuints = Array.from({ length: 201 }, (_, i) =>
  Array.from({ length: 5 }, (_, j) => blocks[j][i])
);
const extraConsumers = {
  quintetShamir: quints.map(q => mod29(sum(q.map((v, j) => v * shamir[j])))),
  blockFiveIndexSum: blockQuints.map(q => mod29(sum(q))),
  blockFivePrimeSum: blockQuints.map(q => mod29(sum(q.map(v => corpus.prime[v])))),
  blockFiveShamir: blockQuints.map(q => mod29(sum(q.map((v, j) => v * shamir[j])))),
};

/**
 * Exact Gaussian rank over GF(29). Detects any constant affine checksum
 * a0*C0+...+a4*C4=b in all original five-rune groups.
 * @param {number[][]} rows
 * @returns {number}
 */
function gf29Rank(rows) {
  const a = rows.map(row => row.map(mod29));
  const width = a[0].length;
  let rank = 0;
  for (let col = 0; col < width && rank < a.length; col++) {
    let pivot = rank;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    let inverse = 1;
    for (let j = 0; j < 27; j++) inverse = mod29(inverse * a[rank][col]);
    for (let j = col; j < width; j++) a[rank][j] = mod29(a[rank][j] * inverse);
    for (let row = rank + 1; row < a.length; row++) {
      const factor = a[row][col];
      for (let j = col; j < width; j++) {
        a[row][j] = mod29(a[row][j] - factor * a[rank][j]);
      }
    }
    rank++;
  }
  return rank;
}
const plantedParity = quints.map(q => [
  ...q.slice(0, 4), mod29(sum(q.slice(0, 4))),
]);
const parityRanks = {
  fiveRuneConsecutive: {
    linear: gf29Rank(quints), affine: gf29Rank(quints.map(q => [...q, 1])),
  },
  five201RuneBlocks: {
    linear: gf29Rank(blockQuints), affine: gf29Rank(blockQuints.map(q => [...q, 1])),
  },
  checksumPositivePlant: {
    linear: gf29Rank(plantedParity), affine: gf29Rank(plantedParity.map(q => [...q, 1])),
  },
};
assert.deepEqual(parityRanks.fiveRuneConsecutive, { linear: 5, affine: 6 });
assert.deepEqual(parityRanks.five201RuneBlocks, { linear: 5, affine: 6 });
assert.deepEqual(parityRanks.checksumPositivePlant, { linear: 4, affine: 5 });

const results = {
  source: {
    pages: [23, 24, 25, 26], redRunes: 16, totalRunes: source.length,
    bodyRunes: body.length, exactQuintets: quints.length,
  },
  folds: Object.fromEntries(Object.entries({ ...consumers, ...extraConsumers }).map(([key, v]) => [key, summary(v)])),
  strideFive: strides.map(summary),
  consecutive201: blocks.map(summary),
  parityRanks,
};
assert.ok(Math.abs(results.folds.indexSum.ioc - 0.033084577) < 1e-6);
assert.ok(Math.abs(results.folds.gpPrimeSum.ioc - 0.035671642) < 1e-6);
assert.ok(Math.abs(results.folds.quintetShamir.ioc - 0.0344278607) < 1e-6);
assert.ok(Math.abs(results.folds.blockFiveIndexSum.ioc - 0.0358706468) < 1e-6);
assert.ok(Math.abs(results.folds.blockFivePrimeSum.ioc - 0.0320398010) < 1e-6);
assert.ok(Math.abs(results.folds.blockFiveShamir.ioc - 0.0341293532) < 1e-6);
assert.ok(Math.max(...results.strideFive.map(x => x.ioc)) < 0.035);
assert.ok(Math.max(...results.consecutive201.map(x => x.ioc)) < 0.035);
console.log(JSON.stringify(results, null, 2));
