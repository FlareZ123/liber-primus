"use strict";

/**
 * Red-ink word-shell sums as indices into Cicada's verified 2016 signed words.
 * CJS Node22, Windows-friendly, read-only, no external dependencies.
 * All source inputs original scans' canonical derived rune and ink annotations.
 * Builds and corrects the complete 58-physical-page / 57-rune-page mapping.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(load("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = load("resources/liber-primus/lp2-transcription.txt");
const signed = load("resources/historical/cicada2016-4gq25-outguess.asc");
const message = signed.match(/Hello\.[\s\S]*?Good luck\./i);
assert.ok(message, "Exact signed 2016 textual body");
const signedWords = message[0].split(/Good luck\./i)[0].match(/[A-Za-z]+/g).map((word) => word.toUpperCase());
assert.deepEqual(
  signedWords.slice(17, 23),
  ["THE", "MAP", "THEIR", "MEANING", "IS", "THE"],
);
assert.equal(signedWords[1], signedWords[22]);
const glyph = new Map(corpus.runes.map((rune, index) => [rune, index]));
let transcriptPage = 0;
let offset = 0;
let current = [];
let positions = [];
const words = [];

/**
 * @param {string|null} following Literal - . & or $ after the printed word.
 * Slashes, newlines, and numeric-only page 50 are never word breaks.
 */
function flush(following) {
  if (current.length === 0) return;
  words.push({ values: current, first: positions[0], last: positions.at(-1), following });
  current = [];
  positions = [];
}

for (const ch of transcription) {
  const rune = glyph.get(ch);
  if (rune !== undefined) {
    current.push(rune);
    positions.push({
      physicalPage: transcriptPage < 50 ? transcriptPage : transcriptPage + 1,
      offset,
    });
    offset += 1;
  } else if (ch === "%") {
    transcriptPage += 1;
    offset = 0;
  } else if ("-.$&".includes(ch)) {
    flush(ch);
  }
}
flush(null);
const flattened = words.flatMap((word) => word.values);
assert.equal(transcriptPage, 56);
assert.equal(words.length, 2941);
assert.deepEqual(flattened, corpus.pages.flatMap((page) => page.indices));
assert.equal(flattened.length, 13136);
assert.equal(ink.counts.red, 225);
assert.equal(ink.counts.red13, 30);

/**
 * For each pair outside inward, H(a,b)=(a-b,a+b) mod29.
 * The sum of a complete pair equals 2a mod29; odd word centers are untouched.
 * @param {number[]} values Original GP29 word glyphs
 */
function hSum(values) {
  let result = 0;
  for (let j = 0; j < Math.floor(values.length / 2); j += 1) {
    const a = values[j];
    const b = values[values.length - 1 - j];
    result += (a - b + 29) % 29;
    result += (a + b) % 29;
  }
  if (values.length % 2 === 1) result += values[Math.floor(values.length / 2)];
  return result % 29;
}
const spans = ink.pages.flatMap((page) => (page.red_spans || []).map((red) => {
  const selected = words.filter((word) =>
    word.first.physicalPage === page.page
    && word.last.physicalPage === page.page
    && word.first.offset >= red.start
    && word.last.offset < red.start + red.length);
  const flat = selected.flatMap((word) => word.values);
  const original = corpus.pages[page.page].indices.slice(red.start, red.start + red.length);
  assert.deepEqual(flat, original, "Every annotated red span covers exact whole words");
  assert.equal(flat.length, red.length);
  return {
    page: page.page,
    start: red.start,
    length: red.length,
    words: selected.map((word) => ({ values: word.values, following: word.following })),
  };
}));
assert.equal(spans.length, 18);
assert.equal(spans.slice(0, 16).reduce((total, span) => total + span.length, 0), 213);
function at(page, start) {
  const s = spans.find((span) => span.page === page && span.start === start);
  assert.ok(s);
  return s;
}
const p0 = at(0, 0);
const p7 = at(7, 194);
const p8 = at(8, 0);
const p56 = at(56, 0);
assert.deepEqual(p7.words.map((w) => w.values.length), [2, 4, 3, 2, 3]);
assert.equal(p7.words[1].following, ".", "Source-printed full stop selects the first red two-word clause");
assert.deepEqual(p8.words.map((w) => w.values.length), [4, 8]);
assert.deepEqual(p56.words.map((w) => w.values.length), [2, 3]);
const vector = (span) => span.words.map((word) => hSum(word.values));
assert.deepEqual(vector(p0), [1, 13]);
assert.deepEqual(vector(p7), [17, 18, 17, 28, 11]);
assert.deepEqual(vector(p8), [19, 20]);
assert.deepEqual(vector(p56), [21, 1]);
assert.deepEqual(signedWords.slice(17, 23), [
  signedWords[17], signedWords[18],
  signedWords[19], signedWords[20],
  signedWords[21], signedWords[1],
]);
console.log(JSON.stringify({
  source: "original LP2 red whole words; signed 2016 word order; page50 original numeric only",
  sourcePage7: { page: 7, start: 194, redWords: vector(p7), firstClause: vector(p7).slice(0, 2) },
  sourcePage8: { page: 8, start: 0, redWords: vector(p8) },
  solvedPage56: { page: 56, start: 0, redWords: vector(p56) },
  recoveredLexicalIndexSequence: [17, 18, 19, 20, 21, 1],
  authenticatedWordPositions: [17, 18, 19, 20, 21, 22],
  authenticatedWords: signedWords.slice(17, 23),
  exactNumericPrefix: "17,18,19,20,21",
  finalIndexNote: "H residue1 denotes THE, which aliases signed position22",
}));

