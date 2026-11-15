'use strict';

/**
 * Exhaust all partitions of the original 729-rune LP2 pp0-2 chapter into
 * thirteen GP-prime-length blocks. For each block an arbitrary unknown
 * fixed 29-symbol substitution alphabet is granted. An equality-pair
 * count is invariant under every such alphabet.
 *
 * Execute with Node.js 22 on Windows 11. Read only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const primes = corpus.prime;
const source = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
const length = 729;
const blockCount = 13;
const thresholdNum = 1005;
const thresholdDen = 24890;
const pairDen = primes.map((p) => p * (p - 1) / 2);
assert.deepStrictEqual(corpus.pages.slice(0, 3).map((page) => page.indices.length),
  [262, 266, 201]);
assert.equal(source.length, length);
assert.equal(primes.length, 29);

/**
 * Compute exact same-glyph unordered pair count for each prime-length
 * segment, in all positions of one GP29 reference.
 * @param {number[]} letters
 * @returns {Uint16Array[]}
 */
function pairCaches(letters) {
  const caches = [];
  for (const width of primes) {
    const counts = new Uint16Array(29);
    const cache = new Uint16Array(letters.length - width + 1);
    let eq = 0;
    for (let i = 0; i < width; i += 1) {
      eq += counts[letters[i]];
      counts[letters[i]] += 1;
    }
    for (let pos = 0; pos < cache.length; pos += 1) {
      cache[pos] = eq;
      if (pos + width < letters.length) {
        const oldValue = letters[pos];
        const nextValue = letters[pos + width];
        counts[oldValue] -= 1;
        eq -= counts[oldValue];
        eq += counts[nextValue];
        counts[nextValue] += 1;
      }
    }
    caches.push(cache);
  }
  return caches;
}

/**
 * Integer max-score dynamic program over all thirteen-block prime cuts.
 * sign=+1: max(24890*same - 1005*all) on source.
 * sign=-1: max(1005*all - 24890*same) on native English.
 * All integers are exactly representable as JS numbers.
 * @param {Uint16Array[]} caches
 * @param {number} offset
 * @param {1|-1} sign
 * @param {boolean} witness
 * @returns {{score:number, lengths:number[]|null, equalPairs:number, allPairs:number}}
 */
function optimize(caches, offset, sign, witness = false) {
  let previous = new Float64Array(length + 1).fill(-Infinity);
  previous[0] = 0;
  const back = witness
    ? Array.from({length: blockCount + 1},
      () => new Int8Array(length + 1).fill(-1))
    : null;
  for (let blocks = 1; blocks <= blockCount; blocks += 1) {
    const next = new Float64Array(length + 1).fill(-Infinity);
    for (let end = 2 * blocks;
      end <= length - 2 * (blockCount - blocks); end += 1) {
      let best = -Infinity;
      let bestK = -1;
      for (let k = 0; k < primes.length; k += 1) {
        const first = end - primes[k];
        if (first < 0) break;
        const previousScore = previous[first];
        if (previousScore === -Infinity) continue;
        const samePairs = caches[k][offset + first];
        const score = previousScore + sign *
          (thresholdDen * samePairs - thresholdNum * pairDen[k]);
        if (score > best) {
          best = score;
          bestK = k;
        }
      }
      next[end] = best;
      if (back) back[blocks][end] = bestK;
    }
    previous = next;
  }
  const score = previous[length];
  assert.ok(Number.isFinite(score));
  if (!back) return {score, lengths: null, equalPairs: 0, allPairs: 0};
  const lengths = [];
  let end = length;
  let equalPairs = 0;
  let allPairs = 0;
  for (let blocks = blockCount; blocks >= 1; blocks -= 1) {
    const k = back[blocks][end];
    assert.ok(k >= 0);
    lengths.unshift(primes[k]);
    equalPairs += caches[k][offset + end - primes[k]];
    allPairs += pairDen[k];
    end -= primes[k];
  }
  assert.equal(end, 0);
  assert.equal(lengths.reduce((n, p) => n + p, 0), length);
  assert.equal(score, sign *
    (thresholdDen * equalPairs - thresholdNum * allPairs));
  return {score, lengths, equalPairs, allPairs};
}

const initial = optimize(pairCaches(source), 0, 1, true);
assert.equal(initial.score, 0);
assert.equal(initial.equalPairs, 1005);
assert.equal(initial.allPairs, 24890);
assert.deepStrictEqual(initial.lengths,
  [31, 107, 83, 67, 61, 43, 79, 29, 31, 41, 67, 83, 7]);
console.log('CERTIFIED: original 13-prime-block IoC maximum = 1005/24890 = ' +
  (1005 / 24890).toFixed(12));
