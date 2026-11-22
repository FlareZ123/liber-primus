"use strict";

/**
 * Original LP2 p16–p21 nonlinear ciphertext-feedback recovery attempt.
 * Standalone Windows/Node.js22 SFT. Read-only; no dependencies.
 *
 * Hypothesis motivated by original p39 red [27,5,15]:
 * C[i] = P[i] + K[i] mod 29
 * K[i+1] = (27 + 5 K[i] + 15 K[i]^2 + C[i]) mod 29
 *
 * Only unknown is K[0] in GF29, exhausted exactly over all 29 keys.
 * P16 is the training receiver and pp17–21 are withheld as one
 * continuous state. The source has not authenticated this operation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const printed = read("resources/liber-primus/lp2-transcription.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const mod = n => ((n % 29) + 29) % 29;
const quadratic = k => mod(27 + 5 * k + 15 * k * k);
const passagePages = source.pages.slice(16, 22);
const original = passagePages.flatMap(p => p.indices);
assert.deepEqual(source.pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.equal(quadratic(24), 0);
assert.deepEqual(passagePages.map(p => p.indices.length), [267, 273, 260, 271, 269, 273]);
assert.equal(original.length, 1613);

/** @param {number[]} plain @param {number} seed */
function encrypt(plain, seed) {
  let state = seed;
  const out = [];
  for (const p of plain) {
    const c = mod(p + state);
    out.push(c);
    state = mod(quadratic(state) + c);
  }
  return out;
}

/** @param {number[]} cipher @param {number} seed */
function decrypt(cipher, seed) {
  let state = seed;
  const out = [];
  for (const c of cipher) {
    out.push(mod(c - state));
    state = mod(quadratic(state) + c);
  }
  return out;
}

/** @param {number[]} v */
function ioc(v) {
  const counts = Array(29).fill(0);
  for (const rune of v) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (v.length * (v.length - 1));
}

const spellings = source.translit.slice().sort((a, b) => b.length - a.length);
const symbolOf = new Map(source.translit.map((value, index) => [value, index]));

/** @param {string} raw */
function encodeGpWord(raw) {
  const word = raw.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) { result.push(21); i += 3; continue; }
    if (word.startsWith("IO", i)) { result.push(27); i += 2; continue; }
    const token = spellings.find(x => word.startsWith(x, i));
    assert.ok(token, "Cannot GP-encode " + raw);
    result.push(symbolOf.get(token));
    i += token.length;
  }
  return result;
}
const shakespeareGp = (shakespeare.match(/[A-Za-z]+/g) || [])
  .flatMap(encodeGpWord);
assert.equal(shakespeareGp.length, 217106);
const training = shakespeareGp.slice(0, 110000);
const count = new Float64Array(29 ** 3).fill(0.1);
const log = new Float64Array(29 ** 3);
for (let i = 2; i < training.length; i++) {
  count[training[i - 2] * 841 + training[i - 1] * 29 + training[i]]++;
}
for (let prefix = 0; prefix < 841; prefix++) {
  let normalizer = 0;
  for (let rune = 0; rune < 29; rune++) normalizer += count[prefix * 29 + rune];
  for (let rune = 0; rune < 29; rune++) {
    log[prefix * 29 + rune] = Math.log(count[prefix * 29 + rune] / normalizer);
  }
}

/** @param {number[]} runes */
function trigram(runes) {
  let sum = 0;
  for (let i = 2; i < runes.length; i++) {
    sum += log[runes[i - 2] * 841 + runes[i - 1] * 29 + runes[i]];
  }
  return sum / (runes.length - 2);
}
const splits = [0, 267, 540, 800, 1071, 1340, 1613];

/** @param {number[]} text */
function rankSeeds(text) {
  return Array.from({ length: 29 }, (_, seed) => {
    const plaintext = decrypt(text, seed);
    assert.deepEqual(encrypt(plaintext, seed), text);
    return {
      seed,
      plaintext,
      trainingScore: trigram(plaintext.slice(0, splits[1])),
      withheldScore: trigram(plaintext.slice(splits[1])),
      ioc: ioc(plaintext)
    };
  }).sort((a, b) => b.trainingScore - a.trainingScore);
}
const rank = rankSeeds(original);
const winner = rank[0];
assert.equal(winner.seed, 4);
assert(Math.abs(winner.trainingScore - (-4.556530436841795)) < 1e-9);
assert(Math.abs(winner.withheldScore - (-4.574245678364593)) < 1e-9);
assert(winner.ioc < 0.04);
assert.equal(splits[1], source.pages[16].indices.length);

