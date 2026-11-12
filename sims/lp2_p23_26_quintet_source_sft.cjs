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
const results = {
  source: {
    pages: [23, 24, 25, 26], redRunes: 16, totalRunes: source.length,
    bodyRunes: body.length, exactQuintets: quints.length,
  },
  folds: Object.fromEntries(Object.entries(consumers).map(([key, v]) => [key, summary(v)])),
  strideFive: strides.map(summary),
  consecutive201: blocks.map(summary),
};
assert.ok(Math.abs(results.folds.indexSum.ioc - 0.033084577) < 1e-6);
assert.ok(Math.abs(results.folds.gpPrimeSum.ioc - 0.035671642) < 1e-6);
assert.ok(Math.max(...results.strideFive.map(x => x.ioc)) < 0.035);
assert.ok(Math.max(...results.consecutive201.map(x => x.ioc)) < 0.035);
console.log(JSON.stringify(results, null, 2));
