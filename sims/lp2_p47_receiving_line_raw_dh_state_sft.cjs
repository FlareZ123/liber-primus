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
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const p50Tokens = grid.pages.flatMap((page) => page.tokens);
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
  const half = Math.floor(values.length / 2);
  for (let index = 0; index < half; index += 1) {
    out.push(mod29(values[index] - values[values.length - 1 - index]));
  }
  if (values.length % 2 === 1) out.push(values[half]);
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

const boundaryPairs = [];
for (let index = 0; index < boundaryH.length; index += 2) {
  const numeral = boundaryH[index] * 29 + boundaryH[index + 1];
  const address = numeral % 256;
  boundaryPairs.push({
    pair: [boundaryH[index], boundaryH[index + 1]],
    numeral,
    address,
    token: p50Tokens[address],
  });
}
assert.deepEqual(boundaryPairs, [
  { pair: [22, 22], numeral: 660, address: 148, token: '46' },
  { pair: [19, 17], numeral: 568, address: 56, token: '4E' },
  { pair: [4, 0], numeral: 116, address: 116, token: '0s' },
  { pair: [13, 26], numeral: 403, address: 147, token: '2r' },
]);
assert.deepEqual(
  boundaryPairs.filter(({ token }) => /^\d{2}$/.test(token) && Number(token) <= 55),
  [boundaryPairs[0]]
);

const p46Groups = pageGroups(46);
assert.equal(p46Groups.length, 61);
const p46Group46 = p46Groups[45];
const p46Values = p46Group46.sites.map((site) => site.value);
assert.deepEqual(p46Values, [10, 2, 17, 18, 4]);
assert.deepEqual(p46Group46.sites.map((site) => site.line), [9, 9, 10, 10, 10]);
const p46Descriptor = descriptor(p46Group46.sites);
assert.deepEqual(
  [p46Descriptor.length, p46Descriptor.sum, p46Descriptor.product],
  [state.g, state.p - 1, state.q]
);
const p46H = H(p46Values);
assert.deepEqual(p46H, [
  state.a,
  state.b - state.K,
  state.b + state.K,
  state.p - state.e,
  mod29(-state.b),
]);

const p46Lines = [...new Set(p46Group46.sites.map((site) => site.line))];
assert.deepEqual(
  p46Lines.map((selectedLine) => p46Group46.sites.filter((site) => site.line === selectedLine).length),
  [state.K, state.e]
);

const allLocalGroups = [];
const selfIndexedGroups = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const groups = pageGroups(page);
  for (let index = 0; index < groups.length; index += 1) {
    const values = groups[index].sites.map((site) => site.value);
    const d = descriptor(groups[index].sites);
    allLocalGroups.push({ page, ordinal: index + 1, values, d, h: H(values) });
  }
  if (page >= 1 && groups[page - 1]) {
    const values = groups[page - 1].sites.map((site) => site.value);
    const d = descriptor(groups[page - 1].sites);
    selfIndexedGroups.push({ page, ordinal: page, values, d, h: H(values) });
  }
}
assert.equal(allLocalGroups.length, 2928);
assert.equal(selfIndexedGroups.length, 48);
const p46RawMatches = (row) =>
  row.d.length === state.g && row.d.sum === state.p - 1 && row.d.product === state.q;
assert.deepEqual(
  selfIndexedGroups.filter(p46RawMatches).map(({ page, ordinal }) => [page, ordinal]),
  [[46, 46]]
);
assert.deepEqual(
  allLocalGroups.filter(p46RawMatches).map(({ page, ordinal }) => [page, ordinal]),
  [[46, 46]]
);
assert.deepEqual(
  allLocalGroups.filter((row) => row.h.join(',') === p46H.join(','))
    .map(({ page, ordinal }) => [page, ordinal]),
  [[46, 46]]
);

