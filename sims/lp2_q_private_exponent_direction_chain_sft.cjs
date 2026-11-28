'use strict';

/**
 * Source-only finite charge for the plain-Q private-exponent page route:
 * p27 -> p6 -> p15-first -> {p23,p8}.
 *
 * This is a post-discovery structural/navigation test. It does not decrypt
 * unknown body text and does not treat red-page membership alone as evidence.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');

const MOD = 29;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const words = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/\b[A-Za-z]+\b/g)
  .filter((word) => !['BEGIN', 'PGP', 'SIGNED', 'MESSAGE', 'Hash', 'SHA'].includes(word))
  .map((word) => word.toUpperCase());
assert.equal(words.length, 43);

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

/** @param {number} page @param {number} start */
function getSpan(page, start) {
  const pageRecord = ink.pages.find((item) => item.page === page);
  assert(pageRecord, 'missing ink page ' + page);
  const span = (pageRecord.red_spans || []).find((item) => item.start === start);
  assert(span, 'missing red span p' + page + ':' + start);
  return span;
}

/** @param {{runes:string}} span @returns {[number,number]} */
function residue(span) {
  return evaluate([...span.runes].map((rune) => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  }));
}

/** @param {[number,number]} output @param {Set<number>} redPages @returns {number[]} */
function redLandings(output, redPages) {
  return output.filter((value) => redPages.has(value));
}

/** @param {[number,number]} output @returns {[number,number]} */
function interval(output) { return [Math.min(...output), Math.max(...output)]; }

/** @param {[number,number]} a @param {[number,number]} b @returns {number} */
function overlapSize(a, b) {
  return Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0]) + 1);
}

const Q = evaluate([5, 5, 14, 9, 10, 4, 27, 17, 25]);
assert.deepEqual(Q, [17, 24]);
assert.deepEqual(pow(Q, 840), [1, 0]);

const p27 = getSpan(27, 0);
const p6 = getSpan(6, 71);
const p15First = getSpan(15, 0);
assert.equal(p27.length, 19);
assert.equal(p6.length, 11);
assert.equal(p15First.length, 9);

// Independently established by the p27/cell254 historical-BASE29 route.
const DH = Object.freeze({p: 23, a: 6, b: 15, A: 8});

const redPages = new Set(
  ink.pages
    .filter((page) => page.page < MOD && (page.red_spans || []).length > 0)
    .map((page) => page.page),
);
assert.deepEqual([...redPages].sort((a, b) => a - b), [0, 3, 6, 7, 8, 15, 23]);

const q27 = mul(Q, residue(p27));
const q6 = mul(Q, residue(p6));
const q15 = mul(Q, residue(p15First));
assert.deepEqual(q27, [10, DH.a]);
assert.deepEqual(q6, [1, DH.b]);
assert.deepEqual(q15, [DH.p, DH.A]);
assert.deepEqual(q27.map((value) => words[value]), ['PRIMUS', 'SEEKS']);
assert.deepEqual(q6.map((value) => words[value]), ['THE', 'WORDS']);
assert.deepEqual(q15.map((value) => words[value]), ['ROAD', 'DEVOTED']);
assert.deepEqual(redLandings(q27, redPages), [DH.a]);
assert.deepEqual(redLandings(q6, redPages), [DH.b]);
assert.deepEqual(redLandings(q15, redPages), [DH.p, DH.A]);

// Q is primitive, so Q^s enumerates all 840 nonzero field multipliers.
const privateRouteQualifiers = [];
for (let exponent = 0; exponent < 840; exponent += 1) {
  const scalar = pow(Q, exponent);
  const out27 = mul(scalar, residue(p27));
  const out6 = mul(scalar, residue(p6));
  const landing27 = redLandings(out27, redPages);
  const landing6 = redLandings(out6, redPages);
  if (landing27.length === 1 && landing27[0] === DH.a &&
      landing6.length === 1 && landing6[0] === DH.b) {
    const out15 = mul(scalar, residue(p15First));
    privateRouteQualifiers.push({
      exponent,
      scalar,
      out27,
      out6,
      out15,
      terminalRedLandings: redLandings(out15, redPages),
    });
  }
}
assert.deepEqual(privateRouteQualifiers.map((item) => item.exponent), [1, 257, 378, 825]);

