"use strict";

/**
 * Exact key-independent suffix-partition test for the five-independent-map
 * per-word GP29 five-back ciphertext-feedback family.
 *
 * Model for each printed word w and phase r in 0..4:
 *   C[j] = pi_r(P[j])                         for j < 5
 *   C[j] = C[j-5] + pi_(j mod 5)(P[j]) mod 29 for j >= 5
 *
 * The five maps are independent for every word. Therefore the fifth-back
 * residual D[j] = C[j]-C[j-5] mod 29 is a bijective image of P[j] for
 * j >= 5, but equality is preserved only within each residue class mod 5.
 * Initial symbols are deliberately excluded from this suffix-only gate.
 *
 * SFT: node sims/lp2_lagfive_perword_phase_partition_sft.cjs
 * Node.js 20+ CommonJS; no network or third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const runeMap = new Map(gp.runes.map((glyph, ordinal) => [glyph, ordinal]));
const runePattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const transcription = read("resources/lp2-transcription.txt");
const sourceWords = (transcription.split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "").match(runePattern) || [])
  .map(word => Array.from(word, glyph => runeMap.get(glyph)));
const pages = gp.pages.filter(page => page.page < 56 && page.indices.length > 0);
const pageAtRune = pages.flatMap(page => Array(page.indices.length).fill(page.page));
const sourceRuneCount = sourceWords.reduce((sum, word) => sum + word.length, 0);
assert.equal(sourceWords.length, 2896, "original printed-word count");
assert.equal(sourceRuneCount, 12956, "original unknown-rune count");
assert.equal(pageAtRune.length, 12956, "original physical-page overlay");

let offset = 0;
const wordLocations = sourceWords.map((word, wordIndex) => {
  const start = offset;
  const end = start + word.length - 1;
  offset += word.length;
  return {
    wordIndex,
    page: pageAtRune[start],
    endPage: pageAtRune[end],
    startRune: start,
    endRune: end
  };
});
const crossingWords = wordLocations.filter(location => location.page !== location.endPage).length;
assert.equal(crossingWords, 32, "original page-carried printed words");

function canonicalPartition(values) {
  const labels = new Map();
  let next = 0;
  return values.map(value => {
    if (!labels.has(value)) labels.set(value, next++);
    return labels.get(value);
  }).join(",");
}

function cipherSuffixSignature(ciphertextWord) {
  const phases = [];
  for (let phase = 0; phase < 5; phase++) {
    const residuals = [];
    for (let j = phase + 5; j < ciphertextWord.length; j += 5) {
      residuals.push((ciphertextWord[j] - ciphertextWord[j - 5] + 29) % 29);
    }
    phases.push(canonicalPartition(residuals));
  }
  return phases.join("|");
}

function plainSuffixSignature(plaintextWord) {
  const phases = [];
  for (let phase = 0; phase < 5; phase++) {
    const symbols = [];
    for (let j = phase + 5; j < plaintextWord.length; j += 5) {
      symbols.push(plaintextWord[j]);
    }
    phases.push(canonicalPartition(symbols));
  }
  return phases.join("|");
}

function eligibleSamePhasePairs(word) {
  let pairs = 0;
  for (let phase = 0; phase < 5; phase++) {
    let count = 0;
    for (let j = phase + 5; j < word.length; j += 5) count++;
    pairs += count * (count - 1) / 2;
  }
  return pairs;
}

const corpusSpecs = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Latin Vulgate", "resources/control/latin-vulgate-latin26-wholewords.txt"],
  ["TextBlob", "resources/control/english_wordfreq_textblob.txt"]
];

const dictionaries = corpusSpecs.map(([name, file]) => {
  const text = read(file);
  const lines = text.split("\n").filter(line => !line.startsWith("#"));
  const tokens = lines.join(" ").match(/[A-Za-z]+/g) || [];
  const uniqueWords = new Set(tokens.map(token => token.toUpperCase()));
  const buckets = Array.from({length: 15}, () => new Map());
  const positiveWords = [];
  const positiveSeen = new Set();

  for (const raw of tokens) {
    const word = encodeSourceNativeGP(raw);
    if (word.length < 1 || word.length > 14) continue;
    const signature = plainSuffixSignature(word);
    let set = buckets[word.length].get(signature);
    if (!set) {
      set = new Set();
      buckets[word.length].set(signature, set);
    }
    set.add(raw.toUpperCase());

    if (word.length >= 10 && !positiveSeen.has(raw.toUpperCase())) {
      positiveSeen.add(raw.toUpperCase());
      positiveWords.push({raw: raw.toUpperCase(), word});
    }
  }
  return {name, file, tokenCount: tokens.length, uniqueWordCount: uniqueWords.size, buckets, positiveWords};
});

const longWords = sourceWords.map((word, index) => ({word, index}))
  .filter(item => item.word.length >= 10 && item.word.length <= 14);
assert.equal(longWords.length, 109, "original 10-14-rune words");

const rows = longWords.map(({word, index}) => {
  const signature = cipherSuffixSignature(word);
  const bySource = {};
  for (const dictionary of dictionaries) {
    const set = dictionary.buckets[word.length].get(signature);
    bySource[dictionary.name] = set ? Array.from(set).sort() : [];
  }
  const union = Array.from(new Set(Object.values(bySource).flat())).sort();
  const location = wordLocations[index];
  return {
    wordIndex: index,
    page: location.page,
    endPage: location.endPage,
    runeLength: word.length,
    ciphertextRunes: word.map(value => gp.runes[value]).join(""),
    phasePattern: signature,
    candidateCounts: Object.fromEntries(Object.entries(bySource).map(([name, candidates]) => [name, candidates.length])),
    unionCount: union.length,
    candidates: union.length <= 40 ? union : undefined
  };
});

const eligiblePairs = longWords.reduce((sum, item) => sum + eligibleSamePhasePairs(item.word), 0);
assert.equal(eligiblePairs, 92, "original same-word, same-phase suffix comparisons");

const candidateDistribution = {};
for (const row of rows) {
  candidateDistribution[row.unionCount] = (candidateDistribution[row.unionCount] || 0) + 1;
}
const sortedDistribution = Object.fromEntries(Object.entries(candidateDistribution)
  .sort((a, b) => Number(a[0]) - Number(b[0])));
assert.deepEqual(sortedDistribution, {
  "6": 1,
  "14": 2,
  "75": 1,
  "113": 2,
  "203": 1,
  "487": 3,
  "1021": 17,
  "1976": 30,
  "3377": 52
});
assert.equal(rows.filter(row => row.unionCount === 0).length, 0);
assert.equal(rows.filter(row => row.unionCount === 1).length, 0);

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function shuffledAlphabet(random) {
  const alphabet = Array.from({length: 29}, (_, index) => index);
  for (let i = alphabet.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  return alphabet;
}

function plantFiveBackWord(plaintext, random) {
  const maps = Array.from({length: 5}, () => shuffledAlphabet(random));
  const inverses = maps.map(map => {
    const inverse = new Array(29);
    map.forEach((value, index) => { inverse[value] = index; });
    return inverse;
  });
  const ciphertext = new Array(plaintext.length);

  for (let j = 0; j < Math.min(5, plaintext.length); j++) {
    ciphertext[j] = maps[j][plaintext[j]];
  }
  for (let j = 5; j < plaintext.length; j++) {
    ciphertext[j] = (ciphertext[j - 5] + maps[j % 5][plaintext[j]]) % 29;
  }

  const recovered = new Array(plaintext.length);
  for (let j = 0; j < Math.min(5, plaintext.length); j++) {
    recovered[j] = inverses[j][ciphertext[j]];
  }
  for (let j = 5; j < plaintext.length; j++) {
    const residual = (ciphertext[j] - ciphertext[j - 5] + 29) % 29;
    recovered[j] = inverses[j % 5][residual];
  }
  assert.deepEqual(recovered, plaintext, "independent five-map-per-word inverse");
  assert.equal(cipherSuffixSignature(ciphertext), plainSuffixSignature(plaintext),
    "five-back suffix equality partition survives all five secret maps");
  return ciphertext.length;
}

const random = makeRng(0x33013301);
let positiveWords = 0;
let positiveRunes = 0;
for (const dictionary of dictionaries) {
  const sample = dictionary.positiveWords.slice(0, 100);
  assert.equal(sample.length, 100, dictionary.name + " positive plant size");
  for (const item of sample) {
    positiveRunes += plantFiveBackWord(item.word, random);
    positiveWords++;
  }
}
assert.equal(positiveWords, 500);

const lowCandidateRows = rows.filter(row => row.unionCount <= 40);
assert.equal(lowCandidateRows.length, 3);

const result = {
  status: "exact original-input key-independent suffix-partition test; no unknown plaintext recovered",
  original: {
    printedWords: sourceWords.length,
    unknownRunes: sourceRuneCount,
    pageCarriedWords: crossingWords,
    longWords10to14: longWords.length,
    eligibleSameWordSamePhasePairs: eligiblePairs
  },
  dictionaries: dictionaries.map(dictionary => ({
    name: dictionary.name,
    rawTokens: dictionary.tokenCount,
    uniqueWords: dictionary.uniqueWordCount,
    distinctLength10to14Patterns: dictionary.buckets.slice(10, 15).reduce((sum, bucket) => sum + bucket.size, 0)
  })),
  result: {
    matchedWords: rows.filter(row => row.unionCount > 0).length,
    unmatchedWords: rows.filter(row => row.unionCount === 0).length,
    uniqueCandidates: rows.filter(row => row.unionCount === 1).length,
    candidateDistribution: sortedDistribution,
    minimumCandidates: Math.min(...rows.map(row => row.unionCount)),
    maximumCandidates: Math.max(...rows.map(row => row.unionCount)),
    lowCandidateRows
  },
  positivePlant: {
    independentWords: positiveWords,
    recoveredRunes: positiveRunes,
    all500RoundTripsAndSuffixPartitionsPassed: true,
    seed: "0x33013301"
  },
  interpretation: "The five-independent-map-per-word family is not falsified by this finite-dictionary suffix invariant, but it yields no unique plaintext word and requires an unconstrained 5-map key schedule per printed word. Do not treat survival as evidence of Cicada's intended mechanism."
};

if (require.main === module) {
  console.log(JSON.stringify(result, null, 2));
}
module.exports = {cipherSuffixSignature, plainSuffixSignature};
