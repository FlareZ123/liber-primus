'use strict';

/**
 * Original-source visual-chapter finite-register capacity SFT.
 * Deterministic source-exact support count and reversible synthetic controls.
 *
 * Run: node sims/lp2_visible_chapter_register_capacity_sft.cjs
 *
 * Every deterministic 1-for-1 encoder C_i=f(P_i, chapter, prior C symbols)
 * must output at most M distinct symbols from the same observed public state
 * if its plaintext alphabet has cardinality M. This is exact and independent
 * of plaintext language, key choice and whether f is a permutation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../resources/liber-primus/');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const starts = ink.pages.filter(p => (p.red_spans || []).some(x => x.start === 0))
  .map(p => p.page).filter(p => p <= 55);
assert.deepEqual(starts, [0, 3, 8, 15, 23, 27, 33, 40, 54]);

const physical = corpus.pages.filter(p => p.page <= 55);
assert.equal(physical.length, 56);
const pages = physical.filter(p => p.indices.length);
assert.equal(pages.length, 55);
const startToSection = new Map(starts.map((p, i) => [p, i]));
let section = -1;
const attributedPages = physical.map(page => {
  if (startToSection.has(page.page)) section = startToSection.get(page.page);
  return { section, page: page.page, indices: page.indices };
});
const runeCount = attributedPages.reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(runeCount, 12956);

/**
 * @param {Array<{section:number,page:number,indices:number[]}>} allPages
 * @param {number} width Number of previous ciphertext runes per state.
 */
function countSupports(allPages, width) {
  const states = new Map();
  let observations = 0;
  for (const page of allPages) {
    for (let i = width; i < page.indices.length; i++) {
      const state = page.section + ':' + page.indices.slice(i - width, i).join(',');
      const support = states.get(state) || new Set();
      support.add(page.indices[i]);
      states.set(state, support);
      observations++;
    }
  }
  const sizes = [...states.values()].map(s => s.size);
  return {
    width,
    observedPositions: observations,
    distinctStates: states.size,
    maximumNextRuneSupport: Math.max(...sizes),
    statesExceeding16: sizes.filter(s => s > 16).length,
    full29States: [...states].filter(([, s]) => s.size === 29).map(([k]) => k),
  };
}
const original = [0, 1, 2, 3].map(n => countSupports(attributedPages, n));
assert.deepEqual(original.map(o => o.observedPositions), [12956, 12901, 12846, 12791]);
assert.deepEqual(original.map(o => o.distinctStates), [9, 261, 5642, 12331]);
assert.deepEqual(original.map(o => o.maximumNextRuneSupport), [29, 29, 11, 3]);
assert.deepEqual(original.map(o => o.statesExceeding16), [9, 217, 0, 0]);
assert.deepEqual(original[1].full29States,
  ['7:26', '7:25', '7:18', '7:10', '7:22', '7:7']);

/** @param {number[]} plaintext @param {number} chapter */
function encrypt16(plaintext, chapter) {
  const ciphertext = [];
  let previous = 0;
  for (const symbol of plaintext) {
    const next = (symbol + previous + 3 * chapter) % 29;
    ciphertext.push(next);
    previous = next;
  }
  return ciphertext;
}
/** @param {number[]} ciphertext @param {number} chapter */
function decrypt16(ciphertext, chapter) {
  const plaintext = [];
  let previous = 0;
  for (const symbol of ciphertext) {
    plaintext.push((symbol - previous - 3 * chapter + 58) % 29);
    previous = symbol;
  }
  return plaintext;
}

// Positive control: an original-length 16-letter native register, encrypted
// with chapter and preceding-ciphertext feedback, remains invertible.
// The original chapter source boundaries are held fixed, including p50
// as a runeless grid page.
const synthetic = attributedPages.map((page, j) => {
  const plaintext = page.indices.map((_, i) => (j * 11 + i * 7 + Math.floor(i / 17)) % 16);
  const ciphertext = encrypt16(plaintext, page.section);
  assert.deepEqual(decrypt16(ciphertext, page.section), plaintext);
  return { ...page, indices: ciphertext };
});
const plant = countSupports(synthetic, 1);
assert.equal(plant.observedPositions, 12901);
assert.ok(plant.maximumNextRuneSupport <= 16);
assert.equal(plant.statesExceeding16, 0);

console.log(JSON.stringify({
  originalRuseSource: 'resources/liber-primus/lp2-corpus.json',
  redChapterSource: 'resources/liber-primus/lp2-ink-annotations.json',
  visibleChapterStarts: starts,
  original,
  firstOrderRegisterLowerBound: original[1].maximumNextRuneSupport,
  synthesized16SourcePositiveControl: {
    originalLength: runeCount,
    exactDecryptRoundTrip: true,
    observedPositions: plant.observedPositions,
    maxNextRuneSupport: plant.maximumNextRuneSupport,
    statesExceeding16: plant.statesExceeding16,
  },
  interpretation: 'At fixed chapter and preceding C, original ciphertext requires all 29 source symbols for a deterministic one-for-one alphabet mapping. A 16-rune Younger Futhark, hex, or other smaller plaintext source cannot fit this exact state family. Added state or segmentation remains possible.'
}, null, 2));
