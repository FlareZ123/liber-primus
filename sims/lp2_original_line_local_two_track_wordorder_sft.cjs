"use strict";
/**
 * Source-original LP2 whole-word line-local two-track read-order gate.
 * Physical pages p16-21 train the human-visible operation; p40-53 is
 * an independent holdout. Only five fixed, line-local bijections are
 * considered. Randomization preserves page word inventories and the
 * source's per-line word-slot masks.
 *
 * Run in Node.js 22: node sims/lp2_original_line_local_two_track_wordorder_sft.cjs
 * No writes, network calls, dynamic dependencies, or fitted ciphertext keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(gp.runes);
const translit = gp.translit.slice().sort((a, b) => b.length - a.length);

/** @typedef {{ values:number[], page:number, line:number, endPage:number, endLine:number }} Word */
/** @returns {Word[]} */
function originalWords() {
  const words = [];
  let current = [];
  let rawPage = 0;
  let line = -1;
  const finish = () => {
    if (!current.length) return;
    words.push({
      values: current.map(x => x.index),
      page: current[0].page,
      line: current[0].line,
      endPage: current[current.length - 1].page,
      endLine: current[current.length - 1].line,
    });
    current = [];
  };
  for (const sourceLine of read("resources/liber-primus/lp2-transcription.txt").split(/\r?\n/)) {
    if (sourceLine === "%") {rawPage++; line = -1; continue;}
    if (sourceLine === "$") continue;
    if (sourceLine === "&") {finish(); continue;}
    line++;
    for (const character of sourceLine) {
      if (runeSet.has(character)) {
        current.push({
          index: gp.runes.indexOf(character),
          page: rawPage < 50 ? rawPage : rawPage + 1,
          line,
        });
      } else if (character === "-" || character === ".") finish();
    }
  }
  finish();
  assert.equal(words.length, 2941);
  const unknown = words.slice(0, 2896);
  assert.equal(unknown.flatMap(w => w.values).length, 12956);
  assert.deepEqual(
    unknown.flatMap(w => w.values),
    gp.pages.filter(p => p.page < 56).flatMap(p => p.indices),
  );
  assert.equal(unknown.filter(w => w.page !== w.endPage).length, 32);
  assert.equal(unknown.filter(w => w.page !== w.endPage || w.line !== w.endLine).length, 420);
  return unknown;
}

/** @param {string} word @returns {number|null} */
function englishRuneLength(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let length = 0;
  for (let i = 0; i < normalized.length;) {
    const token = normalized.startsWith("ING", i) ? "ING"
      : normalized.startsWith("IO", i) ? "IO"
      : translit.find(t => normalized.startsWith(t, i));
    if (!token) return null;
    length++;
    i += token.length;
  }
  return length;
}

/** @returns {number[]} */
function nativeTraining() {
  const texts = [
    "resources/control/gibran_prophet_58585.txt",
    "resources/control/shakespeare_first300k.txt",
  ];
  const lengths = texts.flatMap(file => (read(file).match(/[A-Za-z]+/g) || [])
    .map(englishRuneLength).filter(x => x !== null));
  assert.equal(lengths.length, 71140);
  return lengths;
}

const CLASSES = 10;
const SMOOTH = 1.3;
const bin = value => Math.min(value, CLASSES) - 1;

/** @param {number[]} training */
function makeModel(training) {
  const uni = new Float64Array(CLASSES);
  const triples = new Float64Array(CLASSES ** 3);
  const previous = new Float64Array(CLASSES ** 2);
  for (let i = 0; i < training.length; i++) {
    const z = bin(training[i]);
    uni[z]++;
    if (i < 2) continue;
    triples[(bin(training[i - 2]) * CLASSES + bin(training[i - 1])) * CLASSES + z]++;
  }
  for (let i = 0; i < previous.length; i++)
    for (let j = 0; j < CLASSES; j++)
      previous[i] += triples[i * CLASSES + j];
  return (sequence, order) => {
    let total = 0;
    for (let i = 2; i < order.length; i++) {
      const a = bin(sequence[order[i - 2]]);
      const b = bin(sequence[order[i - 1]]);
      const c = bin(sequence[order[i]]);
      const ctx = a * CLASSES + b;
      total += Math.log((triples[ctx * CLASSES + c] + SMOOTH) /
        (previous[ctx] + SMOOTH * CLASSES)) -
        Math.log((uni[c] + SMOOTH) / (training.length + SMOOTH * CLASSES));
    }
    return total;
  };
}

const NAMES = ["identity", "adjacent_swap", "odds_first", "evens_first",
  "interleave_halves", "half_swap"];
