'use strict';
/**
 * Paragraph-reset all-secret GP29 predecessor-exclusion rank capacity.
 *
 * The order of all 29 ciphertext runes and the association of its 28
 * predecessor-excluding ordinal ranks with plaintext symbols are allowed
 * to change freely after every physical page or transcribed '&' paragraph
 * boundary. Exactly seven additional boundaries occur in the unknown LP2
 * corpus. Both page leaders and these added leaders are unrestricted,
 * and every immediately repeated ciphertext rune is a free erasure.
 *
 * Computes the exact highest possible count of ANY single content symbol
 * over all 29! secret rune orders independently in each segment.
 * No cryptographic key is guessed or language search fitted.
 *
 * SFT, read-only: node sims/lp2_no_repeat_paragraph_rekey_capacity_sft.cjs
 *
 * @module lp2_no_repeat_paragraph_rekey_capacity_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const alphabet = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const Q = 29;
const UNKNOWN_RUNES = 12956;
const PAGE_GROUPS = 55;
const NATIVE_GP_E_MIN = 1372;
assert.equal(corpus.runes.length, Q);

/**
 * Recover exactly the unknown original runes; discard the following
 * solved p56 cipher and clear p57 without confusing physical page IDs
 * with '$' text-section markers.
 * @returns {string}
 */
function originalTranscription() {
  const original = corpus.pages.filter(page =>
    page.page >= 0 && page.page <= 55).flatMap(page => page.indices);
  assert.equal(original.length, UNKNOWN_RUNES);
  let found = 0;
  let source = '';
  for (const glyph of read('resources/lp2-transcription.txt')) {
    if (alphabet.has(glyph)) {
      if (found === original.length) break;
      found++;
    }
    source += glyph;
  }
  assert.equal(found, UNKNOWN_RUNES);
  const seen = [...source].filter(glyph => alphabet.has(glyph))
    .map(glyph => alphabet.get(glyph));
  assert.deepEqual(seen, original, 'Original rune indices must match source');
  return source;
}
const original = originalTranscription();

/**
 * @param {Set<string>} splits
 * @returns {number[][]}
 */
function splitSegments(splits) {
  /** @type {number[][]} */
  const groups = [];
  /** @type {number[]} */
  let group = [];
  for (const glyph of original) {
    if (alphabet.has(glyph)) {
      group.push(alphabet.get(glyph));
    } else if (splits.has(glyph) && group.length) {
      groups.push(group);
      group = [];
    }
  }
  if (group.length) groups.push(group);
  assert.equal(groups.reduce((n, g) => n + g.length, 0), UNKNOWN_RUNES);
  return groups;
}

/**
 * A rank r is emitted by the two immediately adjacent source glyphs
 * a,b of secret order. A different previous glyph s can be placed on
 * either side to contribute max(T[s,a], T[s,b]); the mutual a/b
 * transitions always contribute. Both arrangements can be realized by
 * one full order, proving the maximum over secret orders and all ranks.
 *
 * @param {Array<ArrayLike<number>>} transition
 * @returns {number}
 */
function exactMaxRank(transition) {
  const q = transition.length;
  let highest = 0;
  for (let a = 0; a < q; a++) {
    for (let b = a + 1; b < q; b++) {
      let count = transition[a][b] + transition[b][a];
      for (let previous = 0; previous < q; previous++) {
        if (previous !== a && previous !== b)
          count += Math.max(transition[previous][a],
            transition[previous][b]);
      }
      highest = Math.max(highest, count);
    }
  }
  return highest;
}

/**
 * @param {number[]} group
 * @returns {{maximum:number,eligible:number,doublets:number}}
 */
function segmentCapacity(group) {
  const transition = Array.from({length:Q},
    () => new Uint32Array(Q));
  let equal = 0;
  for (let i = 1; i < group.length; i++) {
    const previous = group[i - 1], current = group[i];
    if (previous === current) equal++;
    else transition[previous][current]++;
  }
  return {
    maximum:exactMaxRank(transition),
    eligible:group.length - 1 - equal,
    doublets:equal
  };
}

