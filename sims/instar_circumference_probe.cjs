"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const quadgramText = fs.readFileSync(
  path.join(ROOT, "resources", "control", "duko_round27_english_quadgrams.txt"), "utf8");
const quadgrams = new Map();
for (const line of quadgramText.trim().split(/\r?\n/u)) {
  const match = line.trim().match(/^([A-Z]{4})\s+(\d+)$/u);
  if (match) quadgrams.set(match[1], Number(match[2]));
}

const parsed = parseSharedCorpus();
assert.equal(parsed.runeCount, 12956, "original unsolved rune count");
assert.equal(parsed.words.length, 2896, "canonical continuous word count");
assert.equal(parsed.crossPageWords, 32, "cross-page word count");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeWords = parsed.words.map((word) => [...word.runes].map((rune) => {
  const index = runeIndex.get(rune);
  assert(Number.isInteger(index), "unknown rune " + rune);
  return index;
}));

// Literal circumference removal: discard both endpoint runes of every
// canonical word. A one- or two-rune word has no interior.
const interiors = runeWords.map((word) => word.length > 2 ? word.slice(1, -1) : []);

const keyText = "DIUINITY"; // GP orthography: V is represented by U.
const key = [...keyText].map((letter) => corpus.translit.indexOf(letter));
assert(key.every((index) => index >= 0), "DIVINITY key must map to GP");
assert.deepEqual(key, [23, 10, 1, 10, 9, 10, 16, 26]);

function runeText(word) {
  return word.map((index) => corpus.translit[index]).join("");
}

function scoreStrings(words) {
  let sum = 0;
  let grams = 0;
  let unknown = 0;
  for (const word of words) {
    for (let i = 0; i + 4 <= word.length; i++) {
      const count = quadgrams.get(word.slice(i, i + 4)) || 0;
      if (!count) unknown++;
      sum += Math.log(count + 0.01);
      grams++;
    }
  }
  return {
    meanLogCount: grams ? sum / grams : null,
    grams,
    unknown,
    coverage: grams ? (grams - unknown) / grams : null
  };
}

function scoreIndices(words) {
  return scoreStrings(words.map(runeText));
}

function applyVigenere(words, options) {
  let globalStep = options.phase;
  return words.map((word) => {
    let localStep = options.phase;
    return word.map((symbol) => {
      const step = options.resetPerWord ? localStep++ : globalStep++;
      const shift = key[step % key.length];
      return (symbol + options.sign * shift + 290) % 29;
    });
  });
}

function indexOfCoincidence(words) {
  const counts = Array(29).fill(0);
  let n = 0;
  for (const word of words) for (const symbol of word) {
    counts[symbol]++;
    n++;
  }
  return {
    n,
    ioc: n > 1
      ? counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1))
      : null
  };
}

function doubletRate(words) {
  let pairs = 0;
  let doublets = 0;
  for (const word of words) {
    for (let i = 1; i < word.length; i++) {
      pairs++;
      if (word[i] === word[i - 1]) doublets++;
    }
  }
  return {pairs, doublets, rate: pairs ? doublets / pairs : null};
}

const configs = [];
for (const resetPerWord of [false, true]) {
  for (const sign of [-1, 1]) {
    for (let phase = 0; phase < key.length; phase++) {
      const decoded = applyVigenere(interiors, {resetPerWord, sign, phase});
      configs.push({
        resetPerWord, sign, phase,
        ...scoreIndices(decoded)
      });
    }
  }
}
configs.sort((a, b) => b.meanLogCount - a.meanLogCount);

const p56Control = [
  "AN", "END", "WITHIN", "THE", "DEEP", "WEB", "THERE", "EXISTS",
  "A", "PAGE", "THAT", "HASHES", "TO", "IT", "IT", "IS", "THE",
  "DUTY", "OF", "EUERY", "PILGRIM", "TO", "SEEC", "OUT", "THIS", "PAGE"
];
const p57Control = [
  "PARABLE", "LIKE", "THE", "INSTAR", "TUNNELING", "TO", "THE",
  "SURFACE", "WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES",
  "FIND", "THE", "DIVINITY", "WITHIN", "AND", "EMERGE"
];