// Do not fit p or A here. The final discriminator is only the source-typed
// fact that both p15-first output numbers are physical red-bearing pages.
const dualTerminal = privateRouteQualifiers.filter(
  (item) => item.terminalRedLandings.length === 2,
);
assert.deepEqual(dualTerminal.map((item) => item.exponent), [1]);
assert.deepEqual(dualTerminal[0].out15, [DH.p, DH.A]);

// Secondary interval consequence, recorded but not used to select Q.
const q6Interval = interval(q6);
const q15Interval = interval(q15);
assert.deepEqual(q6Interval, [1, 15]);
assert.deepEqual(q15Interval, [8, 23]);
assert.equal(Math.min(q6Interval[0], q15Interval[0]), 1);
assert.equal(Math.max(q6Interval[1], q15Interval[1]), 23);
assert.equal(overlapSize(q6Interval, q15Interval), DH.A);

const intervalUnionQualifiers = [];
for (let exponent = 0; exponent < 840; exponent += 1) {
  const scalar = pow(Q, exponent);
  const a = interval(mul(scalar, residue(p6)));
  const b = interval(mul(scalar, residue(p15First)));
  const connected = Math.max(a[0], b[0]) <= Math.min(a[1], b[1]) + 1;
  if (connected && Math.min(a[0], b[0]) === 1 && Math.max(a[1], b[1]) === 23) {
    intervalUnionQualifiers.push({exponent, a, b, overlap: overlapSize(a, b)});
  }
}
assert.deepEqual(intervalUnionQualifiers.map((item) => item.exponent), [1, 146, 173, 207, 793, 827]);
assert.deepEqual(
  intervalUnionQualifiers.filter((item) => item.overlap === DH.A).map((item) => item.exponent),
  [1],
);

const result = {
  status: 'PASS',
  classification: 'post-discovery source-licensed Q navigation/state cross-lock; no unknown plaintext',
  redPagesBelow29: [...redPages].sort((a, b) => a - b),
  independentlyTypedState: DH,
  qRoute: [
    {source: 'p27:red19', output: q27, words: q27.map((value) => words[value]), uniqueRedDirection: DH.a},
    {source: 'p6:red11', output: q6, words: q6.map((value) => words[value]), uniqueRedDirection: DH.b},
    {source: 'p15:first-red9', output: q15, words: q15.map((value) => words[value]), redDirections: [DH.p, DH.A]},
  ],
  allNonzeroScalarCharge: {
    privateExponentRouteQualifierExponents: privateRouteQualifiers.map((item) => item.exponent),
    countBeforeTerminalDualRedGate: privateRouteQualifiers.length,
    dualRedTerminalQualifierExponents: dualTerminal.map((item) => item.exponent),
    countAfterTerminalDualRedGate: dualTerminal.length,
  },
  secondaryIntervalCheck: {
    p6: q6Interval,
    p15First: q15Interval,
    union: [1, 23],
    overlap: overlapSize(q6Interval, q15Interval),
    unionQualifierExponents: intervalUnionQualifiers.map((item) => item.exponent),
    overlapAQualifierExponents: intervalUnionQualifiers.filter((item) => item.overlap === DH.A).map((item) => item.exponent),
  },
  boundary: 'a=6,b=15 come from the independent p27/cell254 DH reconstruction; p15-first is independently selected by the pre-existing Q-orbit cycle. The charge is retrospective and does not establish that every signed word number is a physical-page opcode or decrypt any body runes.',
};

console.log(JSON.stringify(result, null, 2));
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), JSON.stringify(result, null, 2));
}
