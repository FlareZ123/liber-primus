"use strict";
/**
 * Necessary-condition screen for source-locked, delayed public-state GP29
 * permutation channels. All keys are arbitrary independent row permutations.
 *
 * Modes:
 *  - EA-only: transparent GP EA emits C[i-1], remaining 28 symbols select
 *    one of the 28 nonzero F29 steps in root-15 order.
 *  - EA+T6: where printed word position >=6, GP T emits
 *    (24 - 2*C[i-6]) mod29, with a deterministic collision fallback;
 *    all other symbols select 27 residual steps.
 * A row key is selected by (C[i-5], C[i-6], T6-eligible flag), globally.
 * For any fixed state, an unknown row permutation preserves the collision
 * rate among the published rank labels after reserved-output removal.
 * No original unknown plaintext or key is claimed.
 *
 * Use: node sims/delayed_motif_row_invariant.cjs
 * Dependencies: Node.js 22 built-ins, existing canonical corpus/parser/controls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const words = parseSharedCorpus().words;
const runeNumber = new Map(corpus.runes.map((rune, i) => [rune, i]));
const letters = new Map(corpus.translit.map((label, i) => [label, i]));
const ciphertext = words.flatMap((word) => [...word.runes].map((rune) => runeNumber.get(rune)));
const physical = corpus.pages.filter((page) => page.status === "unsolved" && page.indices.length);
assert.deepEqual(ciphertext, physical.flatMap((page) => page.indices));
assert.equal(ciphertext.length, 12956);
assert.equal(words.length, 2896);
const wordPosition = words.flatMap((word) => Array.from({ length: word.length }, (_, i) => i));
const pageLengths = physical.map((page) => page.indices.length);
const nonzeroPowers = [];
for (let value = 1, i = 0; i < 28; i++, value = value * 15 % 29) nonzeroPowers.push(value);
assert.equal(new Set(nonzeroPowers).size, 28);
const BASE_SYMBOLS = Array.from({ length: 28 }, (_, i) => i);
const SEED = 0x2765ca55;
let state = SEED;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
function randomInt(n) { return Math.floor(random() * n); }

/** Convert editorial-cleaned or ordinary Latin source to GP rune indices. */
function toGP(text) {
  const output = [];
  for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (letters.has(pair)) { output.push(letters.get(pair)); i += 2; }
      else { if (letters.has(word[i])) output.push(letters.get(word[i])); i++; }
    }
  }
  return output;
}
const shakespeare = toGP(read("resources/control/shakespeare_first300k.txt").slice(190000));
const native = toGP(read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("\n").filter((line) => !/^(#|\[|[0-9 ]+$)/.test(line.trim())).join(" "));
assert(shakespeare.length > 40000 && native.length > 2000);

/**
 * Determine the fixed output reservations and all remaining output slots.
 * @param {number[]} history At least the six previous published runes.
 * @param {number} position True printed word position (not line position).
 * @param {boolean} t6 Whether the T6 reserved channel is in the model.
 */
function channels(history, position, t6) {
  const end = history.length;
  const previous = history[end - 1];
  const key = history[end - 5] * 29 + history[end - 6];
  const ordered = [previous, ...nonzeroPowers.map((step) => (previous + step) % 29)];
  const reserved = [previous];
  const enabled = t6 && position >= 6;
  if (enabled) {
    const target = ((24 - 2 * history[end - 6]) % 29 + 29) % 29;
    reserved.push(reserved.includes(target) ? ordered.find((x) => !reserved.includes(x)) : target);
  }
  return {
    row: key * 2 + Number(enabled),
    reserved,
    remainder: ordered.filter((x) => !reserved.includes(x)),
    sourceSymbols: enabled ? BASE_SYMBOLS.filter((x) => x !== 16) : BASE_SYMBOLS,
  };
}

/** The first six actual runes are only public IV history, never scored. */
function rowCollisions(data, t6) {
  const groups = new Map();
  const history = data.slice(0, 6);
  let eau = 0;
  let tee = 0;
  for (let i = 6; i < data.length; i++) {
    const ch = channels(history, wordPosition[i], t6);
    const glyph = data[i];
    if (glyph === ch.reserved[0]) eau++;
    else if (ch.reserved.length === 2 && glyph === ch.reserved[1]) tee++;
    else {
      const rank = ch.remainder.indexOf(glyph);
      assert(rank >= 0);
      let counts = groups.get(ch.row);
      if (!counts) { counts = new Uint16Array(29); groups.set(ch.row, counts); }
      counts[rank]++;
      counts[28]++;
    }
    history.push(glyph);
  }
  let numerator = 0;
  let denominator = 0;
  for (const counts of groups.values()) {
    denominator += counts[28] * (counts[28] - 1);
    for (let i = 0; i < 28; i++) numerator += counts[i] * (counts[i] - 1);
  }
  return {
    ratio: numerator / denominator,
    matchingPairs: numerator / 2,
    eligiblePairs: denominator / 2,
    eaOutputs: eau,
    t6Outputs: tee,
    publicRows: groups.size,
  };
}

/** Construct page-length-matched original-language source stream. */
function sourcePlant(source) {
  const plaintext = [];
  for (const n of pageLengths) {
    const start = randomInt(source.length - n - 1);
    plaintext.push(...source.slice(start, start + n));
  }
  return plaintext;
}

/**
 * Genuine invertible positive: random unknown permutations per public row.
 * Its inverse recovers every source symbol, including both reserved classes.
 */
function encryptPlant(plaintext, t6) {
  const history = Array.from({ length: 6 }, () => randomInt(29));
  const tables = new Map();
  const inverses = new Map();
  const output = [];
  for (let i = 0; i < plaintext.length; i++) {
    const ch = channels(history, wordPosition[i], t6);
    let table = tables.get(ch.row);
    let inverse = inverses.get(ch.row);
    if (!table) {
      table = ch.sourceSymbols.slice();
      for (let j = table.length - 1; j > 0; j--) {
        const k = randomInt(j + 1);
        [table[j], table[k]] = [table[k], table[j]];
      }
      inverse = new Map(table.map((value, rank) => [value, rank]));
      tables.set(ch.row, table);
      inverses.set(ch.row, inverse);
    }
    const symbol = plaintext[i];
    const cipher = symbol === 28 ? ch.reserved[0]
      : ch.reserved.length === 2 && symbol === 16 ? ch.reserved[1]
        : ch.remainder[inverse.get(symbol)];
    const decoded = cipher === ch.reserved[0] ? 28
      : ch.reserved.length === 2 && cipher === ch.reserved[1] ? 16
        : table[ch.remainder.indexOf(cipher)];
    assert.equal(decoded, symbol);
    output.push(cipher);
    history.push(cipher);
  }
  return output;
}

/** Matched suppression-only 29-state chain, not an LP2 mechanism. */
function nullPlant() {
  const output = [];
  for (const length of pageLengths) {
    let last = randomInt(29);
    output.push(last);
    for (let i = 1; i < length; i++) {
      last = randomInt(10000) < 67 ? last : (last + 1 + randomInt(28)) % 29;
      output.push(last);
    }
  }
  return output;
}
function summarize(samples, observed) {
  const ordered = samples.map((stat) => stat.ratio).sort((a, b) => a - b);
  const N = samples.length;
  return {
    mean: ordered.reduce((a, b) => a + b, 0) / N,
    min: ordered[0], max: ordered[N - 1],
    q05: ordered[Math.floor(0.05 * (N - 1))],
    q95: ordered[Math.floor(0.95 * (N - 1))],
    atOrBelowOriginal: ordered.filter((score) => score <= observed.ratio).length,
    meanEA: samples.reduce((sum, stat) => sum + stat.eaOutputs, 0) / N,
    meanT: samples.reduce((sum, stat) => sum + stat.t6Outputs, 0) / N,
  };
}
function main() {
  const results = [];
  for (const t6 of [false, true]) {
    const observed = rowCollisions(ciphertext, t6);
    const samples = { shakespeare: [], solvedCicada: [], antiRepeatNull: [] };
    for (let trial = 0; trial < 256; trial++) {
      samples.shakespeare.push(rowCollisions(encryptPlant(sourcePlant(shakespeare), t6), t6));
      samples.solvedCicada.push(rowCollisions(encryptPlant(sourcePlant(native), t6), t6));
      samples.antiRepeatNull.push(rowCollisions(nullPlant(), t6));
    }
    results.push({ mode: t6 ? "EA+word-local-T6" : "EA-only",
      original: observed,
      controls: Object.fromEntries(Object.entries(samples).map(([name, data]) =>
        [name, summarize(data, observed)])) });
  }
  console.log(JSON.stringify({ schema: 1, seed: SEED, originalRunes: ciphertext.length,
    completeWords: words.length, shakespeareRunes: shakespeare.length,
    nativeRunes: native.length, trialsPerMode: 256, results }, null, 2));
}
main();
