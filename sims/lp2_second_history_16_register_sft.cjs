'use strict';

/**
 * Original LP2 second-ciphertext-history 16-source capacity and shifted-codebook SFT.
 * Run with: node sims/lp2_second_history_16_register_sft.cjs
 *
 * All 29 GP rune indices and the nine chapter boundaries are loaded from
 * pinned original-image-derived resources; word delimiters come from the
 * separately labelled derivative transcription and are checked rune-for-rune.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../resources/liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const starts = ink.pages.filter(p => p.page <= 55 &&
  (p.red_spans || []).some(s => s.start === 0)).map(p => p.page);
assert.deepEqual(starts, [0, 3, 8, 15, 23, 27, 33, 40, 54]);

let chapter = -1;
const pages = corpus.pages.filter(p => p.page <= 55).map(p => {
  if (starts.includes(p.page)) chapter++;
  return { page: p.page, chapter, indices: p.indices };
});
assert.equal(pages.length, 56);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);

/** @param {number[]} indices @param {number} i */
function history(indices, i) {
  return [i > 1 ? indices[i - 2] : -1, i > 0 ? indices[i - 1] : -1];
}

/**
 * Each state is (visible chapter, previous two ciphertext runes).
 * -1 is an explicit, public reset sentinel. Include every position.
 * @param {Array<{chapter:number,indices:number[]}>} segments
 * @returns {Map<string, Set<number>>}
 */
function supports(segments) {
  const states = new Map();
  for (const seg of segments) {
    for (let i = 0; i < seg.indices.length; i++) {
      const key = seg.chapter + ':' + history(seg.indices, i).join(',');
      if (!states.has(key)) states.set(key, new Set());
      states.get(key).add(seg.indices[i]);
    }
  }
  return states;
}

/** @param {Map<string,Set<number>>} states */
function metrics(states) {
  const d = [...states.values()].map(x => x.size);
  return {
    states: states.size,
    max: Math.max(...d),
    over16: d.filter(x => x > 16).length,
    full29: [...states].filter(([, x]) => x.size === 29).map(([k]) => k),
    sumSupport: d.reduce((a, b) => a + b, 0),
  };
}
const page = supports(pages);
assert.deepEqual(metrics(page), {
  states: 5699, max: 11, over16: 0, full29: [], sumSupport: 12480,
});

const chapters = starts.map((_, chapter) => ({
  chapter,
  indices: pages.filter(p => p.chapter === chapter).flatMap(p => p.indices),
}));
const chapterStates = supports(chapters);
assert.deepEqual(metrics(chapterStates), {
  states: 5675, max: 11, over16: 0, full29: [], sumSupport: 12482,
});

// Word reset is a different hypothesis. The transcription preserves each rune
// exactly, but its '-' and '.' separator flags are derivative, not image-authored
// cipher reset instructions. Physical page boundaries are also honored.
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const derivedIndices = [];
const boundaries = new Set();
for (const char of transcription) {
  if (runeMap.has(char)) derivedIndices.push(runeMap.get(char));
  else if ((char === '-' || char === '.') && derivedIndices.length < 12956) {
    boundaries.add(derivedIndices.length);
  }
}
assert.deepEqual(derivedIndices.slice(0, 12956), pages.flatMap(p => p.indices));
let boundary = 0;
for (const p of pages) {
  boundary += p.indices.length;
  boundaries.add(boundary);
}
let globalOffset = 0;
const wordSegments = [];
for (const p of pages) {
  let word = [];
  for (const cipher of p.indices) {
    if (word.length && boundaries.has(globalOffset)) {
      wordSegments.push({ chapter: p.chapter, indices: word });
      word = [];
    }
    word.push(cipher);
    globalOffset++;
  }
  if (word.length) wordSegments.push({ chapter: p.chapter, indices: word });
}
assert.equal(wordSegments.length, 2928);
const wordStates = supports(wordSegments);
assert.deepEqual(metrics(wordStates), {
  states: 4570, max: 29, over16: 22,
  full29: Array.from({ length: 8 }, (_, x) => x + ':-1,-1'),
  sumSupport: 9553,
});

