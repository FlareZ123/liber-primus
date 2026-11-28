'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const MOD = 29;
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {[number, number]} x @param {[number, number]} y @returns {[number, number]} */
function mul(x, y) {
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1]),
  ];
}

/** @param {[number, number]} x @param {number} n @returns {[number, number]} */
function pow(x, n) {
  /** @type {[number, number]} */
  let acc = [1, 0];
  let base = x;
  let exponent = n;
  while (exponent > 0) {
    if (exponent & 1) acc = mul(acc, base);
    base = mul(base, base);
    exponent = Math.floor(exponent / 2);
  }
  return acc;
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

const words = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word))
  .map((word) => word.toUpperCase());

assert.equal(words.length, 43);
assert.deepEqual(words.slice(29, 32), ['DIRECTION', 'SEEK', 'AND']);

// Frozen upstream from the source p3 / p15-second / solved-p57 quotient route.
const QCoefficients = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const Q = evaluate(QCoefficients);
assert.deepEqual(Q, [17, 24]);

const discreteLog = new Map();
let state = [1, 0];
for (let k = 0; k < 840; k += 1) {
  assert.ok(!discreteLog.has(state.join(',')));
  discreteLog.set(state.join(','), k);
  state = mul(state, Q);
}
assert.deepEqual(state, [1, 0]);
assert.equal(discreteLog.size, 840);
assert.deepEqual(pow(Q, 29), [2, 5]); // DIRECTION -> [K,g]
assert.deepEqual(pow(Q, 30), [8, 0]); // SEEK -> A

const red = [];
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const values = [...span.runes].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    });
    const residue = evaluate(values);
    if (residue[0] === 0 && residue[1] === 0) continue;
    const k = discreteLog.get(residue.join(','));
    assert.notEqual(k, undefined);
    red.push({
      page: pageRecord.page,
      start: span.start,
      length: span.length,
      residue,
      k,
      coordinate: [Math.floor(k / MOD), k % MOD],
    });
  }
}
assert.equal(red.length, 17);

/** @param {number} step */
function directedEdgesAt(step) {
  const hits = [];
  for (const from of red) {
    for (const to of red) {
      if (from === to) continue;
      if ((to.k - from.k + 840) % 840 === step) hits.push({from, to});
    }
  }
  return hits;
}

const directionEdges = directedEdgesAt(29);
const seekEdges = directedEdgesAt(30);
const andEdges = directedEdgesAt(31);
assert.deepEqual(directionEdges, []);
assert.equal(seekEdges.length, 1);
assert.deepEqual(
  [
    seekEdges[0].from.page,
    seekEdges[0].from.start,
    seekEdges[0].from.length,
    seekEdges[0].from.k,
    seekEdges[0].to.page,
    seekEdges[0].to.start,
    seekEdges[0].to.length,
    seekEdges[0].to.k,
  ],
  [15, 0, 9, 236, 27, 0, 19, 266],
);

// Keep the adjacent-word control visible rather than hiding it.
assert.deepEqual(
  andEdges.map(({from, to}) => [from.page, from.start, to.page, to.start]),
  [[53, 128, 56, 0]],
);

const p15First = seekEdges[0].from;
const p27 = seekEdges[0].to;
assert.deepEqual(p15First.coordinate, [8, 4]);
assert.deepEqual(p27.coordinate, [9, 5]);
assert.deepEqual(mul(p15First.residue, pow(Q, 30)), p27.residue);
assert.equal(p27.length, 19);

// Reproduce the independently established p27 source receiver from the original
// red heading, its adjacent red 13-dot mark, and the source table geometry.
const p27Ink = ink.pages.find((page) => page.page === 27);
assert.ok(p27Ink);
assert.deepEqual(p27Ink.large_punctuation, [[19, 13, 'red']]);
const p27Span = p27Ink.red_spans.find((span) => span.start === 0 && span.length === 19);
assert.ok(p27Span);
const p27Values = [...p27Span.runes].map((rune) => runeIndex.get(rune));
const dotCount = 13;
const residual = p27Span.length - dotCount;
const selectedRuneIndex = p27Values[dotCount - 1];
const selectedRunePrime = corpus.prime[selectedRuneIndex];
assert.deepEqual(
  {residual, selectedRuneIndex, selectedRune: corpus.translit[selectedRuneIndex], selectedRunePrime},
  {residual: 6, selectedRuneIndex: 10, selectedRune: 'I', selectedRunePrime: 31},
);

