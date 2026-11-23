'use strict';

/**
 * Reproduce one historically source-selected GIMP 2.8 Dissolve MT19937
 * additive keystream conjecture on original unknown LP2 GP29 runes.
 * Windows Node22 CommonJS; read-only SFT, no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

class MT19937 {
  /** @param {number} seed */
  constructor(seed) {
    this.index = 624;
    this.state = new Uint32Array(624);
    this.state[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const t = this.state[i - 1];
      this.state[i] = (Math.imul(1812433253, t ^ (t >>> 30)) + i) >>> 0;
    }
  }

  /** @returns {number} unsigned uniform 32-bit integer, GLib g_rand_int equivalent */
  next() {
    if (this.index >= 624) {
      for (let i = 0; i < 624; i++) {
        const t = (this.state[i] & 0x80000000) |
          (this.state[(i + 1) % 624] & 0x7fffffff);
        this.state[i] = this.state[(i + 397) % 624] ^
          (t >>> 1) ^ ((t & 1) ? 0x9908b0df : 0);
      }
      this.index = 0;
    }
    let t = this.state[this.index++];
    t ^= t >>> 11;
    t ^= (t << 7) & 0x9d2c5680;
    t ^= (t << 15) & 0xefc60000;
    t ^= t >>> 18;
    return t >>> 0;
  }
}

const seed = 314159265;
const expectedGlibValues = [
  3721122731, 618219707, 807213306, 3144837749,
  3447982176, 3230631767, 755972506, 1398685501,
  3196876378, 1337812403, 909895126, 1889049173,
];
const mtControl = new MT19937(seed);
assert.deepEqual(expectedGlibValues.map(() => mtControl.next()),
  expectedGlibValues, 'historical GLib 32-bit positive vector');

/** @param {number[]} values */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const value of values) hist[value]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {number[]} runes
 * @param {"continuous" | "page-reset"} clock
 * @param {number} sign
 * @returns {number[]}
 */
function convert(runes, clock, sign) {
  let mt = new MT19937(seed);
  const output = [];
  let cursor = 0;
  for (const page of corpus.pages.filter((p) => p.page <= 55)) {
    if (clock === 'page-reset') mt = new MT19937(seed);
    for (const rune of runes.slice(cursor, cursor + page.indices.length)) {
      output.push((rune + sign * (mt.next() % 29) + 29) % 29);
    }
    cursor += page.indices.length;
  }
  assert.equal(cursor, runes.length);
  return output;
}
const pages = corpus.pages.filter((p) => p.page <= 55);
const original = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 56);
assert.equal(original.length, 12956);
assert.equal(corpus.pages[50].indices.length, 0);
assert.ok(ioc(original) < 0.035);

const expectedScores = {
  'continuous-minus': 0.03446403937728731,
  'continuous-plus': 0.03446276439128534,
  'page-reset-minus': 0.034486190769601806,
  'page-reset-plus': 0.03451120194360296,
};

for (const clock of /** @type {const} */ (['continuous', 'page-reset'])) {
  for (const sign of [-1, 1]) {
    const plain = convert(original, clock, sign);
    assert.deepEqual(convert(plain, clock, -sign), original,
      'exact original forward replay');
    const key = clock + (sign < 0 ? '-minus' : '-plus');
    const score = ioc(plain);
    assert.ok(Math.abs(score - expectedScores[key]) < 1e-12, key);
    const preview = plain.slice(0, 80)
      .map((index) => corpus.translit[index]).join('');
    console.log('ORIGINAL ' + key + ' IoC=' + score.toFixed(14) +
      ' p0=' + preview);
  }
}

// Synthetic original-solved native positive: authenticated p57 is clear native GP.
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
for (const clock of /** @type {const} */ (['continuous', 'page-reset'])) {
  const prefix = original.slice();
  prefix.splice(0, known.length, ...known);
  const encrypted = convert(prefix, clock, 1);
  const recovered = convert(encrypted, clock, -1);
  assert.deepEqual(recovered.slice(0, known.length), known);
  assert.ok(ioc(known) > 0.05);
}
console.log('PASS native 95-rune GP29 solved-p57 encrypt/decrypt plants, ' +
  'GLib MT19937 vector, all original runes and four source-fixed inverses.');
console.log('No authenticated LP2 key/plaintext. GIMP 314159265 is a software default.');


/**
 * Separately fixed known chain-cipher rule, using the SAME historical MT
 * stream. This inverse is motivated by the rare original GP29 adjacent
 * repeats, not by anything explicitly inscribed in the GIMP artifact.
 * @param {number[]} ciphertext
 * @param {"continuous"|"page-reset"} clock
 * @param {number} sign
 * @returns {number[]}
 */
