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

// Source-fixed continuation: line10's outgoing carry selects line11, then line12/page end.
const inverse29 = (value) => {
  for (let candidate = 1; candidate < 29; candidate += 1) {
    if ((value * candidate) % 29 === 1) return candidate;
  }
  throw new Error('no inverse');
};
const Ainv = inverse29(state.A);
assert.equal(Ainv, 11);

const line11 = lineFragments(47, 11);
const line11Lengths = [state.q, state.e, state.g * state.K, state.q];
const line11Sums = [mod29(state.A * state.K), mod29(state.b - state.K), 0, state.B];
const line11Products = [1, mod29(state.b - state.K), 28, state.A];
assert.deepEqual(line11.map((f) => f.length), line11Lengths);
assert.deepEqual(line11.map((f) => f.sum), line11Sums);
assert.deepEqual(line11.map((f) => f.product), line11Products);

const line12 = lineFragments(47, 12);
const line12Lengths = [state.e, state.e, Ainv, state.e, state.q];
const line12Sums = [state.b, Ainv, state.e, mod29(state.b - state.K), mod29(-Ainv)];
const line12Products = [mod29(-state.A), mod29(-state.b), mod29(-state.g), 0, state.B];
assert.deepEqual(line12.map((f) => f.length), line12Lengths);
assert.deepEqual(line12.map((f) => f.sum), line12Sums);
assert.deepEqual(line12.map((f) => f.product), line12Products);

const line11Class = printedLines.filter(({ fragments }) =>
  fragments.length === 4
  && fragments[0].continuation
  && fragments.at(-1).continues
  && fragments.slice(1, -1).every((f) => f.complete)
);
assert.equal(line11Class.length, 22);
const line11LengthHits = line11Class.filter(({ fragments }) => same(fragments.map((f) => f.length), line11Lengths));
const line11LengthSumHits = line11LengthHits.filter(({ fragments }) => same(fragments.map((f) => f.sum), line11Sums));
const line11FullHits = line11LengthSumHits.filter(({ fragments }) => same(fragments.map((f) => f.product), line11Products));
for (const hits of [line11LengthHits, line11LengthSumHits, line11FullHits]) {
  assert.deepEqual(hits.map(({ page, line }) => [page, line]), [[47, 11]]);
}

const lastLineByPage = new Map();
for (const row of printedLines) {
  lastLineByPage.set(row.page, Math.max(lastLineByPage.get(row.page) || 0, row.line));
}
const line12Class = printedLines.filter(({ page, line, fragments }) =>
  line === lastLineByPage.get(page)
  && fragments.length === 5
  && fragments[0].continuation
  && !fragments.some((f) => f.continues)
  && fragments.slice(1).every((f) => f.complete)
);
assert.equal(line12Class.length, 20);
const line12LengthHits = line12Class.filter(({ fragments }) => same(fragments.map((f) => f.length), line12Lengths));
const line12LengthSumHits = line12LengthHits.filter(({ fragments }) => same(fragments.map((f) => f.sum), line12Sums));
const line12FullHits = line12LengthSumHits.filter(({ fragments }) => same(fragments.map((f) => f.product), line12Products));
for (const hits of [line12LengthHits, line12LengthSumHits, line12FullHits]) {
  assert.deepEqual(hits.map(({ page, line }) => [page, line]), [[47, 12]]);
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
const crossPage = allWords
  .filter((w) => new Set(w.map((site) => physical(site.page))).size > 1);
assert.equal(crossPage.length, 32);
const boundaryWord = crossPage.find((w) => {
  const pages = [...new Set(w.map((site) => physical(site.page)))];
  return pages.length === 2 && pages[0] === 47 && pages[1] === 48;
});
assert.ok(boundaryWord);
const boundaryValues = boundaryWord.map((site) => site.value);
assert.deepEqual(boundaryValues, [24, 3, 24, 25, 8, 5, 10, 2]);
const boundaryDescriptor = descriptor(boundaryWord);
assert.equal(boundaryDescriptor.length, state.A);
assert.equal(boundaryDescriptor.sum, mod29(-state.b));
assert.equal(boundaryDescriptor.product, state.q);

const boundaryLeft = descriptor(boundaryWord.slice(0, 4));
const boundaryRight = descriptor(boundaryWord.slice(4));
assert.deepEqual(
  [boundaryLeft.length, boundaryLeft.sum, boundaryLeft.product],
  [state.q, mod29(-Ainv), state.B]
);
assert.deepEqual(
  [boundaryRight.length, boundaryRight.sum, boundaryRight.product],
  [state.q, mod29(-state.q), state.b + state.K]
);

const H = (values) => {
  const out = [];
  const half = values.length / 2;
  for (let index = 0; index < half; index += 1) {
    out.push(mod29(values[index] - values[values.length - 1 - index]));
  }
  for (let index = half - 1; index >= 0; index -= 1) {
    out.push(mod29(values[index] + values[values.length - 1 - index]));
  }
  return out;
};
const boundaryH = H(boundaryValues);
assert.deepEqual(boundaryH, [
  state.p - 1,
  state.p - 1,
  state.B,
  state.b + state.K,
  state.q,
  0,
  state.b - state.K,
  mod29(-state.e),
]);

const crossPageLengthA = crossPage.filter((w) => w.length === state.A);
assert.deepEqual(
  crossPageLengthA.map((w) => [physical(w[0].page), physical(w.at(-1).page)]),
  [[47, 48]]
);

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
  continuationCensus: {
    line11: {
      comparableLines: line11Class.length,
      lengths: line11Lengths,
      sums: line11Sums,
      products: line11Products,
      fullHits: line11FullHits.map(({ page, line }) => [page, line]),
    },
    line12: {
      comparableLines: line12Class.length,
      lengths: line12Lengths,
      sums: line12Sums,
      products: line12Products,
      fullHits: line12FullHits.map(({ page, line }) => [page, line]),
    },
  },
  crossPageCarrier: {
    crossPageWords: crossPage.length,
    lengthAHits: crossPageLengthA.length,
    pages: [47, 48],
    values: boundaryValues,
    raw: {
      length: boundaryDescriptor.length,
      sum: boundaryDescriptor.sum,
      product: boundaryDescriptor.product,
    },
    halves: {
      p47: [boundaryLeft.length, boundaryLeft.sum, boundaryLeft.product],
      p48: [boundaryRight.length, boundaryRight.sum, boundaryRight.product],
    },
    H: boundaryH,
  },
  successorControl: {
    completeWords: complete.length,
    completeSix: six.length,
    lenSumProductHits: successorHits.map((w) => [w.page, w.sites[0].offset]),
    endpointQualifiedHits: [[47, 212]],
  },
}, null, 2));
console.log('PASS lp2_p47_receiving_line_raw_dh_state_sft');
