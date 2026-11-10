"use strict";

/**
 * Source-indexed, lossless physical-page/printed-line traversal challenge.
 *
 * A facing-page reading order is motivated by the manuscript's alternating
 * tree margins on physical pages 8–13. This script checks the entire original
 * unsolved LP2 source (including the runeless numeric page 50) and asks a
 * narrow question: is a simple line-by-line spread traversal compatible with
 * the low repeat rate across ordinary physical printed-line joins?
 *
 * It proposes no key, decryption or claim of an intended transposition.
 * Run with Node.js 22: node sims/lp2_spread_traversal_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const RUNE = /[\u16a0-\u16ff]/u;
const TRIALS = 40000;

/**
 * @typedef {{physicalPage:number, runeOffset:number, printedLine:number,
 *   runeColumn:number, glyph:string}} SourceCoordinate
 * @typedef {{linesByPage:Map<number,number[][]>,
 *   coordinates:SourceCoordinate[], totalLines:number}} PhysicalSource
 */

/** @returns {PhysicalSource} */
function parseSource() {
  const raw = fs.readFileSync(path.join(ROOT, "resources",
    "lp2-transcription.txt"), "utf8");
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources",
    "liber-primus", "lp2-corpus.json"), "utf8"));
  const chunks = raw.split("%").filter(part => RUNE.test(part)).slice(0, 55);
  const original = corpus.pages.filter(page => page.status === "unsolved");
  assert.equal(chunks.length, 55);
  assert.equal(original.length, 55);

  /** @type {Map<number,number[][]>} */
  const linesByPage = new Map();
  /** @type {SourceCoordinate[]} */
  const coordinates = [];
  let totalLines = 0;
  for (let p = 0; p < chunks.length; p++) {
    const physicalPage = p >= 50 ? p + 1 : p;
    assert.equal(original[p].page, physicalPage);
    const runes = original[p].indices.map(i => corpus.runes[i]);
    let local = 0;
    const lines = chunks[p].split("/").map((sourceLine, lineIndex) => {
      /** @type {number[]} */
      const ids = [];
      for (const glyph of sourceLine) {
        if (!RUNE.test(glyph)) continue;
        assert.equal(glyph, runes[local]);
        ids.push(coordinates.length);
        coordinates.push({physicalPage, runeOffset:local,
          printedLine:lineIndex, runeColumn:ids.length - 1, glyph});
        local++;
      }
      return ids;
    }).filter(ids => ids.length);
    assert.equal(local, runes.length);
    totalLines += lines.length;
    linesByPage.set(physicalPage, lines);
  }
  assert.equal(coordinates.length, 12956);
  assert.equal(totalLines, 594);
  assert.equal(linesByPage.has(50), false);
  return {linesByPage, coordinates, totalLines};
}

/**
 * Reversible ordinal permutation of original glyph offsets.
 * On each even/odd facing spread, emit line 0 left then line 0 right, etc.
 * An incomplete final line and the runeless p50 grid are accounted for.
 * @param {PhysicalSource} source
 * @returns {number[]}
 */
function spreadOrder(source) {
  /** @type {number[]} */
  const order = [];
  for (let p = 0; p <= 54; p += 2) {
    const left = source.linesByPage.get(p) || [];
    const right = source.linesByPage.get(p + 1) || [];
    for (let k = 0; k < Math.max(left.length, right.length); k++) {
      if (left[k]) order.push(...left[k]);
      if (right[k]) order.push(...right[k]);
    }
  }
  return order;
}

/**
 * @param {number[]} order
 * @param {number} size
 * @returns {number[]}
 */
function invertOrder(order, size) {
  assert.equal(order.length, size);
  const inverse = Array(size).fill(-1);
  for (let i = 0; i < order.length; i++) {
    const original = order[i];
    assert.ok(Number.isInteger(original) && original >= 0 && original < size);
    assert.equal(inverse[original], -1);
    inverse[original] = i;
  }
  assert.ok(inverse.every(i => i >= 0));
  return inverse;
}

/** @param {PhysicalSource} source @returns {number[][]} */
function spreads(source) {
  const pairs = [];
  for (let p = 0; p <= 54; p += 2) {
    if (source.linesByPage.has(p) && source.linesByPage.has(p + 1)) {
      pairs.push([p, p + 1]);
    }
  }
  return pairs;
}

/**
 * Count the two types of cross-page transition in a facing-spread line walk.
 * AB is left line-k final -> right line-k initial;
 * BA is right line-k final -> left line-(k+1) initial.
 * @param {PhysicalSource} source
 * @param {number[][]} pairs
 * @param {string[]} glyphs
 * @returns {[number,number,number,number]}
 */
function transitions(source, pairs, glyphs) {
  const out = [0, 0, 0, 0];
  for (const [a, b] of pairs) {
    const A = source.linesByPage.get(a);
    const B = source.linesByPage.get(b);
    assert.ok(A && B);
    for (let k = 0; k < Math.min(A.length, B.length); k++) {
      out[0] += Number(glyphs[A[k].at(-1)] === glyphs[B[k][0]]);
      out[2]++;
      if (k + 1 < A.length) {
        out[1] += Number(glyphs[B[k].at(-1)] === glyphs[A[k + 1][0]]);
        out[3]++;
      }
    }
  }
  return /** @type {[number,number,number,number]} */ (out);
}

