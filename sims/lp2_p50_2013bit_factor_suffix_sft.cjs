'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const data = Buffer.from(grid.bytes);
assert.equal(data.length, 256);
assert.equal(crypto.createHash('sha256').update(data).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {bigint} n @param {bigint} p @returns {number} */
function valuation(n, p) {
  let count = 0;
  while (n !== 0n && n % p === 0n) {
    count++;
    n /= p;
  }
  return count;
}

/** @param {bigint} number @returns {number[]} */
function toGp29(number) {
  assert(number > 0n);
  const digits = [];
  for (let n = number; n > 0n; n /= 29n) {
    digits.push(Number(n % 29n));
  }
  return digits.reverse();
}

/** Longest exact overlap, including original page joins; returns positions for verification.
 * @param {number[]} pattern @param {number[]} text
 * @returns {{length:number, patternOffset:number, textOffset:number}}
 */
function longestOverlap(pattern, text) {
  let previous = new Uint16Array(text.length + 1);
  let best = { length: 0, patternOffset: -1, textOffset: -1 };
  for (let i = 0; i < pattern.length; i++) {
    const current = new Uint16Array(text.length + 1);
    for (let j = 0; j < text.length; j++) {
      if (pattern[i] === text[j]) {
        const length = previous[j] + 1;
        current[j + 1] = length;
        if (length > best.length) {
          best = { length, patternOffset: i + 1 - length, textOffset: j + 1 - length };
        }
      }
    }
    previous = current;
  }
  return best;
}

const N = data.reduce((n, byte) => (n << 8n) + BigInt(byte), 0n);
const factors = [[2n, 4], [3n, 3], [7n, 1], [13n, 1], [29n, 1], [179n, 2]];
let F = 1n;
for (const [prime, exponent] of factors) {
  assert.equal(valuation(N, prime), exponent);
  F *= prime ** BigInt(exponent);
}
assert.equal(F, 36528277968n);
assert.equal(N % F, 0n);
const quotient = N / F;
assert.equal(quotient.toString(2).length, 2013);

// This is conditional on a factorization found from the complete table.
// It does not establish an independent checksum, because the final bytes
// were visible when the divisibility factors were selected.
const prefix = data.subarray(0, 252).reduce((n, byte) => (n << 8n) + BigInt(byte), 0n);
const fourByteMaximum = 1n << 32n;
assert(F > fourByteMaximum);
const recovered = (-prefix * fourByteMaximum % F + F) % F;
assert(recovered < fourByteMaximum);
assert.equal(recovered, BigInt(data.readUInt32BE(252)));
assert.equal(recovered, 0xb424bd50n);

const stream = corpus.pages
  .filter(page => page.page <= 55 && page.indices && page.indices.length)
  .flatMap(page => page.indices);
assert.equal(stream.length, 12956);
const digits = toGp29(quotient);
assert.equal(digits.length, 415);
const variants = [
  ['forward', digits],
  ['reverse', [...digits].reverse()],
  ['negated', digits.map(value => (29 - value) % 29)],
  ['reverse-negated', digits.map(value => (29 - value) % 29).reverse()],
];
const overlapResults = variants.map(([name, sequence]) => ({ name, ...longestOverlap(sequence, stream) }));
for (const result of overlapResults) assert.equal(result.length, 4);

console.log(JSON.stringify({
  status: 'PASS',
  sourceHash: crypto.createHash('sha256').update(data).digest('hex'),
  factor: F.toString(),
  quotientBits: quotient.toString(2).length,
  recoveredLastFour: recovered.toString(16).padStart(8, '0'),
  gp29DigitCount: digits.length,
  originalRuneCount: stream.length,
  overlaps: overlapResults,
  classification: 'retrospective factor identity and negative direct-GP29 reuse; no plaintext or key',
}, null, 2));


/** Python 3 random.Random's MT19937 seeding and 32-bit tempering, for the
 * exact 2013-bit candidate seed Q. The historical source does not name
 * Python or MT19937. This is a restricted possible consumer, not provenance.
 */
class PythonMT {
  /** @param {bigint} seed */
  constructor(seed) {
    this.state = new Uint32Array(624);
    this.index = 624;
    const a = this.state;
    a[0] = 19650218;
    for (let i = 1; i < 624; i++) {
      a[i] = (Math.imul(1812433253, (a[i - 1] ^ (a[i - 1] >>> 30))) + i) >>> 0;
    }
    const words = [];
    for (let x = seed; x > 0n; x >>= 32n) words.push(Number(x & 0xffffffffn));
    if (!words.length) words.push(0);
    let i = 1;
    let j = 0;
    for (let k = Math.max(624, words.length); k > 0; k--) {
      a[i] = ((a[i] ^ Math.imul((a[i - 1] ^ (a[i - 1] >>> 30)), 1664525)) + words[j] + j) >>> 0;
      i++;
      j++;
      if (i >= 624) {
        a[0] = a[623];
        i = 1;
      }
      if (j >= words.length) j = 0;
    }
    for (let k = 623; k > 0; k--) {
      a[i] = ((a[i] ^ Math.imul((a[i - 1] ^ (a[i - 1] >>> 30)), 1566083941)) - i) >>> 0;
      i++;
      if (i >= 624) {
        a[0] = a[623];
        i = 1;
      }
    }
    a[0] = 0x80000000;
  }

  /** @returns {number} */
  nextU32() {
    const a = this.state;
    if (this.index >= 624) {
      for (let i = 0; i < 624; i++) {
        const z = ((a[i] & 0x80000000) | (a[(i + 1) % 624] & 0x7fffffff)) >>> 0;
        a[i] = (a[(i + 397) % 624] ^ (z >>> 1) ^ ((z & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      this.index = 0;
    }
    let x = a[this.index++];
    x ^= x >>> 11;
    x ^= (x << 7) & 0x9d2c5680;
    x ^= (x << 15) & 0xefc60000;
    x ^= x >>> 18;
    return x >>> 0;
  }

  /** Python3 random.randrange(29), using rejection from getrandbits(5).
   * @returns {number}
   */
  range29() {
    let x;
    do {
      x = this.nextU32() >>> 27;
    } while (x >= 29);
    return x;
  }

  /** Math.floor(29 * Python3 random.random()).
   * @returns {number}
   */
  float29() {
    const high27 = this.nextU32() >>> 5;
    const low26 = this.nextU32() >>> 6;
    return Math.floor(((high27 * 67108864 + low26) / 9007199254740992) * 29);
  }

  /** Direct 32-bit residue GP29 projection.
   * @returns {number}
   */
  remainder29() {
    return this.nextU32() % 29;
  }
}

const vector = [1517194729, 3483797104, 528230897, 1511315982,
  458434271, 1804140763, 1440820800, 1822339851,
  2103650447, 3916319472, 2821722878, 4094619000];
const vectorSource = new PythonMT(quotient);
assert.deepEqual(vector.map(() => vectorSource.nextU32()), vector);
const rangeControl = new PythonMT(quotient);
assert.deepEqual(Array.from({ length: 20 }, () => rangeControl.range29()),
  [11,25,3,11,3,13,10,13,15,21,19,25,11,25,8,25,24,20,3,27]);
const floatControl = new PythonMT(quotient);
assert.deepEqual(Array.from({ length: 20 }, () => floatControl.float29()),
  [10,3,3,9,14,19,17,10,7,21,2,17,4,8,10,8,18,24,4,20]);

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const count = new Uint32Array(29);
  for (const value of symbols) count[value]++;
  const n = symbols.length;
  return count.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}
const unsolvedPages = corpus.pages.filter(page => page.page <= 55 && page.indices?.length);
const chapterStarts = new Set([0,3,8,15,23,27,33,40,54]);
const inverses = [];
for (const clock of ['continuous', 'page', 'chapter']) {
  for (const projection of ['range29', 'float29', 'remainder29']) {
    let random = new PythonMT(quotient);
    let consumed = 0;
    const key = [];
    for (const page of unsolvedPages) {
      if (consumed && (clock === 'page' || (clock === 'chapter' && chapterStarts.has(page.page)))) {
        random = new PythonMT(quotient);
      }
      for (let i = 0; i < page.indices.length; i++) key.push(random[projection]());
      consumed += page.indices.length;
    }
    assert.equal(key.length, 12956);
    for (const differential of [false, true]) {
      for (const sign of [-1, 1]) {
        const output = stream.map((c, i) =>
          (c + (differential ? 29 - stream[Math.max(i - 1, 0)] : 0)
           + sign * key[i] + 58) % 29);
        inverses.push({ clock, projection, differential, sign, ioc: ioc(output) });
      }
    }
  }
}
assert.equal(inverses.length, 36);
const values = inverses.map(item => item.ioc);
assert(values.every(value => value > 0.03445 && value < 0.03452));
console.log(JSON.stringify({
  consumer: 'Python3-MT19937 quotient-seeded GP29',
  pythonCrossChecked: true,
  variants: inverses.length,
  originalIoc: ioc(stream),
  minimumIoc: Math.min(...values),
  maximumIoc: Math.max(...values),
  nativeLanguageBaseline: 'GP29-English is typically above 0.05',
  interpretation: 'No source-natural additive/differential GP29 decryption in this fixed consumer family',
}, null, 2));
