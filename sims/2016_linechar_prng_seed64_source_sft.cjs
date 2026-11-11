"use strict";

/**
 * SFT: 2016 signed-message line:character remainder -> 64-bit PRNG seed,
 * tested against the independently archived 2014 sexagesimal.bin bytes.
 *
 * Run from repository root:
 *   node sims/2016_linechar_prng_seed64_source_sft.cjs
 *
 * This is a finite source-level screen, not a proposed LP2 decryption.
 * Reference algorithms: OpenJDK SplittableRandom, Vigna xorshift papers,
 * and PCG's official minimal-C implementation (linked in companion report).
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const source = read("resources/cicada2014-sexagesimal-source.json");
const grid = read("resources/liber-primus/base60-grid.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");

const historic = source.decimal_values;
const later = grid.byte_rows.flat();
assert.equal(historic.length, 256);
assert.equal(later.length, 256);
assert.deepEqual(historic.slice(0, 4), [203, 231, 167, 186]);
assert.equal(crypto.createHash("sha256").update(Buffer.from(historic)).digest("hex"),
  source.source_sha256.binary);
assert.equal(historic.filter((v, i) => v !== later[i]).length, 10);

/** Fixed ordered GP tokens excluding the candidate "PRNG" extraction. */
const tokens = ["L", "C", "B", "P", "NG", "P", "A", "R", "R", "TH", "B", "P", "C"];
const digits = tokens.map((t) => corpus.translit.indexOf(t));
assert(digits.every((d) => d >= 0 && d < 29));
const fromBase29 = (seq) => seq.reduce((n, d) => n * 29n + BigInt(d), 0n);
const seed = fromBase29(digits);
const reverseSeed = fromBase29(digits.slice().reverse());
assert.equal(seed, 7144649572585460758n);
assert.equal(reverseSeed, 1934863664782322278n);

const MASK = (1n << 64n) - 1n;
const STEP = 0x9e3779b97f4a7c15n;

/** @param {bigint} initial @returns {() => bigint} */
function splitmix64(initial) {
  let x = initial & MASK;
  return () => {
    let z = (x = (x + STEP) & MASK);
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK;
    return (z ^ (z >> 31n)) & MASK;
  };
}
assert.equal(splitmix64(0n)(), 0xe220a8397b1dcdafn);

/** @param {bigint} initial @returns {() => bigint} */
function xorshift64star(initial) {
  let x = initial & MASK;
  return () => {
    x ^= x >> 12n;
    x ^= (x << 25n) & MASK;
    x ^= x >> 27n;
    return (x * 0x2545f4914f6cdd1dn) & MASK;
  };
}

/** @param {bigint} initial @returns {() => bigint} */
function xorshift64(initial) {
  let x = initial & MASK;
  return () => {
    x ^= (x << 13n) & MASK;
    x ^= x >> 7n;
    x ^= (x << 17n) & MASK;
    return x & MASK;
  };
}

/** @param {bigint} initial @returns {() => bigint} */
function xorshift128plus(initial) {
  const next = splitmix64(initial);
  let a = next(), b = next();
  return () => {
    let x = a;
    const y = b;
    a = y;
    x ^= (x << 23n) & MASK;
    x ^= x >> 17n;
    x ^= y ^ (y >> 26n);
    b = x & MASK;
    return (b + y) & MASK;
  };
}

/** PCG32 minimal-C engine with fixed odd increment. */
function pcg32(initial) {
  let x = initial & MASK;
  const increment = 1442695040888963407n;
  return () => {
    const old = x;
    x = (old * 6364136223846793005n + increment) & MASK;
    const shifted = ((old >> 18n) ^ old) >> 27n;
    const rot = Number(old >> 59n);
    return ((shifted >> BigInt(rot)) |
      (shifted << BigInt((-rot) & 31))) & 0xffffffffn;
  };
}

/** OpenJDK SplittableRandom's separate nextInt mixing path. */
function javaMix32(initial) {
  let x = initial & MASK;
  return () => {
    x = (x + STEP) & MASK;
    let z = ((x ^ (x >> 33n)) * 0x62a9d9ed799705f5n) & MASK;
    z = ((z ^ (z >> 28n)) * 0xcb24d0a5c88c35b3n) & MASK;
    return z >> 32n;
  };
}

const engines = [
  ["splitmix64", splitmix64, 8],
  ["xorshift64star", xorshift64star, 8],
  ["xorshift64", xorshift64, 8],
  ["xorshift128plus", xorshift128plus, 8],
  ["pcg32", pcg32, 4],
  ["javaMix32", javaMix32, 4]
];
const serializations = ["low", "high", "le", "be"];

/** @param {bigint} initial */
function candidates(initial) {
  const result = [];
  for (const [engineName, factory, width] of engines) {
    const next = factory(initial);
    const values = Array.from({length: 256}, () => next());
    for (const serialization of serializations) {
      const bytes = new Array(256);
      for (let i = 0; i < 256; i++) {
        const packed = serialization === "le" || serialization === "be";
        const value = values[packed ? Math.floor(i / width) : i];
        const byte = packed ? i % width : 0;
        const shift = serialization === "low" ? 0 :
          serialization === "high" ? 8 * (width - 1) :
          8 * (serialization === "le" ? byte : width - 1 - byte);
        bytes[i] = Number((value >> BigInt(shift)) & 255n);
      }
      result.push({engine: engineName, serialization, bytes});
    }
  }
  return result;
}

/** @param {number[]} proposed @param {number[]} original */
function score(proposed, original) {
  let matches = 0, longest = 0, run = 0;
  for (let i = 0; i < 256; i++) {
    if (proposed[i] === original[i]) {
      matches++;
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return {matches, longest};
}

const full = [];
for (const [orientation, initial] of [["forward", seed], ["reverse", reverseSeed]]) {
  for (const item of candidates(initial)) {
    full.push({
      seed: orientation,
      engine: item.engine,
      serialization: item.serialization,
      historical: score(item.bytes, historic),
      printed: score(item.bytes, later),
      first8: Buffer.from(item.bytes.slice(0, 8)).toString("hex")
    });
  }
}
assert.equal(full.length, 48);
full.sort((a, b) => b.historical.matches - a.historical.matches ||
  b.historical.longest - a.historical.longest);
assert.equal(full[0].historical.matches, 4);
assert.equal(full[0].historical.longest, 2);

const wrongSeedMaxima = [];
for (let delta = 1n; delta <= 128n; delta++) {
  let best = 0;
  for (const s of [seed + delta, reverseSeed + delta]) {
    for (const item of candidates(s)) {
      best = Math.max(best, score(item.bytes, historic).matches);
    }
  }
  wrongSeedMaxima.push(best);
}
const wrongAtLeastOriginal = wrongSeedMaxima.filter((x) =>
  x >= full[0].historical.matches).length;

console.log(JSON.stringify({
  schema: "2016-linechar-13token-64bit-prng-gate-v1",
  source_byte_sha256: source.source_sha256.binary,
  seed_gp_indices: digits,
  seed_decimal: String(seed),
  reversed_seed_decimal: String(reverseSeed),
  model_count: full.length,
  top_source_matches: full.slice(0, 12),
  max_printed_matches: Math.max(...full.map((x) => x.printed.matches)),
  shifted_seed_controls: wrongSeedMaxima.length,
  shifted_seed_controls_at_least_original: wrongAtLeastOriginal,
  wrong_seed_maximum: Math.max(...wrongSeedMaxima),
  conclusion: "No exact pre-2014 table reproduction; original-vs-plant gap."
}, null, 2));