// Source-bounded p57 circumference / paired-ring gate.
const fullTranscript = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
const fullParsed = parseLP2Words(fullTranscript, 58);
const pageFragments = fullTranscript.split("%");
const pageWordGlyphs = (pageIndex) => (pageFragments[pageIndex].replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || []);
const p55PageWordGlyphs = pageWordGlyphs(54);
const p57PageWordGlyphs = pageWordGlyphs(56);
const p55PageWords = p55PageWordGlyphs.map((word) => [...word].map((rune) => runeIndex.get(rune)));
const p57PageWords = p57PageWordGlyphs.map((word) => [...word].map((rune) => runeIndex.get(rune)));
const p57BodyWords = p57PageWords.slice(1);
const p57First7Words = p57BodyWords.slice(0, 7);
const p55CompleteWords = fullParsed.byStartPage[54];
const p55IncomingCrossPageWords = fullParsed.words.filter((word) => word.startPage === 53 && word.endPage === 54);
const p55Flat = p55PageWords.flat();
const p57BodyFlat = p57BodyWords.flat();
const boundaryLength = (word) => word.length === 1 ? 1 : 2;
const interiorLength = (word) => Math.max(0, word.length - 2);
const p55BoundaryCount = p55PageWords.reduce((sum, word) => sum + boundaryLength(word), 0);
const p57BoundaryCount = p57BodyWords.reduce((sum, word) => sum + boundaryLength(word), 0);
const p57First7BoundaryCount = p57First7Words.reduce((sum, word) => sum + boundaryLength(word), 0);
const p57InteriorCount = p57BodyWords.reduce((sum, word) => sum + interiorLength(word), 0);
const ringSizes = (side) => {
  const sizes = [];
  for (let width = side; width >= 1; width -= 2) sizes.push(width === 1 ? 1 : 4 * width - 4);
  return sizes;
};
const pairedRingSizes = [...ringSizes(7), ...ringSizes(5)];

const squareRows = fs.readFileSync(path.join(ROOT, "resources/cicada2014-openpuff-magic-squares.txt"), "utf8")
  .trim().split(/\r?\n/u).filter((line) => line.trim()).map((line) => line.trim().split(/\s+/u).map(Number));
assert.equal(squareRows.length, 17);
const square7 = squareRows.slice(5, 12);
const square5 = squareRows.slice(12, 17);
assert.equal(square7[0].reduce((sum, value) => sum + value, 0), 1033);
assert.equal(square5[0].reduce((sum, value) => sum + value, 0), 1033);
const isPrimeForNumber = (n) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p += 1) if (n % p === 0) return false;
  return true;
};
const reverseDecimal = (n) => Number(String(n).split("").reverse().join(""));
const distinctPrimeFactors = (n) => {
  const factors = [];
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) {
    if (rest % p === 0) {
      factors.push(p);
      while (rest % p === 0) rest /= p;
    }
  }
  if (rest > 1) factors.push(rest);
  return factors;
};
const historicalNumber = (n) => {
  if (isPrimeForNumber(n)) {
    const reversed = reverseDecimal(n);
    if (isPrimeForNumber(reversed)) return { plus: true, factors: [] };
    return { plus: false, factors: distinctPrimeFactors(reversed) };
  }
  return { plus: false, factors: distinctPrimeFactors(n) };
};
const summarizeNumberSquare = (matrix) => {
  const cells = matrix.flat().map((value, index) => ({ index, value, ...historicalNumber(value) }));
  const active = cells.filter((cell) => !cell.plus);
  return {
    cellCount: cells.length,
    plusCount: cells.filter((cell) => cell.plus).length,
    activeCount: active.length,
    factorTokenCount: active.reduce((sum, cell) => sum + cell.factors.length, 0),
    activeCells: active
  };
};
const number7 = summarizeNumberSquare(square7);
const number5 = summarizeNumberSquare(square5);
const endpointPairs = p57BodyWords.map((word) => [corpus.prime[word[0]], corpus.prime[word[word.length - 1]]].sort((a, b) => a - b));
const sameNumbers = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);
const endpointFactorMatches = endpointPairs.map((pair, wordIndex) => ({
  wordIndex,
  pair,
  cells: number5.activeCells.filter((cell) => sameNumbers(pair, cell.factors.slice().sort((a, b) => a - b))).map((cell) => cell.value)
}));
const exactEndpointFactorMatchCount = endpointFactorMatches.filter((match) => match.cells.length > 0).length;
const unmappedFiveFactors = [...new Set(number5.activeCells.flatMap((cell) => cell.factors).filter((factor) => !corpus.prime.includes(factor)))].sort((a, b) => a - b);

