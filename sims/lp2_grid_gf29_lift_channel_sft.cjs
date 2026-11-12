'use strict';

/**
 * GP29 original-book enumerative escape codec with an independently factored
 * source table's mod-29 byte lifts as a side channel.
 *
 * Frozen conditional model:
 *   A GP29 cyclic path has at most 86 within-page zero differences;
 *   rank all such paths with the page initials, repeat-mask colex rank and
 *   remaining 28-way nonzero steps, in that order;
 *   rank 256 full bytes by their possible lifts above each fixed mod-29 residue.
 *   The rank modulo the source-bound GP29 quotient carries the missing bits;
 *   the quotient is unconstrained, preserved as a separate salt.
 *
 * No cipher key, original plaintext or author instruction is claimed.
 * Run: node sims/lp2_grid_gf29_lift_channel_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} p */
const readJSON = p => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const gp = readJSON('resources/liber-primus/lp2-corpus.json');
const pages = gp.pages.filter(p => p.status === 'unsolved' && p.indices.length);
const bytes = readJSON('resources/liber-primus/lp2-grid-256.json').bytes;
const lens = pages.map(p => p.indices.length);
const H = lens.length;
const N = lens.reduce((a, b) => a + b - 1, 0);
const TOTAL = N + H;
const K = 86;
assert.equal(H, 55);
assert.equal(N, 12901);
assert.equal(TOTAL, 12956);
assert.equal(bytes.length, 256);
const residues = bytes.map(x => x % 29);
const radices = residues.map(r => r <= 23 ? 9 : 8);
const FULL = 29n ** BigInt(TOTAL);
const START_BASE = 29n ** BigInt(H);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= k; i++) {
    value = value * BigInt(n - k + i) / BigInt(i);
  }
  return value;
}
const groups = Array.from({length: K + 1}, (_, j) => choose(N, j) * 28n ** BigInt(N - j));
const TRANS_BASE = groups.reduce((a, b) => a + b, 0n);
const CODE_BASE = TRANS_BASE * START_BASE;
const LIFT_BASE = radices.reduce((a, b) => a * BigInt(b), 1n);

/** @param {number[]} digits @param {number} radix */
function rankFixed(digits, radix) {
  let value = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < radix);
    value = value * BigInt(radix) + BigInt(digit);
  }
  return value;
}
/** @param {bigint} value @param {number} len @param {number} radix */
function unrankFixed(value, len, radix) {
  const out = new Array(len);
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(value % BigInt(radix));
    value /= BigInt(radix);
  }
  assert.equal(value, 0n);
  return out;
}
/** @param {number[]} digits @param {number[]} bases */
function rankMixed(digits, bases) {
  assert.equal(digits.length, bases.length);
  let value = 0n;
  for (let i = 0; i < digits.length; i++) {
    assert(digits[i] >= 0 && digits[i] < bases[i]);
    value = value * BigInt(bases[i]) + BigInt(digits[i]);
  }
  return value;
}
/** @param {bigint} value @param {number[]} bases */
function unrankMixed(value, bases) {
  const out = new Array(bases.length);
  for (let i = bases.length - 1; i >= 0; i--) {
    out[i] = Number(value % BigInt(bases[i]));
    value /= BigInt(bases[i]);
  }
  assert.equal(value, 0n);
  return out;
}

/** @param {number[][]} cipherPages */
function rankPath(cipherPages) {
  assert.deepEqual(cipherPages.map(x => x.length), lens);
  const starts = cipherPages.map(x => x[0]);
  const zeros = [], digits = [];
  let pos = 0;
  for (const page of cipherPages) {
    for (let i = 1; i < page.length; i++, pos++) {
      const delta = (page[i] - page[i - 1] + 29) % 29;
      if (delta === 0) zeros.push(pos);
      else digits.push(delta - 1);
    }
  }
  assert.equal(pos, N);
  assert(zeros.length <= K, 'more than 86 repeats');
  let colex = 0n;
  for (let i = 0; i < zeros.length; i++) colex += choose(zeros[i], i + 1);
  let transition = 0n;
  for (let j = 0; j < zeros.length; j++) transition += groups[j];
  transition += colex * 28n ** BigInt(N - zeros.length);
  transition += rankFixed(digits, 28);
  const rank = transition * START_BASE + rankFixed(starts, 29);
  assert(rank < CODE_BASE);
  return {rank, repeats: zeros.length};
}

/** @param {bigint} value @param {number} k @param {number} upper */
function unrankColex(value, k, upper) {
  const out = new Array(k);
  let max = upper - 1;
  for (let i = k; i >= 1; i--) {
    let lo = i - 1, hi = max + 1;
    while (lo + 1 < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (choose(mid, i) <= value) lo = mid;
      else hi = mid;
    }
    out[i - 1] = lo;
    value -= choose(lo, i);
    max = lo - 1;
  }
  assert.equal(value, 0n);
  return out;
}

