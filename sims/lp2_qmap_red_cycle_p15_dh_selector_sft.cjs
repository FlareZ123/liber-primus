'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const MOD = 29;
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {[number, number]} left @param {[number, number]} right @returns {[number, number]} */
function mul(left, right) {
  const [a, b] = left;
  const [c, d] = right;
  return [
    mod(a * c + 8 * b * d),
    mod(a * d + b * c + 3 * b * d),
  ];
}

/** @param {number[]} coefficients @returns {[number, number]} */
function evaluate(coefficients) {
  /** @type {[number, number]} */
  let acc = [0, 0];
  /** @type {[number, number]} */
  let power = [1, 0];

  for (const coefficient of coefficients) {
    acc = [
      mod(acc[0] + coefficient * power[0]),
      mod(acc[1] + coefficient * power[1]),
    ];
    power = mul(power, [0, 1]);
  }
  return acc;
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const pageRecord = ink.pages.find((item) => item.page === page);
  assert.ok(pageRecord, `missing p${page}`);
  const span = (pageRecord.red_spans || []).find(
    (item) => item.start === start && item.length === length,
  );
  assert.ok(span, `missing p${page} red span ${start}+${length}`);
  return [...span.runes].map((rune) => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  });
}

const words = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word))
  .map((word) => word.toUpperCase());

assert.equal(words.length, 43);
assert.equal(words[29], 'DIRECTION');
assert.deepEqual(words.slice(4, 9), ['EMPTY', 'EPIPHANY', 'SEEKS', 'THE', 'DEVOTED']);

const Q = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const EQ = evaluate(Q);
assert.deepEqual(EQ, [17, 24]);

const discreteLog = new Map();
let state = [1, 0];
for (let exponent = 0; exponent < MOD * MOD - 1; exponent += 1) {
  assert.ok(!discreteLog.has(state.join(',')));
  discreteLog.set(state.join(','), exponent);
  state = mul(state, EQ);
}
assert.deepEqual(state, [1, 0]);
assert.equal(discreteLog.size, 840);

/** @param {number[]} coefficients @returns {[number, number] | null} */
function coordinate(coefficients) {
  const residue = evaluate(coefficients);
  const exponent = discreteLog.get(residue.join(','));
  if (exponent === undefined) return null;
  return [Math.floor(exponent / MOD), exponent % MOD];
}

const printed = [];
const zeroSpans = [];
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const source = [...span.runes].map((rune) => runeIndex.get(rune));
    const pair = coordinate(source);
    const item = {
      page: pageRecord.page,
      start: span.start,
      length: span.length,
      pair,
    };
    if (pair === null) zeroSpans.push(item);
    else printed.push(item);
  }
}

assert.equal(printed.length, 17);
assert.deepEqual(
  zeroSpans.map((item) => [item.page, item.start, item.length]),
  [[3, 119, 3]],
);

const byIdentity = (page, start, length) => {
  const item = printed.find(
    (candidate) =>
      candidate.page === page &&
      candidate.start === start &&
      candidate.length === length,
  );
  assert.ok(item);
  return item;
};

const p56 = byIdentity(56, 0, 5);
const p40 = byIdentity(40, 0, 8);
const p15First = byIdentity(15, 0, 9);

assert.deepEqual(p56.pair, [4, 5]);
assert.deepEqual(p40.pair, [5, 8]);
assert.deepEqual(p15First.pair, [8, 4]);

assert.deepEqual(
  [p56.pair[0], p56.pair[1], p40.pair[1]],
  [4, 5, 8],
);
assert.deepEqual(
  [words[4], words[5], words[8]],
  ['EMPTY', 'EPIPHANY', 'DEVOTED'],
);

