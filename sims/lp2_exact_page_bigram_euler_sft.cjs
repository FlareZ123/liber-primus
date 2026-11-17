"use strict";

/**
 * Exact, source-conditioned original LP2 fifth-back test.
 *
 * Samples a uniformly random directed Euler trail on each physical page,
 * preserving its first and last rune and ALL its 29x29 ordered bigram counts.
 * Uses cycle-popping to sample a random rooted last-exit arborescence, then
 * independently shuffles all outgoing edges with its final tree edge last.
 * Each labeled-edge Euler trail has exactly one such last-exit tree, so the
 * resulting trials are uniform over labeled-edge trails. Parallel equal
 * endpoint edges induce the same constant multiplicity for every rune trail.
 *
 * Windows 11, Node.js 22+, CommonJS; no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const source = pages.flatMap((p) => p.indices);
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const parsed = parseSharedCorpus();
const spans = [];
let cursor = 0;

for (const word of parsed.words) {
  const indices = Array.from(word.runes, (rune) => {
    assert.ok(runeIndex.has(rune));
    return runeIndex.get(rune);
  });
  assert.deepEqual(source.slice(cursor, cursor + word.length), indices,
    `Mismatch at original printed word ${spans.length + 1}`);
  spans.push([cursor, cursor + word.length]);
  cursor += word.length;
}
assert.equal(pages.length, 55);
assert.equal(source.length, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(cursor, source.length);

/**
 * Score all 2,105 source-original in-word fifth-back opportunities.
 * @param {ArrayLike<number>} array
 * @returns {[number,number,number]}
 */
function score(array) {
  let same = 0;
  let sEcho = 0;
  let paired = 0;
  for (const [start, end] of spans) {
    for (let i = start + 5; i < end; i++) {
      if (array[i] === array[i - 5]) {
        same++;
        if (array[i] === 15) sEcho++;
        if (i > start + 5 && array[i - 1] === array[i - 6])
          paired++;
      }
    }
  }
  return [same, sEcho, paired];
}

/**
 * Build the authentic per-page directed multigraph. Different equal-valued
 * source edges are labeled separately for correct arborescence weighting.
 * @param {number[]} symbols
 * @returns {{ symbols:number[], outgoing:number[][], root:number }}
 */
function graph(symbols) {
  const outgoing = Array.from({length: 29}, () => []);
  for (let i = 1; i < symbols.length; i++)
    outgoing[symbols[i - 1]].push(symbols[i]);
  return { symbols, outgoing, root: symbols[symbols.length - 1] };
}

const graphs = pages.map((page) => graph(page.indices));

/**
 * Reproducible xorshift32, returning doubles in [0,1).
 * @param {number} seed
 * @returns {() => number}
 */
