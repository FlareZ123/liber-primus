"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

/**
 * Exact, key-independent Playfair-like pair-collision gate on the source LP2.
 * Standard Playfair encryption always emits two DISTINCT symbols for a valid
 * digraph, under ANY keyed 5x5 alphabet. We generously allow four original GP
 * runes to pass through unchanged, and a dangling final core rune to pass
 * through unchanged whenever a reset segment has odd core length.
 * @param {readonly number[][]} segments - Source-ordered reset segments.
 * @param {number} bypassMask - Bitmask of four bypass rune identities.
 * @returns {number} Number of impossible, equal-symbol complete pairs.
 */
function violations(segments, bypassMask) {
  let errors = 0;
  for (const runes of segments) {
    let phase = 0;
    let first = -1;
    for (const rune of runes) {
      if ((bypassMask & (1 << rune)) !== 0) continue;
      if (phase === 1 && first === rune) errors++;
      first = rune;
      phase ^= 1;
    }
  }
  return errors;
}

/**
 * Track the minimum across every secret selection of four bypass identities.
 * @param {{min:number,zero:number,best:number[]}} record
 * @param {number} value
 * @param {number} mask
 */
function recordMinimum(record, value, mask) {
  if (value < record.min) {
    record.min = value;
    record.zero = 0;
    record.best = [mask];
  } else if (value === record.min && record.best.length < 3) {
    record.best.push(mask);
  }
  if (value === 0) record.zero++;
}

/** @returns {{min:number,zero:number,best:number[]}} */
function emptyRecord() {
  return {min: Number.POSITIVE_INFINITY, zero: 0, best: []};
}

/**
 * The whole-manuscript analysis keeps all authentic printed runes and words.
 * Chapters are visually separated at source red-heading boundaries.
 */
