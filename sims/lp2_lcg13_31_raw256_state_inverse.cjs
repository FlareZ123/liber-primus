"use strict";
/**
 * Original-source 13/31 full-period 256-byte LCG state as a DIRECT key.
 *
 * Unlike prior grid lookup/pad screens, this treats the source-visible
 * recurrence state itself as one keystream byte. No table-value lookup,
 * fitted seed, arbitrary phase, or interpolated unknown plaintext.
 *
 * Fixed finite models: before/after update, global or original-page reset,
 * mod-radix or scale-to-radix byte reduction, both signs, GP29 additive or
 * page-IV GP28 predecessor-exclusion with transparent repeated rune 28.
 * This is a source-motivated bounded cipher gate, not a known mechanism.
 *
 * Node.js 22, CommonJS; run from repo root:
 * node sims/lp2_lcg13_31_raw256_state_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const ciphertext = pages.flatMap(p => p.indices);
const native = corpus.pages.find(p => p.page === 57).indices;
const mod = (x, n) => ((x % n) + n) % n;

assert.equal(pages.length, 55);
assert.equal(ciphertext.length, 12956);
assert.equal(native.length, 95);
const states = [];
for (let s = 0, i = 0; i < 256; i++, s = (13 * s + 31) & 255)
  states.push(s);
assert.equal(new Set(states).size, 256);
assert.equal((13 * states.at(-1) + 31) & 255, 0);

/**
 * Invert the original cipher, or encrypt a source-native planted plaintext.
 * GP28 uses each original page's initial output as an unchanged first-rune IV;
 * GP28 index28 means a repeat of the prior ciphertext rune.
 *
 * @param {number[]} input Original source-rune-shaped stream.
 * @param {"before"|"after"} read
 * @param {"global"|"page"} reset
 * @param {"gp29"|"gp28"} family
 * @param {-1|1} sign
 * @param {"mod"|"scaled"} projection
 * @param {boolean} decode
 * @returns {number[]}
 */
function transform(input, read, reset, family, sign, projection, decode) {
  assert.equal(input.length, ciphertext.length);
  const output = new Array(input.length);
  let globalIndex = 0;
  for (const page of pages) {
    let previousCipher = -1;
    for (let i = 0; i < page.indices.length; i++, globalIndex++) {
      const clock = reset === "page" ? i : globalIndex;
      const keyByte = states[(clock + (read === "after" ? 1 : 0)) % 256];
      const radix = family === "gp29" ? 29 : 28;
      const key = projection === "mod" ? keyByte % radix :
        Math.floor(keyByte * radix / 256);
      const symbol = input[globalIndex];
      let next;
      if (family === "gp29") {
        next = mod(symbol + (decode ? 1 : -1) * sign * key, 29);
      } else if (i === 0) {
        next = symbol;
      } else if (decode) {
        next = symbol === previousCipher ? 28 :
          mod(mod(symbol - previousCipher - 1, 29) + sign * key, 28);
      } else {
        next = symbol === 28 ? previousCipher :
          mod(previousCipher + 1 + mod(symbol - sign * key, 28), 29);
      }
      output[globalIndex] = next;
      if (family === "gp28") previousCipher = decode ? symbol : next;
    }
  }
  return output;
}

/** @param {number[]} symbols */
function stats(symbols) {
  const counts = new Uint32Array(29);
  for (const n of symbols) {
    assert(Number.isInteger(n) && n >= 0 && n <= 28);
    counts[n]++;
  }
  const total = symbols.length;
  return {
    ioc: counts.reduce((sum, count) =>
      sum + count * (count - 1), 0) / (total * (total - 1)),
    first80: symbols.slice(0, 80).map(n => corpus.translit[n]).join("")
  };
}

function main() {
  const plant = Array.from({length: ciphertext.length},
    (_, i) => native[i % native.length]);
  const modes = [];
  for (const read of ["before", "after"])
    for (const reset of ["global", "page"])
      for (const family of ["gp29", "gp28"])
        for (const sign of [-1, 1])
          for (const projection of ["mod", "scaled"]) {
            const mode = [read, reset, family, sign, projection];
            const decoded = transform(ciphertext, ...mode, true);
            assert.deepEqual(transform(decoded, ...mode, false), ciphertext);
            const nativePlant = transform(plant, ...mode, false);
            assert.deepEqual(transform(nativePlant, ...mode, true), plant);
            modes.push({read, reset, family, sign, projection,
              ...stats(decoded)});
          }
  assert.equal(modes.length, 32);
  const range = family => {
    const vals = modes.filter(x => x.family === family).map(x => x.ioc);
    return [Math.min(...vals), Math.max(...vals)];
  };
  return {
    classification: "bounded direct-source 256-state negative; no unknown plaintext",
    source: {
      algorithm: "s_(i+1)=(13*s_i+31) mod256, s0=0",
      period: 256, minState: Math.min(...states),
      maxState: Math.max(...states),
      statesFirst16: states.slice(0, 16),
      originalRunes: ciphertext.length,
      actualRunePages: pages.length
    },
    modelCount: modes.length,
    sourceNativePositiveRoundtrips: modes.length * ciphertext.length,
    exactOriginalReencipheredRunes: modes.length * ciphertext.length,
    originalIoC: stats(ciphertext).ioc,
    gp29OutputIoCRange: range("gp29"),
    gp28MarkerOutputIoCRange: range("gp28"),
    modes,
    status: "NO_NEW_UNKNOWN_PLAINTEXT"
  };
}
if (require.main === module)
  process.stdout.write(JSON.stringify(main(), null, 2) + "\n");
module.exports = {states, transform, main};
