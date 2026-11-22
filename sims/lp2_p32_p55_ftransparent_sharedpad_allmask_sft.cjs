"use strict";

/**
 * Source-linked LP2 p32/p55: all-contiguous shared-pad inverse under the
 * historically attested literal-plaintext-F, no-key-advance rule.
 *
 * Run from repository root: node sims/lp2_p32_p55_ftransparent_sharedpad_allmask_sft.cjs
 * Source-locked, read-only, no third-party libraries. Node 22/CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const lexicon = read("resources/control/english_wordfreq_textblob.txt");
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const tokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;

/** @param {string} input @returns {number[] | null} */
function encode(input) {
  const text = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  const result = [];
  for (let i = 0; i < text.length;) {
    const token = tokens.find(entry => text.startsWith(entry.token, i));
    if (!token) return null;
    result.push(token.i);
    i += token.token.length;
  }
  return result;
}

const dictionary = new Map();
for (const line of lexicon.match(/^[a-z]+\s+\d+$/gm) || []) {
  const word = encode(line.split(/\s+/u)[0]);
  if (!word) continue;
  if (!dictionary.has(word.length)) dictionary.set(word.length, []);
  dictionary.get(word.length).push(word);
}
assert.equal([...dictionary.values()].reduce((n, entries) => n + entries.length, 0), 29154);

/**
 * P55 is transcript section54 because physical p50's number-only scan is
 * not represented in this rune-only transcription.
 * @param {number} physical @param {number} section
 */
function page(physical, section) {
  const words = (transcript.split("%")[section].replace(/\/\s*/gu, "")
    .match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => [...word].map(rune => runeIndex.get(rune)));
  const indices = words.flat();
  assert.deepEqual(indices, corpus.pages[physical].indices);
  let start = 0;
  const spans = words.map((word, wi) => {
    const span = {start, end: start + word.length, length: word.length, wi};
    start += word.length;
    return span;
  });
  const where = indices.map((_, i) =>
    spans.find(span => span.start <= i && i < span.end).wi);
  const f = indices.flatMap((value, i) => value === 0 ? [i] : []);
  return {indices, words, spans, where, f};
}
const A = page(32, 32);
const B = page(55, 54);
assert.equal(A.indices.length, 121);
assert.equal(B.indices.length, 76);
assert.equal(A.words.length, 22);
assert.equal(B.words.length, 17);
assert.deepEqual(A.f, [29, 30, 42, 114]);
assert.deepEqual(B.f, [15, 25, 41]);

/** @param {number[]} sites @param {number} mask @returns {Set<number>} */
function literalPositions(sites, mask) {
  return new Set(sites.filter((_, i) => (mask & (1 << i)) !== 0));
}

/**
 * A literal plaintext F appears exactly at a selected ciphertext F site.
 * All other runes, including the unselected ciphertext Fs, must decrypt
 * to non-F plaintext, as required by the solved p56 cipher.
 * @param {object} source @param {Set<number>} literal
 * @returns {number[][][]}
 */
function candidates(source, literal) {
  return source.spans.map(span => (dictionary.get(span.length) || [])
    .filter(word => word.every((value, i) =>
      (value === 0) === literal.has(span.start + i))));
}

/** @param {object} source @param {Set<number>} literal */
function consumedSites(source, literal) {
  return source.indices.flatMap((_, i) => literal.has(i) ? [] : [i]);
}
const fullBitset = (1 << 29) - 1;
const BsignatureCache = new Map();

/**
 * Test one pair of secret F masks, one page skip, and one contiguous
 * placement in key-consumption-clock space. The shared K[i] is arbitrary.
 * @param {number[]} ca @param {number[]} cb
 * @param {number[]} consumedA @param {number[]} consumedB
 * @param {number[][][]} optionsA @param {number[][][]} optionsB
 * @param {number} maskB @param {number} offset @param {number} drop
 */
