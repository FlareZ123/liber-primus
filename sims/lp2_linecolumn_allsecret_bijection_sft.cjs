'use strict';

/**
 * Director #1526: all-secret physical-line-column substitution gate.
 *
 * Family: C[line,j] = pi_j(P[line,j]) with one arbitrary GP29 bijection pi_j
 * shared by every physical printed line. Equality at each line column is
 * therefore key-invariant.
 *
 * Run: node sims/lp2_linecolumn_allsecret_bijection_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const nativeText = read('resources/control/gibran_prophet_58585.txt');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @returns {number[][]} */
function unknownPhysicalLines() {
  const out = [];
  let runes = 0;
  for (const section of transcription.split(/^%$/m)) {
    const sectionLines = [];
    let sectionRunes = 0;
    for (const raw of section.split('/\n')) {
      const xs = [...raw].filter((ch) => runeIndex.has(ch))
        .map((ch) => runeIndex.get(ch));
      if (xs.length) {
        sectionLines.push(xs);
        sectionRunes += xs.length;
      }
    }
    if (runes + sectionRunes > 12956) break;
    out.push(...sectionLines);
    runes += sectionRunes;
    if (runes === 12956) break;
  }
  assert.equal(runes, 12956);
  assert.equal(out.length, 594);
  assert.equal(Math.max(...out.map((line) => line.length)), 26);
  return out;
}

/** @param {string} s @returns {number[]} */
function gpNative(s) {
  const words = s.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  const tokens = corpus.translit.map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  const out = [];
  for (const word of words) {
    for (let at = 0; at < word.length;) {
      if (word.startsWith('ING', at)) {
        out.push(21);
        at += 3;
        continue;
      }
      if (word.startsWith('IO', at)) {
        out.push(27);
        at += 2;
        continue;
      }
      const token = tokens.find((candidate) => word.startsWith(candidate.t, at));
      assert.ok(token, 'unknown GP spelling ' + word.slice(at));
      out.push(token.i);
      at += token.t.length;
    }
  }
  return out;
}

const sourceLines = unknownPhysicalLines();
const lengths = sourceLines.map((line) => line.length);
const offsetsByColumn = Array.from({length:26}, () => []);
let cursor = 0;
for (const length of lengths) {
  for (let j = 0; j < length; j++) offsetsByColumn[j].push(cursor + j);
  cursor += length;
}
assert.equal(cursor, 12956);
const source = sourceLines.flat();
const native = gpNative(nativeText);
assert.equal(native.length, 62492);
const windows = native.length - source.length + 1;
assert.equal(windows, 49537);

/**
 * Count equal unordered symbol pairs within every repeated physical-line
 * column. Any per-column bijection preserves this count exactly.
 * @param {number[]} stream
 * @param {number} start
 * @returns {number}
 */
function collisionCount(stream, start) {
  let hits = 0;
  for (const offsets of offsetsByColumn) {
    const counts = new Uint16Array(29);
    for (let i = 0; i < offsets.length; i++)
      counts[stream[start + offsets[i]]]++;
    for (let symbol = 0; symbol < 29; symbol++) {
      const n = counts[symbol];
      hits += n * (n - 1) / 2;
    }
  }
  return hits;
}

/** @returns {number} */
function eligiblePairs() {
  let total = 0;
  for (const offsets of offsetsByColumn)
    total += offsets.length * (offsets.length - 1) / 2;
  return total;
}

/** @returns {number} */
function absoluteMinimum() {
  let total = 0;
  for (const offsets of offsetsByColumn) {
    const n = offsets.length;
    const q = Math.floor(n / 29);
    const r = n % 29;
    total += r * q * (q + 1) / 2 + (29 - r) * q * (q - 1) / 2;
  }
  return total;
}

/** @returns {() => number} */
function prng() {
  let x = 0x1526c1ca;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/** @param {() => number} rand @returns {number[]} */
function permutation(rand) {
  const a = Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = rand() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Positive control: arbitrary secret pi_j on one native source-shaped plant. */
function plantedControl() {
  const plain = native.slice(12345, 12345 + source.length);
  const rand = prng();
  const keys = Array.from({length:26}, () => permutation(rand));
  const cipher = new Array(source.length);
  const recovered = new Array(source.length);
  for (let line = 0, at = 0; line < lengths.length; line++) {
    for (let j = 0; j < lengths[line]; j++, at++)
      cipher[at] = keys[j][plain[at]];
  }
  for (let line = 0, at = 0; line < lengths.length; line++) {
    for (let j = 0; j < lengths[line]; j++, at++) {
      const p = keys[j].indexOf(cipher[at]);
      assert.ok(p >= 0);
      recovered[at] = p;
    }
  }
  assert.deepEqual(recovered, plain);
  assert.equal(collisionCount(cipher, 0), collisionCount(plain, 0));
  return collisionCount(plain, 0);
}

const eligible = eligiblePairs();
const lower = absoluteMinimum();
const original = collisionCount(source, 0);
assert.equal(eligible, 3638562);
assert.equal(lower, 119276);
assert.equal(original, 126508);
const planted = plantedControl();

const nativeHits = new Int32Array(windows);
let min = Infinity;
let max = -Infinity;
let minAt = -1;
for (let start = 0; start < windows; start++) {
  const hits = collisionCount(native, start);
  nativeHits[start] = hits;
  if (hits < min) {
    min = hits;
    minAt = start;
  }
  if (hits > max) max = hits;
}
const sorted = Array.from(nativeHits).sort((a, b) => a - b);
/** @param {number} p @returns {number} */
const quantile = (p) => sorted[Math.ceil(p * sorted.length) - 1];
assert.ok(original < min);

console.log(JSON.stringify({
  source: {
    lines:lengths.length, runes:source.length, maxLine:26,
    hits:original, eligible, ioc:original/eligible,
    absolute29SymbolMinimum:lower,
    excessAboveAbsoluteMinimum:original-lower
  },
  nativeRegister: {
    source:'resources/control/gibran_prophet_58585.txt',
    runes:native.length, windows, min, minAt,
    p001:quantile(0.001), p01:quantile(0.01), p05:quantile(0.05),
    median:quantile(0.5), p95:quantile(0.95), max,
    minimumGap:min-original
  },
  plant: {hits:planted, exactInverse:true, equalityInvariant:true},
  decision:'ORIGINAL_BELOW_EVERY_NATIVE_WINDOW'
}, null, 2));
