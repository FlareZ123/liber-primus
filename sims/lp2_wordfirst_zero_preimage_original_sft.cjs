'use strict';
/**
 * Original LP2 key-independent gate: word-initial affine-offset zero preimage.
 *
 * C[w,j] = C[w,j-1] + F[w,j](P[w,j]) (mod 29), j >= 1;
 * F[w,j] is a bijection of all 29 runes with its unique zero preimage at
 * P[w,0] + k (mod 29). Other 28 outputs are independently unrestricted.
 *
 * As a result, a within-word ciphertext doublet must coincide exactly with
 * a plaintext rune equal to word-first + k. Page-edge resets are conservatively
 * granted 32 FREE violations at the 32 source-documented carried words.
 *
 * Native book controls independently draw whole GP-encoded English words by
 * their exact original printed lengths. The probability distribution is
 * evaluated by an exact truncated probability-generating-function DP.
 *
 * Node 22 CommonJS SFT; read only; no dependencies or network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const Q = 29;
const MAX_LENGTH = 14;
const TOTAL = 12956;
const nByLength = new Uint32Array(MAX_LENGTH + 1);
const original = [];
let word = [], start = 0, runeCount = 0;
for (const ch of read('resources/liber-primus/lp2-transcription.txt')) {
  if (runeMap.has(ch)) {
    if (!word.length) start = runeCount;
    word.push(runeMap.get(ch));
    if (++runeCount === TOTAL) {
      original.push({start, indices:word});
      break;
    }
  } else if ('-.&'.includes(ch) && word.length) {
    original.push({start, indices:word});
    word = [];
  }
}
assert.equal(runeCount, TOTAL);
assert.equal(original.length, 2896);
for (const w of original) {
  assert(w.indices.length >= 1 && w.indices.length <= MAX_LENGTH);
  nByLength[w.indices.length]++;
}
assert.deepEqual(Array.from(nByLength.slice(1)),
  [83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3]);
let equalPairs = 0;
for (const w of original)
  for (let i = 1; i < w.indices.length; i++)
    equalPairs += Number(w.indices[i] === w.indices[i - 1]);
assert.equal(equalPairs, 63);
const pageCuts = new Set();
let offset = 0;
for (const p of gp.pages) {
  if (p.page >= 56) break;
  offset += p.indices.length;
  if (offset < TOTAL) pageCuts.add(offset);
}
assert.equal(pageCuts.size, 54);
let carriedWords = 0;
for (const w of original) {
  const stop = w.start + w.indices.length;
  if ([...pageCuts].some(cut => w.start < cut && cut < stop))
    carriedWords++;
}
assert.equal(carriedWords, 32);
const conservativeThreshold = equalPairs + carriedWords;
assert.equal(conservativeThreshold, 95);

const tokens = gp.translit.map((value, i) => ({value, i}))
  .sort((a, b) => b.value.length - a.value.length);
/** @param {string} spelling @returns {number[]} */
function nativeWord(spelling) {
  const text = spelling.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) { result.push(21); i += 3; continue; }
    if (text.startsWith('IO', i)) { result.push(27); i += 2; continue; }
    const token = tokens.find(t => text.startsWith(t.value, i));
    assert.ok(token, 'unknown native GP source token: ' + text.slice(i));
    result.push(token.i);
    i += token.value.length;
  }
  return result;
}
/** @param {number} x @returns {number} */
const mod = x => ((x % Q) + Q) % Q;
/** @param {number[]} plaintext @param {number} keyShift @returns {number[]} */
function encrypt(plaintext, keyShift) {
  const special = mod(plaintext[0] + keyShift);
  const ciphertext = [plaintext[0]];
  for (let j = 1; j < plaintext.length; j++) {
    const x = mod(plaintext[j] - special);
    const step = x === 0 ? 0 : 1 + ((x - 1 + 3 * j) % 28);
    ciphertext.push(mod(ciphertext.at(-1) + step));
  }
  return ciphertext;
}
/** @param {number[]} ciphertext @param {number} keyShift @returns {number[]} */
function decrypt(ciphertext, keyShift) {
  const plaintext = [ciphertext[0]];
  const special = mod(plaintext[0] + keyShift);
  for (let j = 1; j < ciphertext.length; j++) {
    const step = mod(ciphertext[j] - ciphertext[j - 1]);
    const x = step === 0 ? 0 : ((step - 1 - 3 * j) % 28 + 28) % 28 + 1;
    plaintext.push(mod(special + x));
  }
  return plaintext;
}
const witness = original[1476].indices;
assert.deepEqual(witness, [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18]);
const doubleSites = w => w.flatMap((v, i) =>
  i && v === w[i - 1] ? [i] : []);
assert.deepEqual(doubleSites(witness), [5, 11]);
const candidates = [];
for (const m of read('resources/control/english_wordfreq_textblob.txt')
  .matchAll(/^([a-z]+)\s+\d+$/gm)) {
  const w = nativeWord(m[1]);
  if (w.length !== 12 || w[5] !== w[11]) continue;
  if (w.slice(1).some((v, i) =>
    v === w[5] && i !== 4 && i !== 10)) continue;
  candidates.push({spelling:m[1], shift:mod(w[5] - w[0])});
}
assert.equal(candidates.length, 25);
assert.deepEqual(candidates.filter(c => c.shift === 13).map(c => c.spelling),
  ['compressible', 'counterpoise']);
