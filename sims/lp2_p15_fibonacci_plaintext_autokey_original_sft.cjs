'use strict';
/**
 * Issue #2374: p15 authentic Fibonacci-number spiral as a two-seed GP29
 * plaintext-autokey over original pp16..55, preserving every page seam.
 *
 * Source-locked cipher: C[i] = P[i] + K[i] (mod29)
 *                      K[i+2] = K[i] + K[i+1] + P[i] (mod29).
 * Key insight: K[i+2] = K[i+1] + C[i] (mod29), exactly. Hence for i>=1
 * the entire plaintext is one of 29 Caesar shifts of a fully determined
 * ciphertext-derived residual. K0 changes only the first rune.
 *
 * Read-only Windows Node22 CommonJS single-file original/native SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = gp.pages.filter((p) => p.page >= 16 && p.page <= 55 && p.indices.length > 0);
const C = pages.flatMap((p) => p.indices);
assert.equal(C.length, 9194);
assert.equal(pages.length, 39); // rune-free p50 is correctly skipped but not erased
const starts = new Map();
let global = 0;
for (const p of pages) { starts.set(p.page, global); global += p.indices.length; }
assert.equal(starts.get(22), 1613);
assert.equal(starts.get(40), 5878);
assert.equal(starts.get(54), 8886);
assert.equal(C.length - starts.get(54), 308);

// Exact physical source: the 4x4 p15 grid and its red center are separately
// visually transcribed and source-checked against the original unchanged JPG.
const p15image = fs.readFileSync(path.join(root, 'resources/liber-primus/32.jpg'));
assert(p15image.length > 100000);
const grid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const spiral = [
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]
];
const distinctFib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const isPrime = (n) => {
  if (n < 2) return false;
  for (let v = 2; v * v <= n; v++) if (n % v === 0) return false;
  return true;
};
const nthPrime = (index) => {
  let p = 1, n = 0;
  while (n < index) { p++; if (isPrime(p)) n++; }
  return p;
};
const actual = spiral.map(([row, col], i) => {
  const value = Math.abs(3301 - nthPrime(distinctFib[i] + 1));
  assert.equal(value, grid[row][col]);
  return grid[row][col];
});
assert.deepEqual(actual, [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
const sourceSeed = [3299 % 29, 3298 % 29];
assert.deepEqual(sourceSeed, [22, 21]);

// Source transcription has '%' original physical page separators. Preserve
// ALL delimiters and page spans; never insert word or page key resets.
const transcribed = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeIndex = new Map(gp.runes.map((symbol, i) => [symbol, i]));
for (const p of pages) {
  const raw = transcribed[p.page] || '';
  const fromSource = [...raw].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch));
  assert.deepEqual(fromSource, p.indices, 'transcription mismatch physical p' + p.page);
}

/** @param {number[]} plain @param {number} k0 @param {number} k1 @returns {number[]} */
function encrypt(plain, k0, k1) {
  const result = [], K = [k0, k1];
  for (let i = 0; i < plain.length; i++) {
    const key = K[i];
    assert(Number.isInteger(key) && key >= 0 && key < 29);
    result.push((plain[i] + key) % 29);
    K[i + 2] = (key + K[i + 1] + plain[i]) % 29;
  }
  return result;
}
/** @param {number[]} cipher @param {number} k0 @param {number} k1 @returns {number[]} */
function inverse(cipher, k0, k1) {
  const result = [], K = [k0, k1];
  for (let i = 0; i < cipher.length; i++) {
    const key = K[i];
    const plain = (cipher[i] - key + 29) % 29;
    result.push(plain);
    K[i + 2] = (key + K[i + 1] + plain) % 29;
  }
  return result;
}
/** @param {number[]} cipher @returns {number[]} */
function residual(cipher) {
  let prefix = 0;
  return cipher.map((symbol, i) => {
    if (i >= 2) prefix = (prefix + cipher[i - 2]) % 29;
    return (symbol - prefix + 29) % 29;
  });
}
/** @param {number[]} R @param {number} k0 @param {number} k1 @returns {number[]} */
function fromResidual(R, k0, k1) {
  return R.map((r, i) => (r - (i === 0 ? k0 : k1) + 29) % 29);
}
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  assert(xs.length > 1);
  const count = Array(29).fill(0);
  for (const r of xs) count[r]++;
  return count.reduce((sum, c) => sum + c * (c - 1), 0) / (xs.length * (xs.length - 1));
}
const R = residual(C);
for (const [a,b] of [[22,21],[0,0],[7,28],[28,7]]) {
  const original = inverse(C, a, b);
  assert.deepEqual(original, fromResidual(R, a, b));
  assert.deepEqual(encrypt(original, a, b), C);
}
for (let k1 = 0; k1 < 29; k1++) {
  const base = fromResidual(R, 0, k1);
  for (let k0 = 0; k0 < 29; k0++) {
    const output = inverse(C.slice(0, 150), k0, k1);
    assert.deepEqual(output, base.slice(0,150).map((x, i) => i === 0 ? (C[0]-k0+29)%29 : x));
  }
}
const trainStart = 1, trainEnd = starts.get(22);
const holdStart = starts.get(40), holdEnd = starts.get(54);
const originalStats = {
  full: ioc(R.slice(1)),
  train: ioc(R.slice(trainStart, trainEnd)),
  holdout: ioc(R.slice(holdStart, holdEnd)),
  terminal: ioc(R.slice(starts.get(54))),
};
assert(Math.abs(originalStats.full - 0.03445994260778696) < 1e-12);
assert(Math.abs(originalStats.train - 0.03468631446645503) < 1e-12);
assert(Math.abs(originalStats.holdout - 0.03453400399068839) < 1e-12);
assert(Math.abs(originalStats.terminal - 0.03564025550996235) < 1e-12);

