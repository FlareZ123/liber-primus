"use strict";
/**
 * Original-source test of the printed p50 256-byte table as a repeating
 * GP29 additive pad under the provisional signed-2013-derived T6 collision
 * repair model. Fixed row-major byte%29 mapping, global period 256, phase 0.
 * Tests both additive signs and both literal-F consumption conventions.
 *
 * A same-key synthetic positive plant uses the exact LP2 word lengths.
 * This is a bounded candidate test, not a claim that T6 is the LP2 cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {words} = require("./outer_permutation_word_context.cjs");
const {train, decodeWord} = require("./lag6_repair_contextual_inverse.cjs");
const {encipher} = require("./lag6_repair_keyed_inverse.cjs");

const M = 29, Q = 0.81, MIX = 0.95;
const mod = value => ((value % M) + M) % M;

function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function inverseCandidates(ciphertext, pad, transparent) {
  const out = [];
  let last = -1, offset = 0;
  for (const word of ciphertext) {
    const options = [];
    for (let j = 0; j < word.length; j++) {
      const c = word[j];
      if (transparent[offset]) {
        options.push([{candidate:c, logEmission:0}]);
        last = c;
        offset++;
        continue;
      }
      const t = j >= 6 ? mod(24 - 2 * word[j - 6]) : -1;
      const p0 = mod(c - pad[offset]);
      const unchanged = c === last ? (j >= 6 && t === last ? 1 : 1 - Q) : 1;
      const row = [{candidate:p0, logEmission:Math.log(unchanged)}];
      if (last >= 0 && c !== last && (j < 6 || c === t)) {
        row.push({candidate:mod(last - pad[offset]),
          logEmission:Math.log(j >= 6 ? Q : Q / 28)});
      }
      options.push(row);
      last = c;
      offset++;
    }
    out.push(options);
  }
  assert.equal(offset, pad.length);
  return out;
}

function decode(ciphertext, pad, transparent, model) {
  const options = inverseCandidates(ciphertext, pad, transparent);
  return options.map(word => decodeWord(word, model, MIX));
}

function summarize(decoded, runeCount, translit) {
  const totalScore = decoded.reduce((sum, word) => sum + word.score, 0);
  const decodedWords = decoded.map(word => word.sequence.map(i => translit[i]).join(""));
  return {
    scorePerRune: totalScore / runeCount,
    totalScore,
    lexicalWords: decoded.filter(word => word.origin === "lexicon").length,
    first40Words: decodedWords.slice(0, 40)
  };
}

function makeOriginalPad(ciphertext, key, sign, transparentF) {
  const pad = [], transparent = [];
  let pointer = 0;
  for (const word of ciphertext) {
    for (const c of word) {
      const skip = transparentF && c === 0;
      transparent.push(skip);
      if (skip) pad.push(0);
      else {
        pad.push(mod(sign * key[pointer % key.length]));
        pointer++;
      }
    }
  }
  return {pad, transparent, keyDraws:pointer};
}

function makePositivePlant(wordLengths, sourceWords, key) {
  const random = rng(0x391702);
  const bins = new Map(), stream = sourceWords.flat();
  for (const word of sourceWords) {
    if (!bins.has(word.length)) bins.set(word.length, []);
    bins.get(word.length).push(word);
  }
  let fallbackWords = 0;
  const plaintext = wordLengths.map(length => {
    const bin = bins.get(length);
    if (bin && bin.length) return bin[Math.floor(random() * bin.length)];
    fallbackWords++;
    const start = Math.floor(random() * (stream.length - length));
    return stream.slice(start, start + length);
  });
  const runeCount = wordLengths.reduce((sum, length) => sum + length, 0);
  const pad = Array.from({length:runeCount}, (_, i) => key[i % key.length]);
  const planted = encipher(plaintext, pad, random, Q);
  return {plaintext, pad, planted, fallbackWords};
}

function run() {
  const root = path.join(__dirname, "..");
  const corpus = JSON.parse(fs.readFileSync(path.join(root,
    "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const grid = JSON.parse(fs.readFileSync(path.join(root,
    "resources/liber-primus/lp2-grid-256.json"), "utf8"));
  const shakespeare = fs.readFileSync(path.join(root,
    "resources/control/shakespeare_first300k.txt"), "utf8");
  const parsed = parseSharedCorpus();
  const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
  const ciphertext = parsed.words.map(word => [...word.runes].map(rune => {
    const index = runeIndex.get(rune);
    assert(Number.isInteger(index), "Unknown rune in canonical transcript");
    return index;
  }));
  const wordLengths = ciphertext.map(word => word.length);
  const runeCount = wordLengths.reduce((sum, length) => sum + length, 0);
  assert.equal(ciphertext.length, 2896);
  assert.equal(runeCount, 12956);
  assert.equal(parsed.runeCount, runeCount);
  assert.equal(grid.bytes.length, 256);

  const key = grid.bytes.map(value => mod(value));
  const model = train(words(shakespeare.slice(0, 200000)));
  const original = [];
  for (const sign of [1, -1]) {
    for (const transparentF of [false, true]) {
      const {pad, transparent, keyDraws} =
        makeOriginalPad(ciphertext, key, sign, transparentF);
      const decoded = decode(ciphertext, pad, transparent, model);
      original.push({
        sign,
        transparentF,
        keyDraws,
        ...summarize(decoded, runeCount, corpus.translit)
      });
    }
  }

  const sourceWords = words(shakespeare.slice(240000));
  const plant = makePositivePlant(wordLengths, sourceWords, key);
  const transparent = Array(plant.pad.length).fill(false);
  const recovered = decode(plant.planted.ciphertext, plant.pad, transparent, model);
  const truth = plant.plaintext.flat();
  const prediction = recovered.flatMap(word => word.sequence);
  const correct = prediction.reduce((n, rune, i) => n + Number(rune === truth[i]), 0);
  const positiveControl = {
    seed:"0x391702",
    fallbackWords:plant.fallbackWords,
    overwrittenRunes:plant.planted.rewritten.filter(Boolean).length,
    correctRunes:correct,
    totalRunes:runeCount,
    accuracy:correct / runeCount,
    lexicalWords:recovered.filter(word => word.origin === "lexicon").length,
    scorePerRune:recovered.reduce((sum, word) => sum + word.score, 0) / runeCount
  };

  return {
    classification:"conditional original-source key test; no plaintext recovered",
    cipherHypothesis:"C=P+K mod29 with q=.81 collision repair and T6(x)=24-2x mod29",
    keyHypothesis:"printed p50 32x8 row-major 256-byte table; K[i]=byte[i mod256] mod29",
    scope:"global key clock from first original LP2 rune; no phase search, reversal, radix alternative or page reset",
    source: {
      words:ciphertext.length,
      runes:runeCount,
      keyBytes:grid.bytes.length,
      keyPrefix:key.slice(0,32),
      trainingWords:words(shakespeare.slice(0,200000)).length,
      modelMix:MIX
    },
    originalCandidates:original,
    positiveControl
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, inverseCandidates};
