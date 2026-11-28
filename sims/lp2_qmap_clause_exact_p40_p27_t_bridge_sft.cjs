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

/** @param {[number,number]} x @returns {[number,number]} */
function frobenius(x) { return [mod(x[0] + 3 * x[1]), mod(-x[1])]; }

const words = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word))
  .map((word) => word.toUpperCase());

assert.equal(words.length, 43);

// Clause boundaries are taken directly from the authenticated punctuation.
const clauses = [
  [0, 0, 'HELLO'],
  [1, 4, 'THE PATH LIES EMPTY'],
  [5, 8, 'EPIPHANY SEEKS THE DEVOTED'],
  [9, 13, 'LIBER PRIMUS IS THE WAY'],
  [14, 18, 'ITS WORDS ARE THE MAP'],
  [19, 23, 'THEIR MEANING IS THE ROAD'],
  [24, 29, 'AND THEIR NUMBERS ARE THE DIRECTION'],
  [30, 35, 'SEEK AND YOU WILL BE FOUND'],
  [36, 37, 'GOOD LUCK'],
  [38, 40, 'BEWARE FALSE PATHS'],
  [41, 42, 'VERIFY OPENPGP'],
];
for (const [start, end, text] of clauses) {
  assert.equal(words.slice(start, end + 1).join(' '), text);
}

const Q = evaluate([5, 5, 14, 9, 10, 4, 27, 17, 25]);
assert.deepEqual(Q, [17, 24]);
assert.deepEqual(pow(Q, 840), [1, 0]);
const QInv = pow(Q, 839);
assert.deepEqual(QInv, [22, 26]);
assert.deepEqual(mul(Q, QInv), [1, 0]);

const discreteLog = new Map();
let orbit = [1, 0];
for (let k = 0; k < 840; k += 1) {
  assert.ok(!discreteLog.has(orbit.join(',')));
  discreteLog.set(orbit.join(','), k);
  orbit = mul(orbit, Q);
}

const red = [];
for (const pageRecord of ink.pages) {
  for (const span of pageRecord.red_spans || []) {
    const residue = evaluate([...span.runes].map((rune) => runeIndex.get(rune)));
    if (residue[0] === 0 && residue[1] === 0) continue;
    const k = discreteLog.get(residue.join(','));
    assert.notEqual(k, undefined);
    red.push({
      page: pageRecord.page,
      start: span.start,
      length: span.length,
      residue,
      k,
      forward: [Math.floor(k / MOD), k % MOD],
      inverse: [Math.floor(((840 - k) % 840) / MOD), ((840 - k) % 840) % MOD],
    });
  }
}
assert.equal(red.length, 17);

/** @param {[number,number]} pair @returns {{start:number,end:number,text:string}|null} */
function exactClause(pair) {
  for (const [start, end, text] of clauses) {
    if (pair[0] === start && pair[1] === end) return {start, end, text};
  }
  return null;
}

const clauseHits = [];
for (const span of red) {
  const forward = exactClause(span.forward);
  const inverse = exactClause(span.inverse);
  if (forward) clauseHits.push({page: span.page, start: span.start, length: span.length, direction: 'Q', pair: span.forward, clause: forward.text});
  if (inverse) clauseHits.push({page: span.page, start: span.start, length: span.length, direction: 'Q^-1', pair: span.inverse, clause: inverse.text});
}

assert.deepEqual(clauseHits, [
  {
    page: 27, start: 0, length: 19, direction: 'Q^-1', pair: [19, 23],
    clause: 'THEIR MEANING IS THE ROAD',
  },
  {
    page: 40, start: 0, length: 8, direction: 'Q', pair: [5, 8],
    clause: 'EPIPHANY SEEKS THE DEVOTED',
  },
]);

const p40 = red.find((span) => span.page === 40 && span.start === 0);
const p27 = red.find((span) => span.page === 27 && span.start === 0);
assert.ok(p40 && p27);

/** @param {[number,number]} x @returns {[number,number]} */
const FQ = (x) => frobenius(mul(Q, x));
/** @param {[number,number]} x @returns {[number,number]} */
const QF = (x) => mul(Q, frobenius(x));
/** @param {[number,number]} x @returns {[number,number]} */
const FQInv = (x) => frobenius(mul(QInv, x));
/** @param {[number,number]} x @returns {[number,number]} */
const QInvF = (x) => mul(QInv, frobenius(x));