// All 29×29 possible ordered checksum pairs are mapped to EVERY 2016
// signed-source adjacent lexical pair, including repeated THE and THEIR.
const hits = Array.from({ length: 29 * 29 }, () => []);
for (let a = 0; a < 29; a += 1) {
  for (let b = 0; b < 29; b += 1) {
    for (let j = 0; j + 1 < signedWords.length; j += 1) {
      if (signedWords[a] === signedWords[j] && signedWords[b] === signedWords[j + 1]) {
        hits[29 * a + b].push(j);
      }
    }
  }
}
const neighbors = [];
for (let i = 0; i < spans.length; i += 1) {
  for (let j = 0; j < spans.length; j += 1) {
    if (spans[j].page === spans[i].page + 1 && spans[i].words.length >= 2 && spans[j].words.length >= 2) {
      neighbors.push([i, j]);
    }
  }
}
assert.deepEqual(neighbors.map(([i, j]) => [spans[i].page, spans[j].page]), [[6, 7], [7, 8], [53, 54]]);

// Keep source red words' exact rune multisets, page/offsets, word lengths,
// group identities and signed source unchanged in all shuffled controls.
let rng = 0x33012016;
/** @returns {number} Deterministic non-crypto unsigned xorshift32 state. */
function random32() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
function sampleSum(word, shuffle) {
  const values = word.values.slice();
  if (shuffle) {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = random32() % (i + 1);
      [values[i], values[j]] = [values[j], values[i]];
    }
  }
  return hSum(values);
}
function score(shuffle) {
  const values = spans.map((span) => span.words.map((word) => sampleSum(word, shuffle)));
  const pairs = values.map((v) => v.slice(0, -1).map((a, j) => hits[29 * a + v[j + 1]]));
  let matchingPairs = 0;
  let longestChain = 0;
  let hasNeighborSourceFour = false;
  let hasNeighborConsecutiveFour = false;
  let prior = Array(signedWords.length).fill(0);
  for (let i = 0; i < pairs.length; i += 1) {
    const next = prior.slice();
    for (const positions of pairs[i]) {
      if (positions.length) matchingPairs += 1;
      for (const position of positions) {
        const current = 1 + (position >= 2 ? prior[position - 2] : 0);
        if (current > next[position]) next[position] = current;
        if (current > longestChain) longestChain = current;
      }
    }
    prior = next;
  }
  for (const [left, right] of neighbors) {
    for (let i = 0; i < pairs[left].length; i += 1) {
      for (let j = 0; j < pairs[right].length; j += 1) {
        if (!hasNeighborSourceFour && pairs[left][i].some((pos) => pairs[right][j].includes(pos + 2))) {
          hasNeighborSourceFour = true;
        }
        const first = values[left][i];
        if (!hasNeighborConsecutiveFour
          && values[left][i + 1] === (first + 1) % 29
          && values[right][j] === (first + 2) % 29
          && values[right][j + 1] === (first + 3) % 29) {
          hasNeighborConsecutiveFour = true;
        }
      }
    }
  }
  return { matchingPairs, longestChain, hasNeighborSourceFour, hasNeighborConsecutiveFour };
}
const original = score(false);
assert.deepEqual(original, {
  matchingPairs: 6,
  longestChain: 3,
  hasNeighborSourceFour: true,
  hasNeighborConsecutiveFour: true,
});

