'use strict';

/**
 * A complete reversible source-selected candidate, not an authenticated cipher.
 * Original p15 has sixteen Fibonacci-prime spiral cells, in red-start order.
 * Flora-framed pp40-55 are sixteen physical pages; dropping their two red
 * opening headings leaves exactly 3299 ciphertext runes, the red p15 number.
 * A standard MT19937 random stream seeded with the corresponding spiral cell
 * supplies a nonzero-step modulo-29 rank-28 coder, one draw per rune.
 *
 * The use of MT19937, mod28 output, IV=0, and the decoder is conjectural.
 * Run: node sims/lp2_p15_spiral_mt19937_flora_direct_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const seeds = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
assert.equal(seeds.length, 16);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages[50].indices.length, 0);

class MT19937 {
  /** @param {number} seed */
  constructor(seed) {
    this.words = new Uint32Array(624);
    this.words[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const v = this.words[i - 1];
      this.words[i] = (Math.imul(1812433253, v ^ (v >>> 30)) + i) >>> 0;
    }
    this.index = 624;
  }

  /** @returns {number} */
  nextUint32() {
    if (this.index === 624) {
      for (let i = 0; i < 624; i++) {
        const x = (this.words[i] & 0x80000000) |
          (this.words[(i + 1) % 624] & 0x7fffffff);
        this.words[i] = (this.words[(i + 397) % 624] ^
          (x >>> 1) ^ ((x & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      this.index = 0;
    }
    let y = this.words[this.index++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }
}

/**
 * @param {number[]} cipher
 * @param {number} seed
 * @returns {number[]}
 */
function decode(cipher, seed) {
  const prng = new MT19937(seed);
  let previous = 0;
  return cipher.map(current => {
    const step = (current - previous + 29) % 29;
    const random = prng.nextUint32() % 28;
    previous = current;
    return step === 0 ? 28 : (step - 1 - random + 28) % 28;
  });
}

/**
 * @param {number[]} plain
 * @param {number} seed
 * @returns {number[]}
 */
function encode(plain, seed) {
  const prng = new MT19937(seed);
  let previous = 0;
  return plain.map(symbol => {
    assert(symbol >= 0 && symbol <= 28);
    const random = prng.nextUint32() % 28;
    const current = symbol === 28 ? previous :
      (previous + 1 + ((symbol + random) % 28)) % 29;
    previous = current;
    return current;
  });
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const freq = Array(29).fill(0);
  for (const i of a) freq[i]++;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) /
    (a.length * (a.length - 1));
}

const generator = new MT19937(5489);
assert.deepEqual(Array.from({length: 3}, () => generator.nextUint32()),
  [3499211612, 581869302, 3890346734],
  'Canonical published C++ MT19937 seed-5489 vector');

const clearControl = corpus.pages[57].indices;
assert.equal(clearControl.length, 95);
const planted = encode(clearControl, seeds[0]);
assert.deepEqual(decode(planted, seeds[0]), clearControl,
  'Authentic clear 95-rune PARABLE plant must recover exactly');
assert.deepEqual(encode(decode(planted, seeds[0]), seeds[0]), planted);

const sections = [];
const all = [];
for (let i = 0; i < 16; i++) {
  const page = i + 40;
  const beginning = page === 40 ? 8 : page === 54 ? 9 : 0;
  const cipher = corpus.pages[page].indices.slice(beginning);
  const plaintext = decode(cipher, seeds[i]);
  assert.deepEqual(encode(plaintext, seeds[i]), cipher,
    'Exact GP29 original roundtrip on physical p' + page);
  all.push(...plaintext);
  sections.push({
    page,
    seed: seeds[i],
    runeCount: plaintext.length,
    opening25: plaintext.slice(0, 25).map(x => corpus.translit[x]).join(' ')
  });
}
assert.equal(all.length, 3299);
const outputIoC = ioc(all);
assert(Math.abs(outputIoC - 0.03517375112843611) < 1e-12,
  'Stable original numerical output for this complete candidate');
assert(ioc(clearControl) > 0.06);

console.log(JSON.stringify({
  claim: 'Exact original-cipher candidate rejected as native GP29 plaintext',
  originalPages: 'p40-p55',
  originalRuneCount: all.length,
  originalClearReferenceIoC: ioc(clearControl),
  candidateIoC: outputIoC,
  plantedClearReferenceRecovered: clearControl.length,
  exactOriginalCipherReencryption: all.length,
  prng: 'standard MT19937 seed/init, 32-bit output modulo 28',
  iv: 0,
  rank: 'zero-step to GP symbol28; other steps invert with one random value',
  sections
}, null, 2));
