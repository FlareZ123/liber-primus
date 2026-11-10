'use strict';
/**
 * Source-native 78-rank to 47-ASCII-byte inverse with unknown global
 * 29-rune cyclic order. Uses the *original* 86 adjacent-repeat positions as
 * nonconsuming transport markers and 165 fixed packets of 78 nonrepeat ranks.
 *
 * Model: 47 seven-bit ASCII bytes -> 78 base28 digits; each digit walks to
 * the next ciphertext rune in a secret cyclic permutation of 29 GP runes,
 * skipping the previous rune. Source-native GP English supplies a frozen
 * first-byte likelihood. The secret permutation is inferred from ONLY the
 * first 108 of 164 testable packet leaders, then applied to 56 heldout
 * packets and all 47 decoded bytes per packet without any further fitting.
 *
 * Read-only, deterministic, no dependencies outside Node 22 builtins.
 * node sims/prime78_ascii_order_inversion.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page < 56);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const repeats = new Set(original.flatMap((c, i) =>
  i > 0 && c === original[i - 1] ? [i] : []));
assert.equal(repeats.size, 86);
const observed = original.filter((_, i) => !repeats.has(i));
const PACKETS = 165, RADIX = 28, WIDTH = 78, BYTES = 47, TRAIN = 108;
assert.equal(observed.length, PACKETS * WIDTH);
const MASK = 29;
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split(/\r?\n/u).filter(s =>
    !s.startsWith('#') && !s.startsWith('[') && !/^\d/u.test(s))
  .join(' ').toUpperCase().replace(/[^A-Z]+/gu, ' ')
  .replace(/\s+/gu, ' ').trim() + ' ';
assert.ok(reference.length > 3500);
const plaintext = reference.repeat(
  Math.ceil(PACKETS * BYTES / reference.length)).slice(0, PACKETS * BYTES);
const A = Number(28n ** 77n) / Number(256n ** 46n);
const sourceCounts = new Float64Array(RADIX);
for (let i = 0; i + 2 < reference.length; i++) {
  const leading = reference.charCodeAt(i)
    + reference.charCodeAt(i + 1) / 256
    + reference.charCodeAt(i + 2) / 65536;
  const d = Math.floor(leading / A);
  assert.ok(d >= 0 && d < RADIX);
  sourceCounts[d]++;
}
const totalSource = sourceCounts.reduce((a, b) => a + b, 0);
const q = Array.from(sourceCounts, n => 0.9 * n / totalSource + 0.1 / RADIX);
const logq = q.map(Math.log);
let rngState = 0x78164723;

/** @returns {number} seeded uint32 PRNG, reproducible across Node runs. */
function next32() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
/** @param {number} n @returns {number} */
function draw(n) {return next32() % n;}
/** @returns {number[]} random cyclic GP rune order. */
function permutation() {
  const p = Array.from({length: MASK}, (_, i) => i);
  for (let i = MASK - 1; i > 0; i--) {
    const k = draw(i + 1);
    [p[i], p[k]] = [p[k], p[i]];
  }
  return p;
}
/** @param {number[]} order @returns {number[]} index of each glyph. */
function positions(order) {
  const out = Array(MASK);
  order.forEach((g, i) => {out[g] = i;});
  return out;
}
/** @param {string} ascii @returns {number[][]} */
function bytesToRanks(ascii) {
  assert.equal(ascii.length, PACKETS * BYTES);
  const blocks = [];
  for (let k = 0; k < PACKETS; k++) {
    let value = 0n;
    for (let j = 0; j < BYTES; j++) {
      const b = ascii.charCodeAt(k * BYTES + j);
      assert.ok(b >= 0 && b < 128);
      value = value * 256n + BigInt(b);
    }
    const digits = Array(WIDTH);
    for (let j = WIDTH - 1; j >= 0; j--) {
      digits[j] = Number(value % 28n);
      value /= 28n;
    }
    assert.equal(value, 0n);
    blocks.push(digits);
  }
  return blocks;
}
/**
 * Encrypt all 12,870 rank digits using a secret cyclic order; restore the
 * original 86 repeat slots without changing the predecessor cipher state.
 * @param {number[][]} digitBlocks
 * @param {number[]} order
 * @returns {number[]}
 */
