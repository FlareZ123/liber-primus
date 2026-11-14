"use strict";

/**
 * Original LP2 source-runic test of a one-rune-delayed, lossless 29-state
 * rank-28 no-doublet emitter with an arbitrarily named reserved GP rune.
 *
 * The fixed source word lengths and intra-word positions constrain repeated
 * ciphertext events, even if an unknown stationary 28-rune bijection is
 * composed with the emitter. Train the 29 marker candidates on p0–39 only
 * and evaluate the chosen candidate on withheld p40–55.
 *
 * Source inputs are immutable; this script performs no writes.
 * Run: node sims/lp2_oneback_rank28_marker_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const unsolved = gp.pages.filter(p => p.page < 56 && p.indices.length);
const words = parseSharedCorpus().words;
const observed = unsolved.flatMap(p => p.indices);
assert.equal(observed.length, 12956);
assert.equal(words.length, 2896);
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const info = [];
for (const word of words) {
  const chars = Array.from(word.runes);
  for (let i = 0; i < chars.length; i++) {
    assert.equal(observed[info.length], runeToIndex.get(chars[i]));
    info.push({length: chars.length, position: i});
  }
}
assert.equal(info.length, observed.length);

/** @type {{label:string,index:number}[]} */
const tokens = gp.translit.map((label, index) => ({label, index}))
  .sort((a, b) => b.label.length - a.label.length);

/**
 * Match source-attested ING/IO spellings, plus the original GP letter folds.
 * @param {string} latinWord
 * @returns {number[]}
 */
function encodeWord(latinWord) {
  const word = latinWord.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (word.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const found = tokens.find(token => word.startsWith(token.label, i));
      assert(found, "Unmapped original spelling in " + word);
      out.push(found.index);
      i += found.label.length;
    }
  }
  return out;
}
assert.deepEqual(encodeWord("FOLLOWING"), [0, 8, 10, 10, 8, 7, 21]);

/** @type {Map<string,{counts:Uint32Array,total:number}>} */
const table = new Map();
const background = new Float64Array(29);
let backgroundTotal = 0;
for (const source of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
]) {
  const sourceWords = read(source).toUpperCase().match(/[A-Z]+/g) || [];
  for (const word of sourceWords) {
    const letters = encodeWord(word);
    for (let j = 0; j < letters.length; j++) {
      const key = letters.length + ":" + j;
      let slot = table.get(key);
      if (!slot) {
        slot = {counts: new Uint32Array(29), total: 0};
        table.set(key, slot);
      }
      slot.counts[letters[j]]++;
      slot.total++;
      background[letters[j]]++;
      backgroundTotal++;
    }
  }
}
const prior = Array.from(background, c => c / backgroundTotal);
/** @type {Map<string,number[]>} */
const probabilities = new Map();
for (const [key, slot] of table) {
  const concentration = Math.max(15, slot.total / 10);
  probabilities.set(key, prior.map((p, s) =>
    (slot.counts[s] + concentration * p) / (slot.total + concentration)));
}
/**
 * @param {{length:number,position:number}} where
 * @param {number} symbol
 */
function probability(where, symbol) {
  return (probabilities.get(where.length + ":" + where.position) || prior)[symbol];
}
const events = [];
let start = 0;
for (const page of unsolved) {
  for (let i = 1; i < page.indices.length; i++) {
    events.push({
      site: start + i,
      page: page.page,
      first: start,
      last: start + page.indices.length,
      repeat: Number(page.indices[i] === page.indices[i - 1])
    });
  }
  start += page.indices.length;
}
assert.equal(events.length, 12901);
assert.equal(events.reduce((n, e) => n + e.repeat, 0), 86);

/**
 * A lossless, no-repeat-biased alphabet with one reserved plaintext index.
 * @param {number} symbol
 * @param {number} previousCipher
 * @param {number} reserved
 */