const gibranRaw = fs.readFileSync(path.join(ROOT, "resources/control/gibran_prophet_58585.txt"), "utf8").replace(/^\uFEFF/u, "");
const gibranStartMarker = "*** START OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***";
const gibranEndMarker = "*** END OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***";
const gibranStart = gibranRaw.indexOf(gibranStartMarker);
const gibranEnd = gibranRaw.indexOf(gibranEndMarker);
assert.ok(gibranStart >= 0 && gibranEnd > gibranStart);
const gibranBody = gibranRaw.slice(gibranStart + gibranStartMarker.length, gibranEnd);
const controlTranslitMap = new Map(corpus.translit.map((token, index) => [token, index]));
function encodeControlEnglishWord(word) {
  const normalized = word.toUpperCase().replace(/QU/gu, "CW").replace(/V/gu, "U").replace(/K/gu, "C").replace(/Z/gu, "S");
  const encoded = [];
  for (let i = 0; i < normalized.length;) {
    const digraph = normalized.slice(i, i + 2);
    if (controlTranslitMap.has(digraph)) {
      encoded.push(controlTranslitMap.get(digraph));
      i += 2;
    } else if (controlTranslitMap.has(normalized[i])) {
      encoded.push(controlTranslitMap.get(normalized[i]));
      i += 1;
    } else {
      i += 1;
    }
  }
  return encoded;
}
const gibranRunes = (gibranBody.toUpperCase().match(/[A-Z]+/gu) || []).flatMap(encodeControlEnglishWord);
const native76Iocs = [];
for (let i = 0; i + 76 <= gibranRunes.length; i += 1) native76Iocs.push(indexOfCoincidence([gibranRunes.slice(i, i + 76)]).ioc);
native76Iocs.sort((a, b) => a - b);
const p55Ioc = indexOfCoincidence(p55PageWords).ioc;

assert.equal(p55PageWords.length, 17);
assert.equal(p55Flat.length, 76);
assert.equal(p55PageWords[0].length, 1);
assert.equal(p55CompleteWords.length, 16);
assert.equal(p55IncomingCrossPageWords.length, 1);
assert.equal(p55IncomingCrossPageWords[0].runes.length, 11);
assert.ok(p55IncomingCrossPageWords[0].runes.endsWith(p55PageWordGlyphs[0]));
assert.equal(p55CompleteWords.filter((word) => word.runes.length === 2).length, 5);
assert.equal(p55CompleteWords.filter((word) => word.runes.length >= 3).length, 11);
assert.equal(p55BoundaryCount, 33);
assert.equal(p55Flat.length - p55BoundaryCount, 43);
assert.equal(p57PageWords.length, 20);
assert.equal(fullParsed.byContainedPage[56].length, 20);
assert.equal(p57BodyWords.length, 19);
assert.equal(p57BodyFlat.length, 88);
assert.equal(p57First7Words.length, 7);
assert.equal(p57First7BoundaryCount, 14);
assert.equal(p57BodyFlat.length - p57First7BoundaryCount, 74);
assert.equal(p57BoundaryCount, 38);
assert.equal(p57InteriorCount, 50);
assert.deepEqual(pairedRingSizes, [24, 16, 8, 1, 16, 8, 1]);
assert.equal(pairedRingSizes.reduce((sum, size) => sum + size, 0), 74);
assert.equal(number7.activeCount, 41);
assert.equal(number7.plusCount, 8);
assert.equal(number7.factorTokenCount, 84);
assert.equal(number5.activeCount, 19);
assert.equal(number5.plusCount, 6);
assert.equal(number5.factorTokenCount, 44);
assert.equal(number5.factorTokenCount + number5.plusCount, p57InteriorCount);
assert.equal(exactEndpointFactorMatchCount, 1);
assert.ok(unmappedFiveFactors.includes(113));
assert.equal(native76Iocs.length, 47959);
assert.ok(p55Ioc < native76Iocs[0]);

