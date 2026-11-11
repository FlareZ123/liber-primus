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
const p55PageWords = fullParsed.byContainedPage[54].map((word) => word.runeIndices);
const p57PageWords = fullParsed.byContainedPage[56].map((word) => word.runeIndices);
const p57BodyWords = p57PageWords.slice(1);
const p57First7Words = p57BodyWords.slice(0, 7);
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
assert.equal(p55BoundaryCount, 33);
assert.equal(p55Flat.length - p55BoundaryCount, 43);
assert.equal(p57PageWords.length, 20);
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
    words: p55PageWords.length,
    wordLengths: p55PageWords.map((word) => word.length),
    singletonWords: p55PageWords.filter((word) => word.length === 1).length,
    twoRuneWords: p55PageWords.filter((word) => word.length === 2).length,
    runes: p55Flat.length,
    boundaryRunes: p55BoundaryCount,
    interiorRunes: p55Flat.length - p55BoundaryCount,
    ioc: p55Ioc,
    native76Windows: native76Iocs.length,
    native76MinimumIoc: native76Iocs[0],
    permutationOnlyGate: p55Ioc < native76Iocs[0]
  },
  conclusion: "The split is reversible but not a cipher. Ring/count concordances do not specify word-to-ring order, orientation, endpoint state update, or a GP29 symbol-changing operation."
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
  allConfigurations: configs
};

console.log(JSON.stringify(result, null, 2));