/** @param {PhysicalSource} source @param {string[]} glyphs */
function ordinaryLineWraps(source, glyphs) {
  let equal = 0, joins = 0;
  for (const lines of source.linesByPage.values()) {
    for (let k = 0; k + 1 < lines.length; k++) {
      equal += Number(glyphs[lines[k].at(-1)] === glyphs[lines[k + 1][0]]);
      joins++;
    }
  }
  return {equal, joins};
}

/** Deterministic xorshift32 for fully reproducible control permutations. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Preserve the physical left pages, exact right-page line-count classes,
 * every page's glyph sequence and print-line morphology. Randomize only
 * which equal-line-count right page is placed opposite each left page.
 * @param {PhysicalSource} source
 * @param {number[][]} pairs
 * @param {string[]} glyphs
 * @param {number} trials
 */
function matchedRightPageNull(source, pairs, glyphs, trials) {
  const actual = transitions(source, pairs, glyphs);
  const groups = new Map();
  for (let i = 0; i < pairs.length; i++) {
    const key = source.linesByPage.get(pairs[i][1]).length;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  const random = rng(0x13310);
  const histAB = Array(actual[2] + 1).fill(0);
  const histBA = Array(actual[3] + 1).fill(0);
  let sumAB = 0, sumBA = 0;
  for (let t = 0; t < trials; t++) {
    const rights = pairs.map(pair => pair[1]);
    for (const ids of groups.values()) {
      const options = ids.map(i => rights[i]);
      for (let k = options.length - 1; k > 0; k--) {
        const j = Math.floor(random() * (k + 1));
        [options[k], options[j]] = [options[j], options[k]];
      }
      ids.forEach((id, j) => { rights[id] = options[j]; });
    }
    const permuted = pairs.map((pair, i) => [pair[0], rights[i]]);
    const result = transitions(source, permuted, glyphs);
    assert.equal(result[2], actual[2]);
    assert.equal(result[3], actual[3]);
    histAB[result[0]]++;
    histBA[result[1]]++;
    sumAB += result[0];
    sumBA += result[1];
  }
  const lowerTail = (h, v) =>
    (1 + h.slice(0, v + 1).reduce((a, b) => a + b, 0)) / (trials + 1);
  return {matchedPageGroups:[...groups].map(([lines, ids]) =>
    ({rightPageLines:lines, pairs:ids.length})),
    AB:{observed:actual[0], links:actual[2], nullMean:sumAB/trials,
      lowerTail:lowerTail(histAB, actual[0])},
    BA:{observed:actual[1], links:actual[3], nullMean:sumBA/trials,
      lowerTail:lowerTail(histBA, actual[1])}};
}

function main() {
  const source = parseSource();
  const originalGlyphs = source.coordinates.map(c => c.glyph);
  const order = spreadOrder(source);
  const inverse = invertOrder(order, source.coordinates.length);
  assert.ok(order.every((id, j) => inverse[id] === j));
  assert.equal(new Set(order).size, 12956);
  const pairs = spreads(source);
  const ordinary = ordinaryLineWraps(source, originalGlyphs);
  assert.deepEqual(ordinary, {equal:4, joins:539});
  const trees = [[8,9],[10,11],[12,13]];
  const natural = transitions(source, pairs, originalGlyphs);
  const illustrated = transitions(source, trees, originalGlyphs);

  // Detector plant: construct a source-position indexed surrogate whose
  // output glyph alternates along the *candidate* interleaved traversal.
  // It must have no repeat at either type of traversed cross-page link.
  const planted = Array(source.coordinates.length);
  order.forEach((originalIndex, i) => {
    planted[originalIndex] = i % 2 === 0 ? "ᚠ" : "ᚢ";
  });
  const plant = transitions(source, pairs, planted);
  assert.equal(plant[0], 0);
  assert.equal(plant[1], 0);

  const result = {source:{runes:source.coordinates.length,
    runePages:source.linesByPage.size, printedLines:source.totalLines,
    physicalGridPage:50}, map:{permutationSize:order.length,
    firstOriginalOffsets:order.slice(0,16),
    exactRoundtrip:order.every((id, i) => inverse[id] === i)},
    ordinaryWraps:ordinary, facingSpreads:{pairs:pairs.length,
    AB:{equal:natural[0], total:natural[2]},
    BA:{equal:natural[1], total:natural[3]}},
    visuallyMirroredTreePages:{pairs:trees,
    AB:{equal:illustrated[0], total:illustrated[2]},
    BA:{equal:illustrated[1], total:illustrated[3]}},
    plant:{AB:plant[0],BA:plant[1]},
    conditionalNull:matchedRightPageNull(source,pairs,originalGlyphs,TRIALS),
    interpretation:"No support for one globally repeat-suppressed " +
      "line-interleaved facing-spread ciphertext stream. This does not " +
      "exclude arbitrary position-dependent or rekeyed ciphers."};
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = {parseSource,spreadOrder,invertOrder,spreads,
  transitions,ordinaryLineWraps,matchedRightPageNull};
