"use strict";

/**
 * Director #1515: recover or exclude one phase-zero 256-symbol additive GP29
 * value layer beneath the frozen #1422 zero->F moving-exception surface inverse.
 *
 * Exact family:
 *   M[i] = P[i] + K[i mod 256] (mod 29)
 * where M is the frozen #1422 intermediate and K is one unknown 256-rune key.
 *
 * Recovery objective is frozen before original evaluation:
 * - source-native GP29 bigram language model trained on Shakespeare + Emerson;
 * - authentic printed word boundaries;
 * - no phase search, resets, alternate sign, transposition or outer changes.
 *
 * The 256 key symbols form a 29-state cyclic chain. The pairwise objective is
 * solved exactly by Viterbi after fixing each of the 29 possible K[0] values.
 * Positive controls use Gibran words with the exact original LP2 word lengths,
 * three deterministic random 256-rune keys and the full frozen outer wrapper.
 *
 * Node.js 22, CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const pathMod = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = pathMod.resolve(__dirname, "..");
const read = name => fs.readFileSync(pathMod.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = grid.bytes;
const tokens = grid.pages.flatMap(page => page.tokens);
const pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
const original = pages.flatMap(page => page.indices);

assert.equal(original.length, 12956);
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);

const pageAt = new Uint8Array(original.length);
let pageOffset = 0;
for (const page of pages) {
  pageAt.fill(page.page, pageOffset, pageOffset + page.indices.length);
  pageOffset += page.indices.length;
}
assert.equal(pageOffset, original.length);

const sourceText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const wordArrays = (sourceText.match(runePattern) || []).map(word =>
  Array.from(word, glyph => glyphIndex.get(glyph)));
assert.equal(wordArrays.length, 2896);
assert.deepEqual(wordArrays.flat(), original);

const words = [];
let offset = 0;
for (const values of wordArrays) {
  words.push({ start: offset, end: offset + values.length, length: values.length });
  offset += values.length;
}
assert.equal(offset, original.length);

const special = [
  corpus.translit.indexOf("F"),
  ...corpus.translit.map((value, index) =>
    value.length === 2 ? index : -1).filter(index => index >= 0)
];
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);

/** @param {number} value @param {number} left @param {number} right */
function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

/** @param {number} control */
function marker(control) {
  if (tokens[control][0] === "0") return 0;
  return special[bytes[control] & 7];
}

/** @param {number[]} plain */
function outerEncrypt(plain) {
  const cipher = new Array(plain.length);
  cipher[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    const control = (i - 1) & 255;
    cipher[i] = swap(plain[i], cipher[i - 1], marker(control));
  }
  return cipher;
}

/** @param {number[]} cipher */
function outerDecrypt(cipher) {
  const plain = new Array(cipher.length);
  plain[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    const control = (i - 1) & 255;
    plain[i] = swap(cipher[i], cipher[i - 1], marker(control));
  }
  return plain;
}

const frozenIntermediate = outerDecrypt(original);
assert.deepEqual(outerEncrypt(frozenIntermediate), original);
assert.equal(frozenIntermediate.reduce(
  (n, value, i) => n + Number(value !== original[i]), 0), 549);

/** @param {string} file */
function encodedWords(file) {
  const out = [];
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (encoded.length) out.push(encoded);
  }
  return out;
}

const BOUNDARY = 29;
const ALPHABET = 30;
const transitionCounts = Array.from({ length: ALPHABET },
  () => new Float64Array(ALPHABET));

for (const file of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
]) {
  for (const word of encodedWords(file)) {
    let prev = BOUNDARY;
    for (const value of word) {
      transitionCounts[prev][value]++;
      prev = value;
    }
    transitionCounts[prev][BOUNDARY]++;
  }
}

const alpha = 0.25;
const logP = Array.from({ length: ALPHABET }, () => new Float64Array(ALPHABET));
for (let a = 0; a < ALPHABET; a++) {
  const total = transitionCounts[a].reduce((sum, value) => sum + value, 0);
  const denom = total + alpha * ALPHABET;
  for (let b = 0; b < ALPHABET; b++) {
    logP[a][b] = Math.log((transitionCounts[a][b] + alpha) / denom);
  }
}

/** @param {number} value @param {number} key */
function sub29(value, key) {
  const result = value - key;
  return result < 0 ? result + 29 : result;
}