const sourceLockedWordGate = {
  p57: {
    bodyWords: p57BodyWords.length,
    bodyRunes: p57BodyFlat.length,
    firstSentenceWords: p57First7Words.length,
    first7BoundaryRunes: p57First7BoundaryCount,
    runesRemainingAfterFirst7Boundary: p57BodyFlat.length - p57First7BoundaryCount,
    allWordBoundaryRunes: p57BoundaryCount,
    allWordInteriorRunes: p57InteriorCount,
    wordLengths: p57BodyWords.map((word) => word.length)
  },
  pairedSquares: {
    ringSizes: pairedRingSizes,
    ringCount: pairedRingSizes.length,
    cellCount: pairedRingSizes.reduce((sum, size) => sum + size, 0),
    sevenBySeven: { active: number7.activeCount, plus: number7.plusCount, factorTokens: number7.factorTokenCount },
    fiveByFive: { active: number5.activeCount, plus: number5.plusCount, factorTokens: number5.factorTokenCount },
    fiveByFiveFactorTokensPlusMarkers: number5.factorTokenCount + number5.plusCount,
    exactEndpointFactorMatchCount,
    endpointFactorMatches,
    unmappedFiveFactors
  },
  p55: {
    pageLocalSegments: p55PageWords.length,
    pageLocalSegmentLengths: p55PageWords.map((word) => word.length),
    leadingOneRuneContinuationFragment: true,
    incomingCrossPageWordLength: p55IncomingCrossPageWords[0].runes.length,
    completeWordsStartingOnPage: p55CompleteWords.length,
    standaloneSingletonWords: 0,
    twoRuneCompleteWords: p55CompleteWords.filter((word) => word.runes.length === 2).length,
    longerCompleteWords: p55CompleteWords.filter((word) => word.runes.length >= 3).length,
    runes: p55Flat.length,
    boundaryRunes: p55BoundaryCount,
    interiorRunes: p55Flat.length - p55BoundaryCount,
    ioc: p55Ioc,
    native76Windows: native76Iocs.length,
    native76MinimumIoc: native76Iocs[0],
    permutationOnlyGate: p55Ioc < native76Iocs[0]
  },
  conclusion: "The split is reversible but not a cipher. The p55 leading page segment continues a word from the previous page. Ring/count concordances do not specify word-to-ring order, orientation, endpoint state update, or a GP29 symbol-changing operation."
};



function applyCandidateKey(target, key, sign, reverse = false) {
  const stream = reverse ? [...key].reverse() : key;
  return target.map((symbol, i) => (symbol + sign * stream[i % stream.length] + 290) % 29);
}
const textBlobWordFreq = fs.readFileSync(
  path.join(ROOT, "resources", "control", "english_wordfreq_textblob.txt"), "utf8");
