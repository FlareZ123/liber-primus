"use strict";

/**
 * Source-only, read-only audit of the five numbered LP2 clauses enclosed by
 * two ten-dot punctuation stencils on physical pp36–38.
 * Run: node sims/lp2_five_item_79_alignment.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const rawPages = read("resources/lp2-transcription.txt").split("%").slice(0, 55);
const RUNE = /[\u16A0-\u16FF]/u;

/** @param {string} text */
function runeChars(text) {
  return [...text].filter((ch) => RUNE.test(ch));
}

function run() {
  assert.equal(rawPages.length, 55);
  const offsets = new Map();
  let total = 0;
  for (const p of corpus.pages) {
    offsets.set(p.page, total);
    total += p.indices.length;
  }
  assert.equal(total, 13136);

  const labels = [];
  const actualRunes = [];
  for (let p = 0; p < rawPages.length; p++) {
    const physical = p >= 50 ? p + 1 : p;
    const expected = corpus.pages.find((item) => item.page === physical);
    assert.ok(expected, "missing physical source page " + physical);
    const runes = runeChars(rawPages[p]);
    assert.equal(runes.join(""),
      expected.indices.map((index) => corpus.runes[index]).join(""),
      "source rune mismatch on physical p" + physical);
    actualRunes.push(...runes);
    const characters = [...rawPages[p]];
    let local = 0;
    for (let j = 0; j < characters.length; j++) {
      const ch = characters[j];
      if (RUNE.test(ch)) local++;
      else if (/^[1-5]$/u.test(ch) && characters[j + 1] === "-") {
        labels.push({number: Number(ch), physicalPage: physical,
          localRuneOffset: local,
          globalRuneOffset: offsets.get(physical) + local});
      }
    }
    assert.equal(local, expected.indices.length);
  }
  assert.equal(actualRunes.length, 12956);
  assert.deepEqual(labels.map((x) => x.number), [1, 2, 3, 4, 5]);

  const tenDots = ink.pages.flatMap((p) =>
    (p.large_punctuation || []).filter((item) => item[1] === 10)
      .map((mark) => ({physicalPage: p.page, localRuneOffset: mark[0],
        globalRuneOffset: offsets.get(p.page) + mark[0], color: mark[2]}))
  );
  assert.deepEqual(tenDots.map((p) => p.globalRuneOffset),
    [8805, 9358, 12114, 13001]);
  assert.ok(tenDots.every((mark) => mark.color === "red"));
  assert.deepEqual(labels.map((p) => p.globalRuneOffset),
    [8805, 8944, 9035, 9133, 9229]);

  const first = tenDots[0].globalRuneOffset;
  const last = tenDots[1].globalRuneOffset;
  assert.equal(labels[0].globalRuneOffset, first);
  assert.equal(last - first, 7 * 79);
  assert.equal((first - 1) % 79, 35);
  assert.equal((last - 1) % 79, 35);

  const clauses = labels.map((label, index) => ({
    number: label.number,
    physicalPage: label.physicalPage,
    localRuneOffset: label.localRuneOffset,
    globalStart: label.globalRuneOffset,
    globalEnd: labels[index + 1]?.globalRuneOffset ?? last,
    runeLength: (labels[index + 1]?.globalRuneOffset ?? last)
      - label.globalRuneOffset
  }));
  assert.deepEqual(clauses.map((c) => c.runeLength),
    [139, 91, 98, 96, 129]);

  const interval = actualRunes.slice(first, last);
  let repeatCount = 0;
  for (let i = 1; i < interval.length; i++)
    if (interval[i] === interval[i - 1]) repeatCount++;
  assert.equal(repeatCount, 1);
  const phase35SaltIndexes = Array.from({length: 8},
    (_, i) => first - 1 + i * 79);
  assert.equal(phase35SaltIndexes.at(-1), last - 1);
  const sevenPacketDoublets = Array.from({length: 7}, (_, block) => {
    let repeats = 0;
    const segment = interval.slice(block * 79, (block + 1) * 79);
    for (let i = 1; i < segment.length; i++)
      if (segment[i] === segment[i - 1]) repeats++;
    return repeats;
  });
  assert.deepEqual(sevenPacketDoublets, [0, 1, 0, 0, 0, 0, 0]);


  // Observed 79-step salt-subsequence is H UAA UAG C. UAA, UAG, UGA
  // are RNA termination codons. This biological interpretation was
  // noticed only after inspection and is exploratory.
  const indices = Uint8Array.from(actualRunes.map((rune) =>
    corpus.runes.indexOf(rune)));
  const U = corpus.translit.indexOf("U");
  const A = corpus.translit.indexOf("A");
  const G = corpus.translit.indexOf("G");
  const C = corpus.translit.indexOf("C");
  const H = corpus.translit.indexOf("H");

  /** @param {Uint8Array} values @param {number} i @param {number} stride */
  function isStop(values, i, stride) {
    return values[i] === U &&
      ((values[i + stride] === A &&
          (values[i + 2 * stride] === A || values[i + 2 * stride] === G)) ||
       (values[i + stride] === G && values[i + 2 * stride] === A));
  }

  /** @param {Uint8Array} values @param {number} stride */
  function countAdjacentStopPairs(values, stride) {
    let count = 0;
    for (let i = 0; i + 6 * stride < values.length; i++) {
      if (values[i + stride] !== U || values[i + 4 * stride] !== U)
        continue;
      if (isStop(values, i + stride, stride) &&
          isStop(values, i + 4 * stride, stride))
        count++;
    }
    return count;
  }

  const saltLetters = phase35SaltIndexes.map((i) =>
    corpus.translit[indices[i]]);
  assert.deepEqual(saltLetters, ["H", "U", "A", "A", "U", "A", "G", "C"]);
  assert.equal(indices[first - 1], H);
  assert.equal(indices[last - 1], C);
  assert.equal(countAdjacentStopPairs(indices, 79), 1);

  // Fixed original statistic: whether any of all 79 phases anywhere in
  // the manuscript yields two consecutive RNA stop codons at lag 79.
  // The codon feature itself was recognized after seeing the source,
  // so this permutation tail is conditional, not discovery-wide.
  const pageSources = corpus.pages.filter((p) =>
    p.page < 56 && p.indices.length > 0).map((p) => p.indices);
  const pageStarts = [];
  let pageStart = 0;
  for (const p of pageSources) {
    pageStarts.push(pageStart);
    pageStart += p.length;
  }
  assert.equal(pageStart, 12956);
  let rng = 0x48a79035;
  function nextInt() {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    return rng >>> 0;
  }
  const rotated = new Uint8Array(indices.length);
  let rotationsContainingStopPair = 0;
  const rotationCount = 10000;
  for (let trial = 0; trial < rotationCount; trial++) {
    for (let p = 0; p < pageSources.length; p++) {
      const source = pageSources[p];
      const offset = nextInt() % source.length;
      for (let i = 0; i < source.length; i++)
        rotated[pageStarts[p] + i] = source[(i + offset) % source.length];
    }
    if (countAdjacentStopPairs(rotated, 79) > 0)
      rotationsContainingStopPair++;
  }
  assert.equal(rotationsContainingStopPair, 3);
  const sourceStopCodonAtPhase35 = saltLetters.join("");

  const result = {
    classification: "source-observed 79-clock alignment; no recovered plaintext",
    tenDotMarks: tenDots,
    numberedClauses: clauses,
    enclosedRuneCount: last - first,
    seven79RuneIntervals: 7,
    tenDotBoundaryPhaseMod79: [first % 79, last % 79],
    glyphPrecedingBothTenDotsPhaseMod79: [35, 35],
    hypothesizedPhase35SaltIndices: phase35SaltIndexes,
    sevenBlocksWithinPacketDoublets: sevenPacketDoublets,
    totalAdjacentDoubletsInsideEnclosure: repeatCount,
    canonicalOriginalRunes: actualRunes.length,
    sourceStopCodonAtPhase35,
    doubleRNAStopPairsAnywhereInOriginalAtStride79: 1,
    pageRotationNullTrials: rotationCount,
    pageRotationNullTrialsContainingAnyPair: rotationsContainingStopPair,
    conditionalRotationTail: (rotationsContainingStopPair + 1) / (rotationCount + 1),
    caveat: "The alignment was recognized after the existing phase35 hypothesis; no cipher, key or real plaintext recovered."
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {run};