// An all-key mathematical failure: the quadratic state transition collapses
// every possible initial key to one shared state after exactly 89 original
// cipher runes. This is checked on original ciphertext without any scorer.
let states = Array.from({ length: 29 }, (_, seed) => seed);
let collapse = -1;
for (let i = 0; i < original.length; i++) {
  if (new Set(states).size === 1 && collapse === -1) collapse = i;
  const c = original[i];
  states = states.map(state => mod(quadratic(state) + c));
}
assert.equal(collapse, 89);
assert.equal(new Set(states).size, 1);

// Preserve canonical words across source-image page wraps, so the original
// 17 one-rune words provide exact native-English A/I/O constraints.
const runeMap = new Map(source.runes.map((rune, index) => [rune, index]));
const singletonOffsets = [];
const startOffset = source.pages.slice(0, 16).reduce((n, p) => n + p.indices.length, 0);
const endOffset = startOffset + original.length;
let absolute = 0;
let wordStart = -1;
let wordLength = 0;
for (const letter of printed) {
  if (runeMap.has(letter)) {
    if (wordLength === 0) wordStart = absolute;
    wordLength++;
    absolute++;
  } else if ("-.&$".includes(letter) && wordLength) {
    if (wordLength === 1 && wordStart >= startOffset && wordStart < endOffset) {
      singletonOffsets.push(wordStart - startOffset);
    }
    wordLength = 0;
    wordStart = -1;
  }
}
assert.equal(startOffset, 3762);
assert.deepEqual(singletonOffsets, [
  21, 119, 244, 380, 386, 414, 455, 471, 596,
  712, 871, 937, 989, 1032, 1491, 1557, 1574
]);
const nativeSingles = new Set([24, 10, 3]); // GP A, I, O
const actualSingletons = singletonOffsets.map(offset => ({
  offset, rune: source.translit[winner.plaintext[offset]],
  nativeEnglish: nativeSingles.has(winner.plaintext[offset])
}));
const forcedSingletons = actualSingletons.filter(x => x.offset >= collapse);
assert.equal(forcedSingletons.length, 16);
assert.equal(forcedSingletons.filter(x => x.nativeEnglish).length, 3);
assert.equal(actualSingletons.filter(x => x.nativeEnglish).length, 3);
for (const candidate of rank) {
  assert.equal(singletonOffsets.filter(offset =>
    nativeSingles.has(candidate.plaintext[offset])).length <= 4, true);
  assert.deepEqual(candidate.plaintext.slice(collapse), winner.plaintext.slice(collapse));
}

// True-key positive: 95 source-authentic already solved p57 GP runes,
 // tiled only to match target length; exact inverse restores all runes.
const solved = source.pages[57].indices;
assert.equal(solved.length, 95);
const solvedPlant = Array.from({length: original.length}, (_, i) => solved[i % 95]);
assert.deepEqual(decrypt(encrypt(solvedPlant, 24), 24), solvedPlant);

// Independent native-GP Shakespeare plaintext, held out of training.
// Encrypt at unknown seed, recover seed entirely from first source-sized
// page p16, then predict all five withheld p17–p21 pages.
const naturalPlant = shakespeareGp.slice(120000, 120000 + original.length);
assert.equal(naturalPlant.length, original.length);
const plantCipher = encrypt(naturalPlant, 24);
const rankedPlant = rankSeeds(plantCipher);
assert.equal(rankedPlant[0].seed, 24);
assert.deepEqual(rankedPlant[0].plaintext, naturalPlant);
assert(rankedPlant[0].trainingScore > -2.7);
assert(rankedPlant[0].withheldScore > -2.7);

console.log(JSON.stringify({
  status: "PASS",
  originalInput: "LP2 physical pp16-21 original GP29 1613 runes",
  redSource: [27, 5, 15],
  cipher: "C=P+K, K_next=27+5K+15K^2+C mod29",
  modelNotAuthorAuthenticated: true,
  originalRawIoc: ioc(original),
  rawTrainingTrigram: trigram(original.slice(0, 267)),
  rawWithheldTrigram: trigram(original.slice(267)),
  bestSeed: winner.seed,
  bestTrainingTrigram: winner.trainingScore,
  bestWithheldTrigram: winner.withheldScore,
  bestIoc: winner.ioc,
  first89KeyCoalescence: collapse,
  singletonOffsets,
  singletonOriginalDecoding: actualSingletons,
  nativeSingletonFits: actualSingletons.filter(x => x.nativeEnglish).length,
  forcedNativeFitsAfterCoalescence: forcedSingletons.filter(x => x.nativeEnglish).length,
  independentShakespearePositive: {
    seedRecovered: rankedPlant[0].seed,
    runesRecovered: original.length,
    trainingTrigram: rankedPlant[0].trainingScore,
    withheldTrigram: rankedPlant[0].withheldScore
  },
  genuineSolvedP57PlantRecovered: solvedPlant.length,
  first100OriginalTransliteration: winner.plaintext.slice(0,100).map(x=>source.translit[x]).join("")
}, null, 2));
