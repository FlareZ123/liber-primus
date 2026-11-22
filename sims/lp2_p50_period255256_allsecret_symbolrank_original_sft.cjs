'use strict';

/**
 * Exact unknown-key symbol-rank capacity of a repeated 255- or 256-position
 * GP29 lookup cipher on all original LP2 pp0-p55 ciphertext.
 *
 * Any independently secret invertible 29-symbol substitution at each
 * period phase preserves its phase histogram. Consequently, the sum
 * of the top five original phase-bin counts upper-bounds how many
 * decrypted symbols can belong to any five chosen plaintext runes.
 *
 * This includes any Caesar/Vigenere key derived from a 255-state GF4
 * clock or p50's native 256 cells as a special case. Five source-visible
 * key-reset conventions are tested without fitting alphabets or phases.
 *
 * Windows Node22 CommonJS SFT. Read-only, with exact 12956-rune source,
 * source-word/line punctuation and native-GP encrypted positive controls.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8')
  .split('%');
const glyph = new Map(corpus.runes.map((r, i) => [r, i]));
const original = corpus.pages.slice(0, 56).flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(corpus.pages[50].indices.length, 0);
assert.equal(corpus.pages[57].indices.length, 95);

/** Source-visible period-reset clock, with no secret choice of reset sites. */
const phase = {
  continuous: [], physical_page: [], illustrated_chapter: [],
  complete_word: [], printed_line: []
};
const chapterStarts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
let position = 0;
let wordClock = 0;
let chapterClock = 0;
let wordCount = 0;
let hyphenCount = 0;
let fullStopCount = 0;
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  if (chapterStarts.has(page)) chapterClock = 0;
  let pageClock = 0;
  let lineClock = 0;
  for (const ch of transcript[page < 50 ? page : page - 1]) {
    if (glyph.has(ch)) {
      assert.equal(glyph.get(ch), original[position],
        'Raw transcription and index corpus must agree at rune ' + position);
      phase.continuous.push(position++);
      phase.physical_page.push(pageClock++);
      phase.illustrated_chapter.push(chapterClock++);
      phase.complete_word.push(wordClock++);
      phase.printed_line.push(lineClock++);
    } else if (ch === '-' || ch === '.') {
      if (wordClock) wordCount++;
      wordClock = 0;
      if (ch === '-') hyphenCount++;
      else fullStopCount++;
    } else if (ch === '/') {
      lineClock = 0;
    }
  }
}
assert.equal(position, original.length);
assert.equal(wordCount, 2896);
assert.deepEqual([hyphenCount, fullStopCount], [2727, 175]);
assert.equal(new Set(Object.values(phase).map(v => v.length)).size, 1);

const mod29 = n => ((n % 29) + 29) % 29;

/**
 * Exact sum of the k greatest original ciphertext counts within each
 * independently keyed phase: necessary upper bound for any source-wide
 * top-k native-GP plaintext runes after a fixed invertible GP29 map per phase.
 *
 * @param {number[]} stream Original runes.
 * @param {number[]} siteClock Source-visible phase index for each rune.
 * @param {number} period Number of independent secret substitution rows.
 * @param {number} k Number of most common recovered glyphs.
 */
function rankUpperBound(stream, siteClock, period, k) {
  assert.equal(stream.length, siteClock.length);
  const rows = Array.from({ length: period }, () => new Uint32Array(29));
  for (let i = 0; i < stream.length; i++) {
    assert(stream[i] >= 0 && stream[i] < 29);
    rows[siteClock[i] % period][stream[i]]++;
  }
  return rows.reduce((total, row) => {
    const ranked = Array.from(row).sort((a, b) => b - a);
    return total + ranked.slice(0, k).reduce((a, b) => a + b, 0);
  }, 0);
}

const expected = {
  continuous: { 255: [1233, 4818], 256: [1244, 4861] },
  physical_page: { 255: [1245, 4851], 256: [1241, 4858] },
  illustrated_chapter: { 255: [1241, 4833], 256: [1244, 4856] },
  complete_word: { 255: [561, 2660], 256: [561, 2660] },
  printed_line: { 255: [684, 3055], 256: [684, 3055] }
};
const observations = [];
for (const [clockName, clock] of Object.entries(phase)) {
  for (const period of [255, 256]) {
    const B1 = rankUpperBound(original, clock, period, 1);
    const B5 = rankUpperBound(original, clock, period, 5);
    assert.deepEqual([B1, B5], expected[clockName][period]);
    observations.push({
      clock: clockName, period, sourceRunes: original.length,
      B1, B5, B5Fraction: Number((B5 / original.length).toFixed(8))
    });
  }
}

/** Exact histogram for any recovered candidate plaintext. */
function globalTopK(stream, k) {
  const counts = new Uint32Array(29);
  for (const x of stream) counts[x]++;
  return Array.from(counts).sort((a, b) => b - a).slice(0, k)
    .reduce((a, b) => a + b, 0);
}
const solved = corpus.pages[57].indices;
assert.deepEqual([globalTopK(solved, 1), globalTopK(solved, 5)], [15, 46]);

/**
 * Native-GP positive: repeat source-authentic solved p57 to source length,
 * encrypt it with one invertible phase-specific affine GP29 substitution,
 * and show exact forward replay plus rank capacity of its encrypted tape.
 * The affine state is solely a test plant, not an alleged LP2 key.
 */
const positivePlain = Array.from({ length: original.length },
  (_, i) => solved[i % solved.length]);
const positiveCipher = positivePlain.map((p, i) =>
  mod29(7 * p + 13 * (phase.continuous[i] % 256) + 17));
const positiveReconstructed = positiveCipher.map((c, i) =>
  mod29(25 * (c - 13 * (phase.continuous[i] % 256) - 17)));
assert.deepEqual(positiveReconstructed, positivePlain);
const positiveTopFive = globalTopK(positivePlain, 5);
const positiveCapacity = rankUpperBound(positiveCipher, phase.continuous, 256, 5);
assert(positiveCapacity >= positiveTopFive);
assert(positiveTopFive / positivePlain.length > 0.48);
assert(rankUpperBound(original, phase.continuous, 256, 5) / original.length < 0.38);

console.log(JSON.stringify({
  theorem: 'Any unchanged phase-reused GP29 substitution (even 29! secret maps per phase) cannot exceed this source histogram bound for its five most frequent output glyphs',
  originalRunes: original.length,
  sourceWords: wordCount,
  periods: [255, 256],
  sourceNativeP57TopFive: [globalTopK(solved, 5), solved.length],
  exactBounds: observations,
  syntheticNativeControl: {
    nativeRunes: positivePlain.length,
    trueTopFive: positiveTopFive,
    ciphertextUpperBoundTopFive: positiveCapacity,
    trueGP29ForwardReplay: positivePlain.length
  },
  caveat: 'No original key or plaintext. Bounds require globally reused per-phase invertible maps; nonnative plaintext or evolving key escapes.'
}, null, 2));
