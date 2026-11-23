/**
 * SFT: LP2 p15 spiral -> cyclic predecessor-exclusion GP28
 * with Fibonacci plaintext-feedback state, original pp16-55.
 *
 * Run: node sims/lp2_p15_rank28_fib_plainfeedback_original_sft.cjs
 * Inputs: checked-in canonical original LP2 numeric corpus and three
 * independent source-native English control texts. Read-only, Node 22/CJS.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const raw = read('resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(raw);
const pages = corpus.pages.filter((p) => p.page >= 16 && p.page <= 55 && p.indices.length);
const original = pages.flatMap((p) => p.indices);
const pageAt = pages.flatMap((p) => Array(p.indices.length).fill(p.page));
const N = original.length;
const firstSeed = 3299 % 28;
const secondSeed = 3298 % 28;
const gp = corpus.translit;
const runeIndex = new Map(gp.map((s, i) => [s, i]));
const digraphs = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
const mod = (a, m) => ((a % m) + m) % m;

assert.equal(pages.length, 39);
assert.equal(N, 9194);
assert.deepEqual([firstSeed, secondSeed], [23, 22]);

/**
 * Read original ciphertext C with one GP rune per slot.
 * The first output rune is an explicit plaintext IV. For i >= 1:
 * d = C_i - C_(i-1) mod 29
 * P_i = 28 if d=0, otherwise (d-1-K_i) mod 28.
 * K_(i+2)=(K_i+K_(i+1)+P_i%28) mod 28.
 * @param {number[]} cipher
 * @param {number} left
 * @param {number} right
 * @returns {number[]}
 */
function decrypt(cipher, left, right) {
  const result = [cipher[0]];
  let a = left;
  let b = right;
  for (let i = 1; i < cipher.length; i++) {
    const d = mod(cipher[i] - cipher[i - 1], 29);
    const p = d === 0 ? 28 : mod(d - 1 - a, 28);
    result.push(p);
    const next = mod(a + b + (p % 28), 28);
    a = b;
    b = next;
  }
  return result;
}

/**
 * Exact forward inverse using the same first public rune as a clear IV.
 * @param {number[]} plain
 * @param {number} left
 * @param {number} right
 * @returns {number[]}
 */
function encrypt(plain, left, right) {
  const result = [plain[0]];
  let a = left;
  let b = right;
  for (let i = 1; i < plain.length; i++) {
    const p = plain[i];
    const d = p === 28 ? 0 : 1 + mod(p + a, 28);
    result.push(mod(result[result.length - 1] + d, 29));
    const next = mod(a + b + (p % 28), 28);
    a = b;
    b = next;
  }
  return result;
}

/**
 * GP spelling from an English donor, under C/K, U/V, S/Z, C/Q merges.
 * Longest two-letter atomic runes precede one-character rune tokens.
 * @param {string} input
 * @returns {number[]}
 */
function nativeGP(input) {
  const clean = input.toUpperCase()
    .replaceAll('K', 'C')
    .replaceAll('V', 'U')
    .replaceAll('Z', 'S')
    .replaceAll('Q', 'C')
    .replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < clean.length;) {
    const di = digraphs.find((x) => clean.startsWith(x, i));
    const token = di || clean[i];
    const index = runeIndex.get(token);
    assert.notEqual(index, undefined, 'unmapped Latin GP symbol');
    out.push(index);
    i += token.length;
  }
  return out;
}

/**
 * GP29 coincidence, excluding self-pairs.
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, v) => s + v * (v - 1), 0)
    / (values.length * (values.length - 1));
}

/**
 * @param {number[]} decoded
 * @returns {{train:number, holdout:number, final:number}}
 */
function pageScores(decoded) {
  const train = [], holdout = [], final = [];
  for (let i = 0; i < decoded.length; i++) {
    const p = pageAt[i];
    if (p >= 16 && p <= 21) train.push(decoded[i]);
    if (p >= 40 && p <= 53) holdout.push(decoded[i]);
    if (p >= 54 && p <= 55) final.push(decoded[i]);
  }
  return {train: ioc(train), holdout: ioc(holdout), final: ioc(final)};
}