// Exact necessity and sufficiency: d_s <= 16 permits an injective map from
// 16 source labels to 29 outputs for every observed state. Construct the
// inverse mapping by sorted observed successor ranks, a deliberately
// CIPHERTEXT-FITTED table, never an authored key or plausible plaintext.
const rankTables = new Map([...page].map(([k, set]) =>
  [k, [...set].sort((a, b) => a - b)]));
const decoded = pages.map(p => {
  const source = p.indices.map((cipher, i) => {
    const key = p.chapter + ':' + history(p.indices, i).join(',');
    return rankTables.get(key).indexOf(cipher);
  });
  assert.ok(source.every(x => x >= 0 && x < 16));
  const rebuilt = [];
  for (const symbol of source) {
    const key = p.chapter + ':' + history(rebuilt, rebuilt.length).join(',');
    const output = rankTables.get(key)[symbol];
    assert.ok(Number.isInteger(output));
    rebuilt.push(output);
  }
  assert.deepEqual(rebuilt, p.indices);
  return source;
});
assert.equal(decoded.reduce((s, p) => s + p.length, 0), 12956);

// A compact, authentic-to-the-family synthetic positive control with a fixed
// 16-symbol GP source codebook {0..15} and deterministic state shifts.
function shifted16(input, chapter, inverse) {
  const ciphertext = [], plaintext = [];
  for (let i = 0; i < input.length; i++) {
    const h = history(ciphertext, ciphertext.length);
    const shift = (3 * chapter + 7 * Math.max(h[0], 0) +
      11 * Math.max(h[1], 0)) % 29;
    const output = inverse ? input[i] : (input[i] + shift) % 29;
    ciphertext.push(output);
    plaintext.push(inverse ? (output - shift + 29) % 29 : input[i]);
  }
  return inverse ? plaintext : ciphertext;
}
const planted = pages.map(p => {
  const source = p.indices.map((_, i) =>
    (p.page * 13 + i * 7 + Math.floor(i / 17)) % 16);
  const ciphertext = shifted16(source, p.chapter, false);
  assert.deepEqual(shifted16(ciphertext, p.chapter, true), source);
  return { ...p, indices: ciphertext };
});
assert.ok(metrics(supports(planted)).max <= 16);

/** @param {number} mask */
function popcount(mask) {
  let n = 0;
  while (mask) { mask &= mask - 1; n++; }
  return n;
}
const mask29 = (1 << 29) - 1;
/** @param {number} mask @param {number} k */
function rotate(mask, k) {
  return k === 0 ? mask :
    ((mask << k) | (mask >>> (29 - k))) & mask29;
}
/** @param {Set<number>} values */
function bitmask(values) {
  let mask = 0;
  for (const v of values) mask |= 1 << v;
  return mask;
}

// Original pp40-53 chapter 7: four public state supports whose translates
// cannot be covered by ANY shared 16-element subset of Z/29Z.
// Fix the first support's rotation to zero without loss of generality;
// enumerate all 29^3 relative translations for the remaining three.
const witnessKeys = ['7:0,24', '7:18,16', '7:21,28', '7:3,9'];
const masks = witnessKeys.map(k => bitmask(page.get(k)));
assert.deepEqual(masks, [171222531, 186656914, 72366093, 17143849]);
assert.deepEqual(masks.map(popcount), [11, 9, 9, 9]);
let minimum = 29, optimal = 0, atMost16 = 0;
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    for (let c = 0; c < 29; c++) {
      const cardinality = popcount(masks[0] | rotate(masks[1], a) |
        rotate(masks[2], b) | rotate(masks[3], c));
      if (cardinality < minimum) { minimum = cardinality; optimal = 1; }
      else if (cardinality === minimum) optimal++;
      if (cardinality <= 16) atMost16++;
    }
  }
}
assert.equal(minimum, 17);
assert.equal(optimal, 15);
assert.equal(atMost16, 0);


