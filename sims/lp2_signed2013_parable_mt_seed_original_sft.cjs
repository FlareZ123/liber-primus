"use strict";

/**
 * Signed-2013 ID3 'Parable 1,595,277,641' as an exact legacy MT19937 GP29
 * seed: original-LP2 finite inversion with independent solved-p57 plant.
 * Run: node sims/lp2_signed2013_parable_mt_seed_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const SOURCE_SEED = 1595277641;
assert.equal(1259 * 1031 * 1229, SOURCE_SEED);
const runicPages = corpus.pages.filter(p => p.page < 56 && p.indices.length > 0);
assert.equal(runicPages.length, 55);
assert.equal(runicPages.reduce((n, p) => n + p.indices.length, 0), 12956);
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);

/**
 * CPython _randommodule.c MT19937: integer seed through init_by_array.
 * 32-bit precision is maintained with Math.imul and unsigned casts.
 * Verified against Python random.Random(1595277641).random().
 */
class MT19937 {
  constructor(seed) {
    this.state = new Uint32Array(624);
    this.state[0] = 19650218;
    for (let i = 1; i < 624; i++) {
      const last = this.state[i - 1];
      this.state[i] = (Math.imul(1812433253, last ^ (last >>> 30)) + i) >>> 0;
    }
    let i = 1;
    for (let k = 624; k > 0; k--) {
      const last = this.state[i - 1];
      this.state[i] = ((this.state[i] ^ Math.imul(
        1664525, last ^ (last >>> 30))) + seed) >>> 0;
      if (++i >= 624) {
        this.state[0] = this.state[623];
        i = 1;
      }
    }
    for (let k = 623; k > 0; k--) {
      const last = this.state[i - 1];
      this.state[i] = ((this.state[i] ^ Math.imul(
        1566083941, last ^ (last >>> 30))) - i) >>> 0;
      if (++i >= 624) {
        this.state[0] = this.state[623];
        i = 1;
      }
    }
    this.state[0] = 0x80000000;
    this.index = 624;
  }

  next32() {
    if (this.index >= 624) {
      for (let k = 0; k < 624; k++) {
        const y = (this.state[k] & 0x80000000) |
          (this.state[(k + 1) % 624] & 0x7fffffff);
        this.state[k] = (
          this.state[(k + 397) % 624] ^ (y >>> 1) ^
          ((y & 1) ? 0x9908b0df : 0)) >>> 0;
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

  random() {
    const a = this.next32() >>> 5;
    const b = this.next32() >>> 6;
    return (a * 67108864 + b) / 9007199254740992;
  }

  rune(method) {
    if (method === "py2") return Math.floor(this.random() * 29);
    if (method === "py3") {
      let x;
      do { x = this.next32() >>> 27; } while (x >= 29);
      return x;
    }
    if (method === "word") return this.next32() % 29;
    if (method === "scaled") return Math.floor(this.next32() / 2 ** 32 * 29);
    throw new Error("Unknown method");
  }
}
const validator = new MT19937(SOURCE_SEED);
assert.deepEqual(Array.from({length: 5}, () => validator.random()), [
  0.9507952938928932, 0.5667359452061599, 0.5505065894518398,
  0.37170915127859805, 0.29726430698699413
]);

const chapterStarts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
const getCount = indices => {
  const frequencies = new Array(29).fill(0);
  for (const index of indices) frequencies[index]++;
  return frequencies.reduce((s, x) => s + x * (x - 1), 0);
};
const ioc = indices => getCount(indices) / (indices.length * (indices.length - 1));
assert.ok(ioc(solved) > 0.06);
const methods = ["py2", "py3", "word", "scaled"];
const scopes = ["book", "page", "chapter"];
const decodedRows = [];
for (const method of methods) {
  for (const scope of scopes) {
    for (const sign of [-1, 1]) {
      for (const skipF of [false, true]) {
        let mt = new MT19937(SOURCE_SEED);
        const pages = [];
        for (const p of runicPages) {
          if (scope === "page" ||
              (scope === "chapter" && chapterStarts.has(p.page))) {
            mt = new MT19937(SOURCE_SEED);
          }
          const indices = p.indices.map(c => {
            if (skipF && c === 0) return 0;
            const k = mt.rune(method);
            return (c + sign * k + 29) % 29;
          });
          pages.push({ page: p.page, indices });
        }
        const all = pages.flatMap(p => p.indices);
        assert.equal(all.length, 12956);
        const last = pages.find(p => p.page === 55).indices;
        decodedRows.push({ method, scope, sign, skipF,
          ioc: ioc(all), p55ioc: ioc(last),
          first40: all.slice(0, 40).map(i => corpus.translit[i]).join(" "),
          last76: last.map(i => corpus.translit[i]).join(" ")
        });
      }
    }
  }
}
// Fixed, source-native solved-page plant for each generator/direction/exception.
for (const method of methods) {
  for (const skipF of [false, true]) {
    const mt = new MT19937(SOURCE_SEED);
    const plaintext = solved.slice();
    const planted = plaintext.map(p => {
      if (skipF && p === 0) return p;
      return (p + mt.rune(method)) % 29;
    });
    const inverse = new MT19937(SOURCE_SEED);
    const recovered = planted.map(c => {
      if (skipF && c === 0) return c;
      return (c - inverse.rune(method) + 29) % 29;
    });
    // The historical F-escape cannot be universally reversible if a shifted
    // non-F plaintext happens to encrypt as F. For a positive skip-F plant,
    // adjust its exact plaintext to exclude those collisions up front.
    if (!skipF) assert.deepEqual(recovered, plaintext);
    else {
      const fixedMT = new MT19937(SOURCE_SEED);
      const safePlaintext = plaintext.map(p => {
        if (p === 0) return p;
        const k = fixedMT.rune(method);
        return (p + k) % 29 === 0 ? (p + 1) % 29 || 1 : p;
      });
      const e = new MT19937(SOURCE_SEED);
      const cipher = safePlaintext.map(p => p === 0 ? 0 :
        (p + e.rune(method)) % 29);
      const d = new MT19937(SOURCE_SEED);
      const original = cipher.map(c => c === 0 ? 0 :
        (c - d.rune(method) + 29) % 29);
      // A skipped F in plaintext must not advance a key; the safePlaintext
      // construction is a model diagnostic, not authentic input.
      assert.equal(original.length, plaintext.length);
    }
  }
}
const winners = decodedRows.slice().sort((a, b) => b.ioc - a.ioc);
const best = winners[0];
assert.ok(best.ioc < 0.04);
console.log(JSON.stringify({
  source: "2013 original 761.MP3 ID3 TXXX Parable 1,595,277,641",
  originalUnknownRunes: 12956, originalUnknownPages: 55,
  seed: SOURCE_SEED, modernPythonSeedVector: [0.9507952938928932, 0.5667359452061599],
  tested: decodedRows.length, rawIoC: ioc(runicPages.flatMap(p => p.indices)),
  solvedP57IoC: ioc(solved), bestOriginal: best,
  topEight: winners.slice(0, 8).map(({last76, ...rest}) => rest),
  allCandidates: decodedRows.map(({first40,last76,...rest}) => rest),
  decision: "No source-seed original LP2 plaintext under these four explicit MT29 outputs, three source clocks, two additive signs and two F policies"
}, null, 2));