const p46Line10 = lineFragments(46, 10);
const p46Line10Lengths = [state.e, state.e, state.K, state.e, state.g, state.e, state.q];
const p46Line10Sums = [
  state.a + state.q,
  mod29(state.a * state.K),
  state.K,
  state.b - state.K,
  state.K,
  Ainv,
  state.g + state.q,
];
const p46Line10Products = [
  state.a,
  state.e,
  state.K,
  state.p - state.e,
  0,
  state.p - state.e,
  state.A,
];
assert.deepEqual(p46Line10.map((f) => f.length), p46Line10Lengths);
assert.deepEqual(p46Line10.map((f) => f.sum), p46Line10Sums);
assert.deepEqual(p46Line10.map((f) => f.product), p46Line10Products);

const p46SevenCarryClass = printedLines.filter(({ fragments }) =>
  fragments.length === 7
  && fragments[0].continuation
  && fragments.at(-1).continues
  && fragments.slice(1, -1).every((f) => f.complete)
);
assert.equal(p46SevenCarryClass.length, 55);
const p46Line10LengthHits = p46SevenCarryClass.filter(({ fragments }) =>
  same(fragments.map((f) => f.length), p46Line10Lengths)
);
const p46Line10FullHits = p46Line10LengthHits.filter(({ fragments }) =>
  same(fragments.map((f) => f.sum), p46Line10Sums)
  && same(fragments.map((f) => f.product), p46Line10Products)
);
assert.deepEqual(p46Line10LengthHits.map(({ page, line }) => [page, line]), [[46, 10]]);
assert.deepEqual(p46Line10FullHits.map(({ page, line }) => [page, line]), [[46, 10]]);

const p46Line11 = lineFragments(46, 11);
const p46Line11Lengths = [state.e, state.e, state.q, state.K, state.e, state.A, 1];
const p46Line11Sums = [
  mod29(-state.e), mod29(-state.e), mod29(-Ainv), state.q, state.K, 28, mod29(-state.K),
];
const p46Line11Products = [
  state.b - state.K, state.a, state.K, state.A, state.b, 0, mod29(-state.K),
];
assert.deepEqual(p46Line11.map((f) => f.length), p46Line11Lengths);
assert.deepEqual(p46Line11.map((f) => f.sum), p46Line11Sums);
assert.deepEqual(p46Line11.map((f) => f.product), p46Line11Products);
const p46Line11LengthHits = p46SevenCarryClass.filter(({ fragments }) =>
  same(fragments.map((f) => f.length), p46Line11Lengths)
);
const p46Line11FullHits = p46Line11LengthHits.filter(({ fragments }) =>
  same(fragments.map((f) => f.sum), p46Line11Sums)
  && same(fragments.map((f) => f.product), p46Line11Products)
);
assert.deepEqual(p46Line11LengthHits.map(({ page, line }) => [page, line]), [[46, 11]]);
assert.deepEqual(p46Line11FullHits.map(({ page, line }) => [page, line]), [[46, 11]]);

const p46Line12 = lineFragments(46, 12);
const p46Line12Lengths = [state.K, state.g + state.q, state.q, state.A];
const p46Line12Sums = [mod29(-state.e), 28, state.g, state.b - state.K];
const p46Line12Products = [state.b + state.K, state.a + state.q, state.b - state.K, 0];
assert.deepEqual(p46Line12.map((f) => f.length), p46Line12Lengths);
assert.deepEqual(p46Line12.map((f) => f.sum), p46Line12Sums);
assert.deepEqual(p46Line12.map((f) => f.product), p46Line12Products);

const p46FinalClass = printedLines.filter(({ page, line, fragments }) =>
  line === lastLineByPage.get(page)
  && fragments.length === 4
  && fragments[0].continuation
  && !fragments.some((f) => f.continues)
  && fragments.slice(1).every((f) => f.complete)
);
assert.equal(p46FinalClass.length, 3);
const p46Line12LengthHits = p46FinalClass.filter(({ fragments }) =>
  same(fragments.map((f) => f.length), p46Line12Lengths)
);
const p46Line12FullHits = p46Line12LengthHits.filter(({ fragments }) =>
  same(fragments.map((f) => f.sum), p46Line12Sums)
  && same(fragments.map((f) => f.product), p46Line12Products)
);
assert.deepEqual(p46Line12LengthHits.map(({ page, line }) => [page, line]), [[46, 12]]);
assert.deepEqual(p46Line12FullHits.map(({ page, line }) => [page, line]), [[46, 12]]);

