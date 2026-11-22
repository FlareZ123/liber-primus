"use strict";
/**
 * Original LP2 29-symbol rare-marker feedback gate.
 *
 * A reversible exception-preserving model emits the same GP rune as its
 * predecessor iff the plaintext rune is a single globally reserved marker.
 * All other 28 plaintext symbols have a keyed bijection to the 28 nonzero
 * mod-29 output increments. This file tests the resulting keyless word
 * position signature against three fixed source-native English registers.
 *
 * Source-conditional vocabulary test; no unknown LP2 plaintext or key.
 * Node.js 22, CommonJS. Run from the repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.join(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const wordRE = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const physical = gp.pages.filter(p => p.page < 56 && p.indices.length);
const source = read("resources/lp2-transcription.txt");
const words = (source.split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "")
  .match(wordRE) || []).map(w => Array.from(w, r => runeIndex.get(r)));
const pages = physical.flatMap(p => Array(p.indices.length).fill(p.page));
assert.equal(words.length, 2896);
assert.equal(pages.length, 12956);
assert.deepEqual(words.flat(), physical.flatMap(p => p.indices));

/**
 * At each runic position bit=1 means the preceding ciphertext rune is
 * identical; known=0 only at the physical-page first rune.
 * @typedef {{length:number, need:number, known:number, word:number}} Pattern
 * @returns {Pattern[]}
 */
function originalPatterns() {
  const answer = [];
  let absolute = 0, previous = -1, previousPage = -1;
  for (let w = 0; w < words.length; w++) {
    let need = 0, known = 0;
    for (let i = 0; i < words[w].length; i++) {
      const c = words[w][i], p = pages[absolute];
      if (p === previousPage) {
        known |= (1 << i);
        if (c === previous) need |= (1 << i);
      }
      absolute++;
      previous = c;
      previousPage = p;
    }
    answer.push({length:words[w].length, need, known, word:w});
  }
  assert.equal(absolute, 12956);
  return answer;
}
const pattern = originalPatterns();
const repeats = pattern.reduce((n, p) => n + bitCount(p.need), 0);
const repeatedWords = pattern.filter(p => p.need !== 0).length;
const head = pattern.reduce((n, p) => n + Number((p.need & 1) !== 0), 0);
assert.deepEqual([repeats, repeatedWords, head], [86, 85, 23]);

/** @param {number} n @returns {number} */
function bitCount(n) { let count = 0; while (n) { n &= n - 1; count++; } return count; }

/** @param {number[]} w @param {number} marker @returns {number} */
function mask(w, marker) {
  let bits = 0;
  for (let i = 0; i < w.length; i++) if (w[i] === marker) bits |= (1 << i);
  return bits;
}
const controlFiles = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const buckets = Array.from({length:15}, () => []);
for (const file of controlFiles) {
  const latin = read(file).split(/\r?\n/).filter(line => !line.startsWith("#")).join(" ");
  for (const word of latin.match(/[A-Za-z]+/g) || []) {
    const runes = encodeSourceNativeGP(word);
    if (runes.length >= 1 && runes.length <= 14) buckets[runes.length].push(runes);
  }
}
assert(buckets.slice(1).every(b => b.length));
const sourceTokens = buckets.reduce((n, b) => n + b.length, 0);
const summary = [];
for (let marker = 0; marker < 29; marker++) {
  const allowed = buckets.map(b => new Set(b.map(word => mask(word, marker))));
  let uncovered = 0, missedRepeatWords = 0;
  const firstMissing = [];
  let expectedFirst = 0, expectedOther = 0;
  for (const p of pattern) {
    const group = buckets[p.length];
    const possible = [...allowed[p.length]].some(v => (v & p.known) === p.need);
    if (!possible) {
      uncovered++;
      if (p.need) missedRepeatWords++;
      if (firstMissing.length < 3) firstMissing.push(p.word);
    }
    const firstKnown = (p.known & 1) !== 0;
    let first = 0, other = 0;
    for (const w of group) {
      if (firstKnown && w[0] === marker) first++;
      for (let i = 1; i < w.length; i++) if (w[i] === marker) other++;
    }
    expectedFirst += first / group.length;
    expectedOther += other / group.length;
  }
  summary.push({marker:gp.translit[marker], index:marker, covered:words.length-uncovered,
    uncovered, missedRepeatWords, firstMissing,
    expectedFirst:+expectedFirst.toFixed(2), expectedOther:+expectedOther.toFixed(2)});
}
summary.sort((a,b) => b.covered-a.covered || a.index-b.index);
const fullyCovered = summary.filter(s => s.uncovered === 0);
assert.deepEqual(fullyCovered.map(s => s.marker).sort(), ["E","N","S"]);
assert.equal(summary.find(s => s.index === 28).uncovered, 15);
assert.equal(summary.find(s => s.index === 21).uncovered, 17);

/**
 * Independently pinned Vulgate Latin GP29 whole-word corpus. Its GP indices
 * are 0-9A-S in base29 and intentionally retain original Latin word breaks.
 * This tests whether a Latin (rather than English) plaintext register saves
 * the original source-equality masks. No English calibration is substituted.
 */