/** @param {Word[]} words */
function prepare(words) {
  const sequence = words.map(w => w.values.length);
  const groups = [];
  const pages = new Map();
  let prior = "";
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const key = String(w.page) + ":" + String(w.line);
    if (key !== prior) {groups.push([]); prior = key;}
    groups[groups.length - 1].push(i);
    if (!pages.has(w.page)) pages.set(w.page, []);
    pages.get(w.page).push(i);
  }
  const identity = sequence.map((_, i) => i);
  const transforms = [
    g => g.flatMap((_, i) => i % 2 === 0 ? g.slice(i, i + 2).reverse() : []),
    g => g.filter((_, i) => i % 2 === 0).concat(g.filter((_, i) => i % 2 === 1)),
    g => g.filter((_, i) => i % 2 === 1).concat(g.filter((_, i) => i % 2 === 0)),
    g => {
      const middle = Math.ceil(g.length / 2);
      const a = g.slice(0, middle), b = g.slice(middle), order = [];
      for (let i = 0; i < middle; i++) {
        order.push(a[i]);
        if (i < b.length) order.push(b[i]);
      }
      return order;
    },
    g => {
      const middle = Math.ceil(g.length / 2);
      return g.slice(middle).concat(g.slice(0, middle));
    },
  ];
  const orders = [identity, ...transforms.map(t => groups.flatMap(t))];
  for (const order of orders) {
    assert.equal(order.length, sequence.length);
    assert.equal(new Set(order).size, sequence.length);
  }
  return {sequence, orders, pagePositions: [...pages.values()], lineCount: groups.length};
}

/** @param {{sequence:number[],orders:number[][]}} region @param {(s:number[],o:number[])=>number} score */
function gains(region, score, sequence = region.sequence) {
  const scores = region.orders.map(order => score(sequence, order));
  return scores.map(value => value - scores[0]);
}

function seededRandom() {
  let state = 0x33012176;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {{sequence:number[],pagePositions:number[][]}} region */
function pageShuffle(region, random) {
  const sequence = region.sequence.slice();
  for (const positions of region.pagePositions) {
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const a = positions[i], b = positions[j];
      [sequence[a], sequence[b]] = [sequence[b], sequence[a]];
    }
  }
  return sequence;
}

function main() {
  const words = originalWords();
  const score = makeModel(nativeTraining());
  const first = prepare(words.filter(w => w.page >= 16 && w.page <= 21));
  const second = prepare(words.filter(w => w.page >= 40 && w.page <= 53));
  const full = prepare(words);
  assert.deepEqual([first.sequence.length, second.sequence.length, full.sequence.length],
    [373, 669, 2896]);
  assert.deepEqual([
    first.sequence.reduce((a, b) => a + b, 0),
    second.sequence.reduce((a, b) => a + b, 0),
  ], [1615, 3008]);
  const gFirst = gains(first, score);
  const gSecond = gains(second, score);
  const gFull = gains(full, score);
  const max = a => Math.max(...a.slice(1));
  const observed = {
    p16_21: gFirst,
    p40_53: gSecond,
    wholeBook: gFull,
  };
  const observedJoint = Math.max(...gFirst.slice(1).map((v, i) => v + gSecond[i + 1]));
  const random = seededRandom();
  let exceededSecond = 0, exceededJoint = 0, exceededFull = 0;
  for (let trial = 0; trial < 750; trial++) {
    const a = gains(first, score, pageShuffle(first, random));
    const b = gains(second, score, pageShuffle(second, random));
    if (max(b) >= max(gSecond)) exceededSecond++;
    if (Math.max(...a.slice(1).map((v, i) => v + b[i + 1])) >= observedJoint)
      exceededJoint++;
  }
  for (let trial = 0; trial < 350; trial++) {
    const g = gains(full, score, pageShuffle(full, random));
    if (max(g) >= max(gFull)) exceededFull++;
  }
  assert.deepEqual([exceededSecond, exceededJoint, exceededFull], [45, 140, 134]);
  // A truly reversible source-length two-track plant: only a planted
  // word-order layer is recovered here, never an unknown rune-key.
  const clean = nativeTraining().slice(21000, 21000 + second.sequence.length);
  const order = second.orders[NAMES.indexOf("odds_first")];
  const encrypted = clean.slice();
  for (let i = 0; i < clean.length; i++) encrypted[order[i]] = clean[i];
  const decrypted = order.map(i => encrypted[i]);
  assert.deepEqual(decrypted, clean);
  assert.ok(score(clean, second.orders[0]) > score(encrypted, second.orders[0]));
  const output = {
    input: "12956 original unknown ciphertext runes, 2896 printed words, 32 page carries",
    regions: {p16_21: {words: 373, runes: 1615, lines: first.lineCount},
      p40_53: {words: 669, runes: 3008, lines: second.lineCount}},
    operations: NAMES,
    originalGains: observed,
    bestJointGain: observedJoint,
    pageShuffledNulls: {
      p40_53: {exceeded: exceededSecond, trials: 750, plusOneP: (exceededSecond + 1) / 751},
      joint: {exceeded: exceededJoint, trials: 750, plusOneP: (exceededJoint + 1) / 751},
      wholeBook: {exceeded: exceededFull, trials: 350, plusOneP: (exceededFull + 1) / 351},
    },
    sourceNativePlantedInverse: "669/669 word lengths exactly restored",
    conclusion: "No transferable original-source selected word-order inverse or plaintext",
  };
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
}
if (require.main === module) main();
module.exports = {originalWords, englishRuneLength, prepare, makeModel, gains, pageShuffle};