// Exact fixed-four-word null, not a Monte Carlo estimate.
// Under a uniform shuffle, every choice of left-half positions has
// equal probability, even where a rune appears more than once.
function exactEvenHistogram(values) {
  assert.equal(values.length % 2, 0);
  const n = values.length, m = n / 2;
  const counts = Array(29).fill(0);
  let total = 0;
  function choose(from, selected, sum) {
    if (selected === m) {
      counts[(2 * sum) % 29] += 1;
      total += 1;
      return;
    }
    for (let i = from; i <= n - (m - selected); i += 1) {
      choose(i + 1, selected + 1, sum + values[i]);
    }
  }
  choose(0, 0, 0);
  return { counts, total };
}
const fixed = [p7.words[0], p7.words[1], p8.words[0], p8.words[1]].map((w) => exactEvenHistogram(w.values));
assert.deepEqual(fixed.map((x) => x.total), [2, 6, 6, 70]);
const denominator = fixed.reduce((p, x) => p * x.total, 1);
const particular = [17, 18, 19, 20].reduce((p, v, i) => p * fixed[i].counts[v], 1);
let anyNumeric = 0;
for (let a = 0; a < 29; a += 1) {
  let ways = 1;
  for (let j = 0; j < 4; j += 1) ways *= fixed[j].counts[(a + j) % 29];
  anyNumeric += ways;
}
assert.equal(denominator, 5040);
assert.equal(particular, 8);
assert.equal(anyNumeric, 16);

const TRIALS = 100000;
const result = {
  matchedAtLeastSix: 0,
  chainAtLeastThree: 0,
  chainAtLeastFour: 0,
  neighborSourceFour: 0,
  neighborNumericFour: 0,
  neighborSourceAndThree: 0,
  neighborNumericAndThree: 0,
};
for (let trial = 0; trial < TRIALS; trial += 1) {
  const x = score(true);
  if (x.matchingPairs >= original.matchingPairs) result.matchedAtLeastSix += 1;
  if (x.longestChain >= 3) result.chainAtLeastThree += 1;
  if (x.longestChain >= 4) result.chainAtLeastFour += 1;
  if (x.hasNeighborSourceFour) result.neighborSourceFour += 1;
  if (x.hasNeighborConsecutiveFour) result.neighborNumericFour += 1;
  if (x.hasNeighborSourceFour && x.longestChain >= 3) result.neighborSourceAndThree += 1;
  if (x.hasNeighborConsecutiveFour && x.longestChain >= 3) result.neighborNumericAndThree += 1;
}
assert.deepEqual(result, {
  matchedAtLeastSix: 33736,
  chainAtLeastThree: 676,
  chainAtLeastFour: 13,
  neighborSourceFour: 3235,
  neighborNumericFour: 338,
  neighborSourceAndThree: 94,
  neighborNumericAndThree: 62,
});
console.log(JSON.stringify({
  sourceWordCount: words.length,
  redSpans: spans.length,
  redAdjacentWordPairs: spans.reduce((s, span) => s + span.words.length - 1, 0),
  original,
  exactFixedFourWordShuffle: {
    originalFourIndices: [17, 18, 19, 20],
    originalSequenceCount: particular,
    anyConsecutiveSequenceCount: anyNumeric,
    possibleEquallyWeightedSubsetSelections: denominator,
    probabilityFixedSequence: particular / denominator,
    probabilityAnyNumericSequence: anyNumeric / denominator,
  },
  control: {
    shuffles: TRIALS,
    seed: "0x33012016",
    fixedSourceText: "verified signed 2016 word register",
    fixedSources: "18 original red ink spans; exact rune multiset per word; all red locations",
    result,
  },
}));



