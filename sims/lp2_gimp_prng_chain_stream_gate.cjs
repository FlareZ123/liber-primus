"use strict";

/**
 * Direct 28-way nonzero-difference comparison with historical GLib GRand
 * GIMP Dissolve seed314159265. Version22 is the normal GLib 2.38.2 behavior;
 * version20 exists only if G_RANDOM_VERSION=2.0 selects legacy compatibility.
 *
 * This test compares fully prescribed keystreams, not arbitrary raster
 * positions, and cannot by itself establish a real LP2 cipher or key.
 * Run: node sims/lp2_gimp_prng_chain_stream_gate.cjs
 * Node.js 22; read-only; no dependencies beyond the repository corpus.
 *
 * Original source: https://github.com/GNOME/glib/blob/2.38.2/glib/grand.c
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

const source = corpus.pages
  .filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(source.length, 12956);
const steps = source.slice(1).map((r, i) => (r - source[i] + 29) % 29);
const nonzero = steps.filter(r => r !== 0);
assert.deepEqual([steps.length, steps.length - nonzero.length, nonzero.length],
  [12955, 86, 12869]);
const counts = Array(29).fill(0);
for (const value of steps) counts[value]++;
assert.deepEqual(counts.slice(1), [
  459, 504, 440, 438, 446, 430, 470, 426, 510, 497, 455, 449, 504, 474,
  470, 449, 404, 434, 474, 467, 463, 421, 486, 468, 467, 457, 476, 431
]);

const RANGE20_UNIT = 2.3283064365386962890625e-10
  + 2.3283064365386962890625e-10 ** 2;

class GRand {
  /** @param {number} seed
   * @param {20 | 22} version
   */
  constructor(seed, version) {
    this.version = version;
    this.mt = new Uint32Array(624);
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      this.mt[i] = version === 20
        ? Math.imul(69069, this.mt[i - 1]) >>> 0
        : (Math.imul(1812433253,
          this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)) + i) >>> 0;
    }
    this.i = 624;
  }

  /** @returns {number} */
  int() {
    const m = this.mt;
    if (this.i >= 624) {
      let y, k = 0;
      for (; k < 227; k++) {
        y = ((m[k] & 0x80000000) | (m[k + 1] & 0x7fffffff)) >>> 0;
        m[k] = (m[k + 397] ^ (y >>> 1)
          ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      for (; k < 623; k++) {
        y = ((m[k] & 0x80000000) | (m[k + 1] & 0x7fffffff)) >>> 0;
        m[k] = (m[k - 227] ^ (y >>> 1)
          ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      y = ((m[623] & 0x80000000) | (m[0] & 0x7fffffff)) >>> 0;
      m[623] = (m[396] ^ (y >>> 1)
        ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      this.i = 0;
    }
    let value = m[this.i++] >>> 0;
    value ^= value >>> 11;
    value ^= (value << 7) & 0x9d2c5680;
    value ^= (value << 15) & 0xefc60000;
    value ^= value >>> 18;
    return value >>> 0;
  }

  /** Historical g_rand_int_range(1,29) for selected version.
   * @returns {number} 1 to 28 inclusive.
   */
  range28() {
    if (this.version === 20) {
      return 1 + Math.floor(this.int() * RANGE20_UNIT * 28);
    }
    // maxvalue = UINT32_MAX - (2^32 mod 28) = 0xfffffffb.
    // Match GLib 2.2 rejection rather than introducing modulo bias.
    let value;
    do {
      value = this.int();
    } while (value > 0xfffffffb);
    return 1 + value % 28;
  }
}

/** @param {number[]} candidate @returns {{exact:number,inverse:number}} */
function score(candidate) {
  let exact = 0;
  let inverse = 0;
  for (let i = 0; i < nonzero.length; i++) {
    exact += Number(candidate[i] === nonzero[i]);
    inverse += Number(candidate[i] === 29 - nonzero[i]);
  }
  return {exact, inverse};
}

const observed = {};
for (const version of [20, 22]) {
  const master = new GRand(314159265, version);
  const table = Array.from({length:4096}, () => master.int());
  const row = new GRand(table[0], version);
  const expectedTable = version === 20
    ? [1428665816, 524548268, 880683179, 1476340919,
      3157760488, 860933783, 570040902, 504240023]
    : [3721122731, 618219707, 807213306, 3144837749,
      3447982176, 3230631767, 755972506, 1398685501];
  assert.deepEqual(table.slice(0, 8), expectedTable);
  const expectedRow = version === 20
    ? [2319284436, 3986822731, 985467004, 3952971030,
      1583521782, 830117388, 2278999093, 3112095481]
    : [505524582, 4277517655, 1702989131, 912900261,
      1432505218, 4108960502, 2270003630, 316039421];
  assert.deepEqual(Array.from({length:8}, () => row.int()), expectedRow);

  const direct = new GRand(314159265, version);
  const row0 = new GRand(table[0], version);
  const directValues = Array.from({length:nonzero.length},
    () => direct.range28());
  const rowValues = Array.from({length:nonzero.length},
    () => row0.range28());
  const tableValues = Array.from({length:nonzero.length}, (_, i) => {
    const raw = table[i % table.length];
    // This alternative interprets the 4,096 original uint32 row seeds as
    // a cyclic 1-D stream; one word consumes one output, no modulo rejection.
    return 1 + (version === 20
      ? Math.floor(raw * RANGE20_UNIT * 28)
      : raw % 28);
  });
  const result = {
    row0Seed: table[0],
    root: score(directValues),
    firstRow: score(rowValues),
    repeatedRowSeeds: score(tableValues),
  };
  observed[version] = result;
}

assert.deepEqual(observed[20], {
  row0Seed:1428665816,
  root:{exact:438,inverse:425},
  firstRow:{exact:456,inverse:460},
  repeatedRowSeeds:{exact:432,inverse:457}
});
assert.deepEqual(observed[22], {
  row0Seed:3721122731,
  root:{exact:452,inverse:435},
  firstRow:{exact:478,inverse:497},
  repeatedRowSeeds:{exact:460,inverse:441}
});
console.log(JSON.stringify({
  hypothesis:"LP2 nonzero adjacent GP29 differences equal GIMP-generated nonzero field steps",
  comparisonCount:nonzero.length,
  expectedMatchesPerSign:nonzero.length / 28,
  glib38Default:"G_RANDOM_VERSION unset => 2.2, version22",
  alternate:"G_RANDOM_VERSION=2.0 => version20",
  observed,
  result:"Neither fixed historical stream matches beyond chance; no plaintext or selected key."
}, null, 2));