const p46BoundaryWord = crossPage.find((w) => {
  const pages = [...new Set(w.map((site) => physical(site.page)))];
  return pages.length === 2 && pages[0] === 46 && pages[1] === 47;
});
assert.ok(p46BoundaryWord);
assert.deepEqual(
  p46BoundaryWord.map((site) => site.value),
  [21, 20, 19, 5, 27, 12, 0, 25, 28, 10, 2]
);
const p46BoundaryH = H(p46BoundaryWord.map((site) => site.value));
assert.deepEqual(p46BoundaryH, [19, 10, 20, 9, 27, 12, 27, 1, 18, 1, 23]);
const p46BoundaryPairTokens = [];
for (let index = 0; index + 1 < p46BoundaryH.length; index += 2) {
  const numeral = p46BoundaryH[index] * 29 + p46BoundaryH[index + 1];
  p46BoundaryPairTokens.push(p50Tokens[numeral % 256]);
}
assert.deepEqual(p46BoundaryPairTokens, ['0G', '2O', '0P', '21', '3g']);
const p46BoundaryLegalPageTokens = p46BoundaryPairTokens
  .filter((token) => /^\d{2}$/.test(token) && Number(token) <= 55);
assert.deepEqual(p46BoundaryLegalPageTokens, ['21']);

const p21Groups = pageGroups(21);
assert.equal(p21Groups.length, 55);
const p21Group21 = p21Groups[20];
const p21Values = p21Group21.sites.map((site) => site.value);
assert.deepEqual(p21Values, [13, 8, 15, 22]);
assert.ok(p21Group21.sites.every((site) => site.line === 6));
const p21Descriptor = descriptor(p21Group21.sites);
assert.deepEqual(
  [p21Descriptor.length, p21Descriptor.sum, p21Descriptor.product],
  [state.q, 0, state.b - state.K]
);
const p21H = H(p21Values);
assert.deepEqual(p21H, [state.p - state.e, state.p - 1, state.p, state.a]);

const p21RawMatch = (row) =>
  row.d.length === state.q && row.d.sum === 0 && row.d.product === state.b - state.K;
assert.deepEqual(
  selfIndexedGroups.filter(p21RawMatch).map(({ page, ordinal }) => [page, ordinal]),
  [[21, 21]]
);
assert.deepEqual(
  allLocalGroups.filter(p21RawMatch).map(({ page, ordinal }) => [page, ordinal]),
  [[10, 35], [21, 21]]
);
assert.deepEqual(
  allLocalGroups.filter((row) => row.h.join(',') === p21H.join(','))
    .map(({ page, ordinal }) => [page, ordinal]),
  [[21, 21]]
);

const p21PairTokens = [];
for (let index = 0; index < p21H.length; index += 2) {
  const numeral = p21H[index] * 29 + p21H[index + 1];
  p21PairTokens.push(p50Tokens[numeral % 256]);
}
assert.deepEqual(p21PairTokens, ['3I', '3b']);
assert.equal(p50Tokens[p21Group21.start], '2p');
assert.equal(
  [...p21PairTokens, p50Tokens[p21Group21.start]]
    .filter((token) => /^\d{2}$/.test(token) && Number(token) <= 55).length,
  0
);

const incomingPageDestinations = [...new Set(crossPage.map((w) => physical(w.at(-1).page)))]
  .filter((page) => page <= 55 && page !== 50);