/**
 * @param {Set<string>} splits
 * @returns {{groups:number,maximum:number,eligible:number,doublets:number,
 *  additionalLeaders:number,originalEligibleMaximum:number}}
 */
function model(splits) {
  const groups = splitSegments(splits);
  const parts = groups.map(segmentCapacity);
  const additionalLeaders = groups.length - PAGE_GROUPS;
  return {
    groups:groups.length,
    maximum:parts.reduce((n, x) => n + x.maximum, 0),
    eligible:parts.reduce((n, x) => n + x.eligible, 0),
    doublets:parts.reduce((n, x) => n + x.doublets, 0),
    additionalLeaders,
    originalEligibleMaximum:
      parts.reduce((n, x) => n + x.maximum, 0) + additionalLeaders
  };
}

// Independent exhaustive five-symbol oracle, checking the theorem against
// all 5! rune orders and all four rank bins, without LP2 model fitting.
const toy = [
  [0,3,5,2,8], [4,0,1,7,2], [9,6,0,3,4],
  [2,8,5,0,7], [1,4,9,6,0]
];
let brute = 0;
function oracle(prefix, remaining) {
  if (!remaining.length) {
    const pos = [];
    prefix.forEach((glyph, i) => {pos[glyph] = i;});
    const bins = [0,0,0,0];
    for (let previous = 0; previous < 5; previous++) {
      for (let current = 0; current < 5; current++) {
        if (previous === current) continue;
        const digit = pos[current] -
          Number(pos[previous] < pos[current]);
        bins[digit] += toy[previous][current];
      }
    }
    brute = Math.max(brute, ...bins);
    return;
  }
  for (let k = 0; k < remaining.length; k++) {
    oracle([...prefix, remaining[k]],
      [...remaining.slice(0, k), ...remaining.slice(k + 1)]);
  }
}
oracle([], [0,1,2,3,4]);
assert.equal(brute, exactMaxRank(toy));

// An authentic p57 plaintext under three independent secret alphabet
// orders is encrypted and recovered exactly, including the reserved
// rank-28 erasure (= immediately repeated ciphertext rune).
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);
let recovered = 0;
for (const [segment, plaintext] of [
  p57.slice(0,32),p57.slice(32,63),p57.slice(63)
].entries()) {
  const order = Array.from({length:29},
    (_, i) => (7 * i + 3 * segment) % 29);
  const pos = [];
  order.forEach((glyph, i) => {pos[glyph] = i;});
  let previous = (11 + 5 * segment) % 29;
  for (const value of plaintext) {
    const current = value === 28 ? previous :
      order[value + Number(value >= pos[previous])];
    const rank = current === previous ? 28 :
      pos[current] - Number(pos[previous] < pos[current]);
    assert.equal(rank, value);
    previous = current;
    recovered++;
  }
}
assert.equal(recovered, 95);

const page = model(new Set(['%']));
const paragraph = model(new Set(['%','&','$','§']));
const period = model(new Set(['%','&','$','§','.']));
assert.deepEqual(page, {
  groups:55, maximum:1292, eligible:12815, doublets:86,
  additionalLeaders:0, originalEligibleMaximum:1292
});
assert.deepEqual(paragraph, {
  groups:62, maximum:1321, eligible:12808, doublets:86,
  additionalLeaders:7, originalEligibleMaximum:1328
});
assert.equal(period.groups, 219);
assert.equal(period.originalEligibleMaximum, 2072);
assert.equal(period.doublets, 85);
assert(paragraph.originalEligibleMaximum < NATIVE_GP_E_MIN);

console.log(JSON.stringify({
  originalRunes:UNKNOWN_RUNES, nativeControlMinimumE:NATIVE_GP_E_MIN,
  source:'original % page and & paragraph markers',
  page, paragraph, period,
  paragraphGap:NATIVE_GP_E_MIN -
    paragraph.originalEligibleMaximum,
  authenticPositivePlantRecovered:recovered,
  toyExhaustiveMaximum:brute,
  decision:'per-page and per-paragraph fixed secret rank28 alphabets excluded '+
    'for the pinned GP-native English register; sentence-wise rekey remains open',
  newUnknownPlaintextRecovered:false
}, null, 2));
