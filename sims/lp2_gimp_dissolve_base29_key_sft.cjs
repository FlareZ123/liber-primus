/**
 * Source-frozen GIMP Dissolve -> BASE29 stream test against original LP2.
 *
 * Context:
 * - GIMP 2.8.x Dissolve uses g_rand_new_with_seed(314159265)
 *   to generate a 4096-entry guint32 row-seed table.
 * - Cicada's signed 2013 TCP source documents BASE29 (3301 -> 3QO).
 * - This test joins those operations in one explicitly conditional key model.
 *
 * Run from repository root: node sims/lp2_gimp_dissolve_base29_key_sft.cjs
 * No guesses, network access, file writes, or key search.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

/** A bit-exact MT19937 uint32 generator, matching GLib GRand single-seed mode. */
class GimpMT {
  /** @param {number} seed */
  constructor(seed) {
    this.state = new Uint32Array(624);
    this.state[0] = seed >>> 0;
    this.index = 624;
    for (let i = 1; i < 624; i++) {
      const prev = this.state[i - 1];
      this.state[i] = (Math.imul(1812433253, prev ^ (prev >>> 30)) + i) >>> 0;
    }
  }

  /** @returns {number} */
  next() {
    if (this.index === 624) {
      for (let i = 0; i < 624; i++) {
        const x = (this.state[i] & 0x80000000) |
          (this.state[(i + 1) % 624] & 0x7fffffff);
        this.state[i] = (this.state[(i + 397) % 624] ^
          (x >>> 1) ^ ((x & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      this.index = 0;
    }
    let y = this.state[this.index++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }
}

/**
 * Big-endian fixed-width BASE29 numeric digits. The 2013 signed source
 * fixes radix and digit order, but does NOT prescribe fixed width seven.
 * @param {number} n Unsigned 32-bit integer.
 * @param {number} width
 * @returns {number[]}
 */
function base29(n, width) {
  const out = Array(width).fill(0);
  for (let i = width - 1; i >= 0; i--) {
    out[i] = n % 29;
    n = Math.floor(n / 29);
  }
  assert.equal(n, 0, 'BASE29 width too small');
  return out;
}

/** @param {number} seed @returns {number[]} */
function gimpTableAsGP(seed) {
  const prng = new GimpMT(seed);
  const digits = [];
  for (let i = 0; i < 4096; i++) {
    digits.push(...base29(prng.next(), 7));
  }
  return digits;
}

/**
 * @param {number[]} text GP ordinal indices.
 * @param {number[]} key GP ordinal indices.
 * @param {boolean} feedback Whether ciphertext predecessor is included.
 * @returns {number[]}
 */
function encipher(text, key, feedback) {
  const out = [];
  for (let i = 0; i < text.length; i++) {
    const prior = feedback ? (i ? out[i - 1] : 0) : 0;
    out.push((text[i] + key[i] + prior) % 29);
  }
  return out;
}

/** @param {number[]} text @param {number[]} key @param {boolean} feedback @returns {number[]} */
function decipher(text, key, feedback) {
  const out = [];
  for (let i = 0; i < text.length; i++) {
    const prior = feedback ? (i ? text[i - 1] : 0) : 0;
    out.push((text[i] - key[i] - prior + 58) % 29);
  }
  return out;
}

/** @param {number[]} arr @returns {{ioc:number, highest:number, e:number, o:number}} */
function stats(arr) {
  const bins = Array(29).fill(0);
  for (const x of arr) bins[x]++;
  return {
    ioc: bins.reduce((total, n) => total + n * (n - 1), 0) /
      (arr.length * (arr.length - 1)),
    highest: Math.max(...bins),
    e: bins[18],
    o: bins[3]
  };
}

/**
 * Encode the particular preserved solved-LP1 sentence used as a
 * natural-language control under GP digraph conventions.
 * @param {string} latin
 * @param {string[]} translit
 * @returns {number[]}
 */
function toGP(latin, translit) {
  const terms = translit.map((t, idx) => [t, idx])
    .sort((a, b) => b[0].length - a[0].length);
  const clean = latin.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let p = 0; p < clean.length;) {
    const next = terms.find(([t]) => clean.startsWith(t, p));
    assert.ok(next, 'No GP transliteration at position ' + p);
    out.push(next[1]);
    p += next[0].length;
  }
  return out;
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
  ));
  const pages = corpus.pages.filter(p => p.page <= 55);
  const cipher = pages.flatMap(p => p.indices);
  assert.equal(cipher.length, 12956);
  assert.equal(corpus.translit.length, 29);

  // GLib g_rand_new_with_seed(314159265) verified against installed libglib.
  const expected10 = [
    3721122731, 618219707, 807213306, 3144837749, 3447982176,
    3230631767, 755972506, 1398685501, 3196876378, 1337812403
  ];
  const check = new GimpMT(314159265);
  assert.deepEqual(expected10.map(() => check.next()), expected10);
  assert.deepEqual(base29(3301, 3), [3, 26, 24]); // signed 2013 '3QO'.

  const pad = gimpTableAsGP(314159265);
  assert.equal(pad.length, 28672);
  assert.deepEqual(pad.slice(0, 7), [6, 7, 12, 4, 23, 16, 27]);

  const native = toGP(
    'THE PRIMES ARE SACRED THE TOTIENT FUNCTION IS SACRED ' +
    'ALL THINGS SHOULD BE ENCRYPTED', corpus.translit
  );
  for (const mode of [false, true]) {
    assert.deepEqual(decipher(encipher(native, pad, mode), pad, mode), native);
    assert.deepEqual(encipher(decipher(cipher, pad, mode), pad, mode), cipher);
  }

  const plain = decipher(cipher, pad, false);
  const feedback = decipher(cipher, pad, true);
  const wrong = decipher(cipher, gimpTableAsGP(314159266), false);
  const words = a => a.map(x => corpus.translit[x]).join('');
  const sha256 = crypto.createHash('sha256').update(Buffer.from(cipher)).digest('hex');
  const report = {
    classification: 'conditional direct-key negative, not plaintext',
    originalSource: 'resources/liber-primus/lp2-corpus.json',
    originalIndicesSha256: sha256,
    runes: cipher.length,
    generator: 'GIMP 2.8.x fixed Dissolve row-seed MT19937 table',
    sourceSeed: 314159265,
    rowSeeds: 4096,
    keySerialization: '7 big-endian BASE29 digits per uint32',
    keyDigits: pad.length,
    successControls: {
      glibFirst10: true,
      signed2013Base29: true,
      knownProseLength: native.length,
      knownProseIOC: stats(native).ioc,
      reversibleBothModes: true
    },
    output: {
      original: stats(cipher),
      direct: stats(plain),
      ciphertextFeedback: stats(feedback),
      wrongSeed: stats(wrong),
      directFirst100: words(plain.slice(0, 100)),
      feedbackFirst100: words(feedback.slice(0, 100)),
      directP55All76: words(plain.slice(-76))
    },
    evidenceLimit: 'No original instruction chooses this key role, numeric width, ' +
      'ciphertext feedback, or starting clock. The source default is not ' +
      'an author-chosen key. Both frozen decoders produce no GP-native prose.'
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

main();
