"use strict";
/**
 * Exact all-secret obstruction for the red-triad quartic GP29 additive key.
 *
 * For any key sequence K satisfying g(E)K=0, and any plaintext P:
 * g(E)(P+K)=g(E)P. Every unknown initial state is canceled.
 * Each window is wholly inside an original printed word, so book/page/word
 * resets outside that window cannot affect the identity.
 *
 * Run from repository root: node sims/red_triad_quartic_annihilator_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const GP = [
  "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
  "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE",
  "D", "A", "AE", "Y", "IA", "EA",
];
const INDEX = new Map(GP.map((symbol, index) => [symbol, index]));
const RUNES = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const RUNE_INDEX = new Map(RUNES.map((symbol, index) => [symbol, index]));
const LATIN_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRS";
const G = [14, 9, 13, 28, 1];
const ORIENTATIONS = [
  {name: "forward", coefficients: G},
  {name: "reverse", coefficients: [...G].reverse()},
];
const SAMPLES = 500;

/** @param {number} value @returns {number} */
const mod = (value) => ((value % 29) + 29) % 29;

/**
 * Repository-native QU/V/K/Z normalization and GP digraphs.
 * @param {string} source
 * @returns {number[]}
 */
function encodeEnglish(source) {
  const word = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    const pair = word.slice(i, i + 2);
    if (INDEX.has(pair)) {
      out.push(INDEX.get(pair));
      i += 2;
    } else {
      if (INDEX.has(word[i])) out.push(INDEX.get(word[i]));
      i++;
    }
  }
  return out;
}

/**
 * Fixed convolution cancelling any GP29 additive key with recurrence g.
 * @param {number[]} symbols
 * @param {number[]} g Ascending coefficients of g(E)
 * @returns {number[]}
 */
function annihilate(symbols, g) {
  const out = [];
  for (let i = 0; i + 4 < symbols.length; i++) {
    let sum = 0;
    for (let j = 0; j < 5; j++) sum += g[j] * symbols[i + j];
    out.push(mod(sum));
  }
  return out;
}

/**
 * @param {number[][]} words
 * @param {number[]} g
 * @returns {{hist:number[],n:number}}
 */
function histogram(words, g) {
  const hist = Array(29).fill(0);
  let n = 0;
  for (const word of words) {
    for (const value of annihilate(word, g)) {
      hist[value]++;
      n++;
    }
  }
  return {hist, n};
}

/**
 * @param {{hist:number[],n:number}} observed
 * @param {{hist:number[],n:number}} reference
 * @returns {number}
 */
function chiSquare(observed, reference) {
  return observed.hist.reduce((total, n, i) => {
    const expected = observed.n * reference.hist[i] / reference.n;
    assert.ok(expected > 0);
    return total + (n - expected) ** 2 / expected;
  }, 0);
}

/** @param {number} n @returns {number} */
function reciprocal(n) {
  for (let i = 1; i < 29; i++)
    if (mod(n * i) === 1) return i;
  throw new Error("Noninvertible coefficient");
}

/**
 * Positive control: random secret GP29 word-local LFSR key, known only here.
 * @param {number[]} plain
 * @param {number[]} g
 * @param {() => number} rng
 * @returns {number[]}
 */
function encryptPlant(plain, g, rng) {
  const key = Array.from({length: Math.min(plain.length, 4)}, () => rng() % 29);
  const inverseLead = reciprocal(g[4]);
  for (let i = 4; i < plain.length; i++) {
    let sum = 0;
    for (let j = 0; j < 4; j++) sum += g[j] * key[i - 4 + j];
    key.push(mod(-sum * inverseLead));
  }
  return plain.map((value, i) => mod(value + key[i]));
}

/** @param {number} seed @returns {() => number} */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
}

/**
 * @param {number[][]} original
 * @param {number[][]} referenceWords
 * @param {string} name
 * @returns {object[]}
 */
