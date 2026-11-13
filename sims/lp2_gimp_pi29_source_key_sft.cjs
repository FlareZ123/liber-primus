"use strict";

/**
 * Source-seeded GIMP/GLib PRNG as a literal GP29 additive key.
 *
 * Independent question from the earlier 28-way ciphertext-difference test:
 * does the same source-visible GIMP Dissolve seed directly encrypt each original
 * LP2 GP29 rune via C = P +/- K (mod 29)?
 *
 * Run: node sims/lp2_gimp_pi29_source_key_sft.cjs
 * Node.js 22, CommonJS, built-in modules only.
 * This is a bounded original-input cipher test, not a creator-selected key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
const reference = corpus.pages.find(p => p.page === 57).indices;
assert.equal(reference.length, 95);

const SEED = 314159265;
const UNIT = 2.3283064365386962890625e-10
  + (2.3283064365386962890625e-10) ** 2;

/** Reproduces the historical GLib 2.38.2 GRand random-version-20 engine. */
class GRand {
  /** @param {number} seed Unsigned 32-bit seed. */
  constructor(seed) {
    this.mt = new Uint32Array(624);
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      this.mt[i] = Math.imul(69069, this.mt[i - 1]) >>> 0;
    }
    this.mti = 624;
  }

  /** @returns {number} Untempered unsigned 32-bit output post-tempering. */
  int() {
    const mt = this.mt;
    if (this.mti >= 624) {
      let y;
      let i = 0;
      for (; i < 227; i++) {
        y = ((mt[i] & 0x80000000) | (mt[i + 1] & 0x7fffffff)) >>> 0;
        mt[i] = (mt[i + 397] ^ (y >>> 1)
          ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      for (; i < 623; i++) {
        y = ((mt[i] & 0x80000000) | (mt[i + 1] & 0x7fffffff)) >>> 0;
        mt[i] = (mt[i - 227] ^ (y >>> 1)
          ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      y = ((mt[623] & 0x80000000) | (mt[0] & 0x7fffffff)) >>> 0;
      mt[623] = (mt[396] ^ (y >>> 1)
        ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      this.mti = 0;
    }
    let y = mt[this.mti++] >>> 0;
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }
}

const master = new GRand(SEED);
const table = Array.from({length: 4096}, () => master.int());
assert.equal(table[0], 1428665816);

/**
 * @param {"master"|"first-row"|"table"} source
 * @param {"global"|"page"} clock
 * @param {"scaled"|"modulo"} projection
 * @returns {number[]} Secret-pad candidates in the unchanged LP2 page order.
 */
function pad(source, clock, projection) {
  const output = [];
  let rng = new GRand(source === "first-row" ? table[0] : SEED);
  let position = 0;
  for (const page of pages) {
    if (clock === "page") {
      rng = new GRand(source === "first-row" ? table[0] : SEED);
      position = 0;
    }
    for (const ignored of page.indices) {
      const word = source === "table" ? table[position++ % table.length] : rng.int();
      output.push(projection === "scaled"
        ? Math.floor(word * UNIT * 29) : word % 29);
    }
  }
  return output;
}

/** @param {number[]} symbols */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((s, count) => s + count * (count - 1), 0)
    / (symbols.length * (symbols.length - 1));
}
const mod29 = n => (n % 29 + 29) % 29;
const ciphertext = pages.flatMap(p => p.indices);
const plainPlant = Array.from({length: ciphertext.length},
  (_, i) => reference[i % reference.length]);

const observations = [];
for (const source of ["master", "first-row", "table"]) {
  for (const clock of ["global", "page"]) {
    for (const projection of ["scaled", "modulo"]) {
      const key = pad(source, clock, projection);
      assert.equal(key.length, 12956);
      // Validate encryption and its inverse against real source-native p57 GP.
      const plantedCipher = plainPlant.map((v, i) => (v + key[i]) % 29);
      const plantedDecode = plantedCipher.map((v, i) => mod29(v - key[i]));
      assert.deepEqual(plantedDecode, plainPlant);
      for (const sign of [-1, +1]) {
        const recovered = ciphertext.map((v, i) => mod29(v + sign * key[i]));
        const reencrypted = recovered.map((v, i) => mod29(v - sign * key[i]));
        assert.deepEqual(reencrypted, ciphertext);
        observations.push({
          source, clock, projection, inverseSign: sign,
          ioc: ioc(recovered),
          firstThirty: recovered.slice(0, 30).map(i => corpus.translit[i]),
        });
      }
    }
  }
}

assert.equal(observations.length, 24);
const sorted = observations.slice().sort((a, b) => b.ioc - a.ioc);
const minimum = sorted[sorted.length - 1].ioc;
const maximum = sorted[0].ioc;
assert(Math.abs(minimum - 0.03444537930178192) < 1e-14);
assert(Math.abs(maximum - 0.03451897101718503) < 1e-14);
assert(maximum < 0.04, "original remains far from native-GP plaintext IoC");
console.log(JSON.stringify({
  source: "original LP2 unsolved pp0-55; exact native GP 12,956-rune stream",
  historicalKeySource: "GIMP Dissolve 314159265, GLib GRand 2.38.2",
  sourceSeed: SEED, firstRowSeed: table[0], keysTried: observations.length,
  originalIoC: ioc(ciphertext),
  nativeGPPositiveIoC: ioc(plainPlant),
  minimum, maximum, highest: sorted.slice(0, 4),
  decision: "No original GP-native plaintext recovered by a direct source-PRNG additive key."
}, null, 2));
