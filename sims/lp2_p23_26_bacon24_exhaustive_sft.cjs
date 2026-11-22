"use strict";

/**
 * Complete original LP2 pp23-26 classical 24-letter Baconian decoder gate.
 *
 * In the historical I/J and U/V merged Bacon alphabet, A=00000 .. Z=10111,
 * leaving codes 24..31 invalid. All original 201 five-rune groups must then
 * avoid bit-one on their first TWO rune identities simultaneously. This
 * provides an exact source hypergraph independent of the unknown bit key.
 *
 * SFT: node sims/lp2_p23_26_bacon24_exhaustive_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ABC = "ABCDEFGHIKLMNOPQRSTUWXYZ";
assert.equal(ABC.length, 24);

function normalize(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I").replace(/V/g, "U");
}
function indices(text) {
  return [...text].map((c) => {
    const i = ABC.indexOf(c);
    assert.ok(i >= 0);
    return i;
  });
}
function score(text, model) {
  let s = 0;
  for (let i = 0; i + 3 < text.length; i++) {
    s += model[((text[i] * 24 + text[i + 1]) * 24 + text[i + 2]) * 24 + text[i + 3]];
  }
  return s;
}
const refs = [
  ["Gibran", normalize(read("resources/control/gibran_prophet_58585.txt"))],
  ["Emerson", normalize(read("resources/control/emerson_essays_2944.txt"))],
  ["Shakespeare", normalize(read("resources/control/shakespeare_first300k.txt"))]
];
const QUAD_SIZE = 24 ** 4;
const counts = new Uint32Array(QUAD_SIZE);
let total = 0;
for (const [, text] of refs) {
  // The same mid-book passage is withheld from each source, then positively
  // planted under an independently selected unknown binary rune partition.
  const textWithoutHoldout = text.slice(0, 5000) + text.slice(5201);
  const letters = indices(textWithoutHoldout);
  for (let i = 0; i + 3 < letters.length; i++) {
    counts[((letters[i] * 24 + letters[i + 1]) * 24 +
      letters[i + 2]) * 24 + letters[i + 3]]++;
    total++;
  }
}
const model = Float64Array.from(counts, (value) =>
  Math.log((value + 0.05) / (total + QUAD_SIZE * 0.05)));

const section = corpus.pages.slice(23, 27);
assert.deepEqual(section.map((p) => p.indices.length), [213, 270, 273, 265]);
assert.deepEqual(section[0].indices.slice(0, 16),
  [1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26]);
const body = section.flatMap((p) => p.indices).slice(16);
assert.equal(body.length, 1005);
const groups = Array.from({length: 201}, (_, i) => body.slice(i * 5, i * 5 + 5));

function decrypt(key, items) {
  return items.map((g) =>
    16 * ((key >>> g[0]) & 1) + 8 * ((key >>> g[1]) & 1) +
    4 * ((key >>> g[2]) & 1) + 2 * ((key >>> g[3]) & 1) +
    ((key >>> g[4]) & 1));
}
function decode(key, items) {
  return decrypt(key, items).map((n) => ABC[n] || "#").join("");
}

/**
 * @param {number[][]} sourceGroups
 */
