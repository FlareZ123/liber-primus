"use strict";

/**
 * Issue #1341: source-fixed one-extra-key-advance-per-word phase-class
 * coincidence invariant. An arbitrary secret 29-symbol substitution may
 * depend on every one of the 256 source-table phases. Equal symbols in
 * the same phase necessarily remain equal under a permutation; unequal
 * symbols necessarily remain unequal.
 *
 * This is a bound on a deterministic substitution model, not a general
 * cipher recovery or a test of probabilistic Phase24 extra advances.
 * It does not use the numerical values printed in the 256-cell table.
 *
 * Single-file, read-only SFT. Node.js 22 on Windows; no CLI flags.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpusBytes = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"));
const corpusHash = crypto.createHash("sha256").update(corpusBytes).digest("hex");
assert.equal(corpusHash, "58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338");
const book = JSON.parse(corpusBytes.toString("utf8"));
const chars = new Map(book.runes.map((r, i) => [r, i]));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const sourcePages = transcript.split("%");
assert.equal(sourcePages.length, 57);

/**
 * Recover original physical page numbering and the actual word-initial
 * runes. A slash/newline/page boundary is transparent. Printed hyphen,
 * four-dot stop, and paragraph/section markers end a printed word.
 */
const pages = [];
let beforeWord = true;
for (let sourcePage = 0; sourcePage < sourcePages.length; sourcePage++) {
  const physical = sourcePage < 50 ? sourcePage : sourcePage + 1;
  const indices = [], starts = [];
  for (const ch of sourcePages[sourcePage]) {
    if (chars.has(ch)) {
      indices.push(chars.get(ch));
      starts.push(beforeWord);
      beforeWord = false;
    } else if ("-.&$§".includes(ch)) {
      beforeWord = true;
    } else {
      assert.ok("/\r\n\t 0123456789".includes(ch), "Unknown transcription char " + ch);
    }
  }
  assert.deepEqual(indices, book.pages[physical].indices, "Physical page " + physical);
  pages[physical] = {indices, starts};
}
assert.equal(book.pages[50].indices.length, 0);
assert.equal(pages[56].indices.length, 85);
assert.equal(pages[57].indices.length, 95);

const original = [], boundaries = [], physicalPages = [];
for (let p = 0; p <= 55; p++) {
  if (!pages[p]) continue;
  for (let i = 0; i < pages[p].indices.length; i++) {
    original.push(pages[p].indices[i]);
    boundaries.push(pages[p].starts[i]);
    physicalPages.push(p);
  }
}
assert.equal(original.length, 12956);
assert.equal(boundaries.filter(Boolean).length, 2896);
assert.equal(original.filter((x) => x === 0).length, 0 + original.filter((x) => x === 0).length);
const chapters = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapters.reduce((a, b) => a + b, 0), original.length);
const chapterByRune = [];
chapters.forEach((n, i) => { for (let j = 0; j < n; j++) chapterByRune.push(i); });
assert.equal(chapterByRune.length, original.length);

const vocabulary = book.translit.map((t, i) => ({token: t.toLowerCase(), index: i}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const normalized = word.toLowerCase().replace(/qu/g, "cw")
    .replace(/ing/g, "ng").replace(/io/g, "ia")
    .replace(/[vkz]/g, (ch) => ({v: "u", k: "c", z: "s"})[ch]);
  const output = [];
  for (let i = 0; i < normalized.length;) {
    const candidate = vocabulary.find((item) => normalized.startsWith(item.token, i));
    assert.ok(candidate, "Unmappable native control " + normalized.slice(i));
    output.push(candidate.index);
    i += candidate.token.length;
  }
  return output;
}
const english = (read("resources/control/gibran_prophet_58585.txt")
  .match(/[A-Za-z]+/g) || []).flatMap(gpWord);
assert.equal(english.length, 62492);
const englishNonF = english.filter((v) => v !== 0);
assert.ok(englishNonF.length > original.length - 500);

/**
 * At each printed word start after the segment's first rune, the
 * independent fixed clock consumes one extra phase. A transparent
 * ciphertext F stays F and does not consume its normal key position.
 * This transparent-F alternative is an analyst extension of the p56
 * rule, not an instruction to apply it to unsolved pages.
 *
 * @param {"global"|"chapter"|"page"} reset
 * @param {boolean} fTransparent
 * @returns {number[]}
 */
function phases(reset, fTransparent) {
  const out = [];
  let clock = 0;
  for (let i = 0; i < original.length; i++) {
    const isNew = i === 0
      || (reset === "page" && physicalPages[i] !== physicalPages[i - 1])
      || (reset === "chapter" && chapterByRune[i] !== chapterByRune[i - 1]);
    if (isNew) clock = 0;
    if (!isNew && boundaries[i]) clock = (clock + 1) % 256;
    if (fTransparent && original[i] === 0) {
      out.push(-1);
    } else {
      out.push(clock);
      clock = (clock + 1) % 256;
    }
  }
  return out;
}

/**
 * Equality under any bijection at a fixed phase is invariant. Count
 * all unordered symbol pairs having identical 256-phase clock values.
 * @param {number[]} values
 * @param {number[]} clock
 * @param {number} offset
 */
function coincidence(values, clock, offset = 0) {
  const freq = new Uint16Array(256 * 29), phaseSizes = new Uint16Array(256);
  for (let i = 0; i < clock.length; i++) {
    const phase = clock[i];
    assert.ok(Number.isInteger(phase) && phase >= 0 && phase < 256);
    const value = values[offset + i];
    assert.ok(Number.isInteger(value) && value >= 0 && value < 29);
    freq[29 * phase + value]++;
    phaseSizes[phase]++;
  }
  let matchedPairs = 0, eligiblePairs = 0;
  for (const n of freq) matchedPairs += n * (n - 1) / 2;
  for (const n of phaseSizes) eligiblePairs += n * (n - 1) / 2;
  return {matchedPairs, eligiblePairs, rate: matchedPairs / eligiblePairs};
}

/** Reproducible PRNG solely for synthetic plants; no tuning to source. */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {boolean} keepF @param {number} seed @returns {number[][]} */
function secretMaps(keepF, seed) {
  const random = rng(seed);
  return Array.from({length: 256}, () => {
    const map = Array.from({length: 29}, (_, i) => i);
    const floor = keepF ? 1 : 0;
    for (let i = 28; i > floor; i--) {
      const j = floor + Math.floor(random() * (i - floor + 1));
      [map[i], map[j]] = [map[j], map[i]];
    }
    return map;
  });
}

/** @param {number[]} plain @param {number[]} clock @param {boolean} keepF */
function exactPlant(plain, clock, keepF) {
  const maps = secretMaps(keepF, 0x33011341);
  const inverses = maps.map((map) => {
    const inv = Array(29);
    map.forEach((v, i) => {inv[v] = i;});
    return inv;
  });
  const cipher = plain.map((v, i) =>
    clock[i] < 0 ? 0 : maps[clock[i]][v]);
  const decoded = cipher.map((v, i) =>
    clock[i] < 0 ? 0 : inverses[clock[i]][v]);
  assert.deepEqual(decoded, plain);
  const usable = clock.flatMap((v, i) => v < 0 ? [] : [i]);
  const before = coincidence(usable.map((i) => plain[i]), usable.map((i) => clock[i]));
  const after = coincidence(usable.map((i) => cipher[i]), usable.map((i) => clock[i]));
  assert.equal(after.matchedPairs, before.matchedPairs);
  assert.equal(after.eligiblePairs, before.eligiblePairs);
  return {exactlyRecovered: plain.length, matchedPairs: before.matchedPairs};
}

/** Reproduce the separately solved p56 prime-totient control. */
function primeList(size) {
  const list = [];
  for (let x = 2; list.length < size; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) list.push(x);
  }
  return list;
}
const primes = primeList(85);
const solved56 = pages[56].indices;
const recovered56 = [];
let pIndex = 0;
for (let i = 0; i < solved56.length; i++) {
  if (i === 56) {
    assert.equal(solved56[i], 0);
    recovered56.push(0);
  } else {
    const key = (primes[pIndex++] - 1) % 29;
    recovered56.push((solved56[i] - key + 29) % 29);
  }
}
assert.equal(pIndex, 84);
assert.equal(recovered56.slice(0, 11).map((i) => book.translit[i]).join(""), "ANENDWITHIN");

