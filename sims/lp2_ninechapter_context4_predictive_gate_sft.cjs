"use strict";

/**
 * Blind fixed-nine-chapter GP29 transition-regime test.
 *
 * Model selection is performed only on six source-clear LP1 pages plus clear
 * LP2 p57. Each LP2 chapter's first half trains a local model; its untouched
 * second half is scored against both that local model and one shared model
 * trained on all nine first halves. The sole primary statistic is the maximum
 * per-rune heldout code-length gain of any of the nine local models.
 *
 * The conditional null samples page-interior Euler trails while preserving:
 * every original page's complete 29x29 ordered-bigram inventory, first/last
 * four runes, all 32 original cross-page carried words, and all page lengths.
 * Four-rune guards at the train/test split provide heldout neighboring context.
 *
 * Node.js 22+, CommonJS, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const alphabet = corpus.runes;
const runeIndex = new Map(alphabet.map((r, i) => [r, i]));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length)
  .map((p) => ({ physical: p.page, seq: p.indices }));
const source = pages.flatMap((p) => p.seq);
const pageOffsets = [];
let cursor = 0;
for (const page of pages) {
  pageOffsets.push({
    physical: page.physical,
    start: cursor,
    end: cursor + page.seq.length,
    seq: page.seq
  });
  cursor += page.seq.length;
}

const parsed = parseSharedCorpus();
const wordSpans = [];
cursor = 0;
for (const word of parsed.words) {
  const indices = Array.from(word.runes, (r) => {
    assert.ok(runeIndex.has(r), "Unknown rune in canonical word parser");
    return runeIndex.get(r);
  });
  assert.deepEqual(source.slice(cursor, cursor + word.length), indices,
    "Canonical printed-word stream does not match the original page corpus");
  wordSpans.push({
    start: cursor,
    end: cursor + word.length,
    startPage: word.startPage,
    endPage: word.endPage
  });
  cursor += word.length;
}
assert.equal(pages.length, 55);
assert.equal(source.length, 12956);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(cursor, source.length);
assert.deepEqual(pageOffsets.map((p) => p.physical),
  [...Array(50).keys(), 51, 52, 53, 54, 55]);

const chapterPageRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapters = chapterPageRanges.map(([first, last], index) => {
  const selected = pageOffsets.filter((p) =>
    p.physical >= first && p.physical <= last);
  assert.ok(selected.length > 0);
  return {
    index,
    physical: [first, last],
    start: selected[0].start,
    end: selected[selected.length - 1].end,
    length: selected.reduce((sum, p) => sum + p.end - p.start, 0)
  };
});
assert.deepEqual(chapters.map((c) => c.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

function closestWordBoundary(start, end) {
  const midpoint = (start + end) / 2;
  let best = null;
  let distance = Infinity;
  for (const word of wordSpans) {
    if (word.end <= start || word.end >= end) continue;
    const d = Math.abs(word.end - midpoint);
    if (d < distance) {
      distance = d;
      best = word.end;
    }
  }
  assert.notEqual(best, null, "No printed-word split found inside chapter");
  return best;
}
for (const chapter of chapters)
  chapter.split = closestWordBoundary(chapter.start, chapter.end);
assert.deepEqual(chapters.map((c) => c.split - c.start),
  [364, 569, 864, 955, 509, 716, 838, 1504, 156]);

/** Build a hierarchical interpolated GP29 n-gram model. */
function newModel(depth, alpha) {
  return {
    depth,
    alpha,
    unigram: new Float64Array(29),
    total: 0,
    maps: Array.from({ length: depth + 1 }, () => new Map())
  };
}

/**
 * Add target positions in [start,end). Context is causal and resets at the
 * beginning of each supplied sequence; positions excluded from training may
 * still supply observed neighboring context.
 */
function addRange(model, seq, start, end) {
  for (let i = Math.max(start, model.depth); i < end; i++) {
    const y = seq[i];
    model.unigram[y]++;
    model.total++;
    let key = 0;
    for (let k = 1; k <= model.depth; k++) {
      key = key * 29 + seq[i - k];
      let node = model.maps[k].get(key);
      if (!node) {
        node = { counts: new Float64Array(29), total: 0 };
        model.maps[k].set(key, node);
      }
      node.counts[y]++;
      node.total++;
    }
  }
}

function buildModel(depth, alpha, ranges) {
  const model = newModel(depth, alpha);
  for (const range of ranges)
    addRange(model, range.seq, range.start, range.end);
  return model;
}