function evaluate(ca, cb, consumedA, consumedB, optionsA, optionsB, maskB, offset, drop) {
  const groups = new Map();
  for (let k = 0; k < consumedB.length; k++) {
    const i = consumedA[offset + k];
    const j = consumedB[k];
    const wa = A.where[i];
    const wb = B.where[j];
    const key = wa + ":" + wb;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      wa, wb,
      ai: i - A.spans[wa].start,
      bi: j - B.spans[wb].start,
      diff: mod(ca[i] - cb[j])
    });
  }
  const pairs = [...groups.values()]
    .filter(pair => pair.length >= 3)
    .sort((x, y) => y.length - x.length);
  let shifts = fullBitset;
  let contradiction = null;
  let checked = 0;
  for (const pair of pairs) {
    const wa = pair[0].wa;
    const wb = pair[0].wb;
    const rightPositions = pair.map(item => item.bi);
    const leftPositions = pair.map(item => item.ai);
    const diffs = pair.map(item => item.diff);
    const cacheKey = maskB + ":" + wb + ":" + rightPositions.join(",");
    let rights = BsignatureCache.get(cacheKey);
    if (!rights) {
      rights = new Map();
      for (const word of optionsB[wb]) {
        const first = word[rightPositions[0]];
        const signature = rightPositions.slice(1)
          .map(position => mod(word[position] - first)).join(",");
        if (!rights.has(signature)) rights.set(signature, []);
        rights.get(signature).push(first);
      }
      BsignatureCache.set(cacheKey, rights);
    }
    let permitted = 0;
    for (const word of optionsA[wa]) {
      const first = word[leftPositions[0]];
      const signature = leftPositions.slice(1).map((position, i) =>
        mod(word[position] - first - diffs[i + 1] + diffs[0])).join(",");
      const bFirsts = rights.get(signature);
      if (!bFirsts) continue;
      for (const bFirst of bFirsts) {
        const relativeShift = mod(bFirst - first + diffs[0]);
        permitted |= 1 << relativeShift;
      }
      if ((permitted & shifts) === shifts) break;
    }
    checked++;
    shifts &= permitted;
    if (shifts === 0) {
      contradiction = {word32: wa, word55: wb,
        pairedNonliteralRunes: pair.length, firstSource32: A.spans[wa].start +
          leftPositions[0]};
      break;
    }
  }
  const survivors = Array.from({length: 29}, (_, i) => i)
    .filter(i => (shifts & (1 << i)) !== 0);
  return {offset, drop, wordPairs: pairs.length, checked, survivors, contradiction};
}

// Precompute the 128 literal-F choices, then reject any that already
// contradict the source-native dictionary for a complete printed word.
const sourceA = [];
const sourceB = [];
for (let mask = 0; mask < 1 << A.f.length; mask++) {
  const literal = literalPositions(A.f, mask);
  const choices = candidates(A, literal);
  if (choices.some(list => list.length === 0)) continue;
  sourceA.push({mask, literal, choices, consumed: consumedSites(A, literal)});
}
for (let mask = 0; mask < 1 << B.f.length; mask++) {
  const literal = literalPositions(B.f, mask);
  const choices = candidates(B, literal);
  if (choices.some(list => list.length === 0)) continue;
  sourceB.push({mask, literal, choices, consumed: consumedSites(B, literal)});
}
assert.deepEqual(sourceA.map(entry => entry.mask), [0, 1, 2, 3, 8, 9, 10, 11]);
assert.deepEqual(sourceB.map(entry => entry.mask), [0, 1, 2, 3, 4, 5, 6, 7]);
assert.equal(sourceA.length * sourceB.length, 64);

let examined = 0;
let surviving = 0;
const firstContradictionLengths = {};
const originalWitnesses = [];
for (const a of sourceA) {
  for (const b of sourceB) {
    for (const drop of [0, 1]) {
      const cb = b.consumed.filter(i => i >= drop);
      for (let offset = 0; offset <= a.consumed.length - cb.length; offset++) {
        const result = evaluate(A.indices, B.indices,
          a.consumed, cb, a.choices, b.choices, b.mask, offset, drop);
        examined++;
        if (result.survivors.length > 0) surviving++;
        assert.ok(result.contradiction, "Original alignment should contradict word pairs");
        const n = String(result.contradiction.pairedNonliteralRunes);
        firstContradictionLengths[n] = (firstContradictionLengths[n] || 0) + 1;
        if (offset === 19 && a.mask === 0 && b.mask === 0) {
          originalWitnesses.push({drop, ...result});
        }
      }
    }
  }
}
assert.equal(examined, 5952);
assert.equal(surviving, 0);
assert.deepEqual(firstContradictionLengths, {
  4: 80, 5: 406, 6: 1162, 7: 1680,
  8: 1216, 9: 832, 10: 256, 11: 320
});
assert.deepEqual(originalWitnesses.map(x =>
  [x.drop, x.contradiction.pairedNonliteralRunes]), [[0, 6], [1, 6]]);