/**
 * @param {number[]} intermediate
 * @param {(page:number)=>boolean} pageAllowed
 */
function buildObjective(intermediate, pageAllowed) {
  const unary = Array.from({ length: 256 }, () => new Float64Array(29));
  const edges = Array.from({ length: 256 }, () => new Float64Array(29 * 29));
  const phaseObs = new Uint32Array(256);
  let usedWords = 0;
  let usedRunes = 0;

  for (const word of words) {
    let allowed = true;
    for (let i = word.start; i < word.end; i++) {
      if (!pageAllowed(pageAt[i])) {
        allowed = false;
        break;
      }
    }
    if (!allowed) continue;

    usedWords++;
    usedRunes += word.length;

    const first = word.start;
    const last = word.end - 1;
    const firstPhase = first & 255;
    const lastPhase = last & 255;
    phaseObs[firstPhase]++;
    phaseObs[lastPhase]++;

    for (let key = 0; key < 29; key++) {
      unary[firstPhase][key] += logP[BOUNDARY][sub29(intermediate[first], key)];
      unary[lastPhase][key] += logP[sub29(intermediate[last], key)][BOUNDARY];
    }

    for (let i = word.start; i + 1 < word.end; i++) {
      const phase = i & 255;
      phaseObs[phase]++;
      const left = intermediate[i];
      const right = intermediate[i + 1];
      const edge = edges[phase];
      for (let ka = 0; ka < 29; ka++) {
        const pa = sub29(left, ka);
        const row = ka * 29;
        for (let kb = 0; kb < 29; kb++) {
          edge[row + kb] += logP[pa][sub29(right, kb)];
        }
      }
    }
  }

  return { unary, edges, phaseObs, usedWords, usedRunes };
}

/**
 * Exact maximum-likelihood solution of the 256-state ring for the frozen
 * unary + adjacent-pair objective.
 *
 * @param {{unary:Float64Array[],edges:Float64Array[]}} objective
 */
function recoverKey(objective) {
  const { unary, edges } = objective;
  let globalScore = -Infinity;
  let globalKey = null;

  for (let startKey = 0; startKey < 29; startKey++) {
    let prev = new Float64Array(29);
    prev.fill(-Infinity);
    prev[startKey] = unary[0][startKey];

    const back = Array.from({ length: 256 }, () => new Int8Array(29));

    for (let phase = 0; phase < 255; phase++) {
      const next = new Float64Array(29);
      next.fill(-Infinity);
      const edge = edges[phase];

      for (let kb = 0; kb < 29; kb++) {
        let bestScore = -Infinity;
        let bestKa = 0;
        for (let ka = 0; ka < 29; ka++) {
          const score = prev[ka] + edge[ka * 29 + kb];
          if (score > bestScore) {
            bestScore = score;
            bestKa = ka;
          }
        }
        next[kb] = bestScore + unary[phase + 1][kb];
        back[phase + 1][kb] = bestKa;
      }
      prev = next;
    }

    let endKey = 0;
    let score = -Infinity;
    const closing = edges[255];
    for (let k255 = 0; k255 < 29; k255++) {
      const candidate = prev[k255] + closing[k255 * 29 + startKey];
      if (candidate > score) {
        score = candidate;
        endKey = k255;
      }
    }

    if (score > globalScore) {
      const key = new Int8Array(256);
      key[255] = endKey;
      for (let phase = 255; phase >= 1; phase--) {
        key[phase - 1] = back[phase][key[phase]];
      }
      assert.equal(key[0], startKey);
      globalScore = score;
      globalKey = key;
    }
  }

  return { key: Array.from(globalKey), score: globalScore };
}

/** @param {number[]} intermediate @param {number[]} key */
function decodeInner(intermediate, key) {
  return intermediate.map((value, i) => sub29(value, key[i & 255]));
}

/** @param {number[]} plain @param {number[]} key */
function encodeInner(plain, key) {
  return plain.map((value, i) => (value + key[i & 255]) % 29);
}

/** @param {number} seed */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

const gibranPools = new Map();
for (const word of encodedWords("resources/control/gibran_prophet_58585.txt")) {
  if (!gibranPools.has(word.length)) gibranPools.set(word.length, []);
  gibranPools.get(word.length).push(word);
}
for (const word of words) assert.ok(gibranPools.get(word.length)?.length);