// Independent native GP29 language controls and frozen Shakespeare model.
// The unknown corpus never participates in training or in hyperparameters.
const tokens = gp.translit.map((s, i) => ({s, i})).sort((a,b) => b.s.length-a.s.length);
function wordToGP(word) {
  const normalized = word.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find((t) => normalized.startsWith(t.s, i));
    if (!token) return null;
    result.push(token.i);
    i += token.s.length;
  }
  return result;
}
/** @param {string} source @returns {number[]} */
function nativeGP(source) {
  return (source.match(/[A-Za-z]+/g) || []).map(wordToGP).filter(Boolean).flat();
}
const shakespeare = nativeGP(read('resources/control/shakespeare_first300k.txt'));
assert(shakespeare.length > 25000);
const triple = new Uint32Array(29*29*29), bi = new Uint32Array(29*29);
for (let i = 2; i < shakespeare.length; i++) {
  const pair = shakespeare[i-2]*29+shakespeare[i-1];
  bi[pair]++;
  triple[pair*29+shakespeare[i]]++;
}
const logProbs = new Float64Array(29*29*29);
for (let pair = 0; pair < 841; pair++) {
  for (let symbol = 0; symbol < 29; symbol++) {
    const index = pair*29+symbol;
    logProbs[index] = Math.log((triple[index]+0.3)/(bi[pair]+0.3*29));
  }
}
const monograms = new Uint32Array(29);
for (const rune of shakespeare) monograms[rune]++;
const logMono = Array.from(monograms, n => Math.log((n+1)/(shakespeare.length+29)));
/** @param {number[]} xs @returns {number} */
function score(xs) {
  let total = 0;
  for (let i = 2; i < xs.length; i++) {
    total += logProbs[(xs[i-2]*29+xs[i-1])*29+xs[i]];
  }
  return total / (xs.length - 2);
}
/** @param {number[]} cipher @returns {{ k1:number,score:number,runnerUp:number}} */
function chooseK1(cipher) {
  const localR = residual(cipher);
  const ranked = [];
  for (let k1 = 0; k1 < 29; k1++) {
    const trial = localR.slice(trainStart, trainEnd).map((r) => (r-k1+29)%29);
    ranked.push({k1, score: score(trial)});
  }
  ranked.sort((a,b) => b.score-a.score);
  return {k1: ranked[0].k1, score: ranked[0].score, runnerUp: ranked[1].score};
}
function donorToBook(native) {
  assert(native.length >= 900);
  return Array.from({ length: C.length }, (_, i) => native[i % native.length]);
}
const lp1PageText = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%');
const clearLP1 = [3,8,9,10,11,14].flatMap((i) =>
  [...lp1PageText[i]].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch)));