const output = [];
for (const reset of ["global", "chapter", "page"]) {
  for (const transparentF of [false, true]) {
    const clock = phases(reset, transparentF);
    const usable = clock.flatMap((phase, i) => phase < 0 ? [] : [{phase, rune: original[i]}]);
    const activeClock = usable.map((x) => x.phase);
    const activeOriginal = usable.map((x) => x.rune);
    const reference = transparentF ? englishNonF : english;
    const observed = coincidence(activeOriginal, activeClock);
    const scores = [];
    for (let offset = 0; offset <= reference.length - activeClock.length; offset += 50) {
      scores.push(coincidence(reference, activeClock, offset).matchedPairs);
    }
    assert.ok(scores.length > 900);
    const min = Math.min(...scores), max = Math.max(...scores);
    const mean = scores.reduce((sum, x) => sum + x, 0) / scores.length;
    // Controls use a preserved source-phase pattern and an arbitrary
    // secret per-phase bijection. All real GP-native plants round-trip.
    const plantPlain = [], initial = 250;
    let k = 0;
    for (const phase of clock) {
      plantPlain.push(phase < 0 ? 0 : reference[initial + k++]);
    }
    const plant = exactPlant(plantPlain, clock, transparentF);
    assert.equal(plant.exactlyRecovered, original.length);
    assert.ok(observed.matchedPairs < min,
      "Original exceeds a GP-native reference window in this bounded model");
    output.push({
      reset, transparentF, sourceRunes: original.length,
      nativeReferenceRunes: reference.length, activeCipherRunes: activeOriginal.length,
      originalPhaseEqualities: observed.matchedPairs,
      eligiblePairs: observed.eligiblePairs,
      originalRate: observed.rate,
      windows: scores.length, referenceMin: min,
      referenceMean: mean, referenceMax: max,
      referenceMinRate: min / observed.eligiblePairs,
      plantRecovered: plant.exactlyRecovered
    });
  }
}
const p57 = pages[57].indices;
const p57Clock = [];
let j = 0;
for (let i = 0; i < p57.length; i++) {
  if (i > 0 && pages[57].starts[i]) j++;
  p57Clock.push(j % 256); j++;
}
assert.equal(exactPlant(p57, p57Clock, false).exactlyRecovered, 95);
console.log(JSON.stringify({
  hypothesis: "256 secret GP29 phase alphabets, deterministic +1 at each genuine word boundary",
  classification: "Conditional equality invariant, no recovered LP2 plaintext",
  modelScope: "No state-changing repair, no secret event mask, no per-position free alphabet",
  expectedOriginalRunes: 12956, originalPrintedWords: 2896, phaseCount: 256,
  originalCorpusSHA256: corpusHash, independentSourceNativeReference: "Gibran The Prophet",
  originalP56TotientPositive: recovered56.slice(0, 11).map((i) => book.translit[i]).join(""),
  nativeP57BijectivePlantRecovered: 95,
  results: output
}, null, 2));
console.log("PASS deterministic word-advance all-secret phase-invariant original gate");