function encodeRank(symbol, previousCipher, reserved) {
  if (symbol === reserved) return previousCipher;
  const rank = symbol - Number(symbol > reserved);
  return rank + Number(rank >= previousCipher);
}
/** @param {number} cipher @param {number} previousCipher @param {number} reserved */
function decodeRank(cipher, previousCipher, reserved) {
  if (cipher === previousCipher) return reserved;
  const rank = cipher - Number(cipher > previousCipher);
  return rank + Number(rank >= reserved);
}
/**
 * Delay each emitted plaintext rune by exactly one within a cyclic page:
 * Q[0] = P[last] and Q[i] = P[i-1] for i >= 1. The unchanged first
 * ciphertext rune carries Q[0], making the page transform bijective.
 * @param {number[]} plain
 * @param {number} reserved
 */
function encryptDelayed(plain, reserved) {
  const shifted = [plain[plain.length - 1], ...plain.slice(0, -1)];
  const cipher = [shifted[0]];
  for (let i = 1; i < shifted.length; i++) {
    cipher.push(encodeRank(shifted[i], cipher[i - 1], reserved));
  }
  return cipher;
}
/** @param {number[]} cipher @param {number} reserved */
function decryptDelayed(cipher, reserved) {
  const shifted = [cipher[0]];
  for (let i = 1; i < cipher.length; i++) {
    shifted.push(decodeRank(cipher[i], cipher[i - 1], reserved));
  }
  return [...shifted.slice(1), shifted[0]];
}
// The exact event prediction and complete inverse are independently planted.
const plant = encodeWord(read("resources/control/gibran_prophet_58585.txt")
  .slice(0, 1450)).slice(0, 248);
for (const reserved of [0, 6, 21, 28]) {
  const cipher = encryptDelayed(plant, reserved);
  assert.deepEqual(decryptDelayed(cipher, reserved), plant);
  for (let i = 1; i < cipher.length; i++) {
    assert.equal(cipher[i] === cipher[i - 1], plant[i - 1] === reserved);
  }
}
const check = (value, target) =>
  assert(Math.abs(value - target) < 1e-7, "Unexpected original-input score");

/** @param {number} lag @param {number} reserved @param {boolean} train */
function evaluate(lag, reserved, train) {
  let count = 0, repeats = 0, expected = 0, logLikelihood = 0;
  for (const event of events) {
    if ((event.page < 40) !== train) continue;
    const at = event.site + lag;
    if (at < event.first || at >= event.last) continue;
    const p = probability(info[at], reserved);
    count++;
    repeats += event.repeat;
    expected += p;
    logLikelihood += event.repeat * Math.log(p)
      + (1 - event.repeat) * Math.log1p(-p);
  }
  return {count, repeats, expected, logLikelihood};
}
/** @param {{count:number,repeats:number}} score */
function constantRate(score) {
  const p = score.repeats / score.count;
  return score.repeats * Math.log(p)
    + (score.count - score.repeats) * Math.log1p(-p);
}
for (const lag of [-1, 0]) {
  const options = gp.translit.map((label, reserved) => ({
    label, reserved, train: evaluate(lag, reserved, true)
  })).sort((a, b) => b.train.logLikelihood - a.train.logLikelihood);
  const best = options[0];
  const heldout = evaluate(lag, best.reserved, false);
  const baselineTrain = constantRate(best.train);
  const baselineHeldout = constantRate(heldout);
  console.log(JSON.stringify({
    lag, reserved: best.reserved, label: best.label,
    train: best.train, heldout,
    trainDelta: best.train.logLikelihood - baselineTrain,
    heldoutDelta: heldout.logLikelihood - baselineHeldout
  }));
  assert(best.train.logLikelihood < baselineTrain);
  assert(heldout.logLikelihood < baselineHeldout);
  if (lag === -1) {
    assert.equal(best.reserved, 21);
    assert.equal(best.train.count, 9600);
    assert.equal(best.train.repeats, 65);
    assert.equal(heldout.count, 3301);
    assert.equal(heldout.repeats, 21);
    check(best.train.logLikelihood, -418.40824081110424);
    check(heldout.logLikelihood, -142.18318391577992);
  } else {
    assert.equal(best.reserved, 6);
    check(best.train.logLikelihood, -430.01712239437506);
    check(heldout.logLikelihood, -148.64044264095017);
  }
}
console.log("PASS: delay-one rank28 marker has no native-word-position advantage.");
