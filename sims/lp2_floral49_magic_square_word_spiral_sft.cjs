"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

/**
 * Reconstruct complete unsolved-LP2 words across printed line and page wraps.
 * @param {string} raw Community transcription with original page separators
 * @returns {Array<{page:number,runes:string,length:number}>}
 */
function parseWords(raw) {
  const parts = raw.split("%").slice(0, 55);
  const out = [];
  let page = 0;
  let first = 0;
  let active = "";

  function finish() {
    if (!active) return;
    out.push({page:first, runes:active, length:[...active].length});
    active = "";
  }

  for (const character of parts.join("%")) {
    if (/[\u16A0-\u16FF]/u.test(character)) {
      if (!active) first = page;
      active += character;
    } else if (character === "%") {
      page++;
    } else if (character !== "/" && !/\s/u.test(character)) {
      finish();
    }
  }
  finish();
  return out;
}

/**
 * Central clockwise outward 7x7 spiral, matching the direction of p15.
 * @returns {number[]} Exactly 49 zero-based row-major positions
 */
function spiral() {
  const out = [24];
  const directions = [[0,1],[1,0],[0,-1],[-1,0]];
  let row = 3;
  let col = 3;
  let stepLength = 1;
  let direction = 0;
  while (out.length < 49) {
    for (let repeat = 0; repeat < 2 && out.length < 49; repeat++) {
      const [dr,dc] = directions[direction++ % 4];
      for (let step = 0; step < stepLength && out.length < 49; step++) {
        row += dr;
        col += dc;
        if (row >= 0 && row < 7 && col >= 0 && col < 7) {
          out.push(row * 7 + col);
        }
      }
    }
    stepLength++;
  }
  return out;
}

/**
 * Reorder a complete sequence in independently aligned 49-word blocks.
 * @template T
 * @param {T[]} words
 * @param {number[]} permutation
 * @returns {T[]}
 */
function apply(words, permutation) {
  assert.equal(words.length % 49, 0);
  const out = [];
  for (let offset = 0; offset < words.length; offset += 49) {
    for (const index of permutation) out.push(words[offset + index]);
  }
  return out;
}

/**
 * Plugin mutual information of adjacent word lengths, clipped at nine.
 * @param {number[]} values Numbers in 0..8
 * @returns {number}
 */
function mi(values) {
  const transitions = new Float64Array(81);
  const rows = new Float64Array(9);
  const cols = new Float64Array(9);
  const count = values.length - 1;
  for (let i = 1; i < values.length; i++) {
    const a = values[i - 1];
    const b = values[i];
    transitions[a * 9 + b]++;
    rows[a]++;
    cols[b]++;
  }
  let information = 0;
  for (let a = 0; a < 9; a++) {
    for (let b = 0; b < 9; b++) {
      const n = transitions[a * 9 + b];
      if (n) information += n / count * Math.log(n * count / (rows[a] * cols[b]));
    }
  }
  return information;
}

/**
 * GP word lengths from an independent historical English control.
 * @param {string} text
 * @returns {number[]} Zero-based clipped rune word lengths
 */
function nativeLengths(text) {
  return [...text.matchAll(/[A-Za-z]+/g)].map((match) => {
    const normalized = match[0].toUpperCase().replace(/ING|TH|NG|EO|OE|AE|IA|EA|IO/g, "X");
    return Math.min(normalized.length, 9) - 1;
  });
}

/**
 * Train a fixed first-order natural-English word-length likelihood ratio.
 * @param {number[]} controls
 * @returns {(candidate:number[])=>number}
 */
function trainScore(controls) {
  const pairs = new Float64Array(81);
  const row = new Float64Array(9);
  const marginal = new Float64Array(9);
  for (let i = 1; i < controls.length; i++) {
    const a = controls[i - 1];
    const b = controls[i];
    pairs[a * 9 + b]++;
    row[a]++;
    marginal[b]++;
  }
  const alpha = 0.5;
  const n = controls.length - 1;
  return (candidate) => {
    let score = 0;
    for (let i = 1; i < candidate.length; i++) {
      const a = candidate[i - 1];
      const b = candidate[i];
      score += Math.log((pairs[a * 9 + b] + alpha) / (row[a] + 9 * alpha));
      score -= Math.log((marginal[b] + alpha) / (n + 9 * alpha));
    }
    return score / (candidate.length - 1);
  };
}

/**
 * Exact-inventory xorshift32 shuffle.
 * @param {number} seed
 * @returns {(array:number[])=>number[]}
 */