function encrypt(digitBlocks, order) {
  const pi = positions(order), clean = [];
  let previous = order[11];
  for (const block of digitBlocks)
    for (const d of block) {
      previous = order[(pi[previous] + d + 1) % MASK];
      clean.push(previous);
    }
  assert.equal(clean.length, observed.length);
  const out = [];
  let cursor = 0;
  for (let i = 0; i < original.length; i++)
    out.push(repeats.has(i) ? out[out.length - 1] : clean[cursor++]);
  assert.equal(cursor, clean.length);
  assert.deepEqual(out.filter((_, i) => !repeats.has(i)), clean);
  return out;
}
/** @param {number[]} sequence @returns {number[][]} */
function packetLeaders(sequence) {
  const out = [];
  for (let k = 1; k < PACKETS; k++) {
    const i = k * WIDTH;
    out.push([sequence[i - 1], sequence[i]]);
  }
  return out;
}
/**
 * Frozen first-byte source likelihood, optimizing only packet leaders.
 * No recovered byte or actual original plaintext is used in training.
 * @param {number[]} pi
 * @param {number[][]} list
 * @returns {number}
 */
function meanScore(pi, list) {
  let sum = 0;
  for (const [a, b] of list)
    sum += logq[(pi[b] - pi[a] + MASK - 1) % MASK];
  return sum / list.length;
}
/**
 * Fit 29! unknown cyclic order via 48 independent deterministic anneals.
 * Each swap changes only edges incident to its two rune labels.
 * @param {number[][]} leaderPairs
 * @returns {{train:number,held:number,full:number,restart:number,pi:number[]}}
 */
function recoverOrder(leaderPairs) {
  assert.equal(leaderPairs.length, PACKETS - 1);
  let best = {train: -Infinity, held: 0, full: 0, restart: 0, pi: []};
  for (let restart = 0; restart < 48; restart++) {
    const pi = positions(permutation());
    let current = meanScore(pi, leaderPairs.slice(0, TRAIN)) * TRAIN;
    for (let t = 0; t < 11000; t++) {
      const u = draw(MASK), v = draw(MASK);
      if (u === v) continue;
      const pu = pi[u], pv = pi[v];
      let delta = 0;
      for (let j = 0; j < TRAIN; j++) {
        const [a, b] = leaderPairs[j];
        if (a !== u && a !== v && b !== u && b !== v) continue;
        const pa = pi[a], pb = pi[b];
        const na = a === u ? pv : a === v ? pu : pa;
        const nb = b === u ? pv : b === v ? pu : pb;
        delta += logq[(nb - na + MASK - 1) % MASK]
          - logq[(pb - pa + MASK - 1) % MASK];
      }
      const temp = 5 * Math.pow(0.015, t / 11000);
      if (delta > 0 || Math.exp(delta / temp) > draw(10000000) / 10000000) {
        pi[u] = pv;
        pi[v] = pu;
        current += delta;
      }
    }
    const train = current / TRAIN;
    if (train > best.train)
      best = {train, held: meanScore(pi, leaderPairs.slice(TRAIN)),
        full: meanScore(pi, leaderPairs), restart, pi: pi.slice()};
  }
  return best;
}
/**
 * Decode every byte of all complete packets AFTER packet0, whose first
 * predecessor rune is unknowable to the receiver.
 * @param {number[]} sequence
 * @param {number[]} pi
 * @returns {number[]}
 */