console.log('EXACT maximizing block-length witness: ' +
  initial.lengths.join(','));

const translitTokens = corpus.translit
  .map((symbol, index) => ({symbol, index}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/**
 * GP reference encodings. sourceCalibrated adds authentic Cicada-era
 * ING→NG, IO→IA and QU→CW source spellings.
 * @param {string} prose
 * @param {boolean} sourceCalibrated
 * @returns {number[]}
 */
function encodeGP(prose, sourceCalibrated = false) {
  const output = [];
  for (const word of prose.toUpperCase().match(/[A-Z]+/g) || []) {
    const native = sourceCalibrated
      ? word.replace(/QU/g, 'CW').replace(/ING/g, 'NG').replace(/IO/g, 'IA')
      : word;
    const normalized = native.replace(/[KQ]/g, 'C')
      .replace(/V/g, 'U').replace(/Z/g, 'S');
    for (let p = 0; p < normalized.length;) {
      const found = translitTokens.find((item) =>
        normalized.startsWith(item.symbol, p));
      assert.ok(found, 'Bad GP normalization at ' + normalized.slice(p));
      output.push(found.index);
      p += found.symbol.length;
    }
  }
  return output;
}

const referenceSpecs = [
  ['shakespeare_first300k.txt', 218800, 1718],
  ['gibran_prophet_58585.txt', 63114, 492],
  ['emerson_essays_2944.txt', 324630, 2551]
];
let windows = 0;
let originalBoundViolations = 0;
let nearest = {score: -Infinity, file: '', offset: -1};
for (const [filename, expectedRunes, expectedWindows] of referenceSpecs) {
  const words = fs.readFileSync(
    path.join(root, 'resources', 'control', filename), 'utf8');
  const encoded = encodeGP(words);
  assert.equal(encoded.length, expectedRunes);
  const cache = pairCaches(encoded);
  let count = 0;
  let possible = 0;
  let highest = -Infinity;
  for (let offset = 0; offset + length <= encoded.length; offset += 127) {
    const {score} = optimize(cache, offset, -1);
    if (score >= 0) {
      possible += 1;
      originalBoundViolations += 1;
    }
    if (score > highest) highest = score;
    if (score > nearest.score) nearest = {score, file: filename, offset};
    count += 1;
  }
  assert.equal(count, expectedWindows);
  windows += count;
  console.log(filename + ': windows=' + count +
    ', at-or-below-original-bound=' + possible +
    ', highest integer threshold score=' + highest);
}
assert.equal(windows, 4761);
assert.equal(originalBoundViolations, 0);
assert.ok(nearest.score < 0);
console.log('PASS: all 4761 GP-native reference windows violate original necessary bound');
console.log('Closest passage: ' + nearest.file + '@' + nearest.offset +
  ', integer margin=' + nearest.score);

// Independent orthodox Cicada spelling census. The original fixed control
// above deliberately retains the exact historical experiment register;
// this second census prevents transferring its statistical conclusion
// uncritically to the authenticated solved-page ING and IO conventions.
let calibratedWindows = 0;
let calibratedPossible = 0;
let nearestCalibrated = {score: -Infinity, filename: '', offset: -1};
for (const [filename] of referenceSpecs) {
  const prose = fs.readFileSync(
    path.join(root, 'resources', 'control', filename), 'utf8');
  const encoded = encodeGP(prose, true);
  const cache = pairCaches(encoded);
  let windowsHere = 0;
  let possibleHere = 0;
  for (let offset = 0; offset + length <= encoded.length; offset += 127) {
    const {score} = optimize(cache, offset, -1);
    if (score >= 0) {
      possibleHere += 1;
      calibratedPossible += 1;
    }
    if (score > nearestCalibrated.score) {
      nearestCalibrated = {score, filename, offset};
    }
    windowsHere += 1;
  }
  calibratedWindows += windowsHere;
  console.log('AUTHENTIC GP spelling ' + filename + ': runes=' + encoded.length +
    ', windows=' + windowsHere + ', source-bound overlaps=' + possibleHere);
}
assert.ok(calibratedWindows > 4400);
assert.equal(calibratedPossible, 0);
assert.ok(nearestCalibrated.score < 0);
console.log('PASS: all ' + calibratedWindows +
  ' source-calibrated GP reference windows also violate source bound');
console.log('Nearest authentic-spelling window: ' +
  nearestCalibrated.filename + '@' + nearestCalibrated.offset +
  ', integer margin=' + nearestCalibrated.score);

console.log('No unknown-page plaintext or original cipher key recovered.');
