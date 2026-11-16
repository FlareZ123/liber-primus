/**
 * Bounded test of the GIMP Dissolve PRNG as an LP2 key source.
 *
 * The GIMP Dissolve implementation uses a GRand seeded with 314159265 to
 * generate 4096 row seeds; each row then uses a fresh GRand and
 * g_rand_int_range(0, 255) per pixel. This reproduces the GLib MT19937 and
 * GLib 2.2 range-reduction behavior without external dependencies.
 *
 * Tests only two natural seed-derived streams:
 *   1. raw GRand(seed=314159265) outputs modulo GP29;
 *   2. row-major prefix of the actual GIMP 4096-row dissolve field, modulo GP29.
 *
 * Each is tested as a direct additive key and as a chained additive key,
 * with continuous and physical-page-reset chain state. This is a narrow
 * original-input gate, not a general search over offsets or transforms.
 *
 * Run from repository root:
 *   node sims/lp2_gimp_dissolve_keystream_gate.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages
  .filter((p) => p.page < 56 && p.indices.length)
  .map((p) => p.indices);
const ciphertext = pages.flat();
const N = ciphertext.length;
assert.equal(N, 12956);
assert.equal(pages.length, 55); // p50 is numeric, not a rune-text page.

class GRand {
  constructor(seed) {
    this.mt = new Uint32Array(624);
    this.index = 624;
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const previous = this.mt[i - 1];
      this.mt[i] = (Math.imul(
        1812433253, previous ^ (previous >>> 30)
      ) + i) >>> 0;
    }
  }

  int() {
    if (this.index >= 624) {
      for (let i = 0; i < 624; i++) {
        const y = (this.mt[i] & 0x80000000) |
          (this.mt[(i + 1) % 624] & 0x7fffffff);
        this.mt[i] = (
          this.mt[(i + 397) % 624] ^
          (y >>> 1) ^
          ((y & 1) ? 0x9908b0df : 0)
        ) >>> 0;
      }
      this.index = 0;
    }

    let y = this.mt[this.index++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  // GLib 2.2 g_rand_int_range(rand, 0, end): unbiased modulo reduction.
  range(end) {
    assert(Number.isInteger(end) && end > 0);
    const leftover0 = (0x80000000 % end) * 2;
    const leftover = leftover0 >= end ? leftover0 - end : leftover0;
    const maxValue = 0xffffffff - leftover;
    let value;
    do {
      value = this.int();
    } while (value > maxValue);
    return value % end;
  }
}

function gimpDissolveFieldPrefix(length) {
  const seedGenerator = new GRand(314159265);
  const rowSeeds = Array.from({ length: 4096 }, () => seedGenerator.int());
  const field = [];
  let firstRow = null;

  for (let y = 0; field.length < length; y++) {
    const rowGenerator = new GRand(rowSeeds[y % 4096]);
    const count = Math.min(4096, length - field.length);
    const row = [];
    for (let x = 0; x < count; x++) {
      const value = rowGenerator.range(255);
      field.push(value);
      row.push(value);
    }
    if (y === 0) firstRow = row.slice(0, 16);
  }

  return {
    values: field,
    rowSeeds: rowSeeds.slice(0, 4),
    firstRow: firstRow || []
  };
}

function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const numerator = counts.reduce((sum, count) =>
    sum + count * (count - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

function decrypt(key, mode) {
  const plaintext = [];
  let previousCipher = 0;

  for (const page of pages) {
    for (let j = 0; j < page.length; j++) {
      const i = plaintext.length;
      const current = page[j];
      let value;

      if (mode === 'direct') {
        value = current - key[i];
      } else if (mode === 'chain-continuous') {
        value = current - previousCipher - key[i];
      } else if (mode === 'chain-page-reset') {
        value = current - (j === 0 ? 0 : previousCipher) - key[i];
      } else {
        throw new Error('Unknown mode: ' + mode);
      }

      plaintext.push((value % 29 + 29) % 29);
      previousCipher = current;
    }
  }

  return plaintext;
}

function stepMatchCount(key, resetAtPage) {
  let matches = 0;
  let i = 0;
  let previous = 0;
  for (const page of pages) {
    for (let j = 0; j < page.length; j++, i++) {
      const step = (page[j] - (j === 0 && resetAtPage ? 0 : previous) + 29) % 29;
      if (step === key[i]) matches++;
      previous = page[j];
    }
  }
  return matches;
}

function summarize(key) {
  const modes = ['direct', 'chain-continuous', 'chain-page-reset'];
  return modes.map((mode) => {
    const plaintext = decrypt(key, mode);
    const counts = Array(29).fill(0);
    for (const value of plaintext) counts[value]++;
    const sample = plaintext.slice(0, 240)
      .map((value) => corpus.translit[value])
      .join('');
    return {
      mode,
      ioc: indexOfCoincidence(plaintext),
      maxFrequency: Math.max(...counts) / plaintext.length,
      sample
    };
  });
}

const rawGenerator = new GRand(314159265);
const rawKey = Array.from({ length: N }, () => rawGenerator.int() % 29);

const field = gimpDissolveFieldPrefix(N);
const fieldKey = field.values.map((value) => value % 29);

// Implementation controls: the row seed and first pixel draws agree with
// the local system GLib g_rand_new_with_seed/g_rand_int_range implementation.
assert.deepEqual(field.rowSeeds, [
  3721122731, 618219707, 807213306, 3144837749
]);
assert.deepEqual(field.firstRow, [
  87, 10, 191, 6, 133, 152, 5, 71,
  134, 199, 88, 235, 186, 95, 169, 95
]);

const baseline = 1 / 29;
const result = {
  source: {
    seed: 314159265,
    rowSeedCount: 4096,
    pixelRange: '[0,255)',
    pages: pages.length,
    ciphertextRunes: N
  },
  controls: {
    firstFourRowSeeds: field.rowSeeds,
    firstSixteenFieldValues: field.firstRow,
    glibControlMatched: true
  },
  randomBaselineIOC: baseline,
  rawGRand: {
    stepMatchesContinuous: stepMatchCount(rawKey, false),
    stepMatchesPageReset: stepMatchCount(rawKey, true),
    decryptions: summarize(rawKey)
  },
  dissolveFieldRowMajorPrefix: {
    stepMatchesContinuous: stepMatchCount(fieldKey, false),
    stepMatchesPageReset: stepMatchCount(fieldKey, true),
    decryptions: summarize(fieldKey)
  }
};

console.log(JSON.stringify(result, null, 2));