const tableWidth = grid.rows[0].length;
assert.equal(tableWidth, 8);
assert.ok(grid.rows.every((row) => row.length === tableWidth));
const selectedCell = selectedRunePrime * tableWidth + residual;
assert.equal(selectedCell, 254);

const tokens = grid.rows.flat();
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(tokens[selectedCell], '39');

/** @param {string} token @param {string} alphabet @returns {number} */
function tokenValue(token, alphabet) {
  const radix = alphabet.length;
  return radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
}

const n59 = tokenValue(tokens[selectedCell], alphabet59);
const n60 = tokenValue(tokens[selectedCell], alphabet60);
assert.deepEqual([n59, n60], [186, 189]);

// Blindly reconstruct the one-cell DH register, matching the established
// p27/cell254 route without seeding it with the historical tuple.
const A = Math.floor(selectedCell / 29);
const p = (selectedCell % 29) + 1;
assert.equal(A, tableWidth);
assert.equal(Math.floor(n59 / A), p);
assert.equal(Math.floor(n60 / A), p);
const K = n59 % A;
const g = n60 % A;
const a = Math.floor(n59 / 29);
assert.equal(Math.floor(n60 / 29), a);
const b = n60 % 29;
const aK = n59 % 29;
assert.equal(mod(a * K), aK);
const B = tokenValue(tokens[n59], alphabet59);

const dh = {p, g, a, b, A, B, K};
assert.deepEqual(dh, {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2});

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let acc = 1;
  let x = base % modulus;
  let n = exponent;
  while (n > 0) {
    if (n & 1) acc = (acc * x) % modulus;
    x = (x * x) % modulus;
    n = Math.floor(n / 2);
  }
  return acc;
}
assert.equal(modPow(g, a, p), A);
assert.equal(modPow(g, b, p), B);
assert.equal(modPow(B, a, p), K);

const sourceStepCensus = [];
for (let step = 0; step < words.length; step += 1) {
  const edges = directedEdgesAt(step);
  if (edges.length) {
    sourceStepCensus.push({
      step,
      word: words[step],
      edges: edges.map(({from, to}) => [from.page, from.start, to.page, to.start]),
    });
  }
}

const result = {
  status: 'PASS',
  classification:
    'source-numbered SEEK opcode gives unique Q red transition p15-first -> p27; p27 original geometry then reconstructs complete DH register; no body plaintext',
  Q,
  sourceWords: {29: words[29], 30: words[30], 31: words[31]},
  qPowers: {29: pow(Q, 29), 30: pow(Q, 30)},
  seekTransition: {
    from: {page: p15First.page, span: [p15First.start, p15First.length], k: p15First.k, coordinate: p15First.coordinate},
    step: 30,
    word: words[30],
    to: {page: p27.page, span: [p27.start, p27.length], k: p27.k, coordinate: p27.coordinate},
    uniqueAmongPrintedNonzeroRedSpans: true,
  },
  immediateControls: {
    direction29Edges: directionEdges.length,
    seek30Edges: seekEdges.length,
    and31Edges: andEdges.map(({from, to}) => [from.page, from.start, to.page, to.start]),
    allSignedWordStepHits: sourceStepCensus,
  },
  p27Receiver: {
    redLength: p27Span.length,
    redDots: dotCount,
    residual,
    selected13thRune: corpus.translit[selectedRuneIndex],
    selectedRunePrime,
    tableWidth,
    selectedCell,
    token: tokens[selectedCell],
    base59: n59,
    base60: n60,
    derivedDh: dh,
  },
  boundary:
    'Q and the base29 signed-word register are upstream discoveries. The new evidence is the exact SEEK=30 transition into an independently pre-existing p27 DH receiver. It does not prove that every signed word number is a Q step and does not authorize a new body cipher.',
};

const json = JSON.stringify(result, null, 2);
console.log(json);
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), json);
}