function run() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus",
      "lp2-corpus.json"), "utf8"));
  const runeId = new Map(corpus.runes.map((rune, i) => [rune, i]));
  const physicalPages = corpus.pages.filter(
    (p) => p.page <= 55 && p.indices.length > 0);
  const pages = physicalPages.map((p) => p.indices);
  const all = pages.flat();
  const parsed = parseSharedCorpus();
  const words = parsed.words.map(({runes}) => [...runes].map((rune) => {
    const index = runeId.get(rune);
    assert.notEqual(index, undefined, "unrecognized original GP rune");
    return index;
  }));

  assert.equal(pages.length, 55);
  assert.equal(all.length, 12956);
  assert.equal(words.length, 2896);
  assert.equal(parsed.crossPageWords, 32);
  assert.deepEqual(words.flat(), all);

  const chapterEnds = [729,1874,3603,5506,6527,7960,9640,12648,12956];
  const chapters = [];
  let cursor = 0;
  for (const end of chapterEnds) {
    chapters.push(all.slice(cursor, end));
    cursor = end;
  }
  assert.equal(cursor, all.length);

  const chapterPages = Array.from({length: chapters.length}, () => []);
  let pos = 0;
  for (const page of pages) {
    const chapter = chapterEnds.findIndex((end) => pos < end);
    assert.ok(chapter >= 0 && pos + page.length <= chapterEnds[chapter]);
    chapterPages[chapter].push(page);
    pos += page.length;
  }
  const chapterWords = Array.from({length: chapters.length}, () => []);
  pos = 0;
  for (const word of words) {
    const chapter = chapterEnds.findIndex((end) => pos < end);
    assert.ok(chapter >= 0 && pos + word.length <= chapterEnds[chapter]);
    chapterWords[chapter].push(word);
    pos += word.length;
  }

  const modes = ["book", "physical_page", "visual_chapter", "printed_word"];
  const global = Object.fromEntries(modes.map((name) => [name, emptyRecord()]));
  const local = chapters.map(() => [
    emptyRecord(), emptyRecord(), emptyRecord()]);
  let masks = 0;

  for (let a = 0; a < 26; a++)
  for (let b = a + 1; b < 27; b++)
  for (let c = b + 1; c < 28; c++)
  for (let d = c + 1; d < 29; d++) {
    const mask = (1 << a) | (1 << b) | (1 << c) | (1 << d);
    const sums = [0, 0, 0];
    for (let k = 0; k < chapters.length; k++) {
      const counts = [
        violations([chapters[k]], mask),
        violations(chapterPages[k], mask),
        violations(chapterWords[k], mask)
      ];
      for (let mode = 0; mode < 3; mode++) {
        recordMinimum(local[k][mode], counts[mode], mask);
        sums[mode] += counts[mode];
      }
    }
    recordMinimum(global.book, violations([all], mask), mask);
    recordMinimum(global.visual_chapter, sums[0], mask);
    recordMinimum(global.physical_page, sums[1], mask);
    recordMinimum(global.printed_word, sums[2], mask);
    masks++;
  }

  assert.equal(masks, 23751);
  assert.deepEqual(modes.map((name) => global[name].min), [42,39,42,25]);
  assert.deepEqual(local.map((row) => row[0].min),
    [0,0,0,1,0,0,1,4,0]);
  assert.deepEqual(local.map((row) => row[1].min),
    [0,0,0,1,0,1,1,4,0]);
  assert.deepEqual(local.map((row) => row[2].min),
    [0,0,0,1,0,1,1,3,0]);
  for (const name of modes) assert.equal(global[name].zero, 0);

  // Check genuine keyed Playfair pair behavior over ALL legal distinct pairs.
  // A permutation of 0..24 is a deterministic, nontrivial secret square.
  const square = Array.from({length: 25}, (_, i) => (7*i + 3) % 25);
  const cell = Array(25);
  for (let i = 0; i < square.length; i++) cell[square[i]] = i;

  /**
   * @param {number} a - Core symbol 0..24.
   * @param {number} b - Distinct core symbol 0..24.
   * @param {boolean} encrypt
   * @returns {number[]}
   */
  function playfairPair(a, b, encrypt) {
    assert.ok(a >= 0 && a < 25 && b >= 0 && b < 25 && a !== b);
    const x = cell[a], y = cell[b];
    const ar = Math.floor(x / 5), ac = x % 5;
    const br = Math.floor(y / 5), bc = y % 5;
    const step = encrypt ? 1 : 4;
    if (ar === br) return [
      square[5*ar + (ac + step) % 5],
      square[5*br + (bc + step) % 5]
    ];
    if (ac === bc) return [
      square[5*((ar + step) % 5) + ac],
      square[5*((br + step) % 5) + bc]
    ];
    return [square[5*ar + bc], square[5*br + ac]];
  }

  for (let a = 0; a < 25; a++) {
    for (let b = 0; b < 25; b++) {
      if (a === b) continue;
      const cipher = playfairPair(a, b, true);
      assert.notEqual(cipher[0], cipher[1]);
      assert.deepEqual(playfairPair(...cipher, false), [a, b]);
    }
  }

  /**
   * A complete positive shape plant using ACTUAL solved LP2 p57 rune input,
   * repeated into all original word slots. For any within-word pair with two
   * equal core symbols, change the second to its cyclic successor. That small
   * explicit edit makes the plant a valid no-padding Playfair plaintext while
   * retaining the original byte/word geometry and almost all source runes.
   */
  const source = corpus.pages.find((p) => p.page === 57).indices;
  assert.equal(source.length, 95);
  let reading = 0, repaired = 0;
  const plaintext = chapterWords.flat().map((shape) => {
    const word = shape.map(() => source[reading++ % source.length]);
    const corePositions = word.map((v,i) => v < 25 ? i : -1)
      .filter((index) => index >= 0);
    for (let j = 0; j + 1 < corePositions.length; j += 2) {
      const i = corePositions[j], k = corePositions[j+1];
      if (word[i] === word[k]) {
        word[k] = (word[k] + 1) % 25;
        repaired++;
      }
    }
    return word;
  });

  /**
   * @param {readonly number[]} word
   * @param {boolean} encrypt
   * @returns {number[]} Shift every complete core digraph, keep bypass symbols.
   */
  function transformWord(word, encrypt) {
    const out = [...word];
    const positions = word.map((v,i) => v < 25 ? i : -1)
      .filter((index) => index >= 0);
    for (let j = 0; j + 1 < positions.length; j += 2) {
      const a = positions[j], b = positions[j+1];
      const pair = playfairPair(word[a], word[b], encrypt);
      out[a] = pair[0];
      out[b] = pair[1];
    }
    return out;
  }

  const encrypted = plaintext.map((word) => transformWord(word, true));
  const recovered = encrypted.map((word) => transformWord(word, false));
  assert.deepEqual(recovered, plaintext);
  assert.equal(encrypted.flat().length, 12956);
  const positiveMask = (1<<25)|(1<<26)|(1<<27)|(1<<28);
  assert.equal(violations(encrypted, positiveMask), 0);

  const witness = (record) => ({
    min: record.min,
    zeroMasks: record.zero,
    exampleBypasses: record.best.map((mask) =>
      corpus.translit.filter((_,i) => (mask & (1 << i)) !== 0))
  });
  const result = {
    source: {pages: pages.length, runes: all.length, words: words.length,
      carriedWords: parsed.crossPageWords},
    masks,
    global: Object.fromEntries(modes.map(
      (name) => [name,witness(global[name])])),
    perChapter: local.map((entries,k) => ({
      pages: [[0,2],[3,7],[8,14],[15,22],[23,26],
        [27,32],[33,39],[40,53],[54,55]][k],
      runes: chapters[k].length,
      continuous: witness(entries[0]),
      pageReset: witness(entries[1]),
      wordReset: witness(entries[2])
    })),
    positive: {
      originalP57Runes: source.length,
      plantedRunes: encrypted.flat().length,
      repairedCoreDuplicates: repaired,
      distinctPairsValidated: 600,
      independentlyRecoveredRunes: recovered.flat().length,
      impossiblePairs: violations(encrypted,positiveMask)
    }
  };
  console.log(JSON.stringify(result,null,2));
}

run();