const charTrigrams = new Map();
const charBigramContexts = new Map();
for (const line of textBlobWordFreq.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word, countText] = line.split(/\s+/u);
  const weight = Number(countText);
  const upper = word.toUpperCase();
  for (let i = 0; i + 2 < upper.length; i++) {
    const trigram = upper.slice(i, i + 3);
    const bigram = upper.slice(i, i + 2);
    charTrigrams.set(trigram, (charTrigrams.get(trigram) || 0) + weight);
    charBigramContexts.set(bigram, (charBigramContexts.get(bigram) || 0) + weight);
  }
}
function charTrigramScore(indices) {
  const letters = runeText(indices).replace(/[^A-Z]/gu, "");
  let total = 0, count = 0;
  for (let i = 0; i + 2 < letters.length; i++) {
    const bigram = letters.slice(i, i + 2), trigram = letters.slice(i, i + 3);
    total += Math.log(((charTrigrams.get(trigram) || 0) + 0.1) /
      ((charBigramContexts.get(bigram) || 0) + 2.6));
    count++;
  }
  return count ? total / count : null;
}

// Cross-page p57 -> p55 circumference/key tests.
const p54PageWords = pageWordGlyphs(53).map((word) => [...word].map((rune) => runeIndex.get(rune)));
const p54Heading = p54PageWords[0];
const p54BlackBody = p54PageWords.slice(1).flat();
const p54p55Body = [...p54BlackBody, ...p55Flat];
const allUnknownRunes = corpus.pages.filter((page) => page.page <= 55).flatMap((page) => page.indices);
assert.equal(p54Heading.length, 9);
assert.equal(p54BlackBody.length, 223);
assert.equal(p55Flat.length, 76);
assert.equal(p54p55Body.length, 299);
assert.deepEqual(allUnknownRunes.slice(-299), p54p55Body);

const p57Heading = p57PageWords[0];
const p57FirstEdges = p57BodyWords.map((word) => word[0]);
const p57LastEdges = p57BodyWords.map((word) => word[word.length - 1]);
const p57PeelFirst = [...p57Heading, ...p57BodyWords.flatMap((word) => word.slice(1))];
const p57PeelLast = [...p57Heading, ...p57BodyWords.flatMap((word) => word.slice(0, -1))];
const p57BoundaryInterleaved = p57BodyWords.flatMap((word) => [word[0], word[word.length - 1]]);
const p57BoundaryGlobal = [...p57FirstEdges, ...p57LastEdges.slice().reverse()];
assert.equal(p57BodyWords.length, 19);
assert.equal(p57BodyFlat.length, 88);
assert.equal(p57PeelFirst.length, 76);
assert.equal(p57PeelLast.length, 76);
assert.equal(p57BoundaryInterleaved.length, 38);
assert.equal(p57BoundaryGlobal.length, 38);

const keyRepresentations = (key) => ({
  index: key,
  primeMod29: key.map((symbol) => corpus.prime[symbol] % 29),
  phiMod29: key.map((symbol) => (corpus.prime[symbol] - 1) % 29)
});
const p55PadCandidates = [];
const p55KeyInputs = {
  peelFirst76: p57PeelFirst,
  peelLast76: p57PeelLast,
  firstEdges19: p57FirstEdges,
  lastEdges19: p57LastEdges,
  interleavedBoundary38: p57BoundaryInterleaved,
  perimeterBoundary38: p57BoundaryGlobal
};
for (const [keyName, key0] of Object.entries(p55KeyInputs)) {
  const representations = key0.length === 76 ? keyRepresentations(key0) : {index: key0};
  for (const [representation, baseKey] of Object.entries(representations)) {
    for (const reverse of [false, true]) for (const sign of [-1, 1]) {
      const decoded = applyCandidateKey(p55Flat, baseKey, sign, reverse);
      const score = scoreStrings([runeText(decoded)]);
      p55PadCandidates.push({
        keyName, keyLength: baseKey.length, representation, reverse, sign,
        meanLogCount: score.meanLogCount, coverage: score.coverage,
        charTrigram: charTrigramScore(decoded), decoded: runeText(decoded)
      });
    }
  }
}
const p55PadCandidatesByQuadgram = [...p55PadCandidates].sort((a, b) => b.meanLogCount - a.meanLogCount);
const p55PadCandidatesByTrigram = [...p55PadCandidates].sort((a, b) => b.charTrigram - a.charTrigram);
const p55XorCandidates = [];
for (const [keyName, key0] of Object.entries(p55KeyInputs)) {
  const repeated = Array.from({length: 76}, (_, i) => key0[i % key0.length]);
  const decoded = p55Flat.map((symbol, i) => symbol ^ repeated[i]);
  const invalidSymbols = decoded.filter((symbol) => symbol > 28).length;
  p55XorCandidates.push({
    keyName, keyLength: key0.length, invalidSymbols,
    meanLogCount: invalidSymbols === 0 ? scoreStrings([runeText(decoded)]).meanLogCount : null,
    charTrigram: invalidSymbols === 0 ? charTrigramScore(decoded) : null
  });
}