function testRegister(original, referenceWords, name, cohort = "all-words", expectedWords = 1132, expectedWindows = 3237) {
  const training = referenceWords.filter((_, i) => i % 2 === 0);
  const heldout = referenceWords.filter((_, i) => i % 2 !== 0);
  const buckets = Array.from({length: 128}, () => []);
  for (const word of heldout)
    if (word.length < buckets.length) buckets[word.length].push(word);
  const source = original.filter((word) =>
    word.length >= 5 && word.length < buckets.length &&
      buckets[word.length].length > 0);
  assert.equal(source.length, expectedWords);
  return ORIENTATIONS.map(({name: direction, coefficients: g}) => {
    const reference = histogram(training, g);
    const observed = histogram(source, g);
    assert.equal(observed.n, expectedWindows);
    const rng = randomGenerator(142857);
    const controls = [];
    for (let sample = 0; sample < SAMPLES; sample++) {
      const syntheticWords = source.map((word) => {
        const pool = buckets[word.length];
        return pool[rng() % pool.length];
      });
      controls.push(chiSquare(histogram(syntheticWords, g), reference));
    }
    controls.sort((a, b) => a - b);
    const chi2 = chiSquare(observed, reference);
    const tailCount = controls.filter((v) => v >= chi2).length;
    const plant = heldout.filter((word) => word.length >= 5).slice(0, 100);
    assert.equal(plant.length, 100);
    const plantRng = randomGenerator(3301);
    let tested = 0, modified = 0;
    for (const word of plant) {
      const encrypted = encryptPlant(word, g, plantRng);
      modified += encrypted.filter((v, i) => v !== word[i]).length;
      tested += word.length;
      assert.deepEqual(annihilate(encrypted, g), annihilate(word, g));
    }
    assert.ok(modified >= Math.floor(tested / 2));
    return {
      register: name, cohort, direction, words: source.length,
      annihilatedSymbols: observed.n, nativeTrainingSymbols: reference.n,
      originalChiSquare: chi2, controlMin: controls[0],
      controlMedian: controls[250], controlMax: controls[499],
      nullExceed: tailCount, nullDraws: SAMPLES,
      addOneUpperTail: (tailCount + 1) / (SAMPLES + 1),
      plantSymbols: tested, plantChanged: modified,
    };
  });
}

/**
 * Assert every retained five-rune window is wholly inside one physical page,
 * and none straddles a visible 13-dot event (if an event resets the key).
 * @param {{words:Array<{runes:string,startPage:number,endPage:number}>}} parsed
 * @returns {{safeWindows:number,sourceMarks:number}}
 */
function verifySourceSafeWindows(parsed) {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const ink = JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
  const boundaries = new Set();
  let physicalOffset = 0, sourceMarks = 0;
  for (const physical of corpus.pages.slice(0, 56)) {
    const marked = ink.pages.find((page) => page.page === physical.page);
    for (const item of (marked?.large_punctuation || []))
      if (item[1] === 13) {
        boundaries.add(physicalOffset + item[0]);
        sourceMarks++;
      }
    physicalOffset += physical.runic_count;
  }
  assert.equal(physicalOffset, 12956);
  assert.equal(sourceMarks, 28);
  let wordOffset = 0, safeWindows = 0;
  for (const word of parsed.words) {
    if (word.startPage === word.endPage)
      for (let i = 0; i + 4 < word.length; i++) {
        for (let j = 1; j <= 4; j++)
          assert.ok(!boundaries.has(wordOffset + i + j),
            "Key reset within retained source window");
        safeWindows++;
      }
    wordOffset += word.length;
  }
  assert.equal(wordOffset, physicalOffset);
  assert.equal(safeWindows, 3152);
  return {safeWindows, sourceMarks};
}

function main() {
  const original = parseSharedCorpus();
  assert.equal(original.words.length, 2896);
  assert.equal(original.runeCount, 12956);
  const sourceSafe = verifySourceSafeWindows(original);
  const words = original.words.map((word) =>
    [...word.runes].map((symbol) => RUNE_INDEX.get(symbol)));
  assert.ok(words.every((word) => word.every(Number.isInteger)));
  const english = fs.readFileSync(path.join(ROOT,
    "resources/control/shakespeare_first300k.txt"), "utf8")
    .match(/[A-Za-z]+/g).map(encodeEnglish)
    .filter((word) => word.length > 0);
  const latin = fs.readFileSync(path.join(ROOT,
    "resources/control/latin-vulgate-gp-wholewords.txt"), "utf8")
    .split(/\r?\n/u).map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") &&
      [...line].every((symbol) => LATIN_ALPHABET.includes(symbol)))
    .map((line) => [...line].map((symbol) =>
      LATIN_ALPHABET.indexOf(symbol)));
  assert.ok(english.length >= 38000);
  assert.ok(latin.length >= 35000);
  assert.deepEqual(G, [14, 9, 13, 28, 1]);
  const results = [
    ...testRegister(words, english, "GP Shakespeare English"),
    ...testRegister(words, latin, "GP Vulgate Latin"),
  ];
  assert.deepEqual(results.map((r) => r.nullExceed), [0, 0, 0, 2]);
  // A page-reset cannot break recurrence windows in complete words contained
  // within one physical page. The original parser finds 32 cross-page words.
  const pageWords = original.words.filter((word) =>
    word.startPage === word.endPage).map((word) =>
    [...word.runes].map((symbol) => RUNE_INDEX.get(symbol)));
  assert.equal(pageWords.length, 2864);
  const pageSafe = [
    ...testRegister(pageWords, english, "GP Shakespeare English",
      "page-contained", 1108, 3152),
    ...testRegister(pageWords, latin, "GP Vulgate Latin",
      "page-contained", 1108, 3152),
  ];
  console.log("QUARTIC ANNIHILATOR ORIGINAL-INPUT TEST PASSED");
  console.log(JSON.stringify({sourceSafe, allWords: results,
    pageContained: pageSafe}, null, 2));
}

if (require.main === module) main();
module.exports = {annihilate, histogram, chiSquare, encryptPlant, main};