/** @param {bigint} rank */
function unrankPath(rank) {
  assert(rank >= 0n && rank < CODE_BASE);
  const starts = unrankFixed(rank % START_BASE, H, 29);
  let transition = rank / START_BASE, repeatCount = 0;
  while (repeatCount <= K && transition >= groups[repeatCount]) {
    transition -= groups[repeatCount];
    repeatCount++;
  }
  assert(repeatCount <= K);
  const stepBase = 28n ** BigInt(N - repeatCount);
  const zeroRank = transition / stepBase;
  const stepRank = transition % stepBase;
  const positions = unrankColex(zeroRank, repeatCount, N);
  const steps = unrankFixed(stepRank, N - repeatCount, 28);
  const out = [];
  let t = 0, z = 0, d = 0;
  for (let p = 0; p < H; p++) {
    const page = [starts[p]];
    for (let i = 1; i < lens[p]; i++, t++) {
      const delta = z < positions.length && positions[z] === t ? 0 : steps[d++] + 1;
      if (delta === 0) z++;
      page.push((page[i - 1] + delta) % 29);
    }
    out.push(page);
  }
  assert.equal(t, N);
  assert.equal(z, repeatCount);
  assert.equal(d, N - repeatCount);
  return out;
}

/** @param {number[][]} ciphertext @param {number[]} table */
function decode(ciphertext, table) {
  const {rank} = rankPath(ciphertext);
  assert.equal(table.length, 256);
  const lifts = table.map((x, i) => {
    assert.equal(x % 29, residues[i], 'fixed GF29 residues');
    return Math.floor(x / 29);
  });
  const liftRank = rankMixed(lifts, radices);
  const sideChoices = (FULL - 1n - rank) / CODE_BASE + 1n;
  const side = liftRank % sideChoices;
  const salt = liftRank / sideChoices;
  const plain = unrankFixed(side * CODE_BASE + rank, TOTAL, 29);
  return {plain, salt};
}

/** @param {number[]} plain @param {bigint} salt */
function encode(plain, salt) {
  assert.equal(plain.length, TOTAL);
  const value = rankFixed(plain, 29);
  const rank = value % CODE_BASE, side = value / CODE_BASE;
  const sideChoices = (FULL - 1n - rank) / CODE_BASE + 1n;
  assert(side < sideChoices);
  const liftRank = salt * sideChoices + side;
  assert(liftRank >= 0n && liftRank < LIFT_BASE);
  const lifts = unrankMixed(liftRank, radices);
  return {cipher: unrankPath(rank),
    table: lifts.map((q, i) => 29 * q + residues[i])};
}

/** @param {number[]} symbols */
function ioc(symbols) {
  const count = Array(29).fill(0);
  for (const rune of symbols) count[rune]++;
  const numerator = count.reduce((sum, n) => sum + n * (n - 1), 0);
  return numerator / (symbols.length * (symbols.length - 1));
}

function nativeEnglish() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const tokens = gp.translit.map((token, i) => ({token, i}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const raw of source.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let j = 0; j < word.length;) {
      const match = tokens.find(x => word.startsWith(x.token, j));
      assert(match, 'bad rune transliteration');
      out.push(match.i);
      j += match.token.length;
    }
    if (out.length >= TOTAL) break;
  }
  assert(out.length >= TOTAL);
  return out.slice(0, TOTAL);
}

/** @param {bigint} value @returns {number} */
function log2BigInt(value) {
  const bits = value.toString(2);
  const top = bits.slice(0, 52);
  return bits.length - top.length + Math.log2(parseInt(top, 2));
}

function main() {
  const original = pages.map(p => p.indices);
  const originalRank = rankPath(original);
  assert.equal(originalRank.repeats, 86);
  assert.deepEqual(unrankPath(originalRank.rank), original);
  const inverse = decode(original, bytes);
  const reproduced = encode(inverse.plain, inverse.salt);
  assert.deepEqual(reproduced.cipher, original);
  assert.deepEqual(reproduced.table, bytes);
  const english = nativeEnglish();
  const plant = encode(english, 0n);
  const recovered = decode(plant.cipher, plant.table);
  assert.deepEqual(recovered.plain, english);
  assert.equal(recovered.salt, 0n);
  assert.deepEqual(encode(recovered.plain, recovered.salt), plant);

  const zeroCounts = plant.cipher.reduce((acc, p) => acc +
    p.slice(1).filter((x, i) => x === p[i]).length, 0);
  const candidates = inverse.plain.slice(0, 120).map(i => gp.translit[i]).join('');
  const counts = radices.reduce((acc, c) => {
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({
    source: {pages: H, runes: TOTAL, transitions: N, repeats: K},
    GF29_lift_channel: {cells: bytes.length, eightChoice: counts[8],
      nineChoice: counts[9], capacityBits: Math.log2(8) * counts[8] +
      Math.log2(9) * counts[9], originalLiftBits: LIFT_BASE.toString(2).length},
    enumerativeModel: {cap: K, requiredBitsApprox: log2BigInt(FULL) - log2BigInt(CODE_BASE),
      codebookBitLength: CODE_BASE.toString(2).length,
      messageSideBitLength: ((FULL - 1n - originalRank.rank) / CODE_BASE + 1n).toString(2).length},
    original: {decodedIoC: ioc(inverse.plain), first120Transliterated: candidates,
      exactCipherAndTableReencryption: true},
    control: {length: english.length, plaintextIoC: ioc(english),
      emittedRepeats: zeroCounts, originalResiduesPreserved: true,
      exactInverse: true},
    result: 'Full original plaintext remains nonlinguistic. This exact, source-residue-preserving arithmetic decoder is negative.',
  }, null, 2));
}
main();
