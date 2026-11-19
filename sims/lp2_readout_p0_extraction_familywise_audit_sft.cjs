"use strict";

/**
 * Director #1707: familywise audit of the extraction families already reported
 * for the conditional READ OUT receiver p0[80..102].
 *
 * This script adds no new p0 descriptor. It charges the published word
 * descriptor, word-shell H state coverage/boundaries, radial H differences,
 * direct Roman-residue reading, mirrored word-H embedding into solved p57,
 * and the whole-block H/cube language family.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const lexicon = read("resources/control/english_wordfreq_textblob.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent */
function pow29(base, exponent) {
  let result = 1;
  let factor = mod(base);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * factor) % 29;
    factor = (factor * factor) % 29;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} page */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {{runes:number[], words:Array<{start:number,end:number,values:number[],len:number,sum:number,res:number}>}}
 */
function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    const sum = current.reduce((a, b) => a + b, 0);
    words.push({
      start,
      end: runes.length - 1,
      values: current,
      len: current.length,
      sum,
      res: sum % 29,
    });
    current = [];
  }

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = runes.length;
      const value = runeIndex.get(char);
      assert.notEqual(value, undefined);
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {runes, words};
}

/** @param {number} x @param {number} y */
function H(x, y) {
  return [mod(x - y), mod(x + y)];
}

/** @param {number} d @param {number} s */
function HInverse(d, s) {
  return [mod((d + s) * 15), mod((s - d) * 15)];
}

const dh = {p:23, g:5, a:6, b:15, A:8, B:19, K:2, e:3};
const dhValues = [dh.p, dh.g, dh.a, dh.b, dh.A, dh.B, dh.K];
const dhSet = new Set(dhValues);
const dhSum = dhValues.reduce((a, b) => a + b, 0);
assert.equal(dhSum, 78);

const romanGp = new Set([10, 14, 20, 5, 23, 19]); // I X L C D M
const highRomanGp = new Set([20, 5, 23, 19]); // L C D M

/**
 * Natural family charged around the published word-shell H readout:
 * H/H^-1, pair orientation, shell order, word order, component order,
 * and whether odd centers are retained.
 */
const wordShellVariants = [];
for (const op of ["H", "Hinv"]) {
  for (const reversePair of [false, true]) {
    for (const reverseShell of [false, true]) {
      for (const reverseWords of [false, true]) {
        for (const reverseComponents of [false, true]) {
          for (const keepCenter of [false, true]) {
            wordShellVariants.push({
              op,
              reversePair,
              reverseShell,
              reverseWords,
              reverseComponents,
              keepCenter,
            });
          }
        }
      }
    }
  }
}
assert.equal(wordShellVariants.length, 64);

/**
 * @param {Array<{values:number[],len:number}>} words
 * @param {{op:string,reversePair:boolean,reverseShell:boolean,reverseWords:boolean,reverseComponents:boolean,keepCenter:boolean}} variant
 */
function wordShellStream(words, variant) {
  const out = [];
  const orderedWords = variant.reverseWords ? [...words].reverse() : words;
  for (const word of orderedWords) {
    const pairs = [];
    for (let i = 0; i < Math.floor(word.len / 2); i += 1) {
      pairs.push([word.values[i], word.values[word.len - 1 - i]]);
    }
    if (variant.reverseShell) pairs.reverse();

    for (const pair of pairs) {
      let [x, y] = pair;
      if (variant.reversePair) [x, y] = [y, x];
      let transformed =
        variant.op === "H" ? H(x, y) : HInverse(x, y);
      if (variant.reverseComponents) transformed = transformed.reverse();
      out.push(...transformed);
    }

    if (variant.keepCenter && word.len % 2) {
      out.push(word.values[(word.len - 1) / 2]);
    }
  }
  return out;
}

/** @param {number[]} values */
function coversDh(values) {
  const set = new Set(values);
  return dhValues.every((value) => set.has(value));
}

/**
 * Relax labels inside the published word-pair descriptor while preserving its
 * role structure: (e, any DH), (state-count, OUT), (x,x with x in DH),
 * (any DH, any DH), plus the published state-sum checksum.
 *
 * @param {Array<{len:number,res:number,sum:number}>} words
 */