const originalDecoded = decrypt(original, firstSeed, secondSeed);
assert.deepEqual(encrypt(originalDecoded, firstSeed, secondSeed), original);
const doublets = original.reduce((s, x, i) => s + Number(i > 0 && x === original[i - 1]), 0);
assert.equal(doublets, 67);
const source = pageScores(originalDecoded);

const candidates = [];
for (let a = 0; a < 28; a++) {
  for (let b = 0; b < 28; b++) {
    const scores = pageScores(decrypt(original, a, b));
    candidates.push({a, b, ...scores});
  }
}
candidates.sort((x, y) => y.train - x.train);
const best = candidates[0];
const seedRank = candidates.findIndex((x) => x.a === firstSeed && x.b === secondSeed) + 1;
const maxima = Object.fromEntries(['train', 'holdout', 'final'].map(
  (field) => [field, Math.max(...candidates.map((x) => x[field]))]
));
const escapes = originalDecoded.filter((x, i) => i > 0 && x === 28).length;
assert.equal(escapes, 67);
assert.ok(maxima.train < 0.05);
assert.ok(maxima.holdout < 0.05);
console.log('ORIGINAL_SOURCE_SHA256', crypto.createHash('sha256').update(raw).digest('hex'));
console.log('ORIGINAL GP29 N, continuous p16-55, repeat escape', N, escapes);
console.log('SPIRAL_SEEDS', firstSeed, secondSeed, 'source IOC', source, 'train seed rank', seedRank);
console.log('BEST_784_IVS original training-selection', best);
console.log('MAX_ALL_784_IVS, independently separated page groups', maxima);
console.log('SOURCE_SEED_P16_DECODED first 120 GP runes:',
  originalDecoded.slice(0, 120).map((x) => gp[x]).join(''));
console.log('BEST_IV_P16_DECODED first 120 GP runes:',
  decrypt(original, best.a, best.b).slice(0, 120).map((x) => gp[x]).join(''));

const donors = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
for (const [name, file] of donors) {
  const donor = nativeGP(read(file));
  const native = donor.slice(9000, 9000 + N);
  assert.equal(native.length, N, name + ' donor lacks full source-shaped plant');
  const ciphertext = encrypt(native, firstSeed, secondSeed);
  assert.deepEqual(decrypt(ciphertext, firstSeed, secondSeed), native);
  assert.deepEqual(encrypt(decrypt(ciphertext, firstSeed, secondSeed), firstSeed, secondSeed), ciphertext);
  const nativeScores = pageScores(native);
  const wrongScores = pageScores(decrypt(ciphertext, 13, 19));
  const recoveredPlainCounts = native.filter((x) => x === 28).length;
  const plantedDoublets = ciphertext.reduce((n, x, i) => n + Number(i > 0 && x === ciphertext[i - 1]), 0);
  assert.equal(plantedDoublets, recoveredPlainCounts - Number(native[0] === 28));
  assert.ok(nativeScores.train > 0.05);
  assert.ok(nativeScores.holdout > 0.05);
  console.log('NATIVE_PLANT', name, 'decoded', N,
    'native IOC', nativeScores, 'wrong-IV IOC', wrongScores,
    'repeat-escape count', plantedDoublets);
}

// At any nonrepeat, R_i=(C_i-C_(i-1) mod29)-1, so the plaintext
// feedback update simplifies exactly to K_(i+2)=K_(i+1)+R_i mod28.
// The initially tempting two-state Fibonacci key loses one dimension.
// A zero-step escape instead updates K_(i+2)=K_i+K_(i+1).
for (let left = 0; left < 28; left += 3) {
  const p = decrypt(original, left, secondSeed);
  const seedEquivalent = decrypt(original, firstSeed, secondSeed);
  assert.deepEqual(p.slice(2), seedEquivalent.slice(2),
    'first key seed should affect only first cipher transition when d1!=0');
}
console.log('STATE_DEGENERACY first key seed cannot alter original decoded positions i>=2');
console.log('PASS: finite source-constrained GP28 plaintext-feedback negative, three independent full-book native plants, exact replay');
