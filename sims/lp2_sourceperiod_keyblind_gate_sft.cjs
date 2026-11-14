"use strict";

/**
 * Periodic-key blind gate for the source-selected p15 and p39/p50 clocks.
 * Node.js 22 CommonJS. No candidate key, phrase, starting state or phase
 * is fitted; periodic GP29 symbolwise and chained-additive ciphers obey an
 * exact lag-equality invariant regardless of their hidden pad values.
 *
 * This does not test nonadditive Hill transforms, period resets shorter than
 * the measured span, or transforms of a non-native plaintext register.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = (number) => (number % 29 + 29) % 29;

/**
 * @param {number[]} values
 * @param {number} lag
 * @param {boolean} step If true, inspect c_i-c_(i-1).
 */
function lagMatches(values, lag, step = false) {
  const stream = step
    ? values.slice(1).map((value, index) => mod(value - values[index]))
    : values;
  let matches = 0;
  for (let i = 0; i + lag < stream.length; i++) {
    matches += Number(stream[i] === stream[i + lag]);
  }
  return {matches, pairs: Math.max(0, stream.length - lag)};
}

const spellings = gp.translit.map((s, i) => ({spelling: s, index: i}))
  .sort((a, b) => b.spelling.length - a.spelling.length);

/** @param {string} text */
function encodeNativeGp(text) {
  const output = [];
  for (let word of text.match(/[A-Za-z]+/g) || []) {
    word = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        output.push(21);
        i += 3;
      } else if (word.startsWith("IO", i)) {
        output.push(27);
        i += 2;
      } else {
        const token = spellings.find(({spelling}) =>
          word.startsWith(spelling, i));
        assert(token, "Unrecognized native GP word: " + word);
        output.push(token.index);
        i += token.spelling.length;
      }
    }
  }
  return output;
}

const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => ({name, runes: encodeNativeGp(read(file))}));
assert.deepEqual(sources.map((source) => source.runes.length),
  [217106, 62492, 321327]);

/** @param {number} first @param {number} last */
const runes = (first, last) =>
  gp.pages.filter((p) => p.page >= first && p.page <= last)
    .flatMap((p) => p.indices);

/** @type {{name:string,first:number,last:number,lag:number,source:string}[]} */
const cases = [
  {name: "p16-22, p15 full-matrix 812 steps/rune",
    first: 16, last: 22, lag: 812, source: "p15 signed matrix order"},
  {name: "p40-53 black body, p15 full-matrix 812 steps/rune",
    first: 40, last: 53, offset: 8, lag: 812, source: "p15 signed matrix order"},
  {name: "p40-53 black body, p50 H-root 840 steps/rune",
    first: 40, last: 53, offset: 8, lag: 840, source: "p50 H irreducible root order"},
  {name: "p16-55 continuous, 812 four-rune blocks",
    first: 16, last: 55, lag: 3248, source: "812 matrix powers at four runes/block"}
];
assert.deepEqual(cases.map(({first, last, offset}) =>
  runes(first, last).slice(offset || 0).length),
  [1744, 3000, 3000, 9194]);

let randomState = 0x33012014;
/** @returns {number} Reproducible GP29 pad symbol. */
function nextPad() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) % 29;
}

/**
 * @param {number[]} plaintext
 * @param {number} lag
 * @returns {{direct:number[],chained:number[]}}
 */
function plantedCiphers(plaintext, lag) {
  const pad = Array.from({length: lag}, nextPad);
  const direct = plaintext.map((p, i) => mod(p + pad[i % lag]));
  const chained = [0];
  for (let i = 1; i < plaintext.length; i++) {
    chained.push(mod(chained[i - 1] + plaintext[i] + pad[i % lag]));
  }
  return {direct, chained};
}

const results = [];
for (const c of cases) {
  const original = runes(c.first, c.last).slice(c.offset || 0);
  const raw = lagMatches(original, c.lag);
  const delta = lagMatches(original, c.lag, true);
  const control = [];
  for (const source of sources) {
    const remaining = source.runes.length - original.length;
    const samples = Math.min(50, Math.floor(remaining / 5000) + 1);
    let minimum = Infinity, maximum = -Infinity;
    for (let k = 0; k < samples; k++) {
      const start = Math.floor(remaining * k / Math.max(1, samples - 1));
      const native = source.runes.slice(start, start + original.length);
      const directRate = lagMatches(native, c.lag).matches / raw.pairs;
      minimum = Math.min(minimum, directRate);
      maximum = Math.max(maximum, directRate);
      // The arbitrary period-lag pad cancels exactly for both architectures.
      if (k === 0) {
        const plant = plantedCiphers(native, c.lag);
        assert.deepEqual(lagMatches(plant.direct, c.lag),
          lagMatches(native, c.lag));
        // The first symbol has no observed predecessor in a chained cipher.
        const expected = {matches: 0, pairs: native.length - c.lag - 1};
        for (let i = 1; i + c.lag < native.length; i++) {
          expected.matches += Number(native[i] === native[i + c.lag]);
        }
        assert.deepEqual(lagMatches(plant.chained, c.lag, true), expected);
      }
    }
    assert(minimum > raw.matches / raw.pairs);
    assert(minimum > delta.matches / delta.pairs);
    control.push({source: source.name, samples, minNativeRate: minimum,
      maxNativeRate: maximum});
  }
  results.push({
    name: c.name, sourceClock: c.source, periodRunes: c.lag,
    raw, rawRate: raw.matches / raw.pairs,
    delta, deltaRate: delta.matches / delta.pairs, control
  });
}
assert.deepEqual(results.map((r) => [r.raw.matches, r.raw.pairs,
  r.delta.matches, r.delta.pairs]), [
  [31, 932, 27, 931],
  [80, 2188, 76, 2187],
  [83, 2160, 85, 2159],
  [215, 5946, 221, 5945]
]);

console.log(JSON.stringify({
  originalCorpus: "LP2 p0-55 canonical original runes",
  hypothesis: "GP29 plaintext plus periodic pad, or predecessor chain with GP29 plaintext-plus-pad steps",
  periodScope: "one original continuous passage per listed case; resets within it are not tested",
  sampleControl: "three independent native-GP references, 420 total matched-length windows",
  cases: results,
  conclusion: "All four source-clock forms lack the key-blind native-GP lag match invariant; no unknown plaintext/key recovered."
}, null, 2));
