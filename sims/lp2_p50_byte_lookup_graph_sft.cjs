'use strict';

/**
 * SFT: A 256-cell original table defines the canonical byte map f(i)=B[i].
 * Probe complete graph, 2014 first-party 3301/1033 seeds, and a frozen
 * whole-terminal GP29 additive consumer against 180 known terminal runes.
 *
 * Run: node sims/lp2_p50_byte_lookup_graph_sft.cjs
 *
 * No hidden key/alternate traversal guesses, no external dependencies.
 * Outputs are exploratory; no unknown LP2 plaintext is authenticated.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const gp = require('../resources/liber-primus/lp2-corpus.json');
const B = grid.bytes;

assert.equal(B.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(B)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
assert.equal(new Set(B).size, 161);
assert.ok(B.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));

/**
 * @param {number[]} table
 * @param {number} seed
 * @returns {{ transient: number[], cycle: number[] }}
 */
function orbit(table, seed) {
  const positions = new Map();
  const steps = [];
  let x = seed;
  while (!positions.has(x)) {
    positions.set(x, steps.length);
    steps.push(x);
    x = table[x];
  }
  const join = positions.get(x);
  return { transient: steps.slice(0, join), cycle: steps.slice(join) };
}

/**
 * @param {number[]} table
 * @param {number} seed
 * @param {number} length
 * @returns {number[]}
 */
function keyStates(table, seed, length) {
  const states = [];
  let x = seed;
  for (let i = 0; i < length; i += 1) {
    states.push(x);
    x = table[x];
  }
  return states;
}

/**
 * @param {number[]} input
 * @param {number[]} states
 * @param {number} sign
 * @param {number} offset
 * @returns {number[]}
 */
function applyKey(input, states, sign, offset = 0) {
  return input.map((v, i) => (v + sign * (states[offset + i] % 29) + 29) % 29);
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const out = [];
  for (let candidate = 2; out.length < n; candidate += 1) {
    if (out.every((p) => candidate % p !== 0)) out.push(candidate);
  }
  return out;
}

/** @param {number[]} indices @returns {string} */
function gpText(indices) {
  return indices.map((v) => gp.translit[v]).join('');
}

/** @param {number[]} actual @param {number[]} expected @returns {number} */
function matchCount(actual, expected) {
  assert.equal(actual.length, expected.length);
  return actual.reduce((hits, value, index) => hits + Number(value === expected[index]), 0);
}

// February 2014 Stage10 filenames are an independent historical number set.
// Their use as later LP2 table addresses remains hypothetical.
const stage10Html = fs.readFileSync(
  require.resolve('../resources/external/2014-stage10-post-square-response.html'), 'utf8'
);
const stage10Blob = crypto.createHash('sha1').update(
  'blob ' + Buffer.byteLength(stage10Html) + '\0' + stage10Html
).digest('hex');
assert.equal(stage10Blob, 'd71303af76016c8e88ed5dcc8a18b08e6276a437');
const stage10Names = [...stage10Html.matchAll(/src="\/(\d+)\.jpg"/g)]
  .map((match) => Number(match[1]));
assert.deepEqual(stage10Names, [107, 167, 229]);
const historicalPrimeList = firstPrimes(50);
const stage10Ordinals = stage10Names.map((n) => historicalPrimeList.indexOf(n) + 1);
assert.deepEqual(stage10Ordinals, [28, 39, 50]);
assert.deepEqual(stage10Ordinals.slice(1).map((v, i) => v - stage10Ordinals[i]), [11, 11]);
assert.equal(B[229], 0);

const mainCycle = [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192];
const minorCycle = [249, 158];
assert.deepEqual(orbit(B, 3301 % 256), { transient: [229], cycle: mainCycle });
assert.deepEqual(orbit(B, 1033 % 256), { transient: [9], cycle: minorCycle });

const basinCounts = { main: 0, small: 0, maxTailMain: 0, maxTailSmall: 0 };
for (let i = 0; i < 256; i += 1) {
  const x = orbit(B, i);
  if (x.cycle.includes(0)) {
    basinCounts.main += 1;
    basinCounts.maxTailMain = Math.max(basinCounts.maxTailMain, x.transient.length);
  } else {
    assert.ok(x.cycle.includes(249), 'Unexpected third component');
    basinCounts.small += 1;
    basinCounts.maxTailSmall = Math.max(basinCounts.maxTailSmall, x.transient.length);
  }
}
assert.deepEqual(basinCounts, {
  main: 252,
  small: 4,
  maxTailMain: 24,
  maxTailSmall: 1,
});