function unpack(sequence, pi) {
  const bytes = [];
  for (let k = 1; k < PACKETS; k++) {
    let value = 0n;
    for (let j = 0; j < WIDTH; j++) {
      const i = k * WIDTH + j;
      const d = (pi[sequence[i]] - pi[sequence[i - 1]] + MASK - 1) % MASK;
      assert.ok(d >= 0 && d < RADIX);
      value = value * 28n + BigInt(d);
    }
    const local = Array(BYTES);
    for (let j = BYTES - 1; j >= 0; j--) {
      local[j] = Number(value % 256n);
      value /= 256n;
    }
    assert.equal(value, 0n, '47 bytes have capacity for all 78 base28 digits');
    bytes.push(...local);
  }
  assert.equal(bytes.length, (PACKETS - 1) * BYTES);
  return bytes;
}
/** @param {number[]} bytes @returns {object} */
function describe(bytes) {
  const samples = [];
  for (let k = 0; k < 3; k++)
    samples.push(bytes.slice(k * BYTES, (k + 1) * BYTES).map(c =>
      c >= 32 && c <= 126 ? String.fromCharCode(c) : '.').join(''));
  return {
    decoded: bytes.length,
    printable: bytes.filter(c => c >= 32 && c <= 126).length,
    upperOrSpace: bytes.filter(c => c === 32 || (c >= 65 && c <= 90)).length,
    nonAscii: bytes.filter(c => c >= 128).length,
    leaderPrintable: Array.from({length: PACKETS - 1}, (_, i) =>
      bytes[i * BYTES]).filter(c => c >= 32 && c <= 126).length,
    leaderUpperOrSpace: Array.from({length: PACKETS - 1}, (_, i) =>
      bytes[i * BYTES]).filter(c => c === 32 || (c >= 65 && c <= 90)).length,
    samples
  };
}
/** @returns {object} */
function main() {
  const sourceDigits = bytesToRanks(plaintext);
  const secret = permutation(), truePi = positions(secret);
  const plantedBook = encrypt(sourceDigits, secret);
  const planted = plantedBook.filter((_, i) => !repeats.has(i));
  const originalPairs = packetLeaders(observed);
  const plantPairs = packetLeaders(planted);
  const originalFit = recoverOrder(originalPairs);
  const plantFit = recoverOrder(plantPairs);
  const cycleDelta = (plantFit.pi[0] - truePi[0] + MASK) % MASK;
  const recoveredLabels = truePi.filter((p, i) =>
    (plantFit.pi[i] - p + MASK) % MASK === cycleDelta).length;
  const directPlant = unpack(planted, truePi);
  const fittedPlant = unpack(planted, plantFit.pi);
  const expectedPlant = Array.from(plaintext.slice(BYTES), c => c.charCodeAt(0));
  assert.deepEqual(directPlant, expectedPlant);
  assert.equal(recoveredLabels, 29,
    'Source-English plant must recover complete hidden cyclic 29-rune order');
  assert.deepEqual(fittedPlant, expectedPlant,
    'Learned hidden source order must decode every heldout byte');
  const originalBytes = unpack(observed, originalFit.pi);
  return {
    model: '165 x 78 predecessor-excluding base28 digits -> 47 ASCII octets',
    originalRunes: original.length, removedRepeatEvents: repeats.size,
    remainingDigits: observed.length, packetCount: PACKETS,
    fittedLeaders: TRAIN, heldoutLeaders: PACKETS - 1 - TRAIN,
    sourceTextChars: reference.length,
    firstDigitCalibration: {ratio28pow77To256pow46: A,
      leadingDigitDistribution: q},
    original: {
      train: originalFit.train, heldout: originalFit.held,
      allLeaders: originalFit.full, winningRestart: originalFit.restart,
      decodedBytes: describe(originalBytes)
    },
    plant: {
      originalAsciiBytes: plaintext.length, fullKeyLabelsRecovered: recoveredLabels,
      train: plantFit.train, heldout: plantFit.held,
      trueKeyTrain: meanScore(truePi, plantPairs.slice(0, TRAIN)),
      trueKeyHeldout: meanScore(truePi, plantPairs.slice(TRAIN)),
      decodedBytes: describe(fittedPlant),
      byteExactForwardInverse: true,
      secretOrderRecoveredModuloRotation: true
    },
    assessment: 'Strong direct uppercase-English 78->47 ASCII packet candidate excluded on original heldout source register; no genuine plaintext recovered.'
  };
}
if (require.main === module)console.log(JSON.stringify(main(), null, 2));
module.exports = {main, packetLeaders, recoverOrder, unpack, bytesToRanks,
  encrypt, meanScore};
