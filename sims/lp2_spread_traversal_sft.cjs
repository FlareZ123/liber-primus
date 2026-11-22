"use strict";

/**
 * Source-indexed, lossless physical-page/printed-line traversal challenge.
 *
 * Two facing-page reading conventions are motivated by the manuscript's
 * alternating tree margins on physical pages 8–14. The odd/even-facing
 * pairing has ornamented inner margins on p9–10, p11–12 and p13–14. This script checks the entire original
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
function spreadOrder(source, parity = 0) {
  assert.ok(parity === 0 || parity === 1);
  /** @type {number[]} */
  const order = [];
  if (parity === 1) {
    for (const line of source.linesByPage.get(0)) order.push(...line);
  }
  for (let p = parity; p <= 54; p += 2) {
    const left = source.linesByPage.get(p) || [];
    const right = source.linesByPage.get(p + 1) || [];
    for (let k = 0; k < Math.max(left.length, right.length); k++) {
      if (left[k]) order.push(...left[k]);
      if (right[k]) order.push(...right[k]);
    }
  }
  if (parity === 1) {
    for (const line of source.linesByPage.get(55)) order.push(...line);
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
function spreads(source, parity = 0) {
  assert.ok(parity === 0 || parity === 1);
  const pairs = [];
  for (let p = parity; p <= 54; p += 2) {
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


/**
 * Eight geometrically simple alternate facing-spread conventions:
 * either page first, each page's individual lines left-to-right or mirrored.
 * Only newly introduced cross-page links are scored. All preserve an exact
 * inverse back to source coordinates; none alters the printed runes.
 * @param {PhysicalSource} source
 * @param {number[][]} pairs
 * @param {string[]} glyphs
 */
function orientedFamily(source, pairs, glyphs) {
  const modes = [];
  for (let reverseLeft = 0; reverseLeft <= 1; reverseLeft++) {
    for (let reverseRight = 0; reverseRight <= 1; reverseRight++) {
      for (let rightFirst = 0; rightFirst <= 1; rightFirst++) {
        let equal = 0, links = 0;
        for (const [a, b] of pairs) {
          const A = source.linesByPage.get(a);
          const B = source.linesByPage.get(b);
          assert.ok(A && B);
          for (let k = 0; k < Math.min(A.length, B.length); k++) {
            const first = rightFirst ? B[k] : A[k];
            const second = rightFirst ? A[k] : B[k];
            const firstReverse = rightFirst ? reverseRight : reverseLeft;
            const secondReverse = rightFirst ? reverseLeft : reverseRight;
            const end = (line, reverse) =>
              glyphs[reverse ? line[0] : line.at(-1)];
            const start = (line, reverse) =>
              glyphs[reverse ? line.at(-1) : line[0]];
            equal += Number(end(first, firstReverse) ===
              start(second, secondReverse));
            links++;
            const next = (rightFirst ? B : A)[k + 1];
            if (next) {
              equal += Number(end(second, secondReverse) ===
                start(next, firstReverse));
              links++;
            }
          }
        }
        modes.push({reverseLeft:Boolean(reverseLeft),
          reverseRight:Boolean(reverseRight),rightFirst:Boolean(rightFirst),
          equal, links});
      }
    }
  }
  return {modes, minEqual:Math.min(...modes.map(mode => mode.equal))};
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
  let sumAB = 0, sumBA = 0, sumMinimum = 0;
  let familyHits = 0;
  const observedFamily = orientedFamily(source,pairs,glyphs);
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
    const minEqual = orientedFamily(source,permuted,glyphs).minEqual;
    sumMinimum += minEqual;
    familyHits += Number(minEqual <= observedFamily.minEqual);
  }
  const lowerTail = (h, v) =>
    (1 + h.slice(0, v + 1).reduce((a, b) => a + b, 0)) / (trials + 1);
  return {matchedPageGroups:[...groups].map(([lines, ids]) =>
    ({rightPageLines:lines, pairs:ids.length})),
    AB:{observed:actual[0], links:actual[2], nullMean:sumAB/trials,
      lowerTail:lowerTail(histAB, actual[0])},
    BA:{observed:actual[1], links:actual[3], nullMean:sumBA/trials,
      lowerTail:lowerTail(histBA, actual[1])},
    eightOrientationFamily:{observedMin:observedFamily.minEqual,
      nullMeanMin:sumMinimum/trials,
      correctedLowerTail:(1+familyHits)/(trials+1)}};
}

function main() {
  const source = parseSource();
  const originalGlyphs = source.coordinates.map(c => c.glyph);
  const ordinary = ordinaryLineWraps(source, originalGlyphs);
  assert.deepEqual(ordinary, {equal:4, joins:539});

  const conventions = {};
  for (const parity of [0, 1]) {
    const order = spreadOrder(source, parity);
    const inverse = invertOrder(order, source.coordinates.length);
    assert.ok(order.every((id, j) => inverse[id] === j));
    assert.equal(new Set(order).size, 12956);
    const pairs = spreads(source, parity);
    const natural = transitions(source, pairs, originalGlyphs);

    // Synthetic detector: known distinct alternating glyphs in the candidate
    // interleaved order necessarily have zero equalities at every new link.
    const planted = Array(source.coordinates.length);
    order.forEach((originalIndex, i) => {
      planted[originalIndex] = i % 2 === 0 ? "ᚠ" : "ᚢ";
    });
    const plant = transitions(source, pairs, planted);
    assert.equal(plant[0], 0);
    assert.equal(plant[1], 0);
    const label = parity === 0 ? "evenOdd" : "oddEven";
    conventions[label] = {
      map:{permutationSize:order.length, exactRoundtrip:true,
        firstOriginalOffsets:order.slice(0,16)},
      pairs:pairs.length,
      natural:{AB:{equal:natural[0],total:natural[2]},
        BA:{equal:natural[1],total:natural[3]}},
      planted:{AB:plant[0],BA:plant[1]},
      eightOrientationScores:orientedFamily(source,pairs,originalGlyphs).modes,
      conditionalNull:matchedRightPageNull(source,pairs,originalGlyphs,TRIALS)
    };
  }
  const trees = [[9,10],[11,12],[13,14]];
  const t = transitions(source,trees,originalGlyphs);
  const result = {source:{runes:source.coordinates.length,
    runePages:source.linesByPage.size,printedLines:source.totalLines,
    physicalGridPage:50},ordinaryWraps:ordinary,
    visuallyFacingTreePages:{pairs:trees,
      AB:{equal:t[0],total:t[2]},BA:{equal:t[1],total:t[3]}},
    conventions,interpretation:
      "Neither candidate spread parity nor any simple mirrored " +
      "line traversal shows a matched original-source repeat-suppression " +
      "signal; no key or plaintext has been recovered."};
  console.log(JSON.stringify(result,null,2));
}

if (require.main === module) main();
module.exports = {parseSource,spreadOrder,invertOrder,spreads,
  transitions,orientedFamily,ordinaryLineWraps,matchedRightPageNull};