/** Return heldout prequential code length in bits. */
function scoreRange(model, seq, start, end) {
  let bits = 0;
  let count = 0;
  for (let i = Math.max(start, model.depth); i < end; i++) {
    const y = seq[i];
    let probability = (model.unigram[y] + 0.5) / (model.total + 14.5);
    let key = 0;
    for (let k = 1; k <= model.depth; k++) {
      key = key * 29 + seq[i - k];
      const node = model.maps[k].get(key);
      if (node) {
        probability = (node.counts[y] + model.alpha * probability) /
          (node.total + model.alpha);
      }
    }
    bits -= Math.log2(probability);
    count++;
  }
  return { bits, count, bitsPerRune: bits / count };
}

// Hyperparameters are frozen from authentic clear GP29 controls only.
const lp1Raw = fs.readFileSync(
  path.join(ROOT, "resources", "transcriptions", "lp1_wulfic_canonical.txt"),
  "utf8");
const lp1Pages = lp1Raw.split("%").map((part) =>
  Array.from(part, (r) => runeIndex.get(r)).filter((r) => r !== undefined));
const clearLP1PageNumbers = [3, 8, 9, 10, 11, 14];
const controlPages = clearLP1PageNumbers.map((p) => lp1Pages[p])
  .concat([corpus.pages[57].indices]);
assert.deepEqual(controlPages.map((p) => p.length),
  [157, 187, 207, 192, 169, 89, 95]);
const p3Sample = controlPages[0].slice(0, 30)
  .map((i) => corpus.translit[i]).join("");
assert.ok(p3Sample.startsWith("SOMEWISDOMTHEPRIMESARESACRED"));
assert.equal(corpus.pages[57].status, "solved");

const alphaGrid = [0.1, 0.3, 1, 3, 10, 29, 58, 116];
const calibration = [];
for (let depth = 1; depth <= 4; depth++) {
  for (const alpha of alphaGrid) {
    let bits = 0;
    let count = 0;
    for (let heldout = 0; heldout < controlPages.length; heldout++) {
      const training = controlPages
        .filter((_, index) => index !== heldout)
        .map((seq) => ({ seq, start: depth, end: seq.length }));
      const model = buildModel(depth, alpha, training);
      const scored = scoreRange(model, controlPages[heldout],
        depth, controlPages[heldout].length);
      bits += scored.bits;
      count += scored.count;
    }
    calibration.push({
      depth, alpha, bits, count, bitsPerRune: bits / count
    });
  }
}
calibration.sort((a, b) => a.bitsPerRune - b.bitsPerRune);
const chosen = calibration[0];
assert.equal(chosen.depth, 4);
assert.equal(chosen.alpha, 10);
assert.ok(Math.abs(chosen.bitsPerRune - 3.5991482281339127) < 1e-10);

const depth = chosen.depth;
const alpha = chosen.alpha;
const guard = depth;

/**
 * Shared model: all nine first halves.
 * Local model: one chapter's first half.
 * Test: that chapter's untouched second half, after a depth-sized guard.
 */
function chapterStatistic(tape) {
  const chapterSequences = chapters.map((c) => tape.slice(c.start, c.end));
  const trainingRanges = chapterSequences.map((seq, i) => ({
    seq,
    start: guard,
    end: chapters[i].split - chapters[i].start - guard
  }));
  const sharedModel = buildModel(depth, alpha, trainingRanges);
  const results = chapterSequences.map((seq, i) => {
    const split = chapters[i].split - chapters[i].start;
    const localModel = buildModel(depth, alpha, [trainingRanges[i]]);
    const testStart = split + guard;
    const shared = scoreRange(sharedModel, seq, testStart, seq.length);
    const local = scoreRange(localModel, seq, testStart, seq.length);
    return {
      chapter: i + 1,
      physicalPages: chapters[i].physical,
      trainRunes: localModel.total,
      testRunes: shared.count,
      sharedBitsPerRune: shared.bitsPerRune,
      localBitsPerRune: local.bitsPerRune,
      gainBitsPerRune: shared.bitsPerRune - local.bitsPerRune,
      gainBits: shared.bits - local.bits
    };
  });
  return {
    results,
    maxGainBitsPerRune: Math.max(...results.map((r) => r.gainBitsPerRune)),
    sumPositiveGainBits: results.reduce((sum, r) =>
      sum + Math.max(0, r.gainBits), 0)
  };
}

function graph(symbols) {
  const outgoing = Array.from({ length: 29 }, () => []);
  for (let i = 1; i < symbols.length; i++)
    outgoing[symbols[i - 1]].push(symbols[i]);
  return {
    symbols,
    outgoing,
    root: symbols[symbols.length - 1]
  };
}