/**
 * Real English-GP positive under a nonconstant reused key, arbitrary
 * per-page Caesar shifts, and exact p56-style transparent Fs. The pad
 * clock compresses past *only* the declared literal-F positions.
 * @param {object} a @param {object} b
 * @param {number} offset @param {number} drop
 */
function plant(a, b, offset, drop) {
  const plainA = a.choices.flatMap(options => options[0]);
  const plainB = b.choices.flatMap(options => options[0]);
  assert.equal(plainA.length, A.indices.length);
  assert.equal(plainB.length, B.indices.length);
  const cb = b.consumed.filter(i => i >= drop);
  assert.ok(offset + cb.length <= a.consumed.length);
  const sourceIndex = new Map(cb.map((j, k) => [offset + k, j]));
  const key = a.consumed.map((i, t) => {
    let candidate = mod(7 * t * t + 11 * t + 3);
    const bIndex = sourceIndex.get(t);
    while (mod(plainA[i] + candidate + 13) === 0 ||
      (bIndex !== undefined && mod(plainB[bIndex] + candidate + 21) === 0)) {
      candidate = mod(candidate + 1);
    }
    return candidate;
  });
  const ca = plainA.slice().fill(0);
  const bc = plainB.slice().fill(0);
  for (let t = 0; t < a.consumed.length; t++) {
    const i = a.consumed[t];
    ca[i] = mod(plainA[i] + key[t] + 13);
    assert.ok(ca[i] !== 0);
  }
  for (let k = 0; k < cb.length; k++) {
    const j = cb[k];
    bc[j] = mod(plainB[j] + key[offset + k] + 21);
    assert.ok(bc[j] !== 0);
  }
  if (drop === 1) {
    assert.ok(!b.literal.has(0));
    bc[0] = mod(plainB[0] + 9);
    if (bc[0] === 0) bc[0] = mod(plainB[0] + 10);
    assert.ok(bc[0] !== 0);
  }
  for (let i = 0; i < ca.length; i++) {
    if (a.literal.has(i)) assert.equal(ca[i], 0);
  }
  for (let i = 0; i < bc.length; i++) {
    if (b.literal.has(i)) assert.equal(bc[i], 0);
  }
  for (let k = 0; k < a.consumed.length; k++) {
    const i = a.consumed[k];
    assert.equal(mod(ca[i] - key[k] - 13), plainA[i]);
  }
  for (let k = 0; k < cb.length; k++) {
    const i = cb[k];
    assert.equal(mod(bc[i] - key[offset + k] - 21), plainB[i]);
  }
  const result = evaluate(ca, bc, a.consumed, cb,
    a.choices, b.choices, b.mask, offset, drop);
  assert.ok(result.survivors.includes(21),
    "True relative shift must survive the key-blind dictionary gate");
  return {mask32: a.mask, mask55: b.mask, drop, offset,
    pairedWords: result.wordPairs, trueShift21Recovered: true,
    plantedRunesRecovered: plainA.length + plainB.length};
}

const positiveSettings = [
  [0, 0, 0, 0], [0, 0, 1, 19], [3, 3, 0, 19],
  [3, 3, 1, 30], [8, 4, 0, 19], [11, 7, 1, 19],
  [11, 7, 0, 0], [9, 6, 1, 30]
];
const positives = positiveSettings.map(([ma, mb, drop, offset]) =>
  plant(sourceA.find(x => x.mask === ma),
    sourceB.find(x => x.mask === mb), offset, drop));
assert.equal(positives.length, 8);

console.log(JSON.stringify({
  sources: {runes32: 121, runes55: 76,
    words32: 22, words55: 17, originalF32: A.f, originalF55: B.f,
    GPnativeDictionaryEntries: 29154},
  model: {cipherZeroMaskPossibilities: 128, wordPossibleMasks32: sourceA.length,
    wordPossibleMasks55: sourceB.length, survivingMaskPairs: 64,
    placementsIncludingCarriedFragment: true, relativeShifts: 29},
  original: {keyClockPlacements: examined, survivingPlacements: surviving,
    firstContradictionLengths, earlierPostselectedOffset19: originalWitnesses},
  positives,
  conclusion: "All historical F-transparent mask/clock placements for the tree-selected page pair fail original-word English two-time-pad consistency; no unknown plaintext or authentic key recovered."
}, null, 2));