const p57RawMarkerPathKey = [
  ...p57BodyWords[9].slice(1, -1), ...p57BodyWords[13].slice(1, -1),
  ...p57BodyWords[12].slice(1, -1), ...p57BodyWords[7].slice(1, -1)
];
const p57MinusCycleKey = [0, 6, 7, 16, 15].flatMap((i) => p57BodyWords[i].slice(1, -1));
const p57PlusCycleKey = [13, 12, 7, 17, 4].flatMap((i) => p57BodyWords[i].slice(1, -1));
const p57Conditional31Key = [...p57MinusCycleKey, ...p57PlusCycleKey];
assert.equal(runeText(p57RawMarkerPathKey), "HEINIRCUMFERENCE");
assert.equal(p57RawMarkerPathKey.length, 16);
assert.equal(runeText(p57Conditional31Key), "ICURFACITHIIUINITINIRCUMFERENCEN");
assert.equal(p57Conditional31Key.length, 31);
const p57WordSumKey = p57BodyWords.map((word) =>
  word.reduce((sum, symbol) => sum + corpus.prime[symbol], 0) % 29
);

const p54p55KeyTests = [];
for (const [keyName, key] of [
  ["rawMarkerPath16", p57RawMarkerPathKey],
  ["conditionalCycle31", p57Conditional31Key],
  ["p57WordPrimeSums19", p57WordSumKey]
]) {
  for (const reverse of [false, true]) for (const sign of [-1, 1]) {
    const target = keyName === "p57WordPrimeSums19" ? p55Flat : p54p55Body;
    const decoded = applyCandidateKey(target, key, sign, reverse);
    const score = scoreStrings([runeText(decoded)]);
    p54p55KeyTests.push({
      keyName, keyLength: key.length, targetLength: target.length, reverse, sign,
      meanLogCount: score.meanLogCount, coverage: score.coverage,
      charTrigram: charTrigramScore(decoded)
    });
  }
}
p54p55KeyTests.sort((a, b) => b.charTrigram - a.charTrigram);

const allPageArrays = corpus.pages.filter((page) => page.page <= 55).map((page) => page.indices);
const fullBookKeyTests = [];
for (const [keyName, key] of [
  ["rawMarkerPath16", p57RawMarkerPathKey],
  ["conditionalCycle31", p57Conditional31Key]
]) {
  const forms = keyName === "rawMarkerPath16" ? keyRepresentations(key) : {index: key};
  for (const [representation, baseKey] of Object.entries(forms)) {
    for (const reverse of [false, true]) for (const sign of [-1, 1]) {
      const stream = reverse ? [...baseKey].reverse() : baseKey;
      const continuous = applyCandidateKey(allUnknownRunes, stream, sign);
      const pageReset = allPageArrays.flatMap((page) => applyCandidateKey(page, stream, sign));
      fullBookKeyTests.push({
        keyName, representation, keyLength: baseKey.length, reverse, sign, reset: "continuous",
        charTrigram: charTrigramScore(continuous),
        meanLogCount: scoreStrings([runeText(continuous)]).meanLogCount
      });
      fullBookKeyTests.push({
        keyName, representation, keyLength: baseKey.length, reverse, sign, reset: "per-page",
        charTrigram: charTrigramScore(pageReset),
        meanLogCount: scoreStrings([runeText(pageReset)]).meanLogCount
      });
    }
  }
}
fullBookKeyTests.sort((a, b) => b.charTrigram - a.charTrigram);