function xorshift32(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Uniform labeled-edge Euler trail via a random rooted last-exit
 * arborescence (directed cycle-popping), then shuffled outgoing edges.
 */
function randomEulerTrail(input, random) {
  const { symbols, outgoing, root } = input;
  const randomIndex = (size) => Math.floor(random() * size);
  const lastTreeEdge = new Int16Array(29).fill(-1);

  for (let state = 0; state < 29; state++) {
    if (state !== root && outgoing[state].length)
      lastTreeEdge[state] = randomIndex(outgoing[state].length);
  }

  let finished = false;
  let iterations = 0;
  while (!finished) {
    finished = true;
    iterations++;
    assert.ok(iterations <= 100000, "Cycle-popping failed to terminate");
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

  const edgeCursor = new Uint16Array(29);
  const result = [symbols[0]];
  let current = symbols[0];
  for (let index = 1; index < symbols.length; index++) {
    const edge = shuffled[current][edgeCursor[current]++];
    assert.ok(edge, "Euler trail ended before consuming all edges");
    current = edge.next;
    result.push(current);
  }
  assert.equal(current, root);
  for (let vertex = 0; vertex < 29; vertex++)
    assert.equal(edgeCursor[vertex], shuffled[vertex].length);
  return result;
}

function edgeCounts(symbols) {
  const counts = new Int32Array(29 * 29);
  for (let i = 1; i < symbols.length; i++)
    counts[symbols[i - 1] * 29 + symbols[i]]++;
  return counts;
}

function sameArray(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++)
    if (a[i] !== b[i]) return false;
  return true;
}

// Freeze full carried-word fragments and four-rune contexts at both ends of
// every physical page. Randomize only the single contiguous interior segment.
const carryWords = wordSpans.filter((w) => w.startPage !== w.endPage);
const pagePlans = pageOffsets.map((page) => {
  let carryInEnd = page.start;
  let carryOutStart = page.end;
  for (const word of carryWords) {
    if (word.start < page.start && word.end > page.start)
      carryInEnd = Math.max(carryInEnd, Math.min(page.end, word.end));
    if (word.start < page.end && word.end > page.end)
      carryOutStart = Math.min(carryOutStart,
        Math.max(page.start, word.start));
  }
  const pageLength = page.end - page.start;
  const prefixLength = Math.min(pageLength,
    Math.max(depth, carryInEnd - page.start));
  const rawSuffixStart = Math.min(pageLength - depth,
    carryOutStart - page.start);
  const suffixStart = Math.max(prefixLength, rawSuffixStart);
  const interior = page.seq.slice(prefixLength, suffixStart);
  return {
    physical: page.physical,
    prefixLength,
    suffixStart,
    interior,
    interiorGraph: interior.length > 1 ? graph(interior) : null
  };
});
const frozenBoundaryRunes = pagePlans.reduce((sum, plan, index) =>
  sum + plan.prefixLength +
  (pages[index].seq.length - plan.suffixStart), 0);
const randomizedInteriorRunes = source.length - frozenBoundaryRunes;

function sampleBook(random, verify) {
  const result = [];
  for (let index = 0; index < pagePlans.length; index++) {
    const plan = pagePlans[index];
    const originalPage = pages[index].seq;
    const interior = plan.interiorGraph
      ? randomEulerTrail(plan.interiorGraph, random)
      : plan.interior;
    const candidatePage = originalPage.slice(0, plan.prefixLength)
      .concat(interior, originalPage.slice(plan.suffixStart));
    assert.equal(candidatePage.length, originalPage.length);
    if (verify) {
      assert.deepEqual(edgeCounts(candidatePage), edgeCounts(originalPage),
        "Page bigram inventory changed on physical page " + plan.physical);
      assert.deepEqual(candidatePage.slice(0, depth),
        originalPage.slice(0, depth));
      assert.deepEqual(candidatePage.slice(-depth),
        originalPage.slice(-depth));
    }
    result.push(...candidatePage);
  }
  assert.equal(result.length, source.length);
  if (verify) {
    for (const word of carryWords)
      assert.deepEqual(result.slice(word.start, word.end),
        source.slice(word.start, word.end),
        "A source-original carried word changed");
  }
  return result;
}

const original = chapterStatistic(source);
assert.equal(original.results.length, 9);
assert.ok(Math.abs(original.maxGainBitsPerRune -
  0.018943503686468688) < 1e-10);
assert.equal(original.results.filter((r) => r.gainBitsPerRune > 0).length, 1);

const trialCount = 1000;
const seed = 0x3c6ef372;
const random = xorshift32(seed);
const nullMaxima = [];
let upperTailHits = 0;
for (let trial = 0; trial < trialCount; trial++) {
  const candidate = sampleBook(random, trial === 0);
  const statistic = chapterStatistic(candidate);
  nullMaxima.push(statistic.maxGainBitsPerRune);
  if (statistic.maxGainBitsPerRune >= original.maxGainBitsPerRune)
    upperTailHits++;
}
nullMaxima.sort((a, b) => a - b);
const nullMean = nullMaxima.reduce((sum, value) => sum + value, 0) /
  trialCount;
const nullSd = Math.sqrt(nullMaxima.reduce((sum, value) =>
  sum + (value - nullMean) ** 2, 0) / trialCount);
const quantile = (p) => nullMaxima[Math.floor(p * (trialCount - 1))];
const nullSummary = {
  trials: trialCount,
  seed: "0x3c6ef372",
  mean: nullMean,
  sd: nullSd,
  minimum: nullMaxima[0],
  median: quantile(0.5),
  q90: quantile(0.9),
  q95: quantile(0.95),
  q99: quantile(0.99),
  maximum: nullMaxima[trialCount - 1],
  upperTailHits,
  plusOneUpperTail: (upperTailHits + 1) / (trialCount + 1)
};
assert.equal(upperTailHits, 627);
assert.ok(Math.abs(nullSummary.mean - 0.05218246538416103) < 1e-10);

// Positive control: one distinct additive GP29 shift per original chapter.
// Shared control: the same additive shift in every chapter.
const nativeTapeSource = controlPages.flat();
const nativeTape = Array.from({ length: source.length }, (_, i) =>
  nativeTapeSource[i % nativeTapeSource.length]);
const chapterResetPlant = nativeTape.slice();
for (let i = 0; i < chapters.length; i++) {
  const shift = (i * 3 + 7) % 29;
  for (let j = chapters[i].start; j < chapters[i].end; j++)
    chapterResetPlant[j] = (chapterResetPlant[j] + shift) % 29;
}
const sharedShiftPlant = nativeTape.map((value) => (value + 7) % 29);
const chapterResetPositive = chapterStatistic(chapterResetPlant);
const sharedCipherControl = chapterStatistic(sharedShiftPlant);
assert.ok(chapterResetPositive.maxGainBitsPerRune > 0.5);
assert.ok(sharedCipherControl.maxGainBitsPerRune < -0.5);

const output = {
  source: {
    runeCount: source.length,
    printedWords: parsed.words.length,
    crossPageCarriedWords: parsed.crossPageWords,
    pageCount: pages.length,
    pageRuneLengths: pages.map((p) => p.seq.length),
    chapterPhysicalPages: chapters.map((c) => c.physical),
    chapterRuneLengths: chapters.map((c) => c.length),
    chapterWordBoundarySplits: chapters.map((c) => c.split - c.start)
  },
  nativeControlCalibration: {
    controlPages: [
      "LP1 p3", "LP1 p8", "LP1 p9", "LP1 p10", "LP1 p11", "LP1 p14",
      "LP2 p57"
    ],
    controlRuneLengths: controlPages.map((p) => p.length),
    candidateCount: calibration.length,
    selected: chosen,
    nextBest: calibration.slice(1, 5)
  },
  model: {
    type: "hierarchical interpolated GP29 context model",
    maximumContextRunes: depth,
    priorMassPerContext: alpha,
    heldoutNeighborGuard: guard,
    training: "first half of each source-marked chapter",
    test: "untouched second half of each source-marked chapter",
    primaryStatistic: "maximum over nine chapters of shared-minus-local heldout bits per rune"
  },
  original,
  conditionalNull: {
    preserved: [
      "all 55 original page-specific 29x29 ordered-bigram inventories",
      "first and last four runes of every rune-bearing page",
      "all 32 complete cross-page carried words",
      "all page lengths and original word-slot offsets"
    ],
    frozenBoundaryRunes,
    randomizedInteriorRunes,
    ...nullSummary
  },
  positiveControls: {
    distinctChapterCaesarReset: {
      maxGainBitsPerRune: chapterResetPositive.maxGainBitsPerRune,
      chapterGains: chapterResetPositive.results.map((r) => r.gainBitsPerRune)
    },
    oneSharedCaesarShift: {
      maxGainBitsPerRune: sharedCipherControl.maxGainBitsPerRune,
      chapterGains: sharedCipherControl.results.map((r) => r.gainBitsPerRune)
    }
  }
};
console.log(JSON.stringify(output, null, 2));
console.log("PASS: source alignment, control calibration, nine-chapter holdout, " +
  "1000 exact-page-bigram/carry-preserving nulls, and positive controls");