function generator(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Uniformly sample one Euler trail with exactly the original edge multiset.
 * Directed cycle popping produces a uniform rooted last-exit arborescence.
 * The last outgoing edge of each nonroot vertex is the chosen tree edge.
 * @param {{symbols:number[],outgoing:number[][],root:number}} input
 * @param {() => number} random
 * @returns {number[]}
 */
function randomEulerTrail(input, random) {
  const { symbols, outgoing, root } = input;
  const randomIndex = (size) => Math.floor(random() * size);
  const lastTreeEdge = new Int16Array(29).fill(-1);

  for (let state = 0; state < 29; state++) {
    if (state !== root && outgoing[state].length)
      lastTreeEdge[state] = randomIndex(outgoing[state].length);
  }

  // Standard directed cycle-popping: resample every chosen edge on any
  // directed cycle, until all chosen vertices reach the terminal root.
  // Each resampling uses a fresh uniform outgoing labeled edge.
  let finished = false;
  while (!finished) {
    finished = true;
    for (let vertex = 0; vertex < 29 && finished; vertex++) {
      if (vertex === root || !outgoing[vertex].length) continue;
      const positions = new Int16Array(29).fill(-1);
      const chain = [];
      let state = vertex;

      while (state !== root && positions[state] === -1) {
        assert.ok(lastTreeEdge[state] >= 0);
        positions[state] = chain.length;
        chain.push(state);
        state = outgoing[state][lastTreeEdge[state]];
      }
      if (state !== root) {
        finished = false;
        for (const cycleVertex of chain.slice(positions[state]))
          lastTreeEdge[cycleVertex] =
            randomIndex(outgoing[cycleVertex].length);
      }
    }
  }

  const shuffled = outgoing.map((destinations, vertex) => {
    const edges = destinations.map((next, label) => ({ next, label }));
    for (let k = edges.length - 1; k > 0; k--) {
      const other = randomIndex(k + 1);
      [edges[k], edges[other]] = [edges[other], edges[k]];
    }
    if (vertex !== root && lastTreeEdge[vertex] >= 0) {
      const treePosition = edges.findIndex((edge) =>
        edge.label === lastTreeEdge[vertex]);
      assert.ok(treePosition >= 0);
      edges.push(edges.splice(treePosition, 1)[0]);
    }
    return edges;
  });

  const cursor = new Uint16Array(29);
  const result = [symbols[0]];
  let current = symbols[0];
  for (let index = 1; index < symbols.length; index++) {
    const edge = shuffled[current][cursor[current]++];
    assert.ok(edge, `Trail ended early at index ${index}`);
    current = edge.next;
    result.push(current);
  }
  assert.equal(current, root);
  for (let vertex = 0; vertex < 29; vertex++)
    assert.equal(cursor[vertex], shuffled[vertex].length);
  return result;
}

/**
 * Preserve exact observed bigram matrices for a source-page control,
 * especially exact anti-adjacent repeats and empirical page endpoints.
 * @param {number[]} first
 * @param {number[]} second
 * @returns {void}
 */
function verifyEdges(first, second) {
  assert.equal(first.length, second.length);
  assert.equal(first[0], second[0]);
  assert.equal(first[first.length - 1], second[second.length - 1]);
  const counts = new Int16Array(29 * 29);
  for (let i = 1; i < first.length; i++) {
    counts[first[i - 1] * 29 + first[i]]++;
    counts[second[i - 1] * 29 + second[i]]--;
  }
  assert.ok(counts.every((value) => value === 0));
}

const observed = score(source);
assert.deepEqual(observed, [104, 11, 9]);

/**
 * Count distance-five equalities independently of printed word boundaries.
 * This retains the original physical-page order, including five-position
 * windows passing across page turns, identically in observed and null books.
 * @param {ArrayLike<number>} tape
 * @returns {number}
 */
function wholeStreamFifthBack(tape) {
  let matches = 0;
  for (let position = 5; position < tape.length; position++)
    if (tape[position] === tape[position - 5]) matches++;
  return matches;
}

const totalFifthBackSlots = source.length - 5;
const withinWordSlots = spans.reduce((sum, [start, end]) =>
  sum + Math.max(0, end - start - 5), 0);
const insideFraction = withinWordSlots / totalFifthBackSlots;
const originalWholeStream = wholeStreamFifthBack(source);
const originalOutsideWords = originalWholeStream - observed[0];
const originalLocalization = observed[0] - insideFraction * originalWholeStream;
assert.equal(withinWordSlots, 2105);
assert.equal(originalWholeStream, 479);
assert.equal(originalOutsideWords, 375);

// Page-safe sensitivity excludes all fifth-back windows that straddle a
// physical page break, including the number-only p50 hiatus.
const pageWindowIndices = [];
let pageOffset = 0;
for (const page of pages) {
  for (let j = pageOffset + 5; j < pageOffset + page.indices.length; j++)
    pageWindowIndices.push(j);
  pageOffset += page.indices.length;
}
const wordWindowMask = new Uint8Array(source.length);
for (const [start, end] of spans)
  for (let j = start + 5; j < end; j++) wordWindowMask[j] = 1;
/** @param {ArrayLike<number>} tape */
function pageSafeFifthBack(tape) {
  let total = 0;
  let inside = 0;
  for (const index of pageWindowIndices) {
    if (tape[index] === tape[index - 5]) {
      total++;
      inside += wordWindowMask[index];
    }
  }
  return [total, inside];
}
const originalPageSafe = pageSafeFifthBack(source);
const pageSafeInsideSlots = pageWindowIndices.reduce((n, i) =>
  n + wordWindowMask[i], 0);
const pageSafeFraction = pageSafeInsideSlots / pageWindowIndices.length;
const pageSafeConcentration = originalPageSafe[1] -
  pageSafeFraction * originalPageSafe[0];


const random = generator(0x510e527f);
const simulationCount = 10000;
const sums = [0, 0, 0];
const squaredSums = [0, 0, 0];
const upper = [0, 0, 0];
const maxima = [0, 0, 0];
const localization = {
  total: {sum: 0, squares: 0, upper: 0, min: Infinity, max: -Infinity},
  outside: {sum: 0, squares: 0, upper: 0, min: Infinity, max: -Infinity},
  concentration: {sum: 0, squares: 0, upper: 0, min: Infinity, max: -Infinity},
  pageSafeTotal: {sum: 0, squares: 0, upper: 0, min: Infinity, max: -Infinity},
  pageSafeOutside: {sum: 0, squares: 0, upper: 0, min: Infinity, max: -Infinity},
  pageSafeConcentration: {sum: 0, squares: 0, upper: 0, min: Infinity, max: -Infinity}
};

/** @param {keyof typeof localization} kind @param {number} value @param {number} threshold */
function recordLocalization(kind, value, threshold) {
  const part = localization[kind];
  part.sum += value;
  part.squares += value * value;
  if (value >= threshold) part.upper++;
  part.min = Math.min(part.min, value);
  part.max = Math.max(part.max, value);
}


for (let trial = 0; trial < simulationCount; trial++) {
  const candidate = [];
  for (let page = 0; page < graphs.length; page++) {
    const sample = randomEulerTrail(graphs[page], random);
    // Every source-page transition count is verified independently on the
    // first trial, before any statistics are accumulated.
    if (trial === 0) verifyEdges(graphs[page].symbols, sample);
    candidate.push(...sample);
  }
  assert.equal(candidate.length, 12956);
  const result = score(candidate);
  const total = wholeStreamFifthBack(candidate);
  recordLocalization("total", total, originalWholeStream);
  recordLocalization("outside", total - result[0], originalOutsideWords);
  recordLocalization("concentration", result[0] - insideFraction * total,
    originalLocalization);
  const [safeTotal, safeInside] = pageSafeFifthBack(candidate);
  recordLocalization("pageSafeTotal", safeTotal, originalPageSafe[0]);
  recordLocalization("pageSafeOutside", safeTotal - safeInside,
    originalPageSafe[0] - originalPageSafe[1]);
  recordLocalization("pageSafeConcentration", safeInside - pageSafeFraction * safeTotal,
    pageSafeConcentration);
  for (let j = 0; j < 3; j++) {
    sums[j] += result[j];
    squaredSums[j] += result[j] * result[j];
    if (result[j] >= observed[j]) upper[j]++;
    if (result[j] > maxima[j]) maxima[j] = result[j];
  }
}

const means = sums.map((sum) => sum / simulationCount);
console.log(JSON.stringify({
  source: {
    pages: pages.length,
    runes: source.length,
    printedWords: spans.length,
    carriedWords: parsed.crossPageWords,
    fifthBackSlots: spans.reduce((sum, [start, end]) =>
      sum + Math.max(0, end - start - 5), 0),
    observed
  },
  model: "uniform original-page Euler trails; all ordered bigrams exact",
  seed: "0x510e527f",
  simulations: simulationCount,
  means,
  sd: squaredSums.map((sum, j) =>
    Math.sqrt(sum / simulationCount - means[j] * means[j])),
  upperTailHits: upper,
  upperTailPlusOne: upper.map((count) =>
    (count + 1) / (simulationCount + 1)),
  maxima,
  wordWindowLocalization: {
    observedAll: originalWholeStream,
    observedInside: observed[0],
    observedOutside: originalOutsideWords,
    allSlots: totalFifthBackSlots,
    insideSlots: withinWordSlots,
    originalConcentration: originalLocalization,
    pageSafe: {
      totalSlots: pageWindowIndices.length,
      insideSlots: pageSafeInsideSlots,
      observedAll: originalPageSafe[0],
      observedInside: originalPageSafe[1],
      observedOutside: originalPageSafe[0] - originalPageSafe[1],
      observedConcentration: pageSafeConcentration
    },
    exactPageBigramConditional: Object.fromEntries(
      Object.entries(localization).map(([kind, v]) => {
        const mean = v.sum / simulationCount;
        return [kind, {
          mean,
          sd: Math.sqrt(v.squares / simulationCount - mean * mean),
          minimum: v.min,
          maximum: v.max,
          upperTailHits: v.upper,
          upperTailPlusOne: (v.upper + 1) / (simulationCount + 1)
        }];
      }))
  }
}, null, 2));
console.log("PASS: 10000 complete exact-bigram 55-page Euler randomizations");