const p55 = gp.pages.find((page) => page.page === 55).indices;
const p56Cipher = gp.pages.find((page) => page.page === 56).indices;
const p57 = gp.pages.find((page) => page.page === 57).indices;
assert.deepEqual([p55.length, p56Cipher.length, p57.length], [76, 85, 95]);

const stage10Orbits = stage10Names.map((n) => ({ start: n, ...orbit(B, n) }));
assert.deepEqual(stage10Orbits.map((x) => x.transient.length), [16, 18, 1]);
assert.ok(stage10Orbits.every((x) => x.cycle.length === 11));
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const counts = Array.from({ length: 29 }, (_, n) => xs.filter((v) => v === n).length);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
const source229States = keyStates(B, 229, 76);
const stage10P55Trials = [-1, 1].map((sign) => {
  const candidate = applyKey(p55, source229States, sign);
  assert.deepEqual(applyKey(candidate, source229States, -sign), p55);
  return { sign, ioc: ioc(candidate), translit: gpText(candidate) };
});
assert.ok(Math.abs(stage10P55Trials[0].ioc - 0.031228070175438598) < 1e-14);
assert.ok(Math.abs(stage10P55Trials[1].ioc - 0.03894736842105263) < 1e-14);

// Second frozen original 2014 consumer: three source filenames as
// byte-pointer seeds, then XOR the three successor bytes. The original
// 2014 LP1 00-02 stage taught exact three-way bytewise XOR. Its transfer
// to these later LP2 table addresses is a hypothesis, not creator-signed.
let xorStates = stage10Names.slice();
const stage10ThreeXorKey = [];
for (let i = 0; i < 256; i += 1) {
  xorStates = xorStates.map((state) => B[state]);
  stage10ThreeXorKey.push((xorStates[0] ^ xorStates[1] ^ xorStates[2]) % 29);
}
assert.deepEqual(stage10ThreeXorKey.slice(0, 20), [
  5, 17, 3, 8, 16, 17, 25, 9, 23, 16, 9, 8, 1, 28, 1, 5, 1, 22, 7, 10
]);
for (let i = 18; i + 11 < stage10ThreeXorKey.length; i += 1) {
  assert.equal(stage10ThreeXorKey[i], stage10ThreeXorKey[i + 11]);
}
const stage10ThreeXorP55 = [-1, 1].map((sign) => {
  const decoded = p55.map((v, i) => (v + 29 + sign * stage10ThreeXorKey[i]) % 29);
  const reencryption = decoded.map((v, i) => (v + 29 - sign * stage10ThreeXorKey[i]) % 29);
  assert.deepEqual(reencryption, p55);
  const control = gp.pages.find((p) => p.page === 57).indices.slice(0, 76);
  const planted = control.map((v, i) => (v + 29 - sign * stage10ThreeXorKey[i]) % 29);
  assert.deepEqual(planted.map((v, i) => (v + 29 + sign * stage10ThreeXorKey[i]) % 29), control);
  return { sign, ioc: ioc(decoded), translit: gpText(decoded) };
});
assert.ok(Math.abs(stage10ThreeXorP55[0].ioc - 0.0343859649122807) < 1e-14);
assert.ok(Math.abs(stage10ThreeXorP55[1].ioc - 0.039649122807017545) < 1e-14);

const primes = firstPrimes(85);
let clock = 0;
const p56Plain = p56Cipher.map((v, i) => (
  i === 56 ? v : (v - (primes[clock++] - 1) + 29 * 20) % 29
));
assert.equal(clock, 84);
assert.equal(
  gpText(p56Plain),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE'
);
const knownCipher = p56Cipher.concat(p57);
const knownPlain = p56Plain.concat(p57);
const stage10ThreeXorHoldout = [-1, 1].map((sign) => {
  const decoded = knownCipher.map(
    (v, i) => (v + 29 + sign * stage10ThreeXorKey[i + 76]) % 29
  );
  return {
    sign,
    p56SolvedHits: matchCount(decoded.slice(0, 85), p56Plain),
    p57ClearHits: matchCount(decoded.slice(85), p57),
    totalKnown180Hits: matchCount(decoded, knownPlain),
  };
});
assert.deepEqual(
  stage10ThreeXorHoldout.map((x) => [x.p56SolvedHits, x.p57ClearHits, x.totalKnown180Hits]),
  [[2, 0, 2], [6, 0, 6]]
);