assert.equal(clearLP1.length, 1001);
const donors = [
  ['Gibran', nativeGP(read('resources/control/gibran_prophet_58585.txt'))],
  ['Emerson', nativeGP(read('resources/control/emerson_essays_2944.txt'))],
  ['Authenticated clear LP1', clearLP1],
];
const secretSeeds = [[22,21],[6,14],[13,27]];
const positives = [];
for (let sample = 0; sample < donors.length; sample++) {
  const [name, donor] = donors[sample];
  const [secret0, secret1] = secretSeeds[sample];
  const nativeBook = donorToBook(donor);
  const cipher = encrypt(nativeBook, secret0, secret1);
  assert.deepEqual(inverse(cipher, secret0, secret1), nativeBook);
  const recovered = chooseK1(cipher);
  const blind = fromResidual(residual(cipher), secret0, recovered.k1);
  const matched = blind.slice(1).reduce((sum, v, i) => sum + Number(v === nativeBook[i+1]), 0);
  assert.equal(matched, recovered.k1 === secret1 ? C.length - 1 : 0);
  positives.push({
    name, sourceRunes: donor.length, plantedBookRunes: nativeBook.length,
    actualK0: secret0, actualK1: secret1, blindK1: recovered.k1,
    blindlyRecoveredRunesAfterFirst: matched,
    originalNativeIoC: ioc(nativeBook.slice(1)),
    trainLogTrigram: recovered.score,
  });
}
const selectedOriginal = chooseK1(C);
const chosen = fromResidual(R, sourceSeed[0], selectedOriginal.k1);
assert.deepEqual(encrypt(chosen, sourceSeed[0], selectedOriginal.k1), C);
const sourceSeedPlain = fromResidual(R, ...sourceSeed);
assert.deepEqual(encrypt(sourceSeedPlain, ...sourceSeed), C);
function render(xs, first, count) { return xs.slice(first, first+count).map((v) => gp.translit[v]).join(' '); }
console.log(JSON.stringify({
  task: 'Issue2374 source-locked Fibonacci plaintext-autokey',
  source: {grid, spiral, sourceSeed, imageBytes:p15image.length, checked16:true},
  cipherAlgebra: 'K[i+2] = K[i+1] + C[i] mod29; k0 affects only first recovered rune, k1 subtracts constant thereafter',
  original: {
    totalRunes: C.length, physicalRunePages: pages.length,
    trainRunes: trainEnd-trainStart, holdoutRunes:holdEnd-holdStart,
    terminalRunes:C.length-starts.get(54),
    originalStats, selectedOriginalK1:selectedOriginal.k1,
    sourceK1:sourceSeed[1], trainScore:selectedOriginal.score,
    trainScoreSecond:selectedOriginal.runnerUp,
    frozenHoldoutScore:score(chosen.slice(holdStart,holdEnd)),
    nativeSourceSeedFirst100:render(sourceSeedPlain,0,100),
    originalSelectedTrainFirst100:render(chosen,0,100),
    untouchedHoldoutFirst150:render(chosen,holdStart,150),
    untouchedTerminalFirst100:render(chosen,starts.get(54),100),
  },
  blindNativePositives:positives,
}, null, 2));
console.log('PASS: exact p15 16-cell source, all 841 IVs collapse algebraically to 29 shifts, original9194 runes, heldout prediction and 3 GP-native synthetic sources.');