/** @param {{page:number,start:number,length:number,pair:[number,number]}[]} edges */
function directedThreeCycles(edges) {
  const unique = new Map();
  for (let i = 0; i < edges.length; i += 1) {
    for (let j = 0; j < edges.length; j += 1) {
      for (let k = 0; k < edges.length; k += 1) {
        if (i === j || i === k || j === k) continue;
        const first = edges[i];
        const second = edges[j];
        const third = edges[k];
        if (
          first.pair[1] !== second.pair[0] ||
          second.pair[1] !== third.pair[0] ||
          third.pair[1] !== first.pair[0]
        ) {
          continue;
        }
        const signature = [i, j, k].sort((a, b) => a - b).join(',');
        if (!unique.has(signature)) {
          unique.set(signature, [first, second, third]);
        }
      }
    }
  }
  return [...unique.values()];
}

const cycles = directedThreeCycles(printed);
assert.equal(cycles.length, 1);
assert.deepEqual(
  new Set(cycles[0].map((item) => `${item.page}:${item.start}:${item.length}`)),
  new Set(['15:0:9', '40:0:8', '56:0:5']),
);

const printedClosureHits = printed.filter(
  (item) => item.pair[0] === 8 && item.pair[1] === 4,
);
assert.deepEqual(
  printedClosureHits.map((item) => [item.page, item.start, item.length]),
  [[15, 0, 9]],
);

// Charge all cyclic starts and both orientations of every printed complete red span.
let presentationCount = 0;
const closurePresentationHits = [];
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const source = [...span.runes].map((rune) => runeIndex.get(rune));
    for (const reversed of [false, true]) {
      const oriented = reversed ? source.slice().reverse() : source;
      for (let rotation = 0; rotation < oriented.length; rotation += 1) {
        presentationCount += 1;
        const candidate = oriented
          .slice(rotation)
          .concat(oriented.slice(0, rotation));
        const pair = coordinate(candidate);
        if (pair && pair[0] === 8 && pair[1] === 4) {
          closurePresentationHits.push({
            page: pageRecord.page,
            start: span.start,
            length: span.length,
            reversed,
            rotation,
          });
        }
      }
    }
  }
}

assert.equal(presentationCount, 450);
assert.deepEqual(closurePresentationHits, [
  {page: 15, start: 0, length: 9, reversed: false, rotation: 0},
  {page: 15, start: 9, length: 11, reversed: true, rotation: 5},
]);

// The cycle criterion is frozen before this downstream action. Apply the already
// established Q multiplication to the uniquely selected printed closure span.
const p15FirstValues = redSpan(15, 0, 9);
const p15FirstResidue = evaluate(p15FirstValues);
assert.deepEqual(p15FirstResidue, [24, 6]);
const selectedOutput = mul(EQ, p15FirstResidue);
assert.deepEqual(selectedOutput, [23, 8]);
assert.equal(selectedOutput.map((value) => corpus.translit[value]).join(''), 'DH');

console.log(JSON.stringify({
  status: 'PASS',
  classification: 'Q-orbit red-cycle selector for p15 first red; downstream DH consequence; no body plaintext',
  Q,
  E_Q: EQ,
  signedCycle: {
    vertices: [4, 5, 8],
    words: [words[4], words[5], words[8]],
    edges: {
      p56: p56.pair,
      p40: p40.pair,
      p15First: p15First.pair,
    },
  },
  completeRedSpans: printed.length + zeroSpans.length,
  nonzeroPrintedSpans: printed.length,
  nontrivialDirectedThreeCycles: cycles.length,
  printedClosureHits: printedClosureHits.map((item) => [item.page, item.start, item.length]),
  cyclicReversePresentations: presentationCount,
  closurePresentationHits,
  selectedP15First: {
    residue: p15FirstResidue,
    qProduct: selectedOutput,
    canonicalGP: selectedOutput.map((value) => corpus.translit[value]).join(''),
    numbersAsDirectionPages: selectedOutput,
  },
  boundary:
    'Q itself depends upstream on p15-second/p57. The new result selects which other printed p15 red span closes the source-word cycle; it does not independently authenticate Q or decrypt body text.',
}, null, 2));