function shuffler(seed) {
  let state = seed;
  return (source) => {
    const result = source.slice();
    for (let i = result.length - 1; i > 0; i--) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      const j = (state >>> 0) % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
}

/**
 * GP29 rune collision probability.
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const counts = new Float64Array(29);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const words = parseWords(read("resources/lp2-transcription.txt"));
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, item) => sum + item.length, 0), 12956);
const floral = words.filter((item) => item.page >= 40);
assert.equal(floral.length, 735);
assert.equal(floral.reduce((sum, item) => sum + item.length, 0), 3316);

const squareParts = read("resources/cicada2014-openpuff-magic-squares.txt").trim().split(/\n\s*\n/u);
assert.equal(squareParts.length, 3);
const square = squareParts[1].trim().split(/\s+/u).map(Number);
assert.equal(square.length, 49);
for (let r = 0; r < 7; r++) {
  assert.equal(square.slice(r * 7, r * 7 + 7).reduce((a,b) => a+b, 0), 1033);
}
assert.equal(square[24], 331);

const indices = new Map(JSON.parse(read("resources/liber-primus/lp2-corpus.json")).runes.map((r,i) => [r,i]));
const original = floral.flatMap((entry) => [...entry.runes].map((rune) => indices.get(rune)));
assert.equal(original.length, 3316);
const additive = [];
for (const sign of [1, -1]) for (const colMajor of [false, true]) {
  const candidate = floral.flatMap((entry, index) => {
    const j = index % 49;
    const squareIndex = colMajor ? (j % 7) * 7 + Math.floor(j / 7) : j;
    const key = square[squareIndex] % 29;
    return [...entry.runes].map((rune) => (indices.get(rune) + sign * key + 29) % 29);
  });
  additive.push({sign, colMajor, ioc:ioc(candidate)});
}

const order = spiral();
assert.deepEqual(order.slice(0, 8), [24,25,32,31,30,23,16,17]);
assert.equal(new Set(order).size, 49);
const inverse = Array(49);
for (let i = 0; i < 49; i++) inverse[order[i]] = i;
const lengths = floral.map((item) => Math.min(item.length, 9) - 1);
assert.deepEqual(apply(apply(lengths, order), inverse), lengths);

const observed = {
  original:mi(lengths),
  forward:mi(apply(lengths, order)),
  inverse:mi(apply(lengths, inverse)),
  transpose:mi(apply(lengths, Array.from({length:49}, (_,i) => (i%7)*7+Math.floor(i/7))))
};
const close = (a,b) => assert.ok(Math.abs(a-b) < 1e-10, String(a)+" != "+String(b));
close(observed.original, 0.04347262684800185);
close(observed.forward, 0.04677117098077887);
close(observed.inverse, 0.06769154117504231);
close(observed.transpose, 0.047957745890385255);

const shuffle = shuffler(0x33014549);
const N = 20000;
let inverseHits = 0;
let eitherHits = 0;
let sum = 0;
let squared = 0;
for (let trial = 0; trial < N; trial++) {
  const shuffled = shuffle(lengths);
  const a = mi(apply(shuffled, order));
  const b = mi(apply(shuffled, inverse));
  if (b >= observed.inverse) inverseHits++;
  if (Math.max(a,b) >= Math.max(observed.forward, observed.inverse)) eitherHits++;
  sum += b;
  squared += b*b;
}
const nullMean = sum/N;
const nullSD = Math.sqrt(squared/N-nullMean*nullMean);
assert.equal(inverseHits, 155);
assert.equal(eitherHits, 301);

const gibran = nativeLengths(read("resources/control/gibran_prophet_58585.txt"));
const emerson = nativeLengths(read("resources/control/emerson_essays_2944.txt"));
const shakespeare = nativeLengths(read("resources/control/shakespeare_first300k.txt"));
assert.deepEqual([gibran.length,emerson.length,shakespeare.length], [15733,77932,55407]);
const score = trainScore(gibran.concat(emerson));
const language = [score(lengths), score(apply(lengths,order)), score(apply(lengths,inverse))];
close(language[0], -0.04124237927915793);
close(language[1], -0.04886400393171377);
close(language[2], -0.03995665982135137);

const independentShuffle = shuffler(0x4d415049);
const T = 10000;
let languageHits = 0;
let languageEitherHits = 0;
let languageSum = 0;
for (let trial = 0; trial < T; trial++) {
  const sequence = independentShuffle(lengths);
  const forward = score(apply(sequence,order));
  const backwards = score(apply(sequence,inverse));
  if (backwards >= language[2]) languageHits++;
  if (Math.max(forward,backwards) >= Math.max(language[1],language[2])) languageEitherHits++;
  languageSum += backwards;
}
assert.equal(languageHits, 6585);
assert.equal(languageEitherHits, 8481);

let heldBefore=0, heldAfter=0, nativeWindows=0;
for (let offset=0; offset+735 < shakespeare.length; offset+=735) {
  const sample=shakespeare.slice(offset,offset+735);
  heldBefore+=score(sample);
  heldAfter+=score(apply(sample,inverse));
  nativeWindows++;
}
assert.equal(nativeWindows,75);


/**
 * Exact all-secret equality invariant for equal square-cell values.
 * @param {number[][]} wordRunes Full GP29 words in original 49-word blocks
 * @param {boolean} resetEachBlock Whether each block may have independent 29! keys
 * @returns {{equalPairs:number,eligiblePairs:number,rate:number}}
 */
function squareClassEquality(wordRunes, resetEachBlock) {
  const inventories = new Map();
  for (let i = 0; i < wordRunes.length; i++) {
    const key = (resetEachBlock ? String(Math.floor(i / 49)) + ":" : "") +
      String(square[i % 49]);
    if (!inventories.has(key)) inventories.set(key, []);
    inventories.get(key).push(...wordRunes[i]);
  }
  let equalPairs = 0;
  let eligiblePairs = 0;
  for (const glyphs of inventories.values()) {
    const frequency = new Uint32Array(29);
    for (const value of glyphs) frequency[value]++;
    for (const count of frequency) equalPairs += count * (count - 1);
    eligiblePairs += glyphs.length * (glyphs.length - 1);
  }
  return {equalPairs, eligiblePairs, rate:equalPairs / eligiblePairs};
}

/**
 * Source-normalized GP29 word, including historic ING and IO ligatures.
 * @param {string} word
 * @param {Map<string,number>} lookup
 * @returns {number[]}
 */
function gpWord(word, lookup) {
  const normalized = word.toUpperCase().replace(/[KQ]/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S");
  const glyphs = [...normalized.matchAll(/ING|TH|NG|EO|OE|AE|IA|EA|IO|[A-Z]/g)]
    .map((part) => lookup.get(part[0] === "IO" ? "IA" : part[0] === "ING" ? "NG" : part[0]));
  assert.ok(glyphs.length > 0 && glyphs.every(Number.isInteger));
  return glyphs;
}

const originalWordRunes = floral.map((word) => [...word.runes].map((rune) => indices.get(rune)));
const originalShared = squareClassEquality(originalWordRunes, false);
const originalBlockReset = squareClassEquality(originalWordRunes, true);
assert.deepEqual([originalShared.equalPairs, originalShared.eligiblePairs],
  [16308, 479830]);
assert.deepEqual([originalBlockReset.equalPairs, originalBlockReset.eligiblePairs],
  [958, 32490]);

const alphaByLabel = new Map(
  JSON.parse(read("resources/liber-primus/lp2-corpus.json"))
    .translit.map((label, i) => [label.toUpperCase(), i]));
const sourceCorpora = [
  ["Gibran", read("resources/control/gibran_prophet_58585.txt")],
  ["Emerson", read("resources/control/emerson_essays_2944.txt")],
  ["Shakespeare", read("resources/control/shakespeare_first300k.txt")]
];
const sourcePools = sourceCorpora.map(([, source]) => {
  const pools = Array.from({length:20}, () => []);
  for (const entry of source.matchAll(/[A-Za-z]+/g)) {
    const runes = gpWord(entry[0], alphaByLabel);
    if (runes.length < pools.length) pools[runes.length].push(runes);
  }
  return pools;
});
for (const pool of sourcePools) for (const {length} of floral) {
  assert.ok(pool[length].length > 0, "Source missing native-GP word length " + length);
}
const plant = floral.map((entry) => sourcePools[0][entry.length][0]);
const fullSharedPlant = plant.map((word, i) =>
  word.map((value) => (value + square[i % 49]) % 29));
const freshBlockPlant = plant.map((word, i) =>
  word.map((value) => (value + square[i % 49] + 7 * Math.floor(i / 49)) % 29));
assert.deepEqual(squareClassEquality(plant, false),
  squareClassEquality(fullSharedPlant, false));
assert.deepEqual(squareClassEquality(plant, true),
  squareClassEquality(freshBlockPlant, true));

let equalitySeed = 0x494e5637;
function nextEqualityRandom() {
  equalitySeed ^= equalitySeed << 13;
  equalitySeed ^= equalitySeed >>> 17;
  equalitySeed ^= equalitySeed << 5;
  return equalitySeed >>> 0;
}
const equalityControls = sourceCorpora.map(([name], sourceIndex) => {
  const pool = sourcePools[sourceIndex];
  const trials = 400;
  let smallestShared = 1;
  let smallestBlockReset = 1;
  let sumShared = 0;
  let sumBlockReset = 0;
  let atOrBelowShared = 0;
  let atOrBelowBlockReset = 0;
  for (let trial = 0; trial < trials; trial++) {
    const sourceWords = floral.map(({length}) => {
      const options = pool[length];
      return options[nextEqualityRandom() % options.length];
    });
    const shared = squareClassEquality(sourceWords, false).rate;
    const block = squareClassEquality(sourceWords, true).rate;
    if (shared < smallestShared) smallestShared = shared;
    if (block < smallestBlockReset) smallestBlockReset = block;
    sumShared += shared;
    sumBlockReset += block;
    if (shared <= originalShared.rate) atOrBelowShared++;
    if (block <= originalBlockReset.rate) atOrBelowBlockReset++;
  }
  assert.equal(atOrBelowShared, 0);
  assert.equal(atOrBelowBlockReset, 0);
  return {
    name, trials,
    shared:{minimum:smallestShared, mean:sumShared / trials, atOrBelowOriginal:atOrBelowShared},
    blockReset:{minimum:smallestBlockReset, mean:sumBlockReset / trials,
      atOrBelowOriginal:atOrBelowBlockReset}
  };
});


/**
 * Independent Latin Vulgate reference uses the repository's canonical
 * 29-position printable alphabet, one complete GP-word per line.
 */
const latinSymbols = "0123456789ABCDEFGHIJKLMNOPQRS";
const latinPools = Array.from({length:20}, () => []);
for (const line of read("resources/control/latin-vulgate-gp-wholewords.txt").split(/\r?\n/u)) {
  if (!/^[0-9A-S]+$/u.test(line) || line.length >= latinPools.length) continue;
  latinPools[line.length].push([...line].map((symbol) => latinSymbols.indexOf(symbol)));
}
assert.ok(floral.every(({length}) => latinPools[length].length > 0));
let latinState = 0x4c415449;
function drawLatin() {
  latinState ^= latinState << 13;
  latinState ^= latinState >>> 17;
  latinState ^= latinState << 5;
  return latinState >>> 0;
}
const latinTrials = 400;
const latinSummary = {
  samples:latinTrials,
  shared:{min:1,sum:0,atOrBelowOriginal:0},
  freshBlock:{min:1,sum:0,atOrBelowOriginal:0}
};
for (let i = 0; i < latinTrials; i++) {
  const sample = floral.map(({length}) => {
    const options = latinPools[length];
    return options[drawLatin() % options.length];
  });
  const shared = squareClassEquality(sample, false).rate;
  const block = squareClassEquality(sample, true).rate;
  latinSummary.shared.min = Math.min(latinSummary.shared.min, shared);
  latinSummary.shared.sum += shared;
  latinSummary.freshBlock.min = Math.min(latinSummary.freshBlock.min, block);
  latinSummary.freshBlock.sum += block;
  if (shared <= originalShared.rate) latinSummary.shared.atOrBelowOriginal++;
  if (block <= originalBlockReset.rate) latinSummary.freshBlock.atOrBelowOriginal++;
}
assert.equal(latinSummary.shared.atOrBelowOriginal, 0);
assert.equal(latinSummary.freshBlock.atOrBelowOriginal, 0);
latinSummary.shared.mean = latinSummary.shared.sum / latinTrials;
latinSummary.freshBlock.mean = latinSummary.freshBlock.sum / latinTrials;
delete latinSummary.shared.sum;
delete latinSummary.freshBlock.sum;

console.log(JSON.stringify({
  originalCount:{words:words.length,runes:12956,floralWords:floral.length,floralRunes:3316},
  historicSquare:{cells:49,rowSum:1033,center:331,blocks:15},
  directShifts:{originalIoC:ioc(original),alternatives:additive},
  spirals:{mi:observed,exactInventory:{
    trials:N,inverseTail:(inverseHits+1)/(N+1),twoWayTail:(eitherHits+1)/(N+1),
    nullMean,nullSD
  }},
  independentEnglish:{
    scores:{original:language[0],forward:language[1],inverse:language[2]},
    shuffleTrials:T,inverseTail:(languageHits+1)/(T+1),
    twoWayTail:(languageEitherHits+1)/(T+1),
    shuffleMean:languageSum/T,
    heldoutShakespeare:{
      windows:nativeWindows,meanOriginal:heldBefore/nativeWindows,
      meanInverse:heldAfter/nativeWindows
    }
  },
  allSecretMagicSquare:{originalShared,originalBlockReset,controls:equalityControls,latin:latinSummary},
  claim:"No unknown LP2 plaintext or key recovered."
},null,2));
