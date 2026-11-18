"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = grid.bytes;
const tokens = grid.pages.flatMap((page) => page.tokens);
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const original = pages.flatMap((page) => page.indices);
assert.equal(original.length, 12956);

const sourceText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const words = (sourceText.match(runePattern) || []).map((word) =>
  Array.from(word, (glyph) => glyphIndex.get(glyph)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

const wordIdAt = new Int32Array(original.length);
const wordStart = [];
const wordEnd = [];
let offset = 0;
for (let w = 0; w < words.length; w++) {
  wordStart[w] = offset;
  wordIdAt.fill(w, offset, offset + words[w].length);
  offset += words[w].length;
  wordEnd[w] = offset;
}
assert.equal(offset, original.length);

const pageStarts = new Map();
offset = 0;
for (const page of pages) {
  pageStarts.set(page.page, offset);
  offset += page.indices.length;
}
const trainEnd = pageStarts.get(3);
const trainingPages = [
  {name: "p0", from: 0, to: pageStarts.get(1)},
  {name: "p1", from: pageStarts.get(1), to: pageStarts.get(2)},
  {name: "p2", from: pageStarts.get(2), to: pageStarts.get(3)}
];
const holdoutAStart = pageStarts.get(40);
const holdoutBStart = pageStarts.get(54);
assert.equal(trainEnd, 729);
assert.ok(holdoutAStart > trainEnd && holdoutBStart > holdoutAStart);

const special = [
  corpus.translit.indexOf("F"),
  ...corpus.translit.map((value, index) =>
    value.length === 2 ? index : -1).filter((index) => index >= 0)
];
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);

function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

function marker(control) {
  if (tokens[control][0] === "0") return 0;
  return special[bytes[control] & 7];
}

function zeroFEncrypt(plain) {
  const cipher = new Array(plain.length);
  cipher[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    cipher[i] = swap(plain[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return cipher;
}

function zeroFDecrypt(cipher) {
  const plain = new Array(cipher.length);
  plain[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    plain[i] = swap(cipher[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return plain;
}

const z = Uint8Array.from({length: original.length}, (unused, i) =>
  Number(bytes[i & 255] < 60));

function affineEncode(plain, key) {
  const out = new Array(plain.length);
  let previous = 0;
  for (let i = 0; i < plain.length; i++) {
    const a = z[i] ? key.a1 : key.a0;
    const b = z[i] ? key.b1 : key.b0;
    out[i] = (plain[i] + a * previous + b) % 29;
    previous = plain[i];
  }
  return out;
}

function affineDecode(intermediate, key) {
  const out = new Array(intermediate.length);
  let previous = 0;
  for (let i = 0; i < intermediate.length; i++) {
    const a = z[i] ? key.a1 : key.a0;
    const b = z[i] ? key.b1 : key.b0;
    const value = ((intermediate[i] - a * previous - b) % 29 + 29) % 29;
    out[i] = value;
    previous = value;
  }
  return out;
}

const triCounts = new Uint32Array(29 * 29 * 29);
const contexts = new Uint32Array(29 * 29);
for (const file of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
]) {
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    for (let i = 2; i < encoded.length; i++) {
      const ab = encoded[i - 2] * 29 + encoded[i - 1];
      triCounts[ab * 29 + encoded[i]]++;
      contexts[ab]++;
    }
  }
}
const triLog = new Float64Array(triCounts.length);
for (let ab = 0; ab < contexts.length; ab++) {
  const denominator = contexts[ab] + 14.5;
  for (let c = 0; c < 29; c++) {
    triLog[ab * 29 + c] =
      Math.log((triCounts[ab * 29 + c] + 0.5) / denominator);
  }
}
const triEligible = new Uint8Array(original.length);
for (let i = 2; i < original.length; i++) {
  triEligible[i] = Number(
    wordIdAt[i] === wordIdAt[i - 1] && wordIdAt[i] === wordIdAt[i - 2]);
}

function scoreKey(intermediate, a0, a1, b0, b1, scoreFrom, scoreTo) {
  let p2 = 0;
  let p1 = 0;
  let score = 0;
  for (let i = 0; i < scoreTo; i++) {
    const a = z[i] ? a1 : a0;
    const b = z[i] ? b1 : b0;
    const p = ((intermediate[i] - a * p1 - b) % 29 + 29) % 29;
    if (i >= scoreFrom && triEligible[i]) {
      score += triLog[(p2 * 29 + p1) * 29 + p];
    }
    p2 = p1;
    p1 = p;
  }
  return score;
}

function exhaustiveTop64(intermediate, scoreFrom, scoreTo) {
  const top = [];
  for (let a0 = 0; a0 < 29; a0++) {
    for (let a1 = 0; a1 < 29; a1++) {
      for (let b0 = 0; b0 < 29; b0++) {
        for (let b1 = 0; b1 < 29; b1++) {
          const candidate = {
            score: scoreKey(intermediate, a0, a1, b0, b1, scoreFrom, scoreTo),
            a0, a1, b0, b1
          };
          if (top.length < 64 || candidate.score > top[top.length - 1].score) {
            let at = top.length;
            while (at > 0 && candidate.score > top[at - 1].score) at--;
            top.splice(at, 0, candidate);
            if (top.length > 64) top.pop();
          }
        }
      }
    }
  }
  return top;
}

function nativePools(file) {
  const pools = new Map();
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (!pools.has(encoded.length)) pools.set(encoded.length, []);
    pools.get(encoded.length).push(encoded);
  }
  return pools;
}

const pools = nativePools("resources/control/shakespeare_first300k.txt");
let pick = 0;
const plantedPlain = words.flatMap((word) => {
  const options = pools.get(word.length);
  assert.ok(options?.length);
  const selected = options[(pick * 1033 + word.length * 3301) % options.length];
  pick++;
  return selected;
});
let randomState = 0x33011033;
function nextRandom29() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  randomState >>>= 0;
  return randomState % 29;
}
const plantedKeys = Array.from({length: 3}, () => ({
  a0: nextRandom29(),
  a1: nextRandom29(),
  b0: nextRandom29(),
  b1: nextRandom29()
}));
const plantedResults = plantedKeys.map((plantedKey) => {
  const plantedIntermediate = affineEncode(plantedPlain, plantedKey);
  const plantedCipher = zeroFEncrypt(plantedIntermediate);
  assert.deepEqual(zeroFDecrypt(plantedCipher), plantedIntermediate);
  assert.deepEqual(affineDecode(plantedIntermediate, plantedKey), plantedPlain);
  assert.deepEqual(zeroFEncrypt(affineEncode(plantedPlain, plantedKey)), plantedCipher);
  const plantedTop = exhaustiveTop64(plantedIntermediate, 0, trainEnd);
  const plantedRank = plantedTop.findIndex((candidate) =>
    candidate.a0 === plantedKey.a0 && candidate.a1 === plantedKey.a1 &&
    candidate.b0 === plantedKey.b0 && candidate.b1 === plantedKey.b1) + 1;
  assert.ok(plantedRank > 0 && plantedRank <= 64);
  return {key: plantedKey, exhaustiveTop64Rank: plantedRank, exactRoundtrip: true};
});

const intermediate = zeroFDecrypt(original);
assert.deepEqual(zeroFEncrypt(intermediate), original);
const top = exhaustiveTop64(intermediate, 0, trainEnd);
assert.equal(top.length, 64);
const splitWinners = trainingPages.map((slice) => ({
  ...slice,
  winner: exhaustiveTop64(intermediate, slice.from, slice.to)[0]
}));

const dictionaryByLength = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  if (!dictionaryByLength.has(encoded.length)) {
    dictionaryByLength.set(encoded.length, new Set());
  }
  dictionaryByLength.get(encoded.length).add(encoded.join(","));
}

function dictionaryStats(decoded, from, to) {
  let eligibleWords = 0;
  let hits = 0;
  let longHits = 0;
  let longestRunWords = 0;
  let longestRunRunes = 0;
  let runWords = 0;
  let runRunes = 0;
  for (let w = 0; w < words.length; w++) {
    if (wordStart[w] < from || wordEnd[w] > to) continue;
    eligibleWords++;
    const candidate = decoded.slice(wordStart[w], wordEnd[w]);
    const hit = dictionaryByLength.get(candidate.length)?.has(candidate.join(",")) || false;
    if (hit) {
      hits++;
      if (candidate.length >= 5) longHits++;
      runWords++;
      runRunes += candidate.length;
      longestRunWords = Math.max(longestRunWords, runWords);
      longestRunRunes = Math.max(longestRunRunes, runRunes);
    } else {
      runWords = 0;
      runRunes = 0;
    }
  }
  return {eligibleWords, hits, longHits, longestRunWords, longestRunRunes};
}

function render(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const evaluated = top.map((candidate, rank0) => {
  const key = {a0: candidate.a0, a1: candidate.a1,
    b0: candidate.b0, b1: candidate.b1};
  const decoded = affineDecode(intermediate, key);
  assert.deepEqual(affineEncode(decoded, key), intermediate);
  return {
    rank: rank0 + 1,
    ...candidate,
    holdoutP40P53: dictionaryStats(decoded, holdoutAStart, holdoutBStart),
    holdoutP54P55: dictionaryStats(decoded, holdoutBStart, decoded.length),
    p40Prefix: rank0 < 4 ? render(decoded.slice(holdoutAStart, holdoutAStart + 96)) : undefined,
    p54Prefix: rank0 < 4 ? render(decoded.slice(holdoutBStart, holdoutBStart + 96)) : undefined
  };
});
const blindSummary = {
  candidatesEvaluated: evaluated.length,
  maxP40P53LongHits: Math.max(...evaluated.map((row) => row.holdoutP40P53.longHits)),
  maxP54P55LongHits: Math.max(...evaluated.map((row) => row.holdoutP54P55.longHits)),
  maxP40P53DictionaryRunRunes: Math.max(...evaluated.map(
    (row) => row.holdoutP40P53.longestRunRunes)),
  maxP54P55DictionaryRunRunes: Math.max(...evaluated.map(
    (row) => row.holdoutP54P55.longestRunRunes))
};

console.log(JSON.stringify({
  familySize: 29 ** 4,
  training: {pages: "p0-p2", runes: trainEnd,
    score: "native-GP within-word trigram log likelihood"},
  plantedPositive: plantedResults,
  independentTrainingPageWinners: splitWinners,
  blindSummary,
  originalTop16: evaluated.slice(0, 16)
}, null, 2));