/** @param {number} seed */
function makePlantPlain(seed) {
  const random = xorshift32(seed);
  return wordArrays.flatMap(word => {
    const pool = gibranPools.get(word.length);
    return pool[random() % pool.length];
  });
}

/** @param {number} seed */
function makeKey(seed) {
  const random = xorshift32(seed);
  return Array.from({ length: 256 }, () => random() % 29);
}

/** @param {number[]} a @param {number[]} b */
function accuracy(a, b) {
  assert.equal(a.length, b.length);
  let hits = 0;
  for (let i = 0; i < a.length; i++) hits += Number(a[i] === b[i]);
  return hits / a.length;
}

/** @param {number[]} stream @param {(page:number)=>boolean} pageAllowed */
function selectByPage(stream, pageAllowed) {
  const out = [];
  for (let i = 0; i < stream.length; i++) {
    if (pageAllowed(pageAt[i])) out.push(stream[i]);
  }
  return out;
}

/** @param {number[]} stream */
function ioc(stream) {
  const counts = new Uint32Array(29);
  for (const value of stream) counts[value]++;
  const numerator = Array.from(counts)
    .reduce((sum, value) => sum + value * (value - 1), 0);
  return numerator / (stream.length * (stream.length - 1));
}

/** @param {number[]} stream @param {(page:number)=>boolean} pageAllowed */
function meanLanguageLogP(stream, pageAllowed) {
  let total = 0;
  let transitions = 0;
  for (const word of words) {
    let allowed = true;
    for (let i = word.start; i < word.end; i++) {
      if (!pageAllowed(pageAt[i])) {
        allowed = false;
        break;
      }
    }
    if (!allowed) continue;
    let prev = BOUNDARY;
    for (let i = word.start; i < word.end; i++) {
      total += logP[prev][stream[i]];
      transitions++;
      prev = stream[i];
    }
    total += logP[prev][BOUNDARY];
    transitions++;
  }
  return total / transitions;
}

const dictionaryByLength = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  const key = encoded.join(",");
  if (!dictionaryByLength.has(encoded.length)) {
    dictionaryByLength.set(encoded.length, new Set());
  }
  dictionaryByLength.get(encoded.length).add(key);
}

/** @param {number[]} stream @param {(page:number)=>boolean} pageAllowed */
function dictionaryStats(stream, pageAllowed) {
  let exactWords = 0;
  let longWords = 0;
  let exactLong = 0;
  let runWords = 0;
  let runRunes = 0;
  let bestRunWords = 0;
  let bestRunRunes = 0;

  for (const word of words) {
    let allowed = true;
    for (let i = word.start; i < word.end; i++) {
      if (!pageAllowed(pageAt[i])) {
        allowed = false;
        break;
      }
    }
    if (!allowed) {
      runWords = 0;
      runRunes = 0;
      continue;
    }

    const values = stream.slice(word.start, word.end);
    const hit = dictionaryByLength.get(values.length)?.has(values.join(",")) || false;
    if (values.length >= 5) longWords++;
    if (hit) {
      exactWords++;
      if (values.length >= 5) exactLong++;
      runWords++;
      runRunes += values.length;
      if (runWords > bestRunWords) bestRunWords = runWords;
      if (runRunes > bestRunRunes) bestRunRunes = runRunes;
    } else {
      runWords = 0;
      runRunes = 0;
    }
  }

  return { exactWords, longWords, exactLong, bestRunWords, bestRunRunes };
}

/** @param {number[]} stream @param {(page:number)=>boolean} pageAllowed */
function renderFirstWords(stream, pageAllowed, limit) {
  const out = [];
  for (const word of words) {
    let allowed = true;
    for (let i = word.start; i < word.end; i++) {
      if (!pageAllowed(pageAt[i])) {
        allowed = false;
        break;
      }
    }
    if (!allowed) continue;
    out.push(stream.slice(word.start, word.end)
      .map(value => corpus.translit[value]).join(""));
    if (out.length >= limit) break;
  }
  return out;
}

const train = page => page <= 39;
const trainA = page => page <= 22;
const trainB = page => page >= 23 && page <= 39;
const blindMain = page => page >= 40 && page <= 53;
const blindTerminal = page => page >= 54 && page <= 55;
const blindAll = page => page >= 40 && page <= 55;

