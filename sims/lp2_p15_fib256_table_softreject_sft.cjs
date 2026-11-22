"use strict";

/**
 * Single-file original-cipher test: LP2 p15 Fibonacci values, read as offsets
 * into the original p49–51 256-byte grid, used as a GP29 additive key stream.
 * The decoder marginalizes repeat-rejected pad draws as latent drift.
 *
 * Source scope: original physical pp16–22, the complete chapter immediately
 * after the p15 Fibonacci-prime 4×4 square. Four table byte interpretations
 * and both addition signs are fixed before inspecting the text.
 *
 * Run from repository root: node sims/lp2_p15_fib256_table_softreject_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
assert.equal(table.length, 256);
const pages = corpus.pages.filter((p) => p.page >= 16 && p.page <= 22);
assert.deepEqual(pages.map((p) => p.page), [16, 17, 18, 19, 20, 21, 22]);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 1744);

/** Source GP29 transliteration, with the repository's established conventions.
 * @param {string} source
 * @returns {number[]}
 */
function encodeGp(source) {
  const tokens = corpus.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find((t) => word.startsWith(t.s, i));
      assert.ok(match, "unmapped GP grapheme");
      output.push(match.i);
      i += match.s.length;
    }
  }
  return output;
}
const nativeTrain = encodeGp(read("resources/control/shakespeare_first300k.txt"));
const nativePlant = encodeGp(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(nativeTrain.length, 218800);
assert.equal(nativePlant.length, 63114);
const unigram = new Float64Array(29).fill(0.25);
for (const rune of nativeTrain) unigram[rune]++;
const denom = unigram.reduce((sum, x) => sum + x, 0);
for (let i = 0; i < 29; i++) unigram[i] /= denom;

const FIB_PERIOD = 384;
const fib = [];
let f0 = 0, f1 = 1;
for (let i = 0; i < FIB_PERIOD + 2; i++) {
  fib.push(f0);
  [f0, f1] = [f1, (f0 + f1) % 256];
}
assert.deepEqual(fib.slice(0, 2), [0, 1]);
assert.deepEqual(fib.slice(FIB_PERIOD, FIB_PERIOD + 2), [0, 1]);
/** @param {number} x */
const mod29 = (x) => (x % 29 + 29) % 29;

const colTable = Array.from({length: 8}, (_, col) =>
  Array.from({length: 32}, (_, row) => table[8 * row + col])).flat();
const options = [];
for (const [name, bytes] of [["row", table], ["column", colTable]]) {
  for (const conversion of ["mod", "scaled"]) {
    const key = Uint8Array.from({length: FIB_PERIOD}, (_, i) => {
      const b = bytes[fib[i]];
      return conversion === "mod" ? b % 29 : Math.floor(b * 29 / 256);
    });
    options.push({name: name + "-" + conversion, key});
  }
}
assert.equal(options.length, 4);

const REJECT_PROBABILITY = 0.81;
const MAX_DRIFT = 110;
const MAX_LOCAL_REJECTIONS = 5;

/**
 * Keyless comparison model: uniformly random GP29 draws, re-draw a
 * repeated tentative output with probability 0.81.
 * @param {number[]} c
 */
function baseline(c) {
  const same = (1 - REJECT_PROBABILITY) / (29 - REJECT_PROBABILITY);
  const different = (1 - same) / 28;
  let score = -Math.log(29);
  for (let i = 1; i < c.length; i++)
    score += Math.log(c[i] === c[i - 1] ? same : different);
  return score;
}

/**
 * Exact forward likelihood through the declared bounded repair model.
 * The hidden state d is the number of rejected tentative key draws;
 * each rejection consumes a new key, but keeps the SAME plaintext rune.
 *
 * @param {number[]} c Original or planted GP29 ciphertext page
 * @param {Uint8Array} key Fibonacci modulo256 lookup key (period 384)
 * @param {-1|1} sign Ciphertext = plaintext + sign * key mod29
 */
function forward(c, key, sign) {
  const m = MAX_DRIFT;
  let current = new Float64Array(m + 1);
  current[0] = 1;
  let logLikelihood = 0;
  for (let i = 0; i < c.length; i++) {
    const next = new Float64Array(m + 1);
    const previous = i ? c[i - 1] : -1;
    for (let d = 0; d <= m; d++) {
      const weight = current[d];
      if (weight < 1e-170) continue;
      const pointer = i + d;
      const plainDirect = mod29(c[i] - sign * key[pointer % FIB_PERIOD]);
      next[d] += weight * unigram[plainDirect] *
        (c[i] === previous ? 1 - REJECT_PROBABILITY : 1);
      if (i === 0 || d === m) continue;
      const plainRejected = mod29(
        previous - sign * key[pointer % FIB_PERIOD]);
      let rejectMass = weight * unigram[plainRejected] *
        REJECT_PROBABILITY;
      for (let s = 1; s <= MAX_LOCAL_REJECTIONS && d + s <= m; s++) {
        const attempted = mod29(plainRejected +
          sign * key[(pointer + s) % FIB_PERIOD]);
        if (attempted === c[i]) next[d + s] += rejectMass *
          (attempted === previous ? 1 - REJECT_PROBABILITY : 1);
        if (attempted !== previous) break;
        rejectMass *= REJECT_PROBABILITY;
      }
    }
    const mass = next.reduce((sum, value) => sum + value, 0);
    assert.ok(mass > 0, "original symbol inaccessible under this key");
    logLikelihood += Math.log(mass);
    for (let d = 0; d <= m; d++) next[d] /= mass;
    current = next;
  }
  return logLikelihood;
}

let randomState = 0x3301abcd;
/** @returns {number} Deterministic uniform [0,1) */
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
}