function exhaustive(sourceGroups) {
  const forbidden = new Set(sourceGroups.map((g) => (1 << g[0]) | (1 << g[1])));
  const incident = Array.from({length: 29}, () => []);
  for (const edge of forbidden) {
    for (let i = 0; i < 29; i++) {
      if (edge & (1 << i)) incident[i].push(edge);
    }
  }
  const order = Array.from({length: 29}, (_, i) => i).sort((a, b) =>
    incident[b].length - incident[a].length || a - b);
  let visited = 0;
  let best = {score: -Infinity, mask: 0, backward: false};
  let maxOnes = 0;
  let minimumA = 202;
  let minimumAnyLetterMaximum = 202;
  function dfs(i, key, ones) {
    if (i === 29) {
      visited++;
      maxOnes = Math.max(maxOnes, ones);
      const text = decrypt(key, sourceGroups);
      const counts = Array(24).fill(0);
      for (const v of text) {
        assert.ok(v >= 0 && v < 24);
        counts[v]++;
      }
      minimumA = Math.min(minimumA, counts[0]);
      minimumAnyLetterMaximum = Math.min(minimumAnyLetterMaximum, Math.max(...counts));
      const f = score(text, model);
      if (f > best.score) best = {score: f, mask: key, backward: false};
      const b = score([...text].reverse(), model);
      if (b > best.score) best = {score: b, mask: key, backward: true};
      return;
    }
    dfs(i + 1, key, ones);
    const symbol = order[i], bit = 1 << symbol, next = key | bit;
    if (incident[symbol].every((edge) => (next & edge) !== edge)) {
      dfs(i + 1, next, ones + 1);
    }
  }
  dfs(0, 0, 0);
  const out = decode(best.mask, sourceGroups);
  return {
    forbiddenPairs: forbidden.size,
    admissible29BitKeys: visited,
    maxOneBits: maxOnes,
    minimumLetterA: minimumA,
    minimumMostCommonLetter: minimumAnyLetterMaximum,
    bestScore: best.score,
    bestKeyMask: best.mask,
    reversedGroupOrder: best.backward,
    bestText: best.backward ? [...out].reverse().join("") : out
  };
}
const printed = exhaustive(groups);
const mirrored = exhaustive(groups.map((g) => [...g].reverse()));
assert.equal(printed.forbiddenPairs, 159);
assert.equal(printed.admissible29BitKeys, 2574);
assert.equal(printed.maxOneBits, 8);
assert.equal(printed.minimumLetterA, 40);
assert.equal(printed.minimumMostCommonLetter, 40);
assert.equal(mirrored.forbiddenPairs, 158);
assert.equal(mirrored.admissible29BitKeys, 2650);
assert.equal(mirrored.maxOneBits, 7);
assert.equal(mirrored.minimumLetterA, 45);
assert.equal(mirrored.minimumMostCommonLetter, 45);

// Positive, completely reversible source-length Latin Bacon text under one
// frozen GP rune->bit map. The holdout excerpt is absent from the quad model.
const heldout = refs[0][1].slice(5000, 5201);
const keyOnes = new Set([1, 3, 4, 9, 12, 14, 15, 16, 21, 24, 27]);
const keyMask = [...keyOnes].reduce((a, b) => a | (1 << b), 0);
const symbols = [
  Array.from({length: 29}, (_, i) => i).filter((i) => !keyOnes.has(i)),
  [...keyOnes]
];
let seed = 0x3301c1ca;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const plant = indices(heldout).map((value) =>
  [16, 8, 4, 2, 1].map((power) => {
    const alternatives = symbols[(value & power) ? 1 : 0];
    return alternatives[random() % alternatives.length];
  }));
assert.equal(plant.length, 201);
assert.equal(decode(keyMask, plant), heldout);
const plantBest = exhaustive(plant);
const genuineScore = score(indices(heldout), model);
assert.ok(plantBest.bestScore >= genuineScore - 1e-8);
assert.ok(genuineScore > Math.max(printed.bestScore, mirrored.bestScore));

const originalNativeControlWindows = refs.map(([name, text]) => {
  let maxA = 0;
  let windowsWith40A = 0;
  let windowsWith45A = 0;
  let maximumMostCommon = 0;
  let windowsWithAnyLetter40 = 0;
  let windowsWithAnyLetter45 = 0;
  let windows = 0;
  for (let i = 0; i + 201 <= text.length; i += 201) {
    const freq = Array(24).fill(0);
    for (const letter of text.slice(i, i + 201)) freq[ABC.indexOf(letter)]++;
    const countA = freq[0];
    const mostCommon = Math.max(...freq);
    maxA = Math.max(maxA, countA);
    maximumMostCommon = Math.max(maximumMostCommon, mostCommon);
    if (countA >= 40) windowsWith40A++;
    if (countA >= 45) windowsWith45A++;
    if (mostCommon >= 40) windowsWithAnyLetter40++;
    if (mostCommon >= 45) windowsWithAnyLetter45++;
    windows++;
  }
  return {name, windows, maximumLetterA: maxA, maximumMostCommon,
    windowsWith40A, windowsWith45A, windowsWithAnyLetter40,
    windowsWithAnyLetter45};
});
assert.deepEqual(originalNativeControlWindows.map((x) => x.windows), [330, 1693, 1141]);
assert.deepEqual(originalNativeControlWindows.map((x) => x.maximumLetterA), [28, 31, 28]);
assert.ok(originalNativeControlWindows.every((x) => x.windowsWith40A === 0));