function relaxedWordDescriptor(words) {
  return (
    words[0].len === dh.e &&
    dhSet.has(words[0].res) &&
    words[1].len === dhValues.length &&
    words[1].res === 20 &&
    dhSet.has(words[2].len) &&
    words[2].res === words[2].len &&
    dhSet.has(words[2].res) &&
    dhSet.has(words[3].len) &&
    dhSet.has(words[3].res) &&
    words[1].sum === dhSum
  );
}

/** @param {number[]} residues */
function mirroredWordH(residues) {
  const [a, b, c, d] = residues;
  return [
    mod(a - d),
    mod(b - c),
    mod(a + d),
    mod(b + c),
  ];
}

/** @param {number[]} needle @param {number[]} haystack */
function isSubsequence(needle, haystack) {
  let index = 0;
  for (const value of haystack) {
    if (value === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
}

/** @param {string} text */
function runeWords(text) {
  return (text.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || [])
    .map((word) => [...word].map((rune) => runeIndex.get(rune)));
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Residues = runeWords(p57.source_text)
  .map((word) => word.reduce((a, b) => a + b, 0) % 29);

/** @param {number[]} values */
function chooseFour(values) {
  const out = [];
  for (let a = 0; a < values.length - 3; a += 1) {
    for (let b = a + 1; b < values.length - 2; b += 1) {
      for (let c = b + 1; c < values.length - 1; c += 1) {
        for (let d = c + 1; d < values.length; d += 1) {
          out.push([values[a], values[b], values[c], values[d]]);
        }
      }
    }
  }
  return out;
}

/**
 * Charge the post-inspection radial freedom by allowing any four of the eleven
 * radii and either left-right orientation.
 *
 * @param {number[]} runes
 * @param {number} center
 */
function radialFamily(runes, center) {
  const differences = [];
  for (let radius = 1; radius <= 11; radius += 1) {
    differences.push(mod(runes[center - radius] - runes[center + radius]));
  }

  let exactTarget = false;
  let anyFourDistinctDh = false;
  for (const tuple of chooseFour(differences)) {
    const reverse = tuple.map((value) => mod(-value));
    if (
      tuple.join(",") === "5,2,19,15" ||
      reverse.join(",") === "5,2,19,15"
    ) {
      exactTarget = true;
    }

    for (const candidate of [tuple, reverse]) {
      if (
        new Set(candidate).size === 4 &&
        candidate.every((value) => dhSet.has(value))
      ) {
        anyFourDistinctDh = true;
      }
    }
  }
  return {exactTarget, anyFourDistinctDh};
}

/** @param {string} word */
function gpWord(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((item) =>
      normalized.startsWith(item.symbol, index)
    );
    if (!token) return null;
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

// GP-length-three English control for the published whole-block H->cube LONG
// family. This deliberately asks only whether some dictionary prefix appears,
// rather than privileging LONG after seeing it.
const englishGp3 = new Set();
for (const line of lexicon.split(/\r?\n/)) {
  const [word] = line.trim().split(/\s+/);
  if (!word || !/^[A-Za-z]+$/.test(word)) continue;
  const encoded = gpWord(word);
  if (encoded && encoded.length === 3) {
    englishGp3.add(encoded.join(","));
  }
}

/**
 * Whole-block shell transform used only for the matched 23-rune language
 * family. Natural variants charge H/H^-1, pair orientation, shell order,
 * component order, cube/inverse-cube, and operation order.
 *
 * @param {number[]} values
 * @param {{op:string,reversePair:boolean,reverseShell:boolean,reverseComponents:boolean}} variant
 */
function wholeShell(values, variant) {
  const pairs = [];
  for (let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1) {
    pairs.push([values[left], values[right]]);
  }
  if (variant.reverseShell) pairs.reverse();

  const out = [];
  for (const pair of pairs) {
    let [x, y] = pair;
    if (variant.reversePair) [x, y] = [y, x];
    let transformed = variant.op === "H" ? H(x, y) : HInverse(x, y);
    if (variant.reverseComponents) transformed = transformed.reverse();
    out.push(...transformed);
  }
  if (values.length % 2) out.push(values[(values.length - 1) / 2]);
  return out;
}

const languageVariants = [];
for (const op of ["H", "Hinv"]) {
  for (const reversePair of [false, true]) {
    for (const reverseShell of [false, true]) {
      for (const reverseComponents of [false, true]) {
        for (const cubeExponent of [3, 19]) {
          for (const order of ["shellCube", "cubeShell"]) {
            languageVariants.push({
              op,
              reversePair,
              reverseShell,
              reverseComponents,
              cubeExponent,
              order,
            });
          }
        }
      }
    }
  }
}
assert.equal(languageVariants.length, 64);

/** @param {number[]} values @param {typeof languageVariants[number]} variant */
function languageTransform(values, variant) {
  if (variant.order === "shellCube") {
    return wholeShell(values, variant)
      .map((value) => pow29(value, variant.cubeExponent));
  }
  return wholeShell(
    values.map((value) => pow29(value, variant.cubeExponent)),
    variant
  );
}

const counts = {
  windows: 0,
  length23: 0,
  centerF23FourWord: 0,
  descriptorRelaxed: 0,
  hCoverageAnyVariant: 0,
  hBoundaryExactLabelsAnyVariant: 0,
  hBoundaryPermutedLabelsAnyVariant: 0,
  romanDistinctAnySix: 0,
  romanHighExactSet: 0,
  mirroredHEmbedsP57: 0,
  radialExactAnyFour: 0,
  radialDhDistinctAnyFour: 0,
};

const unionHits = new Set();
const scoreCounts = {};
const highScores = [];
let target = null;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));

  for (let index = 0; index + 3 < parsed.words.length; index += 1) {
    const words = parsed.words.slice(index, index + 4);
    const key = `${page}:${index + 1}`;
    counts.windows += 1;

    const length = words[3].end - words[0].start + 1;
    if (length === 23) counts.length23 += 1;
    const centerF =
      length === 23 &&
      parsed.runes[words[0].start + 11] === 0;
    if (centerF) counts.centerF23FourWord += 1;

    const descriptor = relaxedWordDescriptor(words);
    if (descriptor) counts.descriptorRelaxed += 1;

    let hCoverage = false;
    let hExactBoundary = false;
    let hPermutedBoundary = false;

    for (const variant of wordShellVariants) {
      const stream = wordShellStream(words, variant);
      if (!coversDh(stream)) continue;
      hCoverage = true;

      if (
        stream[0] === dh.B &&
        stream[1] === dh.p &&
        stream.at(-1) === dh.K
      ) {
        hExactBoundary = true;
      }

      if (
        dhSet.has(stream[0]) &&
        dhSet.has(stream[1]) &&
        dhSet.has(stream.at(-1)) &&
        new Set([stream[0], stream[1], stream.at(-1)]).size === 3
      ) {
        hPermutedBoundary = true;
      }
    }

    if (hCoverage) counts.hCoverageAnyVariant += 1;
    if (hExactBoundary) counts.hBoundaryExactLabelsAnyVariant += 1;
    if (hPermutedBoundary) counts.hBoundaryPermutedLabelsAnyVariant += 1;

    const residues = words.map((word) => word.res);
    const romanDistinct =
      new Set(residues).size === 4 &&
      residues.every((value) => romanGp.has(value));
    const romanHigh =
      new Set(residues).size === 4 &&
      residues.every((value) => highRomanGp.has(value));
    if (romanDistinct) counts.romanDistinctAnySix += 1;
    if (romanHigh) counts.romanHighExactSet += 1;

    const mirrored = mirroredWordH(residues);
    const p57Embedding = isSubsequence(mirrored, p57Residues);
    if (p57Embedding) counts.mirroredHEmbedsP57 += 1;

    let radialExact = false;
    let radialDh = false;
    if (length === 23) {
      const radial = radialFamily(
        parsed.runes,
        words[0].start + 11
      );
      radialExact = radial.exactTarget;
      radialDh = radial.anyFourDistinctDh;
      if (radialExact) counts.radialExactAnyFour += 1;
      if (radialDh) counts.radialDhDistinctAnyFour += 1;
    }

    // Six broad post-discovery families. Exact target labels are deliberately
    // relaxed where a label choice was made after receiver inspection.
    const broadFeatures = [
      descriptor,
      hCoverage,
      hPermutedBoundary,
      romanDistinct,
      p57Embedding,
      radialDh,
    ];
    const score = broadFeatures.filter(Boolean).length;
    scoreCounts[score] = (scoreCounts[score] || 0) + 1;

    if (score > 0) unionHits.add(key);
    if (score >= 3) {
      highScores.push({
        page,
        word: index + 1,
        start: words[0].start,
        length,
        score,
        features: broadFeatures,
      });
    }

    if (page === 0 && index === 17) {
      target = {
        page,
        word: 18,
        start: words[0].start,
        end: words[3].end,
        length,
        centerF,
        residues,
        mirrored,
        broadFeatures,
        score,
        radialExact,
      };
    }
  }
}

counts.unionAnyBroadFeature = unionHits.size;
assert.equal(counts.windows, 2763);
assert.deepEqual(counts, {
  windows: 2763,
  length23: 117,
  centerF23FourWord: 4,
  descriptorRelaxed: 1,
  hCoverageAnyVariant: 55,
  hBoundaryExactLabelsAnyVariant: 1,
  hBoundaryPermutedLabelsAnyVariant: 16,
  romanDistinctAnySix: 6,
  romanHighExactSet: 1,
  mirroredHEmbedsP57: 11,
  radialExactAnyFour: 1,
  radialDhDistinctAnyFour: 25,
  unionAnyBroadFeature: 90,
});
assert.deepEqual(scoreCounts, {
  0: 2673,
  1: 72,
  2: 15,
  3: 2,
  6: 1,
});
assert.deepEqual(target, {
  page: 0,
  word: 18,
  start: 80,
  end: 102,
  length: 23,
  centerF: true,
  residues: [19, 20, 5, 23],
  mirrored: [25, 15, 13, 25],
  broadFeatures: [true, true, true, true, true, true],
  score: 6,
  radialExact: true,
});
assert.deepEqual(
  highScores.sort((a, b) => b.score - a.score),
  [
    {
      page: 0,
      word: 18,
      start: 80,
      length: 23,
      score: 6,
      features: [true, true, true, true, true, true],
    },
    {
      page: 18,
      word: 28,
      start: 113,
      length: 16,
      score: 3,
      features: [false, true, true, false, true, false],
    },
    {
      page: 51,
      word: 15,
      start: 62,
      length: 23,
      score: 3,
      features: [false, true, true, false, false, true],
    },
  ]
);

// Charge the published LONG language family on all source-matched
// whole-word-bounded 23-rune center-F spans.
let matched23CenterF = 0;
let anyEnglishPrefix = 0;
let exactLongAnyVariant = 0;
const languageTarget = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  const starts = new Set(parsed.words.map((word) => word.start));
  const ends = new Set(parsed.words.map((word) => word.end));

  for (let start = 0; start + 22 < parsed.runes.length; start += 1) {
    const end = start + 22;
    if (
      !starts.has(start) ||
      !ends.has(end) ||
      parsed.runes[start + 11] !== 0
    ) {
      continue;
    }

    matched23CenterF += 1;
    const values = parsed.runes.slice(start, end + 1);
    let english = false;
    let exactLong = false;

    for (const variant of languageVariants) {
      const output = languageTransform(values, variant);
      const prefix = output.slice(0, 3).join(",");
      if (englishGp3.has(prefix)) english = true;
      if (prefix === "20,3,21") exactLong = true;
    }

    if (english) anyEnglishPrefix += 1;
    if (exactLong) exactLongAnyVariant += 1;
    if (page === 0 && start === 80) {
      languageTarget.push({english, exactLong});
    }
  }
}

assert.equal(matched23CenterF, 23);
assert.equal(anyEnglishPrefix, 23);
assert.equal(exactLongAnyVariant, 1);
assert.deepEqual(languageTarget, [{english:true, exactLong:true}]);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "familywise structural audit only; the p0 receiver is uniquely multi-featured inside the charged published family, but no untouched source-authenticated consumer is supplied",
  chargedFamilies: {
    wordShellVariants: wordShellVariants.length,
    languageVariants: languageVariants.length,
    radialRadiusChoices: 330,
    radialOrientations: 2,
    romanSymbols: ["I", "X", "L", "C", "D", "M"],
  },
  counts,
  scoreCounts,
  highScores,
  target,
  languageControl: {
    englishGp3Encodings: englishGp3.size,
    matched23CenterF,
    anyEnglishPrefix,
    exactLongAnyVariant,
    consequence:
      "English-looking first prefixes are non-discriminating after charging the natural H/Hinv/cube family; exact LONG is postselected.",
  },
  directorFork:
    "The packet remains an unusually dense post-discovery structural echo. Promotion is withheld because #1707 requires a new untouched consequence under a frozen consumer, and this audit introduces none.",
}, null, 2));
