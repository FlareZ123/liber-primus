#!/usr/bin/env node
'use strict';

// Source-only reproduction of the p57 Parable / p53-p54 terminal-red
// exponent selector. This validates an exact source-to-field/table relation;
// it does NOT decrypt LP2 or authenticate a cipher.

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('lp2-corpus.json');
const ink = read('lp2-ink-annotations.json');
const grid = read('lp2-grid-256.json');
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const mod = n => ((n % 29) + 29) % 29;
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
const add = (a, b) => [mod(a[0] + b[0]), mod(a[1] + b[1])];
const mul = (a, b) => [
  mod(a[0] * b[0] + 8 * a[1] * b[1]),
  mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])
];
const pow = (x, n) => {
  let a = [1, 0], b = x;
  while (n > 0) {
    if (n % 2) a = mul(a, b);
    b = mul(b, b);
    n = Math.floor(n / 2);
  }
  return a;
};
const order = (x, limit) => {
  let y = [1, 0];
  for (let n = 1; n <= limit; n++) {
    y = mul(y, x);
    if (eq(y, [1, 0])) return n;
  }
  return null;
};
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const indices = s => Array.from(s, r => {
  if (!runeIndex.has(r)) throw new Error('Unknown rune: ' + r);
  return runeIndex.get(r);
});
const sum = xs => xs.reduce((a, b) => a + b, 0);
const page = n => {
  const p = ink.pages.find(x => x.page === n);
  if (!p) throw new Error('Missing ink page ' + n);
  return p;
};

// Recover the four punctuation-delimited p57 strings directly from the
// canonical transcription; hyphens and line-break slashes are not runes.
const start = transcription.lastIndexOf('%') + 1;
const end = transcription.lastIndexOf('§');
if (start <= 0 || end <= start) throw new Error('Cannot isolate final p57 transcription block');
const p57Strings = transcription.slice(start, end).split('.').map(s =>
  Array.from(s).filter(r => runeIndex.has(r)).map(r => corpus.translit[runeIndex.get(r)]).join('')
).filter(Boolean);
const p57Page = corpus.pages.find(x => x.page === 57);
const p57Lengths = p57Strings.map(s => s.length);
if (p57Strings.join('') !== p57Page.indices.map(i => corpus.translit[i]).join('')) {
  throw new Error('p57 transcription and corpus rune stream disagree');
}
if (JSON.stringify(p57Lengths) !== JSON.stringify([7, 30, 30, 28])) {
  throw new Error('Unexpected p57 heading/clause lengths: ' + JSON.stringify(p57Lengths));
}

// The only consecutive-page red-span pair with total length 60.
const adjacent60 = [];
for (const left of ink.pages) {
  const right = ink.pages.find(x => x.page === left.page + 1);
  if (!right) continue;
  for (const a of left.red_spans || []) for (const b of right.red_spans || []) {
    if (a.length + b.length === 60) adjacent60.push({
      pages: [left.page, right.page], lengths: [a.length, b.length]
    });
  }
}
if (JSON.stringify(adjacent60) !== JSON.stringify([{ pages: [53, 54], lengths: [51, 9] }])) {
  throw new Error('Adjacent 60-rune red-span pair changed: ' + JSON.stringify(adjacent60));
}
const p53 = page(53).red_spans.find(x => x.length === 51);
const p54 = page(54).red_spans.find(x => x.length === 9);
const p53Indices = indices(p53.runes);
const p54Indices = indices(p54.runes);
const red60 = p53Indices.concat(p54Indices);
if (red60.length !== 60) throw new Error('Expected 60 terminal red runes');
const blockA = red60.slice(0, 30);
const blockB = red60.slice(30);
const blockSums = [sum(blockA), sum(blockB)];
if (JSON.stringify(blockSums) !== JSON.stringify([433, 360])) {
  throw new Error('Unexpected 30/30 GP-index sums: ' + JSON.stringify(blockSums));
}
const totalSum = sum(red60);

// p3's [13,23,2] defines 2u^2+23u+13=0, i.e. u^2=3u+8.
const p3Triple = indices(page(3).red_spans.find(x => x.length === 3).runes);
const p39Triple = indices(page(39).red_spans.find(x => x.length === 3).runes);
if (JSON.stringify(p3Triple) !== JSON.stringify([13, 23, 2]) ||
    JSON.stringify(p39Triple) !== JSON.stringify([27, 5, 15])) {
  throw new Error('Marked p3/p39 triples changed');
}
const u = [0, 1];
if (!eq(pow(u, 840), [1, 0]) ||
    [2, 3, 5, 7].some(p => eq(pow(u, 840 / p), [1, 0]))) {
  throw new Error('p3 field generator is not primitive of order 840');
}
const roots = [
  { exponent: blockSums[0], element: pow(u, blockSums[0]) },
  { exponent: blockSums[1], element: pow(u, blockSums[1]) },
  { exponent: 797, element: pow(u, 797) }
];