const latinReferenceFile = "resources/control/latin-vulgate-gp-wholewords.txt";
const latinWords = read(latinReferenceFile).split(/\r?\n/)
  .filter(line => line.length > 0 && !line.trimStart().startsWith("#"))
  .map(line => Array.from(line, ch => parseInt(ch, 29)))
  .filter(word => word.length > 0 && word.length <= 14);
assert.equal(latinWords.length, 39785);
const latinBuckets = Array.from({length:15}, () => []);
for (const word of latinWords) {
  assert(word.every(x => Number.isInteger(x) && x >= 0 && x < 29));
  latinBuckets[word.length].push(word);
}
const latinSummary = [];
for (let marker = 0; marker < 29; marker++) {
  const masks = latinBuckets.map(group =>
    new Set(group.map(w => mask(w, marker))));
  let uncovered = 0, expected = 0;
  for (const p of pattern) {
    const group = latinBuckets[p.length];
    if (![...masks[p.length]].some(m => (m & p.known) === p.need))
      uncovered++;
    let n = 0;
    for (const word of group) {
      for (let i = 0; i < word.length; i++)
        if ((p.known & (1 << i)) && word[i] === marker) n++;
    }
    expected += n / group.length;
  }
  latinSummary.push({index:marker,marker:gp.translit[marker],uncovered,
    expected:+expected.toFixed(2)});
}
latinSummary.sort((a,b) => a.uncovered-b.uncovered || a.index-b.index);
assert.deepEqual(latinSummary.filter(s=>s.uncovered===0).map(s=>s.marker).sort(),
  ["M","O","S","T"]);
assert.equal(latinSummary.find(s=>s.marker==="AE").uncovered,20);
assert.equal(latinSummary.find(s=>s.marker==="EA").uncovered,36);
/**
 * Complete 29-to-29 bijection, independently reversible at every position.
 * Marker transmits 0 mod-29; 28 remaining GP runes transmit 1..28, with
 * a known arbitrary 28-phase key. Output depends on previous cipher rune.
 * @param {number} plaintext
 * @param {number} marker
 * @param {number} phase
 * @param {number} previous
 * @returns {number}
 */
function encrypt(plaintext, marker, phase, previous) {
  const symbols = Array.from({length:29}, (_,i) => i).filter(i => i !== marker);
  const rank = symbols.indexOf(plaintext);
  const step = plaintext === marker ? 0 : 1 + ((rank+phase)%28);
  return (previous+step)%29;
}
/** @param {number} cipher @param {number} marker @param {number} phase @param {number} previous @returns {number} */
function decrypt(cipher, marker, phase, previous) {
  const symbols = Array.from({length:29}, (_,i) => i).filter(i => i !== marker);
  const step = (cipher-previous+29)%29;
  return step === 0 ? marker : symbols[(step-1-phase+28)%28];
}
const plant = [], plantCipher = [], plantDecode = [];
let rng = 0x3301977;
function next() {rng = (Math.imul(rng, 1664525)+1013904223)>>>0;return rng;}
for (const w of words) {
  const group = buckets[w.length];
  plant.push(...group[next()%group.length]);
}
let previous = 7, previousPage = -1;
let plantedDoublets = 0, plantedMarkerPositions = 0;
for (let i = 0; i < plant.length; i++) {
  const phase = (11*i + 7)%28;
  if (previousPage !== pages[i]) previous = 7;
  const cipher = encrypt(plant[i], 28, phase, previous);
  const decoded = decrypt(cipher, 28, phase, previous);
  if (previousPage === pages[i]) {
    plantedDoublets += Number(cipher === previous);
    plantedMarkerPositions += Number(plant[i] === 28);
  }
  plantCipher.push(cipher);
  plantDecode.push(decoded);
  previous = cipher; previousPage = pages[i];
}
assert.deepEqual(plantDecode, plant);
assert.equal(plantedDoublets, plantedMarkerPositions);
const result = {
  model:"C_i=C_(i-1) + (P_i==r ? 0 : 1+(rank_r(P_i)+k_i) mod28) mod29",
  original:{pages:55,runes:12956,words:2896,
    adjacentEqual:repeats,withinWord:repeats-head,atWordStart:head,
    wordsWithEqualities:repeatedWords,
    twoEventWord:pattern.filter(p => bitCount(p.need) > 1)},
  controls:{files:controlFiles,sourceTokens,rankedMarkerSignatures:summary},
  latinControl:{file:latinReferenceFile,sourceTokens:latinWords.length,
    rankedMarkerSignatures:latinSummary},
  reversiblePositive:{sourceNativeRunesRecovered:plantDecode.length,
    exactCipherReconstruction:plantCipher.length===plant.length,
    predictedEqualities:plantedMarkerPositions,observedEqualities:plantedDoublets},
  conclusion:"Under unchanged original word boundaries, both English and Latin GP-native reference registers exclude all low-frequency fixed-marker candidates by exact word-mask failures; the English complete markers E/N/S and the Latin complete markers M/O/S/T have expected marker counts hundreds to thousands above original 86. No first-party key schedule or authentic unknown-page plaintext has been found."
};
console.log(JSON.stringify(result, null, 2));
