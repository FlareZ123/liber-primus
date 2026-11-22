"use strict";
/**
 * Native GP29 equality-invariant gate for original unsolved LP2.
 * Test: C_i-C_(i-1)=T_i(P_i-P_(i-1)), where T_i(0)=0 and no
 * nonzero input is mapped to zero. Such an encoder preserves every
 * adjacent-equality bit, whatever its changing secret state.
 *
 * Node.js 22 CommonJS; no external dependencies.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes = new Map(corpus.runes.map((s, i) => [s, i]));
const letters = new Map(corpus.translit.map((s, i) => [s, i]));
const sources = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];

/** @returns {number[][]} Complete printed words, including page carries. */
function originalWords() {
  const result = [];
  let w = [];
  let n = 0;
  for (const ch of read("resources/liber-primus/lp2-transcription.txt")) {
    if (runes.has(ch)) {
      if (n === 12956) break;
      w.push(runes.get(ch));
      n++;
    } else if ((ch === "-" || ch === ".") && w.length) {
      result.push(w);
      w = [];
    }
  }
  if (w.length) result.push(w);
  assert.equal(n, 12956);
  assert.equal(result.length, 2896);
  return result;
}

/**
 * @param {string} input
 * @param {boolean} collapseIng
 * @returns {number[]}
 */
function encode(input, collapseIng) {
  let word = input.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  if (collapseIng) word = word.replace(/ING/g, "NG");
  const a = [];
  for (let i = 0; i < word.length;) {
    const pair = word.slice(i, i + 2);
    if (letters.has(pair)) {
      a.push(letters.get(pair));
      i += 2;
    } else {
      if (letters.has(word[i])) a.push(letters.get(word[i]));
      i++;
    }
  }
  return a;
}

/** @param {number[][]} words @returns {[number,number,number]} */
function stats(words) {
  let inner = 0, terminal = 0, boundary = 0;
  for (let k = 0; k < words.length; k++) {
    const w = words[k];
    for (let i = 1; i < w.length; i++) {
      if (w[i] === w[i - 1]) {
        inner++;
        if (i === w.length - 1) terminal++;
      }
    }
    if (k && words[k - 1].at(-1) === w[0]) boundary++;
  }
  return [inner, terminal, boundary];
}

/** @returns {()=>number} */
function random(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let b = 1; b < 29; b++) if (a * b % 29 === 1) return b;
  throw new Error("nonunit multiplier");
}

/**
 * A varying, reversible GP29 differential cipher: marker conservation
 * must survive all original word boundaries as well as word interiors.
 * @param {number[][]} words
 */
function exactPlant(words) {
  const plaintext = words.flat(), cipher = [((plaintext[0] + 17) % 29)];
  for (let i = 1; i < plaintext.length; i++) {
    const a = 1 + (13 * i + 7 * Math.floor(i / 29)) % 28;
    const delta = (plaintext[i] - plaintext[i - 1] + 29) % 29;
    cipher.push((cipher[i - 1] + a * delta) % 29);
  }
  const decoded = [(cipher[0] - 17 + 29) % 29];
  for (let i = 1; i < cipher.length; i++) {
    const a = 1 + (13 * i + 7 * Math.floor(i / 29)) % 28;
    const delta = (cipher[i] - cipher[i - 1] + 29) % 29;
    decoded.push((decoded[i - 1] + inverse(a) * delta) % 29);
  }
  assert.deepEqual(decoded, plaintext);
  for (let i = 1; i < cipher.length; i++) {
    assert.equal(cipher[i] === cipher[i - 1], plaintext[i] === plaintext[i - 1]);
  }
  return cipher.length;
}

/** @param {number[][]} original */
function main(original) {
  const observed = stats(original);
  assert.deepEqual(observed, [63, 19, 23]);
  const lengths = original.map((w) => w.length);
  const output = [];
  const rng = random(0x3301e011);
  for (const src of sources) {
    const text = read(src).toUpperCase().match(/[A-Z]+/g) || [];
    for (const collapseIng of [false, true]) {
      const groups = new Map();
      for (const t of text) {
        const w = encode(t, collapseIng);
        if (!w.length) continue;
        if (!groups.has(w.length)) groups.set(w.length, []);
        groups.get(w.length).push(w);
      }
      for (const l of lengths) assert(groups.has(l), "missing source word-length group");
      const sums = [0, 0, 0];
      const low = [Infinity, Infinity, Infinity];
      let extreme = 0;
      const N = 2000;
      for (let trial = 0; trial < N; trial++) {
        const selected = lengths.map((l) => {
          const pool = groups.get(l);
          return pool[Math.floor(rng() * pool.length)];
        });
        const s = stats(selected);
        for (let k = 0; k < 3; k++) {
          sums[k] += s[k];
          low[k] = Math.min(low[k], s[k]);
        }
        if (s.some((v, k) => v <= observed[k])) extreme++;
        if (trial === 0) assert.equal(exactPlant(selected), 12956);
      }
      const row = {
        source: src,
        collapseIng,
        sourceWords: [...groups.values()].reduce((s, a) => s + a.length, 0),
        original: observed,
        matchedMean: sums.map((x) => x / N),
        matchedMin: low,
        n: N,
        anyAtOrBelowOriginal: extreme
      };
      assert.equal(extreme, 0, "original unexpectedly fits native source");
      output.push(row);
    }
  }
  console.log(JSON.stringify({
    model: "zero-preserving invertible GP29 first-difference with original word boundaries",
    originalRunes: 12956,
    originalWords: 2896,
    originalWithinWordDoublets: observed[0],
    originalTerminalWithinWordDoublets: observed[1],
    originalBetweenWordDoublets: observed[2],
    seededNull: "xorshift32 0x3301e011; exact original word lengths; per-length source-word sampling with replacement",
    results: output
  }, null, 2));
}
if (require.main === module) main(originalWords());
module.exports = {originalWords, encode, stats, exactPlant};