const operationFamily = [
  ['Q*x', (x) => mul(Q, x)],
  ['Q^-1*x', (x) => mul(QInv, x)],
  ['F(x)', frobenius],
  ['F(Q*x)', FQ],
  ['Q*F(x)', QF],
  ['F(Q^-1*x)', FQInv],
  ['Q^-1*F(x)', QInvF],
  ['Q^29*x', (x) => mul(pow(Q, 29), x)],
  ['Q^-29*x', (x) => mul(pow(Q, 840 - 29), x)],
];

const operationCharge = operationFamily.map(([name, fn]) => ({
  name,
  p40Output: fn(p40.residue),
  hitsP27: fn(p40.residue).join(',') === p27.residue.join(','),
}));

assert.deepEqual(operationCharge, [
  {name: 'Q*x', p40Output: [17, 10], hitsP27: false},
  {name: 'Q^-1*x', p40Output: [8, 16], hitsP27: false},
  {name: 'F(x)', p40Output: [23, 8], hitsP27: false},
  {name: 'F(Q*x)', p40Output: [18, 19], hitsP27: true},
  {name: 'Q*F(x)', p40Output: [13, 17], hitsP27: false},
  {name: 'F(Q^-1*x)', p40Output: [27, 13], hitsP27: false},
  {name: 'Q^-1*F(x)', p40Output: [24, 6], hitsP27: false},
  {name: 'Q^29*x', p40Output: [6, 12], hitsP27: false},
  {name: 'Q^-29*x', p40Output: [13, 23], hitsP27: false},
]);

// Independent solved-page adjudication from Director #3462: within the same
// low-description operation family, p56's typed [1,2] consequence selects Q*x,
// not the semilinear operation that links p40 to p27.
const p56 = red.find((span) => span.page === 56 && span.start === 0);
assert.ok(p56);
const p56Family = operationFamily.map(([name, fn]) => ({name, output: fn(p56.residue)}));
assert.deepEqual(p56Family.find((item) => item.name === 'Q*x').output, [1, 2]);
assert.equal(
  p56Family.filter((item) => item.output[0] === 1 && item.output[1] === 2).length,
  1,
);

// Reproduce the landing page's source-native endpoint values without naming
// them from the signed clause first.
const p27Ink = ink.pages.find((page) => page.page === 27);
assert.ok(p27Ink);
const p27Red = p27Ink.red_spans.find((span) => span.start === 0 && span.length === 19);
assert.ok(p27Red);
const p27Values = [...p27Red.runes].map((rune) => runeIndex.get(rune));
assert.equal(p27Values[0], 19); // giant initial M in GP0
assert.deepEqual(p27Ink.large_punctuation, [[19, 13, 'red']]);
const residual = 19 - 13;
const thirteenth = p27Values[12];
assert.equal(corpus.translit[thirteenth], 'I');
assert.equal(corpus.prime[thirteenth], 31);

const width = grid.rows[0].length;
assert.equal(width, 8);
const cell = corpus.prime[thirteenth] * width + residual;
assert.equal(cell, 254);
const tokens = grid.rows.flat();
assert.equal(tokens[cell], '39');
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
const value = (token, alphabet) => alphabet.length * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
const n59 = value(tokens[cell], alphabet59);
const n60 = value(tokens[cell], alphabet60);
assert.deepEqual([n59, n60], [186, 189]);
const A = Math.floor(cell / 29);
const p = (cell % 29) + 1;
assert.deepEqual([A, p], [8, 23]);
assert.equal(Math.floor(n59 / A), p);
assert.equal(Math.floor(n60 / A), p);

// The canonical T successor already published for p27 is retained as a
// navigation frontier, not interpreted as body plaintext here.
const next = FQ(p27.residue);
assert.deepEqual(next, [28, 23]);

const result = {
  status: 'PASS',
  classification: 'exact signed-clause endpoint lock plus conditional semilinear bridge; broader solved-page control selects plain Q*x; no unknown plaintext',
  nonzeroPrintedRedSpans: red.length,
  coordinatePresentations: red.length * 2,
  exactClauseHits: clauseHits,
  operationFamilyCharge: operationCharge,
  solvedP56OperationCharge: p56Family,
  p27SourceNative: {
    firstRuneGP0: p27Values[0],
    redLength: p27Red.length,
    redDots: 13,
    selectedCell: cell,
    cellToken: tokens[cell],
    derivedModulus: p,
  },
  canonicalTSuccessorOfP27: next,
  boundary: 'The clause census is exact. F(Q*x) uniquely links the two clause-exact red states inside the charged family, but independent solved-p56 evidence selects plain Q*x instead. Treat the semilinear bridge as conditional/post-discovery structure until an original clue independently selects it.'
};

const json = JSON.stringify(result, null, 2);
console.log(json);
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), json);
}