// Independently selected unknown receiver p32: 121 runes = 11*11.
// The p32 route ends at table state32; one more pointer enters the 11-cycle at115.
// The 2014 three-pointer XOR key has an 18-step transient then period11.
const p32Receiver = gp.pages.find((page) => page.page === 32).indices;
assert.equal(p32Receiver.length, 121);
const p32Prefix = gp.pages.filter((page) => page.page < 32).flatMap((page) => page.indices);
const p32GlobalOffset = p32Prefix.length;
const p32PrefixF = p32Prefix.filter((value) => value === 0).length;
const p32PrefixNonF = p32GlobalOffset - p32PrefixF;
assert.deepEqual([p32GlobalOffset, p32PrefixF, p32PrefixNonF], [7839, 283, 7556]);
const keyAt = (index) => index < stage10ThreeXorKey.length
  ? stage10ThreeXorKey[index]
  : stage10ThreeXorKey[18 + ((index - 18) % 11)];
const p32GlobalKeyPhase = 18 + ((p32GlobalOffset - 18) % 11);
const p32GlobalFKeyPhase = 18 + ((p32PrefixNonF - 18) % 11);
assert.equal(p32GlobalKeyPhase, 18);
assert.equal(p32GlobalFKeyPhase, 21);
const p32AdditiveTests = [];
for (const [mode, start] of [['page-reset', 0], ['continuous-LP2', p32GlobalOffset]]) {
  for (const sign of [-1, 1]) {
    const decoded = p32Receiver.map((value, i) => (value + 29 + sign * keyAt(start + i)) % 29);
    p32AdditiveTests.push({ mode, sign, ioc: ioc(decoded), translit: gpText(decoded) });
  }
}
function applyFTransparent(input, start, sign) {
  let clock = start;
  const decoded = [];
  for (const value of input) {
    if (value === 0) { decoded.push(0); continue; }
    decoded.push((value + 29 + sign * keyAt(clock)) % 29);
    clock += 1;
  }
  return { decoded, clockEnd: clock };
}
const p32FTransparentTests = [];
for (const [mode, start] of [['page-reset', 0], ['continuous-F-transparent', p32PrefixNonF]]) {
  for (const sign of [-1, 1]) {
    const result = applyFTransparent(p32Receiver, start, sign);
    p32FTransparentTests.push({ mode, sign, ioc: ioc(result.decoded), clockEnd: result.clockEnd, translit: gpText(result.decoded) });
  }
}
assert.deepEqual(p32AdditiveTests.map((row) => Number(row.ioc.toFixed(12))), [0.035674931129,0.035674931129,0.035399449035,0.035950413223]);
assert.deepEqual(p32FTransparentTests.map((row) => Number(row.ioc.toFixed(12))), [0.043112947658,0.031955922865,0.036501377410,0.036914600551]);
const p32CycleFromReceiver = [115,247,192,0,203,68,199,47,76,114,197];
const p32ColumnOrder = p32CycleFromReceiver.map((value, index) => ({ value, index }))
  .sort((a, b) => a.value - b.value).map((row) => row.index);
assert.deepEqual(p32ColumnOrder, [3,7,5,8,9,0,2,10,6,4,1]);
function p32ColumnarDecrypt(input) {
  const columns = Array.from({ length: 11 }, () => []);
  let cursor = 0;
  for (const column of p32ColumnOrder) { columns[column] = input.slice(cursor, cursor + 11); cursor += 11; }
  return Array.from({ length: 11 }, (_, row) => Array.from({ length: 11 }, (_, column) => columns[column][row])).flat();
}
function p32ColumnarEncrypt(input) {
  const output = [];
  for (const column of p32ColumnOrder) for (let row = 0; row < 11; row += 1) output.push(input[row * 11 + column]);
  return output;
}
const p32ColumnarTests = [
  { direction: 'inverse', ioc: ioc(p32ColumnarDecrypt(p32Receiver)), translit: gpText(p32ColumnarDecrypt(p32Receiver)) },
  { direction: 'forward', ioc: ioc(p32ColumnarEncrypt(p32Receiver)), translit: gpText(p32ColumnarEncrypt(p32Receiver)) },
];
assert.ok(p32ColumnarTests.every((row) => Math.abs(row.ioc - 0.03415977961432507) < 1e-14));
// Original solved p56 literal-F passthrough permits an optional key-clock
// bypass only at each ciphertext F. Exhaust 2^3 p55 branch assignments.
const originalFPositions = p55.map((v, i) => v === 0 ? i : -1).filter((i) => i >= 0);
assert.deepEqual(originalFPositions, [15, 25, 41]);
const originalFContradictions = [];
for (const sign of [-1, 1]) for (let mask = 0; mask < 8; mask += 1) {
  let clock = 0;
  let conflict = -1;
  for (let i = 0; i < p55.length; i += 1) {
    const fIndex = originalFPositions.indexOf(i);
    if (fIndex >= 0 && (mask & (1 << fIndex))) continue;
    if ((p55[i] + 29 + sign * stage10ThreeXorKey[clock]) % 29 === 0) {
      conflict = i;
      break;
    }
    clock += 1;
  }
  originalFContradictions.push({ sign, mask, firstIllegalConsumedF: conflict });
}
assert.equal(originalFContradictions.length, 16);
assert.ok(originalFContradictions.every((v) => v.firstIllegalConsumedF >= 0));
assert.deepEqual(originalFContradictions.filter((v) => v.mask === 0).map(
  (v) => v.firstIllegalConsumedF
), [36, 27]);

