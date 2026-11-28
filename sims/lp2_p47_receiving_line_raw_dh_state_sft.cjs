#!/usr/bin/env node
'use strict';

/**
 * SFT for the p47 selected line-wrap object's receiving line.
 * The fixed receiving line directly serializes the DH23 state in raw
 * length/sum/product/end-point descriptors. No plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r/g, '');
const raw = read('resources/liber-primus/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = raw.split(/^\s*%\s*$/m);
const mod29 = (x) => ((x % 29) + 29) % 29;

function modPow(base, exponent, modulus) {
  let r = 1, b = base % modulus, e = exponent;
  while (e > 0) {
    if (e & 1) r = (r * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1;
  }
  return r;
}

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1] || '';
}

function pageGroups(page) {
  const block = physicalPart(page);
  let offset = 0, line = 1, current = null;
  const groups = [];
  const finish = () => { if (current) groups.push(current); current = null; };
  for (const ch of block) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current) current = { start: offset, sites: [] };
      current.sites.push({ offset, line, value });
      offset += 1;
    } else if (ch === '/') {
      line += 1;
    } else if (/\s/u.test(ch)) {
      // whitespace and printed line-wraps preserve a punctuation group
    } else {
      finish();
    }
  }
  finish();
  return groups;
}

function descriptor(sites) {
  const values = sites.map((s) => s.value);
  return {
    values,
    length: values.length,
    sum: values.reduce((a, b) => a + b, 0) % 29,
    product: values.reduce((a, b) => a * b, 1) % 29,
    first: values[0],
    last: values.at(-1),
  };
}

function lineFragments(page, line) {
  return pageGroups(page)
    .filter((g) => g.sites.some((s) => s.line === line))
    .map((g) => {
      const sites = g.sites.filter((s) => s.line === line);
      return {
        continuation: g.sites[0].line < line,
        continues: g.sites.at(-1).line > line,
        complete: g.sites[0].line === line && g.sites.at(-1).line === line,
        ...descriptor(sites),
      };
    });
}

// Existing upstream route fixes p47 page-local group47.
const groups47 = pageGroups(47);
assert.equal(groups47.length, 59);
const selected = groups47[46];
assert.equal(selected.start, 206);
assert.deepEqual(selected.sites.map((s) => s.value), [19, 1, 10, 27, 11, 3]);
assert.deepEqual(selected.sites.map((s) => s.line), [9, 10, 10, 10, 10, 10]);
const left = selected.sites.filter((s) => s.line === 9).map((s) => s.value);
const right = selected.sites.filter((s) => s.line === 10).map((s) => s.value);
assert.deepEqual(left, [19]);
assert.deepEqual(right, [1, 10, 27, 11, 3]);

const receiving = lineFragments(47, 10);
assert.deepEqual(receiving.map((f) => f.values), [
  [1, 10, 27, 11, 3],
  [15, 12, 25, 12, 21, 4],
  [20, 12, 28],
  [16, 3, 11],
  [3, 21, 13],
  [4, 8],
]);
assert.equal(receiving[0].continuation, true);
assert.equal(receiving.at(-1).continues, true);
assert.ok(receiving.slice(1, -1).every((f) => f.complete));

// Direct extraction: exponentiation is not used to obtain any field.
const state = {
  p: receiving[0].sum,
  g: receiving[0].length,
  a: receiving[1].length,
  b: receiving[1].first,
  A: receiving[4].sum,
  B: left[0],
  K: receiving[1].sum,
  e: receiving[2].length,
  q: receiving[1].last,
};
assert.deepEqual(state, { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 });

const lengths = receiving.map((f) => f.length);
const sums = receiving.map((f) => f.sum);
const products = receiving.map((f) => f.product);
assert.deepEqual(lengths, [state.g, state.a, state.e, state.e, state.e, state.K]);
assert.deepEqual(sums, [state.p, state.K, state.K, 1, state.A, mod29(state.a * state.K)]);
assert.deepEqual(products, [
  state.g + state.K,
  state.p,
  mod29(-state.A),
  state.a,
  state.g + state.K,
  state.e,
]);
assert.equal(receiving.at(-1).length, state.K);
assert.equal(receiving.at(-1).sum, mod29(state.a * state.K));
assert.equal(receiving.at(-1).product, state.e);

// DH is now a validation check only.
assert.equal(modPow(state.g, state.a, state.p), state.A);
assert.equal(modPow(state.g, state.b, state.p), state.B);
assert.equal(modPow(state.B, state.a, state.p), state.K);
assert.equal((state.b * state.e) % (state.p - 1), 1);
assert.equal(state.q, state.e + 1);

// Matched printed-line framing census across unknown physical p0-p55.
const printedLines = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const groups = pageGroups(page);
  const lines = [...new Set(groups.flatMap((g) => g.sites.map((s) => s.line)))];
  for (const line of lines) printedLines.push({ page, line, fragments: lineFragments(page, line) });
}
assert.equal(printedLines.length, 594);
const framed = printedLines.filter(({ fragments }) =>
  fragments.length === 6
  && fragments[0].continuation
  && fragments.at(-1).continues
  && fragments.slice(1, -1).every((f) => f.complete)
);
assert.equal(framed.length, 89);
const same = (a, b) => a.join(',') === b.join(',');
const lengthHits = framed.filter(({ fragments }) => same(fragments.map((f) => f.length), lengths));
const lengthSumHits = lengthHits.filter(({ fragments }) => same(fragments.map((f) => f.sum), sums));
const tripleHits = lengthSumHits.filter(({ fragments }) => same(fragments.map((f) => f.product), products));
const endpointHits = tripleHits.filter(({ fragments }) => fragments[1].first === state.b && fragments[1].last === state.q);
for (const hits of [lengthHits, lengthSumHits, tripleHits, endpointHits]) {
  assert.deepEqual(hits.map(({ page, line }) => [page, line]), [[47, 10]]);
}

// Canonical complete-word control for the immediate successor.
const stream = raw.split('%').slice(0, 55).join('%');
const allWords = [];
let current = [], runePage = 0, line = 1, offset = 0;
const finish = () => { if (current.length) allWords.push(current); current = []; };
for (const ch of stream) {
  const value = runeIndex.get(ch);
  if (value !== undefined) {
    current.push({ page: runePage, line, offset, value });
    offset += 1;
  } else if (ch === '%') {
    runePage += 1; line = 1; offset = 0;
  } else if (ch === '/') {
    line += 1;
  } else if (/\s/u.test(ch)) {
    // carried word continues
  } else {
    finish();
  }
}
finish();
const physical = (page) => page >= 50 ? page + 1 : page;
const complete = allWords
  .filter((w) => w.every((s) => s.page === w[0].page))
  .map((w) => ({ page: physical(w[0].page), sites: w }));
assert.equal(complete.length, 2864);
const six = complete.filter((w) => w.sites.length === state.a);
assert.equal(six.length, 251);
const successorHits = six.filter((w) => {
  const d = descriptor(w.sites);
  return d.sum === state.K && d.product === state.p;
});
assert.deepEqual(successorHits.map((w) => ({
  page: w.page,
  start: w.sites[0].offset,
  first: w.sites[0].value,
  last: w.sites.at(-1).value,
})), [
  { page: 28, start: 26, first: 4, last: 13 },
  { page: 47, start: 212, first: state.b, last: state.q },
]);
assert.deepEqual(successorHits.filter((w) =>
  w.sites[0].value === state.b && w.sites.at(-1).value === state.q
).map((w) => [w.page, w.sites[0].offset]), [[47, 212]]);

console.log(JSON.stringify({
  classification: 'source-selected raw p47 line-state serialization; no plaintext/cipher inverse',
  selectedGroup: { page: 47, ordinal: 47, start: 206 },
  directState: state,
  receivingLine: { page: 47, line: 10, lengths, sums, products },
  framingCensus: {
    printedLines: printedLines.length,
    comparableLines: framed.length,
    lengthHits: lengthHits.map(({ page, line }) => [page, line]),
    lengthSumHits: lengthSumHits.map(({ page, line }) => [page, line]),
    fullDescriptorHits: tripleHits.map(({ page, line }) => [page, line]),
    endpointHits: endpointHits.map(({ page, line }) => [page, line]),
  },
  successorControl: {
    completeWords: complete.length,
    completeSix: six.length,
    lenSumProductHits: successorHits.map((w) => [w.page, w.sites[0].offset]),
    endpointQualifiedHits: [[47, 212]],
  },
}, null, 2));
console.log('PASS lp2_p47_receiving_line_raw_dh_state_sft');