for (const candidate of ['compressible', 'counterpoise']) {
  const plaintext = nativeWord(candidate);
  const ciphertext = encrypt(plaintext, 13);
  assert.deepEqual(doubleSites(ciphertext), [5, 11]);
  assert.deepEqual(decrypt(ciphertext, 13), plaintext);
}
assert.deepEqual(encrypt(decrypt(witness, 13), 13), witness);
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
assert.deepEqual(decrypt(encrypt(p57, 13), 13), p57);

/**
 * For the native GP word inventory, collect the number of times each
 * modulo-29 offset from its first rune recurs after word position zero.
 * @param {string} sourceText
 * @returns {Uint8Array[][]}
 */
function poolsFor(sourceText) {
  const pools = Array.from({length:MAX_LENGTH + 1}, () => []);
  for (const m of sourceText.matchAll(/[A-Za-z]+/g)) {
    const w = nativeWord(m[0]);
    if (w.length > MAX_LENGTH) continue;
    const counts = new Uint8Array(Q);
    for (let i = 1; i < w.length; i++)
      counts[mod(w[i] - w[0])]++;
    pools[w.length].push(counts);
  }
  for (let l = 1; l <= MAX_LENGTH; l++)
    if (nByLength[l]) assert.ok(pools[l].length > 0);
  return pools;
}
/**
 * Exact probability-generating-function convolution, truncating at 95.
 * Mass omitted above 95 cannot flow back into the accepted tail.
 * The native source controls draw each word independently with replacement
 * from their exact-rune-length word inventory.
 * @param {Uint8Array[][]} pools
 * @param {number} shift
 * @returns {{mean:number,p63:number,p95:number}}
 */
function exactTail(pools, shift) {
  const dp = new Float64Array(conservativeThreshold + 1);
  const next = new Float64Array(conservativeThreshold + 1);
  dp[0] = 1;
  let mean = 0;
  for (let l = 2; l <= MAX_LENGTH; l++) {
    const hist = new Float64Array(l);
    for (const wordCounts of pools[l]) hist[wordCounts[shift]]++;
    for (let h = 0; h < l; h++) {
      hist[h] /= pools[l].length;
      mean += nByLength[l] * h * hist[h];
    }
    for (let repeat = 0; repeat < nByLength[l]; repeat++) {
      next.fill(0);
      for (let count = 0; count <= conservativeThreshold; count++) {
        if (!dp[count]) continue;
        for (let h = 0; h < l && count + h <= conservativeThreshold; h++)
          next[count + h] += dp[count] * hist[h];
      }
      dp.set(next);
    }
  }
  let p63 = 0, p95 = 0;
  for (let i = 0; i <= conservativeThreshold; i++) {
    p95 += dp[i];
    if (i <= equalPairs) p63 += dp[i];
  }
  return {mean, p63, p95};
}
const controlDefs = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 214.89551960882875, 18, 1.6280301870607327e-18],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 219.98677652459727, 12, 2.0354641227583566e-19],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 195.35909290380275, 12, 6.255025673249446e-15]
];
const outcomes = [];
for (const [name, sourcePath, expectedLowestMean, expectedShift, expectedFamilyTail] of controlDefs) {
  const pools = poolsFor(read(sourcePath));
  const all = Array.from({length:Q}, (_, k) => ({k, ...exactTail(pools, k)}));
  const smallest = all.reduce((a, b) => b.mean < a.mean ? b : a);
  const familyTailBound = all.reduce((s, x) => s + x.p95, 0);
  assert.equal(smallest.k, expectedShift);
  assert.ok(Math.abs(smallest.mean - expectedLowestMean) < 1e-9);
  assert.ok(Math.abs(familyTailBound / expectedFamilyTail - 1) < 1e-9);
  assert.ok(familyTailBound < 1e-14);
  outcomes.push({
    source:name, originalLengthMatchedSourceWords:nByLength.reduce((s, x) => s + x, 0),
    lowestMeanOffset:smallest.k, lowestMean:smallest.mean,
    sourceShift13:all[13], unionBoundAll29OffsetsAt95:familyTailBound
  });
}
console.log(JSON.stringify({
  hypothesis:'lossless word-initial GP offset zero marker, arbitrary other 28 successor permutations',
  source:{runes:runeCount, words:original.length, withinWordDoublets:equalPairs, carriedWords, p27Witness:doubleSites(witness)},
  controls:{p27DictionaryCandidates:candidates.length, p27Shift13Words:['compressible','counterpoise'], solvedP57RoundTrip:p57.length},
  scope:'All 29 constant source-word initial offsets and exact word-length-matched independent original-GP English from three controls, including 32 page carry allowances',
  results:outcomes, recoveredUnknownPlaintext:false
}, null, 2));