/** Planted authentic Gibran GP29 under exactly the scoring mechanism.
 * @param {number[]} plaintext
 * @param {Uint8Array} key
 * @param {-1|1} sign
 */
function encryptRepair(plaintext, key, sign) {
  const output = [];
  let pointer = 0;
  for (let i = 0; i < plaintext.length; i++) {
    let symbol = -1;
    for (let attempt = 0; attempt < 40; attempt++) {
      symbol = mod29(plaintext[i] + sign * key[pointer++ % FIB_PERIOD]);
      if (i && symbol === output[i - 1] && random() <
          REJECT_PROBABILITY) continue;
      break;
    }
    output.push(symbol);
  }
  return output;
}

function run() {
  const plantedSource = nativePlant.slice(2500, 2500 + 1744);
  let cursor = 0;
  const positivePages = pages.map((p) => {
    const v = plantedSource.slice(cursor, cursor + p.indices.length);
    cursor += p.indices.length;
    return encryptRepair(v, options[0].key, -1);
  });
  assert.equal(cursor, 1744);
  const scores = [];
  for (const {name, key} of options) {
    for (const sign of [-1, 1]) {
      let realGain = 0, positiveGain = 0;
      for (let page = 0; page < pages.length; page++) {
        const original = pages[page].indices;
        const planted = positivePages[page];
        realGain += forward(original, key, sign) - baseline(original);
        positiveGain += forward(planted, key, sign) - baseline(planted);
      }
      scores.push({key: name, sign, realGain, positiveGain});
    }
  }
  scores.sort((a, b) => b.realGain - a.realGain);
  const known = scores.find((x) => x.key === "row-mod" && x.sign === -1);
  assert.ok(known && known.positiveGain > 400);
  assert.ok(scores.every((x) => x.realGain < -800));
  assert.ok(scores.filter((x) => x !== known)
    .every((x) => x.positiveGain < 0));
  return {
    chapterPages: pages.map((p) => p.page), originalRunes: 1744,
    source: "LP2 p15 Fibonacci prime spiral -> LP2 pp49-51 byte table",
    fibonacciMod256Period: FIB_PERIOD,
    model: "GP29 additive pad with 81-percent soft-rejection, page reset",
    driftCeiling: MAX_DRIFT, localRejectionCeiling: MAX_LOCAL_REJECTIONS,
    positivePlantKey: "row-mod / sign -1",
    note: "Narrow source-key model rejection, not a general LP2 cipher result",
    scores
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run};