// More permissive, but still structured: one FIXED global sixteen-codepoint
// subset of GP29, with an independently selected affine (a,b) transform per
// (chapter, previous-two-ciphertext) state. The codebook below was selected
// by fitting ORIGINAL ciphertext; it is not an historical key.
const codebook16 = [0, 1, 3, 6, 9, 10, 13, 15, 16, 18, 20, 21, 23, 25, 26, 27];
assert.equal(bitmask(new Set(codebook16)), 246785611);
const affineCandidates = [];
for (let a = 1; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const outputs = new Set(codebook16.map(x => (a * x + b) % 29));
    affineCandidates.push({ a, b, mask: bitmask(outputs) });
  }
}
assert.equal(affineCandidates.length, 812);
const affineKey = new Map();
let possibleKeys = 0;
for (const [state, outputs] of page) {
  const observed = bitmask(outputs);
  const allowed = affineCandidates.filter(item =>
    (observed & item.mask) === observed);
  assert.ok(allowed.length > 0, 'unrepresented state ' + state);
  affineKey.set(state, allowed[0]);
  possibleKeys += allowed.length;
}
assert.equal(affineKey.size, 5699);
// At every state with only one observed successor, any of sixteen distinct
// source labels can encode it using a=1 and b=(C-P) mod 29, independently
// of every other observed state. This gives a rigorous LOWER bound on
// distinct full 12,956-symbol source decodings for the SAME ciphertext.
const singletonStates = [...page.values()].filter(s => s.size === 1).length;
assert.equal(singletonStates, 2193);
const singletonStateLowerBoundBits = singletonStates * 4;
assert.equal(singletonStateLowerBoundBits, 8772);
assert.ok(Math.abs(possibleKeys / affineKey.size - 271.01982804000704) < 1e-9);
const modularInverse = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  modularInverse[a] = Array.from({ length: 28 }, (_, k) => k + 1)
    .find(k => a * k % 29 === 1);
}
let affinePositions = 0;
for (const p of pages) {
  const source16 = p.indices.map((cipher, i) => {
    const key = p.chapter + ':' + history(p.indices, i).join(',');
    const { a, b } = affineKey.get(key);
    const codepoint = modularInverse[a] * (cipher - b + 29) % 29;
    const label = codebook16.indexOf(codepoint);
    assert.ok(label >= 0 && label < 16);
    return label;
  });
  const rebuilt = [];
  for (const label of source16) {
    const key = p.chapter + ':' + history(rebuilt, rebuilt.length).join(',');
    const { a, b } = affineKey.get(key);
    rebuilt.push((a * codebook16[label] + b) % 29);
  }
  assert.deepEqual(rebuilt, p.indices);
  affinePositions += rebuilt.length;
}
assert.equal(affinePositions, 12956);

// Different observed states generally accept many affine parameter pairs.
// Every full round trip above is ciphertext-fitted and underdetermined.
// Neither the fixed codebook nor the affine state-key table has a source selector.

console.log(JSON.stringify({
  originalRuneCount: 12956,
  visibleChapterStarts: starts,
  pageReset: metrics(page),
  chapterReset: metrics(chapterStates),
  derivativeWordReset: metrics(wordStates),
  wordSegments: wordSegments.length,
  arbitrary16SourceRankConstructionReencryptsAllOriginalRunes: true,
  fixed16SourceShiftedCipherSyntheticPositiveRoundTrip: true,
  fixedCodebookAffine16OriginalFit: {
    codebook: codebook16,
    stateCount: affineKey.size,
    originalPositions: affinePositions,
    averageAllowedAffineKeysPerState: possibleKeys / affineKey.size,
    singletonStates,
    distinctSource16DecodingsLowerBoundLog2: singletonStateLowerBoundBits,
    ciphertextFittedNotPlaintext: true,
  },
  impossibleShiftedShared16CodebookWitness: {
    chapter: 7,
    keys: witnessKeys,
    supports: masks.map(popcount),
    exhaustiveRelativeShifts: 29 ** 3,
    smallestShiftedUnion: minimum,
    shiftTriplesAttainingMinimum: optimal,
    shiftTriplesAtOrBelow16: atMost16,
  },
  interpretation: 'A two-ciphertext-history 16-symbol register is algebraically possible under arbitrary secret injective state tables with page/chapter reset, but impossible under a shared 16-codepoint GP29 additive-shift table. Word-reset variants without additional state fail first-symbol capacity. No LP2 plaintext/key is recovered.'
}, null, 2));