// The 299 black-body runes of p54-p55 form a source-motivated 13x23 map.
const gridRows = 13, gridCols = 23;
const grid = Array.from({length: gridRows}, (_, r) => p54p55Body.slice(r * gridCols, (r + 1) * gridCols));
const gridPerimeter = [];
for (let c = 0; c < gridCols; c++) gridPerimeter.push(grid[0][c]);
for (let r = 1; r < gridRows; r++) gridPerimeter.push(grid[r][gridCols - 1]);
for (let c = gridCols - 2; c >= 0; c--) gridPerimeter.push(grid[gridRows - 1][c]);
for (let r = gridRows - 2; r >= 1; r--) gridPerimeter.push(grid[r][0]);
const gridInterior = [];
for (let r = 1; r < gridRows - 1; r++) for (let c = 1; c < gridCols - 1; c++) gridInterior.push(grid[r][c]);
const gridCore = grid[6].slice(6, 17);
const gridRings = [];
for (let k = 0; k < 6; k++) {
  const r0 = k, c0 = k, r1 = gridRows - 1 - k, c1 = gridCols - 1 - k;
  const ring = [];
  for (let c = c0; c <= c1; c++) ring.push(grid[r0][c]);
  for (let r = r0 + 1; r <= r1; r++) ring.push(grid[r][c1]);
  for (let c = c1 - 1; c >= c0; c--) ring.push(grid[r1][c]);
  for (let r = r1 - 1; r > r0; r--) ring.push(grid[r][c0]);
  gridRings.push(ring);
}
const gridPerimeterPrimeSum = gridPerimeter.reduce((sum, symbol) => sum + corpus.prime[symbol], 0);
const perimeterOffsets = [];
for (let c = 0; c < gridCols; c++) perimeterOffsets.push(c);
for (let r = 1; r < gridRows; r++) perimeterOffsets.push(r * gridCols + gridCols - 1);
for (let c = gridCols - 2; c >= 0; c--) perimeterOffsets.push((gridRows - 1) * gridCols + c);
for (let r = gridRows - 2; r >= 1; r--) perimeterOffsets.push(r * gridCols);
let matchingPerimeterWindows = 0;
for (let start = 0; start + gridRows * gridCols <= allUnknownRunes.length; start++) {
  const sum = perimeterOffsets.reduce((total, offset) =>
    total + corpus.prime[allUnknownRunes[start + offset]], 0);
  if (sum === gridPerimeterPrimeSum) matchingPerimeterWindows++;
}
const gridKeyTests = [];
for (const [keyName, key, target] of [
  ["perimeter68", gridPerimeter, gridInterior],
  ["centerCore11", gridCore, gridRings.slice().reverse().flat()]
]) {
  for (const reverse of [false, true]) for (const sign of [-1, 1]) {
    const decoded = applyCandidateKey(target, key, sign, reverse);
    gridKeyTests.push({
      keyName, keyLength: key.length, targetLength: target.length, reverse, sign,
      meanLogCount: scoreStrings([runeText(decoded)]).meanLogCount,
      charTrigram: charTrigramScore(decoded)
    });
  }
}
gridKeyTests.sort((a, b) => b.charTrigram - a.charTrigram);