/**
 * Independently pinned Latin Vulgate (New Testament) and corrected Old English
 * Beowulf encoded as canonical GP29 rune indices in existing source datasets.
 * The sources use different serialization alphabets, explicitly decoded here.
 * Transliteration to A..Z is only for the letter-A-count control, not a new
 * invented decryption of original LP2.
 *
 * @param {string} GP29Digits
 * @param {string} alphabet
 * @returns {string}
 */
function decodeGpToLetters(GP29Digits, alphabet) {
  let s = "";
  for (const digit of GP29Digits) {
    const position = alphabet.indexOf(digit);
    assert.ok(position >= 0 && position < 29);
    s += corpus.translit[position];
  }
  return normalize(s);
}
const latinDigits = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/).map((line) => line.trim())
  .filter((line) => line !== "" && !line.startsWith("#")).join("");
const latinText = decodeGpToLetters(latinDigits, "0123456789ABCDEFGHIJKLMNOPQRS");
const oldEnglish = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const oldEnglishText = decodeGpToLetters(oldEnglish.sourceGpBase29,
  oldEnglish.positiveControlAlphabet);

/**
 * @param {string} text
 * @param {string} sourceName
 */
function aWindowProfile(text, sourceName) {
  let maximumLetterA = 0;
  let windowsWith40A = 0;
  let windowsWith45A = 0;
  let maximumMostCommon = 0;
  let windowsWithAnyLetter40 = 0;
  let windowsWithAnyLetter45 = 0;
  let windows = 0;
  for (let i = 0; i + 201 <= text.length; i += 201) {
    const fragment = text.slice(i, i + 201);
    const freq = Array(24).fill(0);
    for (const letter of fragment) freq[ABC.indexOf(letter)]++;
    const countA = freq[0];
    const mostCommon = Math.max(...freq);
    maximumLetterA = Math.max(maximumLetterA, countA);
    maximumMostCommon = Math.max(maximumMostCommon, mostCommon);
    if (countA >= 40) windowsWith40A++;
    if (countA >= 45) windowsWith45A++;
    if (mostCommon >= 40) windowsWithAnyLetter40++;
    if (mostCommon >= 45) windowsWithAnyLetter45++;
    windows++;
  }
  return {source: sourceName, sourceLetters: text.length, windows,
    maximumLetterA, maximumMostCommon, windowsWith40A, windowsWith45A,
    windowsWithAnyLetter40, windowsWithAnyLetter45};
}
const alternateLanguageControls = [
  aWindowProfile(latinText, "Latin Vulgate NT GP-rendered"),
  aWindowProfile(oldEnglishText, "Old English Beowulf corrected GP-rendered")
];
assert.deepEqual(alternateLanguageControls.map((x) => x.windows), [1038, 262]);
assert.deepEqual(alternateLanguageControls.map((x) => x.maximumLetterA), [29, 31]);
assert.ok(alternateLanguageControls.every((x) => x.windowsWith40A === 0));
assert.equal(originalNativeControlWindows.reduce(
  (sum, x) => sum + x.windowsWithAnyLetter40, 0), 3);
assert.equal(alternateLanguageControls.reduce(
  (sum, x) => sum + x.windowsWithAnyLetter40, 0), 7);
assert.ok([...originalNativeControlWindows, ...alternateLanguageControls]
  .every((x) => x.windowsWithAnyLetter45 === 0));
assert.deepEqual(originalNativeControlWindows.map((x) => x.maximumMostCommon),
  [38, 42, 39]);
assert.deepEqual(alternateLanguageControls.map((x) => x.maximumMostCommon),
  [44, 40]);

const heldoutReferences = refs.map(([name, text]) => ({
  source: name,
  heldoutScore: score(indices(text.slice(5000, 5201)), model)
}));
console.log(JSON.stringify({
  original: {printed, mirroredQuintets: mirrored, allSecretValidKeys: 5224},
  nativeHeldout: heldoutReferences,
  nativeLetterAControls: originalNativeControlWindows,
  alternativeLanguageLetterAControls: alternateLanguageControls,
  positiveControl: {
    sourceCharactersExactlyRestored: heldout.length,
    originalReadableScore: genuineScore,
    bestExhaustiveScore: plantBest.bestScore,
    keysAllowedOnPlant: plantBest.admissible29BitKeys,
    literalReadableExcerpt: heldout
  }
}, null, 2));