function decodeDerivative(ciphertext, clock, sign) {
  let mt = new MT19937(seed);
  let previous = 0;
  let cursor = 0;
  const out = [];
  for (const page of pages) {
    if (clock === 'page-reset') {
      mt = new MT19937(seed);
      previous = 0;
    }
    for (const c of ciphertext.slice(cursor, cursor + page.indices.length)) {
      const delta = (c - previous + 29) % 29;
      out.push((delta + sign * (mt.next() % 29) + 29) % 29);
      previous = c;
    }
    cursor += page.indices.length;
  }
  assert.equal(cursor, ciphertext.length);
  return out;
}

/**
 * @param {number[]} plaintext
 * @param {"continuous"|"page-reset"} clock
 * @param {number} sign
 * @returns {number[]}
 */
function encodeDerivative(plaintext, clock, sign) {
  let mt = new MT19937(seed);
  let previous = 0;
  let cursor = 0;
  const out = [];
  for (const page of pages) {
    if (clock === 'page-reset') {
      mt = new MT19937(seed);
      previous = 0;
    }
    for (const p of plaintext.slice(cursor, cursor + page.indices.length)) {
      const current = (previous + p - sign * (mt.next() % 29) + 29) % 29;
      out.push(current);
      previous = current;
    }
    cursor += page.indices.length;
  }
  assert.equal(cursor, plaintext.length);
  return out;
}

const derivativeExpected = {
  'continuous-minus': 0.034483715882850256,
  'continuous-plus': 0.03449473600087488,
  'page-reset-minus': 0.03446573758779591,
  'page-reset-plus': 0.03451331517477463,
};
for (const clock of /** @type {const} */ (['continuous', 'page-reset'])) {
  for (const sign of [-1, 1]) {
    const plain = decodeDerivative(original, clock, sign);
    assert.deepEqual(encodeDerivative(plain, clock, sign), original,
      'original full derivative forward replay');
    const key = clock + (sign < 0 ? '-minus' : '-plus');
    const interior = [];
    let cursor = 0;
    for (const page of pages) {
      interior.push(...plain.slice(cursor + 1, cursor + page.indices.length));
      cursor += page.indices.length;
    }
    assert.equal(interior.length, 12901);
    const score = ioc(interior);
    assert.ok(Math.abs(score - derivativeExpected[key]) < 1e-12, key);
    const first = plain.slice(0, 70).map((index) => corpus.translit[index]).join('');
    console.log('ORIGINAL derivative ' + key + ' inner-page IoC=' +
      score.toFixed(14) + ' p0=' + first);
    const testPlain = original.slice();
    testPlain.splice(0, known.length, ...known);
    const cipher = encodeDerivative(testPlain, clock, sign);
    assert.deepEqual(decodeDerivative(cipher, clock, sign)
      .slice(0, known.length), known);
  }
}
console.log('PASS fixed GIMP-source MT19937 ciphertext differential plus ' +
  'native-rune plants, all four original full-source cases.');


// Independently printed p49–51 radix60 32×8 table is the only complete
// 256-byte numeric image-like register. Check the first, strictly default
// GIMP 32×8 field against all 256 cells. No fitting of coordinate offsets.
const p50Table = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const originalBytes = p50Table.byte_rows.flat();
assert.equal(originalBytes.length, 256);
assert.deepEqual(originalBytes.slice(0, 8),
  [203, 231, 167, 186, 97, 237, 126, 183]);
const mtBytes = new MT19937(seed);
const raw = Array.from({ length: 256 }, () => mtBytes.next());
const low8 = raw.map((n) => n & 255);
const high8 = raw.map((n) => n >>> 24);
const rowTableMT = new MT19937(seed);
const first32RowSeeds = Array.from({ length: 32 }, () => rowTableMT.next());
const gimpPixelField = first32RowSeeds.flatMap((rowSeed) => {
  const rowMT = new MT19937(rowSeed);
  return Array.from({ length: 8 }, () => rowMT.next() % 255);
});
// 2013 GLib g_rand_int_range(0,255) positive-vector check, row0:
assert.deepEqual(gimpPixelField.slice(0, 8),
  [87, 10, 191, 6, 133, 152, 5, 71]);
const countEquals = (a) =>
  originalBytes.reduce((n, b, i) => n + (b === a[i] ? 1 : 0), 0);
assert.deepEqual([
  countEquals(low8), countEquals(high8), countEquals(gimpPixelField),
], [1, 2, 2]);
console.log('PASS independent p50 radix60 printed 32x8 source has only' +
  ' 1 / 2 / 2 identical same-position bytes versus first GIMP-MT low8/' +
  'high8/native row-seeded Dissolve pixels; no shared literal 256-byte tape.');