const trials = [];

for (const sourceSeed of [3301, 1033]) {
  const states = keyStates(B, sourceSeed % 256, 256);
  for (const sign of [-1, +1]) {
    // The original terminal suffix starts at position 76 after unknown p55.
    const candidate = applyKey(knownCipher, states, sign, 76);
    const constructed = applyKey(knownPlain, states, -sign, 76);
    assert.deepEqual(applyKey(constructed, states, sign, 76), knownPlain);
    trials.push({
      sourceSeed,
      sign,
      plainRegisterHits: matchCount(candidate, knownPlain),
      p56PlainHits: matchCount(candidate.slice(0, 85), p56Plain),
      p57ClearHits: matchCount(candidate.slice(85), p57),
      printedRegisterHits: matchCount(candidate, knownCipher),
      p57NonzeroKeySites: 95 - states.slice(161, 256).filter((v) => v % 29 === 0).length,
      p55UnverifiedCandidate: gpText(applyKey(p55, states, sign)),
    });
  }
}
assert.deepEqual(trials.map(({ plainRegisterHits, p57ClearHits }) => [
  plainRegisterHits, p57ClearHits
]), [[22, 18], [22, 18], [1, 0], [5, 0]]);

// Illustrative finite null. The outcome condition was noticed after observing
// the source graph. Its 3/100000 rate is NOT a valid pre-registered p-value.
let state = 0x33011033;
/** @returns {number} */
function randomUnit() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
const shuffled = B.slice();
const tally = { samples: 100000, seed229ToZero: 0, seed9OneStepIntoTwoCycle: 0, both: 0 };
for (let iteration = 0; iteration < tally.samples; iteration += 1) {
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(randomUnit() * (i + 1));
    const v = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = v;
  }
  const a = shuffled[229] === 0;
  const u = shuffled[9];
  const v = shuffled[u];
  const b = u !== 9 && v !== 9 && v !== u && shuffled[v] === u;
  if (a) tally.seed229ToZero += 1;
  if (b) tally.seed9OneStepIntoTwoCycle += 1;
  if (a && b) tally.both += 1;
}
assert.deepEqual(tally, {
  samples: 100000,
  seed229ToZero: 772,
  seed9OneStepIntoTwoCycle: 385,
  both: 3,
});

console.log(JSON.stringify({
  sourceByteSha256: '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
  lookup: 'f(i) = original row-major base60 byte B[i], indexed 0..255',
  cycles: [mainCycle, minorCycle],
  basinCounts,
  stage10Source: { historicGitBlob: stage10Blob, filenames: stage10Names,
    primeOrdinals: stage10Ordinals, pointerPaths: stage10Orbits,
    p55OriginalRunners: stage10P55Trials },
  stage10ThreeWayXor: { originalSeeds: stage10Names, keyFirst20: stage10ThreeXorKey.slice(0,20),
    p55CandidateControls: stage10ThreeXorP55, known180Checks: stage10ThreeXorHoldout,
    transparentFImpossibility: originalFContradictions },
  p32ReceiverTransfer: {
    p32Runes:p32Receiver.length, globalOffset:p32GlobalOffset, priorF:p32PrefixF, priorNonF:p32PrefixNonF,
    globalKeyPhase:p32GlobalKeyPhase, globalFTransparentKeyPhase:p32GlobalFKeyPhase, keyPeriod:11,
    additive:p32AdditiveTests, fTransparent:p32FTransparentTests,
    cycleFromReceiver:p32CycleFromReceiver, columnOrder:p32ColumnOrder, columnar:p32ColumnarTests
  },
  sourceSeeds: {
    3301: orbit(B, 3301 % 256),
    1033: orbit(B, 1033 % 256),
  },
  knownTerminalTests: trials,
  exploratoryNull: tally,
  conclusion: 'No 180-position authenticated whole-terminal additive decode or p55/p32 plaintext under the frozen source-key consumers',
}, null, 2));