const p48Line1 = lineFragments(48, 1);
const p48Line1Lengths = [state.q, state.K, state.e, state.e, state.q, state.K, state.q];
const p48Line1Sums = [
  mod29(-state.q),
  state.b + state.K,
  Ainv,
  mod29(-state.g),
  Ainv,
  mod29(-state.g),
  28,
];
const p48Line1Products = [
  state.b + state.K,
  state.A,
  1,
  28,
  state.b + state.K,
  0,
  state.e,
];
assert.deepEqual(p48Line1.map((f) => f.length), p48Line1Lengths);
assert.deepEqual(p48Line1.map((f) => f.sum), p48Line1Sums);
assert.deepEqual(p48Line1.map((f) => f.product), p48Line1Products);
assert.equal(p48Line1Lengths.reduce((a, b) => a + b, 0), state.p - 1);
assert.equal(p48Line1Sums.reduce((a, b) => a + b, 0) % 29, mod29(-state.g));

const p48LineClass = incomingPageDestinations
  .map((page) => ({ page, fragments: lineFragments(page, 1) }))
  .filter(({ fragments }) => fragments.length === 7 && !fragments.some((f) => f.continues));
assert.equal(p48LineClass.length, 2);
const p48LengthHits = p48LineClass.filter(({ fragments }) =>
  same(fragments.map((f) => f.length), p48Line1Lengths)
);
const p48LengthSumHits = p48LengthHits.filter(({ fragments }) =>
  same(fragments.map((f) => f.sum), p48Line1Sums)
);
const p48FullHits = p48LengthSumHits.filter(({ fragments }) =>
  same(fragments.map((f) => f.product), p48Line1Products)
);
for (const hits of [p48LengthHits, p48LengthSumHits, p48FullHits]) {
  assert.deepEqual(hits.map(({ page }) => page), [48]);
}

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
  p46BackwardReceiver: {
    boundaryPairs,
    page: 46,
    ordinal: 46,
    values: p46Values,
    raw: [p46Descriptor.length, p46Descriptor.sum, p46Descriptor.product],
    H: p46H,
    allLocalGroupCount: allLocalGroups.length,
    selfIndexedGroupCount: selfIndexedGroups.length,
    globalRawHits: allLocalGroups.filter(p46RawMatches).map(({ page, ordinal }) => [page, ordinal]),
  },
  p46ReceivingTail: {
    line10: {
      comparableLines: p46SevenCarryClass.length,
      lengths: p46Line10Lengths,
      fullHits: p46Line10FullHits.map(({ page, line }) => [page, line]),
    },
    line11: {
      comparableLines: p46SevenCarryClass.length,
      lengths: p46Line11Lengths,
      fullHits: p46Line11FullHits.map(({ page, line }) => [page, line]),
    },
    line12: {
      comparableLines: p46FinalClass.length,
      lengths: p46Line12Lengths,
      fullHits: p46Line12FullHits.map(({ page, line }) => [page, line]),
    },
    seamToP47: {
      H: p46BoundaryH,
      pairTokens: p46BoundaryPairTokens,
      legalPageTokens: p46BoundaryLegalPageTokens,
      p21: {
        ordinal: 21,
        values: p21Values,
        raw: [p21Descriptor.length, p21Descriptor.sum, p21Descriptor.product],
        H: p21H,
        pairTokens: p21PairTokens,
        startToken: p50Tokens[p21Group21.start],
      },
    },
  },
  p48ReceivingLine: {
    comparableIncomingPageLines: p48LineClass.length,
    lengths: p48Line1Lengths,
    sums: p48Line1Sums,
    products: p48Line1Products,
    lengthHits: p48LengthHits.map(({ page }) => page),
    fullHits: p48FullHits.map(({ page }) => page),
    totalRunes: p48Line1Lengths.reduce((a, b) => a + b, 0),
    totalGp0: p48Line1Sums.reduce((a, b) => a + b, 0) % 29,
  },
  successorControl: {
    completeWords: complete.length,
    completeSix: six.length,
    lenSumProductHits: successorHits.map((w) => [w.page, w.sites[0].offset]),
    endpointQualifiedHits: [[47, 212]],
  },
}, null, 2));
console.log('PASS lp2_p47_receiving_line_raw_dh_state_sft');