// The current base60 grid transcription is a 256-coefficient descending
// polynomial over F29. The first coefficient is formally zero.
const P = grid.bytes.map(b => mod(b));
const evalP = z => P.reduce((acc, coefficient) =>
  add(mul(acc, z), [coefficient, 0]), [0, 0]);
for (const r of roots) r.P = evalP(r.element);
if (!eq(roots[0].element, [23, 27]) ||
    !eq(roots[1].element, [24, 0]) ||
    !eq(roots[2].element, [17, 2]) ||
    roots.some(r => !eq(r.P, [0, 0]))) {
  throw new Error('A selected exponent is not a root of the original table polynomial');
}

// The selected roots give the exact quartic divisor
// (X-24)^2 (X^2+18X+11) = X^4+28X^3+13X^2+9X+14.
const F4 = [1, 28, 13, 9, 14];
const quotient = Array(P.length - F4.length + 1).fill(0);
const remainder = P.slice();
for (let i = 0; i < quotient.length; i++) {
  const v = remainder[i];
  quotient[i] = v;
  for (let j = 0; j < F4.length; j++) {
    remainder[i + j] = mod(remainder[i + j] - v * F4[j]);
  }
}
const tail = remainder.slice(quotient.length);
if (tail.some(x => x !== 0) || quotient.length !== 252 || quotient[0] !== 0) {
  throw new Error('Quartic division did not produce the expected 252-slot quotient');
}
const u30 = pow(u, 30);
if (!eq(u30, [21, 0]) || order(u30, 28) !== 28) {
  throw new Error('u^30 is not the expected order-28 element 21');

// Conditional exchangeability diagnostic: randomize the order of the 51 p53
// red indices, keeping the 9 p54 title fixed. Count 30-subsets with sum 433.
// This is not a discovery-wide p-value; the operation and source pair were
// identified during exploration.
}
const target = 433, chooseK = 30;
const dp = Array.from({ length: chooseK + 1 }, () => Array(target + 1).fill(0n));
dp[0][0] = 1n;
for (const x of p53Indices) {
  for (let k = chooseK - 1; k >= 0; k--) {
    for (let s = target - x; s >= 0; s--) {
      if (dp[k][s] !== 0n) dp[k + 1][s + x] += dp[k][s];
    }
  }
}
const choose = (n, k) => {
  let v = 1n;
  for (let i = 1; i <= k; i++) v = v * BigInt(n - k + i) / BigInt(i);
  return v;
};
const nullCount = dp[chooseK][target];
const nullTotal = choose(51, 30);
const nullProbability = Number(nullCount) / Number(nullTotal);
const pageCount = corpus.pages.length;
const output = {
  p57: { strings: p57Strings, heading_and_clause_lengths: p57Lengths },
  terminal_red: {
    adjacent_60_pair: adjacent60[0],
    gp_index_sums_30_30: blockSums,
    total_gp_index_sum: totalSum,
    total_divided_by_lp2_page_count: {
      page_count: pageCount,
      quotient: Math.floor(totalSum / pageCount),
      remainder: totalSum % pageCount
    },
    total_mod_29: totalSum % 29
  },
  field: {
    defining_p3_triple: p3Triple,
    polynomial: '2u^2+23u+13=0',
    normalized_modulus: 'u^2-3u-8=0',
    generator_order: order(u, 840),
    u_to_30: u30,
    u30_order: order(u30, 28),
    roots
  },
  table: {
    polynomial_coefficients_descending_mod29: P.length,
    quartic_factor_descending: F4,
    quotient_fixed_slots: quotient.length,
    quotient_canonical_coefficients: quotient.length - 1,
    quotient_shape_candidate: [9, 28],
    remainder: tail
  },
  conditional_null: {
    model: 'uniform random ordering of the 51 p53 red indices; fixed 30-rune prefix',
    matching_30_subsets: String(nullCount),
    all_30_subsets: String(nullTotal),
    probability: nullProbability,
    warning: 'Conditional exchangeability diagnostic only; not a discovery-wide p-value.'
  },
  conclusion: 'Exact source-to-field/table root selection under the current base60 table transcription; no LP2 plaintext, cipher key, or decryption is established.'
};
console.log(JSON.stringify(output, null, 2));
