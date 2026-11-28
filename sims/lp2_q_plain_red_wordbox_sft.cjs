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

/** @param {number} x @returns {number} */
function mod(x) { return ((x % MOD) + MOD) % MOD; }

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul(x, y) {
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1]),
  ];
}

/** @param {[number,number]} x @param {number} n @returns {[number,number]} */
function pow(x, n) {
  /** @type {[number,number]} */ let acc = [1, 0];
  let base = x;
  let exponent = n;
  while (exponent > 0) {
    if (exponent & 1) acc = mul(acc, base);
    base = mul(base, base);
    exponent = Math.floor(exponent / 2);
  }
  return acc;
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  /** @type {[number,number]} */ let acc = [0, 0];
  /** @type {[number,number]} */ let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [
      mod(acc[0] + coefficient * power[0]),
      mod(acc[1] + coefficient * power[1]),
    ];
    power = mul(power, [0, 1]);
  }
  return acc;
}

const words = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word))
  .map((word) => word.toUpperCase());

assert.equal(words.length, 43);
assert.equal(words[23], 'ROAD');
assert.equal(words[24], 'AND');
assert.equal(words[29], 'DIRECTION');
assert.ok(
  signed.includes('meaning is the road, and their numbers are the direction.'),
  'authenticated comma boundary missing',
);

const ROAD = 23;
const Q = evaluate([5, 5, 14, 9, 10, 4, 27, 17, 25]);
assert.deepEqual(Q, [17, 24]);
assert.deepEqual(pow(Q, 840), [1, 0]);

const spans = [];
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const values = [...span.runes].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    });
    spans.push({
      page: pageRecord.page,
      start: span.start,
      length: span.length,
      residue: evaluate(values),
    });
  }
}
assert.equal(spans.length, 18);

const zero = spans.filter((span) => span.residue[0] === 0 && span.residue[1] === 0);
assert.deepEqual(zero.map((span) => [span.page, span.start, span.length]), [[3, 119, 3]]);
const nonzero = spans.filter((span) => span.residue[0] !== 0 || span.residue[1] !== 0);
assert.equal(nonzero.length, 17);

const p56 = spans.find((span) => span.page === 56 && span.start === 0 && span.length === 5);
assert.ok(p56);
assert.deepEqual(mul(Q, p56.residue), [1, 2]);
assert.equal(words[1], 'THE');
assert.equal(words[2], 'PATH');

const qOutputs = spans.map((span) => ({
  page: span.page,
  start: span.start,
  length: span.length,
  output: mul(Q, span.residue),
}));

assert.ok(qOutputs.every(({output}) => output[0] <= ROAD && output[1] <= ROAD));
assert.equal(Math.max(...qOutputs.flatMap(({output}) => output)), ROAD);
assert.deepEqual(
  qOutputs.find((item) => item.page === 15 && item.start === 0).output,
  [23, 8],
);

// Q is primitive, so Q^s enumerates every nonzero scalar multiplier exactly once.
const fullBoxQualifiers = [];
for (let s = 0; s < 840; s += 1) {
  const scalar = pow(Q, s);
  const outputs = nonzero.map((span) => mul(scalar, span.residue));
  if (outputs.every((output) => output[0] <= ROAD && output[1] <= ROAD)) {
    fullBoxQualifiers.push({
      exponent: s,
      scalar,
      p56Output: mul(scalar, p56.residue),
      maximum: Math.max(...outputs.flat()),
    });
  }
}

assert.deepEqual(fullBoxQualifiers, [
  {exponent: 1, scalar: [17, 24], p56Output: [1, 2], maximum: 23},
  {exponent: 527, scalar: [0, 7], p56Output: [12, 11], maximum: 22},
  {exponent: 640, scalar: [4, 28], p56Output: [2, 20], maximum: 23},
  {exponent: 809, scalar: [10, 25], p56Output: [19, 0], maximum: 23},
]);

// Hold p56 completely out of the box screen. Collapse duplicate red residues so
// p15-second/p57 do not double-weight the charge.
const unique = [];
for (const span of nonzero) {
  const key = span.residue.join(',');
  if (!unique.some((item) => item.residue.join(',') === key)) unique.push(span);
}
assert.equal(unique.length, 16);

const heldOut = unique.filter((span) => span !== p56 && !(span.page === 56 && span.start === 0));
assert.equal(heldOut.length, 15);

const heldOutQualifiers = [];
for (let s = 0; s < 840; s += 1) {
  const scalar = pow(Q, s);
  if (heldOut.every((span) => {
    const output = mul(scalar, span.residue);
    return output[0] <= ROAD && output[1] <= ROAD;
  })) {
    heldOutQualifiers.push({
      exponent: s,
      scalar,
      p56Output: mul(scalar, p56.residue),
    });
  }
}

assert.deepEqual(heldOutQualifiers, [
  {exponent: 1, scalar: [17, 24], p56Output: [1, 2]},
  {exponent: 527, scalar: [0, 7], p56Output: [12, 11]},
  {exponent: 553, scalar: [26, 1], p56Output: [24, 3]},
  {exponent: 640, scalar: [4, 28], p56Output: [2, 20]},
  {exponent: 809, scalar: [10, 25], p56Output: [19, 0]},
]);

assert.deepEqual(
  heldOutQualifiers.filter(({p56Output}) => p56Output[0] === 1 && p56Output[1] === 2),
  [{exponent: 1, scalar: [17, 24], p56Output: [1, 2]}],
);

const result = {
  status: 'PASS',
  classification:
    'solved-p56-selected plain Q maps every complete red span into authenticated HELLO..ROAD word-index box; finite all-scalar charge; no plaintext',
  signedBoundary: {
    lastInsideIndex: ROAD,
    lastInsideWord: words[ROAD],
    firstOutsideIndex: ROAD + 1,
    firstOutsideWord: words[ROAD + 1],
    directionIndex: 29,
    directionWord: words[29],
  },
  completeRedSpans: spans.length,
  nonzeroRedSpans: nonzero.length,
  distinctNonzeroRedStates: unique.length,
  qOutputs,
  fullBoxQualifiers,
  p56HeldOut: {
    otherDistinctStates: heldOut.length,
    boxQualifiers: heldOutQualifiers,
    solvedP56Target: [1, 2],
    uniqueSelectedExponent: 1,
  },
  boundary:
    'ROAD=23 is source-selected by authenticated punctuation, not optimized from the multiplier scan. The 4/840 and 5/840 counts are finite specificity diagnostics, not authorship probabilities. This constrains Q as a word-map/state operator and does not decrypt black body text.',
};

const json = JSON.stringify(result, null, 2);
console.log(json);
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), json);
}