// The red-only original data select signed positions 17..22, so the signed
// continuation fixes position23 = ROAD independently of the first black word.
// Source p56 red/black boundary is determined by the existing ink annotation.
const p56All = words.filter((word) => word.first.physicalPage === 56);
assert.equal(p56All[2].first.offset, 5);
assert.equal(p56All[2].last.offset, 9);
assert.deepEqual(p56All[2].values, [19, 26, 20, 3, 8]);
assert.equal(signedWords[23], "ROAD");
const blackFirst = hSum(p56All[2].values);
assert.equal(blackFirst, 23);
assert.deepEqual([...vector(p56), blackFirst].map((i) => signedWords[i]), ["IS", "THE", "ROAD"]);

// Independently note, without using it as a selector, the original unknown
// p55's final complete ciphertext word (at page-local offsets73..75).
const p55Final = words.filter((word) => word.last.physicalPage === 55).at(-1);
assert.equal(p55Final.first.offset, 73);
assert.equal(p55Final.last.offset, 75);
assert.deepEqual(p55Final.values, [17, 18, 10]);
assert.equal(hSum(p55Final.values), 23);

/**
 * Uniform-shuffle checksum histogram for one odd-length original word.
 * Choose the left half by rune positions, then the untouched center.
 * @param {number[]} values Exact original rune multiset.
 */
function exactOddHistogram(values) {
  assert.equal(values.length % 2, 1);
  const n = values.length, m = (n - 1) / 2;
  const counts = Array(29).fill(0);
  let total = 0;
  function choose(from, selected, sum, used) {
    if (selected === m) {
      for (let center = 0; center < n; center += 1) {
        if (!used.includes(center)) {
          counts[(2 * sum + values[center]) % 29] += 1;
          total += 1;
        }
      }
      return;
    }
    for (let i = from; i <= n - (m - selected); i += 1) {
      choose(i + 1, selected + 1, sum + values[i], [...used, i]);
    }
  }
  choose(0, 0, 0, []);
  return { counts, total };
}
const titleHead = exactEvenHistogram(p56.words[0].values);
const titleEnd = exactOddHistogram(p56.words[1].values);
const blackWord = exactOddHistogram(p56All[2].values);
const p55Last = exactOddHistogram(p55Final.values);
assert.deepEqual(
  [titleHead.total, titleEnd.total, blackWord.total, p55Last.total],
  [2, 6, 30, 6]
);
assert.deepEqual(
  [titleHead.counts[21], titleEnd.counts[1], blackWord.counts[23], p55Last.counts[23]],
  [1, 2, 3, 1]
);
const sevenTargetCount = particular * titleHead.counts[21] * titleEnd.counts[1] * blackWord.counts[23];
const sevenTotal = denominator * titleHead.total * titleEnd.total * blackWord.total;
assert.equal(sevenTargetCount, 48);
assert.equal(sevenTotal, 1814400);
assert.equal(sevenTargetCount / sevenTotal, 2.6455026455026453e-5);
console.log(JSON.stringify({
  sourceSelectedContinuation: {
    signedWords17To23: signedWords.slice(17, 24),
    p7FirstClause: vector(p7).slice(0, 2),
    p8OriginalRed: vector(p8),
    p56OriginalRedThenBlack: [...vector(p56), blackFirst],
    p56BlackWordLocation: "physical p56 rune offsets5..9, first black word AFTER the red AN END heading",
    p56DecodedPlaintextControl: "The authenticated different p56 totient cipher decrypts this black word as WITHIN",
    extraSourceLocation: "original p55 final ciphertext word offsets73..75",
    p55LastWordHChecksum: hSum(p55Final.values),
    sixRedChecksumPlusBlackWordIndices: [17, 18, 19, 20, 21, 1, 23],
    signedIndices: [17, 18, 19, 20, 21, 22, 23],
    lexicalMatch: signedWords.slice(17, 24).join(" "),
    numericIndexAliasCaveat: "GP field residue1 maps THE, signed position22 is the same word",
  },
  exactFixedSevenOriginalWordMultisetShuffle: {
    favorableSubsetCenterSelections: sevenTargetCount,
    totalEquallyWeightedSelections: sevenTotal,
    probability: sevenTargetCount / sevenTotal,
    selectionCaveat: "Fixed-seven-location count is exploratory, uncorrected for selection of source words and the earlier model search",
  },
}));
console.log("PASS: exact signed seven-word source readout at original red/black locations, p55 terminal echo, 100000 full-red conditional nulls, no unknown LP2 plaintext claimed.");