const plantPlain = makePlantPlain(0x33011515);
const plantResults = [];
for (const seed of [0x15150001, 0x15150002, 0x15150003]) {
  const trueKey = makeKey(seed);
  const syntheticIntermediate = encodeInner(plantPlain, trueKey);
  const syntheticCipher = outerEncrypt(syntheticIntermediate);
  const recoveredIntermediate = outerDecrypt(syntheticCipher);
  assert.deepEqual(recoveredIntermediate, syntheticIntermediate);

  const recovered = recoverKey(buildObjective(recoveredIntermediate, train));
  const decoded = decodeInner(recoveredIntermediate, recovered.key);
  const blindTruth = selectByPage(plantPlain, blindAll);
  const blindDecoded = selectByPage(decoded, blindAll);

  plantResults.push({
    seed,
    keyAccuracy: accuracy(recovered.key, trueKey),
    blindRuneAccuracy: accuracy(blindDecoded, blindTruth),
    blindLanguageLogP: meanLanguageLogP(decoded, blindAll),
    blindTruthLanguageLogP: meanLanguageLogP(plantPlain, blindAll)
  });
}

const minimumPlantKeyAccuracy = Math.min(...plantResults.map(x => x.keyAccuracy));
const minimumPlantBlindAccuracy = Math.min(...plantResults.map(x => x.blindRuneAccuracy));
assert.ok(minimumPlantKeyAccuracy >= 0.98,
  "frozen optimizer must recover >=98% of random planted key symbols");
assert.ok(minimumPlantBlindAccuracy >= 0.98,
  "frozen optimizer must recover >=98% of blind planted runes");

const fullObjective = buildObjective(frozenIntermediate, train);
const recoveredFull = recoverKey(fullObjective);
const decodedOriginal = decodeInner(frozenIntermediate, recoveredFull.key);
assert.deepEqual(encodeInner(decodedOriginal, recoveredFull.key), frozenIntermediate);
assert.deepEqual(outerEncrypt(encodeInner(decodedOriginal, recoveredFull.key)), original);

const recoveredA = recoverKey(buildObjective(frozenIntermediate, trainA));
const recoveredB = recoverKey(buildObjective(frozenIntermediate, trainB));

const blindMainStream = selectByPage(decodedOriginal, blindMain);
const blindTerminalStream = selectByPage(decodedOriginal, blindTerminal);
const blindAllStream = selectByPage(decodedOriginal, blindAll);

const result = {
  model: "frozen zero->F outer inverse + phase-zero period256 additive GP29 key",
  languageModel: "source-native GP29 boundary-aware bigram, Shakespeare+Emerson only, alpha=0.25",
  optimizer: "exact cyclic 29-state Viterbi over all 256 additive key symbols",
  trainingPages: "p0-p39",
  holdouts: ["p40-p53", "p54-p55"],
  positiveControl: {
    plaintextRegister: "Gibran words resampled to exact original GP29 word lengths",
    plants: plantResults,
    minimumPlantKeyAccuracy,
    minimumPlantBlindAccuracy
  },
  original: {
    exactTwoLayerReencryption: true,
    trainingObjectiveScore: recoveredFull.score,
    keyAgreementA_B: accuracy(recoveredA.key, recoveredB.key),
    keyAgreementFull_A: accuracy(recoveredFull.key, recoveredA.key),
    keyAgreementFull_B: accuracy(recoveredFull.key, recoveredB.key),
    phaseObservationMin: Math.min(...fullObjective.phaseObs),
    phaseObservationMax: Math.max(...fullObjective.phaseObs),
    blindMain: {
      runes: blindMainStream.length,
      ioc: ioc(blindMainStream),
      meanLanguageLogP: meanLanguageLogP(decodedOriginal, blindMain),
      dictionary: dictionaryStats(decodedOriginal, blindMain),
      firstWords: renderFirstWords(decodedOriginal, blindMain, 40)
    },
    blindTerminal: {
      runes: blindTerminalStream.length,
      ioc: ioc(blindTerminalStream),
      meanLanguageLogP: meanLanguageLogP(decodedOriginal, blindTerminal),
      dictionary: dictionaryStats(decodedOriginal, blindTerminal),
      firstWords: renderFirstWords(decodedOriginal, blindTerminal, 40)
    },
    blindAll: {
      runes: blindAllStream.length,
      ioc: ioc(blindAllStream),
      meanLanguageLogP: meanLanguageLogP(decodedOriginal, blindAll),
      dictionary: dictionaryStats(decodedOriginal, blindAll)
    }
  }
};

console.log(JSON.stringify(result, null, 2));