const crossPageKeyGate = {
  p57ToP55: {
    bodyWords: p57BodyWords.length, bodyRunes: p57BodyFlat.length,
    headingRunes: p57Heading.length, p55Runes: p55Flat.length,
    peelFirstRunes: p57PeelFirst.length, peelLastRunes: p57PeelLast.length,
    boundaryKeyRunes: p57BoundaryInterleaved.length, firstEdgeKeyRunes: p57FirstEdges.length,
    keyTexts: {
      peelFirst: runeText(p57PeelFirst), peelLast: runeText(p57PeelLast),
      interleavedBoundary: runeText(p57BoundaryInterleaved), globalBoundary: runeText(p57BoundaryGlobal)
    },
    rawP55Quadgram: scoreStrings([runeText(p55Flat)]),
    rawP55CharTrigram: charTrigramScore(p55Flat),
    p57PlaintextCharTrigram: charTrigramScore(p57PageWords.flat()),
    bestPadCandidatesByTrigram: p55PadCandidatesByTrigram.slice(0, 8).map(({decoded, ...entry}) => entry),
    bestPadCandidatesByQuadgram: p55PadCandidatesByQuadgram.slice(0, 5).map(({decoded, ...entry}) => entry),
    xorCandidates: p55XorCandidates
  },
  p57MapKeys: {
    rawMarkerPath16: runeText(p57RawMarkerPathKey),
    conditionalCycle31: runeText(p57Conditional31Key),
    wordPrimeSumKey19: runeText(p57WordSumKey),
    p54p55Best: p54p55KeyTests.slice(0, 8),
    fullBookBest: fullBookKeyTests.slice(0, 8)
  },
  p54p55Grid: {
    p54HeadingRunes: p54Heading.length, p54BlackBodyRunes: p54BlackBody.length,
    p55Runes: p55Flat.length, bodyRunes: p54p55Body.length,
    dimensions: [gridRows, gridCols], perimeterRunes: gridPerimeter.length,
    interiorDimensions: [gridRows - 2, gridCols - 2], interiorRunes: gridInterior.length,
    centerCoreRunes: gridCore.length, centerCore: runeText(gridCore),
    bodyIoC: indexOfCoincidence([p54p55Body]).ioc,
    perimeterIoC: indexOfCoincidence([gridPerimeter]).ioc,
    interiorIoC: indexOfCoincidence([gridInterior]).ioc,
    perimeterPrimeSum: gridPerimeterPrimeSum, equals58Squared: gridPerimeterPrimeSum === 58 * 58,
    matching299WindowCount: matchingPerimeterWindows,
    total299Windows: allUnknownRunes.length - 299 + 1,
    bestKeyTests: gridKeyTests.slice(0, 8)
  },
  decision: "The source-bounded 76-rune p57 peel, 38/19-rune boundary keys, raw-marker 16-rune key, conditional 31-rune key, p57 word-prime-sum key, and 13x23 p54-p55 circumference map do not yield reproducible GP29 plaintext under the tested direct additive, prime/phi, or XOR consumers. Retain the count relationships as hypotheses, not as keys or decryptions."
};

const result = {
  interpretation: "remove the first and last rune of every original word; optionally decrypt each interior with repeating GP-DIUINITY",
  source: {
    runeCount: parsed.runeCount,
    wordCount: parsed.words.length,
    crossPageWords: parsed.crossPageWords,
    interiorRuneCount: interiors.reduce((sum, word) => sum + word.length, 0),
    key: keyText,
    configurations: configs.length
  },
  structural: {
    originalIoC: indexOfCoincidence(runeWords),
    interiorIoC: indexOfCoincidence(interiors),
    originalDoublets: doubletRate(runeWords),
    interiorDoublets: doubletRate(interiors)
  },
  language: {
    original: scoreIndices(runeWords),
    interiorWithoutKey: scoreIndices(interiors),
    bestDIVINITY: configs[0],
    p56CleartextControl: scoreStrings(p56Control),
    p57CleartextControl: scoreStrings(p57Control)
  },
  sourceLockedWordGate,
  crossPageKeyGate,
  allConfigurations: configs
};

console.log(JSON.stringify(result, null, 2));
