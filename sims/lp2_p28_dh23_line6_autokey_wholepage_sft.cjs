"use strict";

/**
 * Director #2216: original p28 DH-line public-seed, lag23 ciphertext-feedback
 * inverse, source-native language gate, independent p29 continuation, positive
 * solved-p57 plant, and exact forward reencryption.
 *
 * This is an exploratory source-constrained TEST, not a historical cipher claim.
 * Requires only Node.js 22 builtins and existing repository data.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

/** @param {string} relative */
const read = relative => fs.readFileSync(path.resolve(__dirname, "..", relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const referenceText = read("resources/liber-primus/lp1-plaintext-reference.txt");
const model = buildSourceNativeTrigramModel({ corpus, referenceText });
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value */
const mod29 = value => ((value % 29) + 29) % 29;

/** @param {number} page */
function sourcePage(page) {
  const record = corpus.pages.find(candidate => candidate.page === page);
  assert.ok(record, "original page is present");
  assert.equal(record.runic_count, record.indices.length);
  return record.indices;
}

/** @param {number} page */
function physicalLines(page) {
  assert.ok(page >= 0 && page < 50);
  const parts = transcription.split(/^\s*%\s*$/m);
  return parts[page].split("/").filter(line => /[\u16a0-\u16ff]/u.test(line)).map(line =>
    [...line].filter(rune => runeToIndex.has(rune)).map(rune => runeToIndex.get(rune))
  );
}

/**
 * @param {number[]} cipher
 * @param {number} weight
 * @param {number[]} history
 */
function decode(cipher, weight, history) {
  assert.equal(history.length, 23);
  const state = [...history];
  const plaintext = [];
  for (let i = 0; i < cipher.length; i++) {
    plaintext.push(mod29(cipher[i] - weight * state[i]));
    state.push(cipher[i]);
  }
  return plaintext;
}

/**
 * @param {number[]} plaintext
 * @param {number} weight
 * @param {number[]} history
 */
function encode(plaintext, weight, history) {
  assert.equal(history.length, 23);
  const state = [...history];
  const ciphertext = [];
  for (let i = 0; i < plaintext.length; i++) {
    const current = mod29(plaintext[i] + weight * state[i]);
    ciphertext.push(current);
    state.push(current);
  }
  return ciphertext;
}

/** @param {number[]} indices */
function ioc(indices) {
  const counts = new Array(29).fill(0);
  for (const rune of indices) counts[rune]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) /
    (indices.length * (indices.length - 1));
}

/** @param {number[]} indices */
function topFive(indices) {
  const counts = new Array(29).fill(0);
  for (const rune of indices) counts[rune]++;
  return counts.sort((a, b) => b - a).slice(0, 5).reduce((sum, count) => sum + count, 0);
}

/**
 * @param {number[]} indices
 * @param {number} length
 */
function calibration(indices, length) {
  const scores = [];
  for (let i = 0; i + length <= indices.length; i++) {
    scores.push(model.scoreStream(indices.slice(i, i + length)).mean);
  }
  scores.sort((a, b) => a - b);
  return {
    count: scores.length,
    minimum: scores[0],
    onePercentile: scores[Math.floor(scores.length * 0.01)],
    median: scores[Math.floor(scores.length / 2)],
    maximum: scores.at(-1),
  };
}

/** @param {number[]} indices */
function describe(indices) {
  return {
    runes: indices.length,
    ioc: ioc(indices),
    topFive: topFive(indices),
    nativeTrigram: model.scoreStream(indices).mean,
    prefix: model.spell(indices.slice(0, 180)),
  };
}

const p28 = sourcePage(28);
const p29 = sourcePage(29);
const p57 = sourcePage(57);
const lines = physicalLines(28);
assert.equal(lines.length, 12);
assert.deepEqual(lines.flat(), p28);
assert.equal(lines.slice(0, 5).reduce((n, line) => n + line.length, 0), 117);
assert.equal(lines[5].length, 23);
const seed = lines[5];
assert.deepEqual(seed, [23, 8, 9, 13, 24, 12, 4, 8, 9, 21, 28,
  0, 9, 0, 3, 19, 15, 9, 28, 24, 10, 1, 20]);
assert.equal(corpus.translit[seed[0]] + corpus.translit[seed[1]], "DH");

const original = { p28: describe(p28), p29: describe(p29), solvedP57: describe(p57) };
const nativeWindows = {
  p28: calibration(model.training, p28.length),
  p29: calibration(model.training, p29.length),
};
const results = [];
for (const weight of [1, 2]) {
  const targets = [
    ["p28", p28, seed],
    ["p29_seed_reset", p29, seed],
    ["p29_crosspage_carry", p29, p28.slice(-23)],
  ];
  for (const [target, cipher, history] of targets) {
    const plaintext = decode(cipher, weight, history);
    assert.deepEqual(encode(plaintext, weight, history), cipher, "original exact forward replay");
    const stats = describe(plaintext);
    const reference = target === "p28" ? nativeWindows.p28 : nativeWindows.p29;
    assert.ok(stats.nativeTrigram < reference.onePercentile,
      target + " inverse would unexpectedly exceed native language exclusion threshold");
    results.push({ weight, target, ...stats });
  }
  const plant = encode(p57, weight, seed);
  assert.deepEqual(decode(plant, weight, seed), p57, "native solved-p57 planting");
}

console.log(JSON.stringify({
  decision: "Negative for both fixed DH23 lag-feedback families on p28, p29 reset and p29 carry; no original LP2 plaintext or key recovered",
  source: {
    p28_line: 6,
    source_offset: 117,
    seed: seed,
    seed_transliteration: seed.map(index => corpus.translit[index]).join(""),
    DH: { modulus: 23, shared: 2 },
  },
  original,
  sourceNativeLp1Training: {
    length: model.trainingLength,
    fullScore: model.trainingScore,
  },
  nativeWindows,
  results,
  forwardReplay: "269/269 p28; 277/277 both p29 histories, both weights",
  plantedSolvedP57: "95/95 each of both weights",
}, null, 2));
