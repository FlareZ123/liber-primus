"use strict";

/**
 * Source-locked test of a proposed LP2 chapter-local LFG(5,16)
 * difference-autokey state.
 *
 * Hypothesis:
 *   S[0..15] = phi(Fibonacci-prime spiral values) mod 29
 *   S[n] = S[n-5] + S[n-16] mod 29
 *   C[i] = C[i-1] + P[i] - S[i] mod 29
 *
 * S and the ciphertext accumulator reset at the nine source-visible chapter
 * starts. Punctuation, line wraps, page boundaries and the 32 cross-page
 * words do not reset or consume the rune clock.
 *
 * Node.js 22, CommonJS, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {primeList, uniqueFibonacciPrimeRanks} =
  require("./fibonacci_prime_spiral.cjs");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourcePages = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55);
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const mod29 = n => ((n % 29) + 29) % 29;
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapterLengths.reduce((a, b) => a + b, 0), 12956);

/** Physical LP2 page 50 is the numeric grid and has no rune stream. */
const physicalPage = p => p >= 50 ? p + 1 : p;

/**
 * Parse printed words without treating slash line wraps or page breaks as
 * word boundaries. This preserves the 32 genuine cross-page words.
 */
function parseWords(layoutPages, checkSource = false) {
  const words = [];
  const pageIndices = [];
  let current = null;
  let global = 0;

  for (let page = 0; page < layoutPages.length; page++) {
    let local = 0;
    const indices = [];
    for (const ch of layoutPages[page]) {
      if (runeIndex.has(ch)) {
        const value = runeIndex.get(ch);
        if (!current) current = {
          nums: [], pages: [], locals: [],
          startPage: page, startLocal: local,
          endPage: page, endLocal: local, first: global
        };
        current.nums.push(value);
        current.pages.push(page);
        current.locals.push(local);
        current.endPage = page;
        current.endLocal = local;
        indices.push(value);
        local++;
        global++;
      } else if (ch === "/" || /\s/u.test(ch)) {
        // A line wrap is not a word boundary; the current word continues.
      } else if (current) {
        words.push(current);
        current = null;
      }
    }
    pageIndices.push(indices);

    if (checkSource) {
      const expected = gp.pages.find(p => p.page === physicalPage(page)).indices;
      assert.deepEqual(indices, expected,
        "Transcription/canonical source mismatch at physical page " +
        physicalPage(page));
    }
  }
  if (current) words.push(current);
  return {
    words, pageIndices, global,
    cross: words.filter(w => w.startPage !== w.endPage)
  };
}

const parsed = parseWords(sourcePages, true);
assert.equal(parsed.global, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.cross.length, 32);

const ciphertext = parsed.pageIndices.flat();
assert.equal(ciphertext.length, 12956);

/** Reconstruct the exact printed layout, changing rune glyphs only. */
function buildLayout(indices) {
  let cursor = 0;
  const text = sourcePages.map(page => Array.from(page).map(ch => {
    if (!runeIndex.has(ch)) return ch;
    assert.ok(cursor < indices.length);
    return gp.runes[indices[cursor++]];
  }).join("")).join("%");
  assert.equal(cursor, indices.length);
  return text;
}
function nonRuneSkeleton(text) {
  return Array.from(text).filter(ch => !runeIndex.has(ch)).join("");
}
function ioc(nums) {
  const counts = Array(29).fill(0);
  for (const x of nums) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (nums.length * (nums.length - 1));
}

/** The 16 source values are the first 16 Fibonacci-prime ranks on p15. */
const ranks = uniqueFibonacciPrimeRanks();
assert.deepEqual(ranks,
  [1, 2, 3, 4, 6, 9, 14, 22, 35, 56, 90, 145, 234, 378, 611, 988]);
const primeTable = primeList(10000);
const primes = ranks.map(rank => primeTable[rank - 1]);
assert.deepEqual(primes,
  [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817]);
const seedPrime = primes.map(mod29);
const seedPhi = primes.map(p => mod29(p - 1));

function stateForChapter(seed, recurrenceSign, length) {
  assert.equal(seed.length, 16);
  const state = seed.slice();
  for (let i = 16; i < length; i++) {
    state[i] = mod29(state[i - 5] + recurrenceSign * state[i - 16]);
  }
  return state;
}

/**
 * The same sign parameter is used in both directions because its only
 * allowed values are +1 and -1, each its own modular inverse.
 */
function transform(input, seed, recurrenceSign, sign, decrypt) {
  assert.equal(input.length, 12956);
  const output = new Array(input.length);
  let offset = 0;

  for (const length of chapterLengths) {
    const state = stateForChapter(seed, recurrenceSign, length);
    let previousCipher = 0; // GP F = 0; reset at chapter start.
    for (let j = 0; j < length; j++) {
      const i = offset + j;
      if (decrypt) {
        output[i] = mod29(state[j] + sign * (input[i] - previousCipher));
        previousCipher = input[i];
      } else {
        output[i] = mod29(previousCipher + sign * (input[i] - state[j]));
        previousCipher = output[i];
      }
    }
    offset += length;
  }
  assert.equal(offset, input.length);
  return output;
}

function stateAcrossChapters(seed, recurrenceSign) {
  const all = [];
  for (const length of chapterLengths) {
    all.push(...stateForChapter(seed, recurrenceSign, length));
  }
  return all;
}
function chapterScores(nums) {
  let offset = 0;
  return chapterLengths.map((length, index) => {
    const part = nums.slice(offset, offset + length);
    offset += length;
    return {
      chapter: index + 1,
      length,
      ioc: ioc(part),
      first150: part.slice(0, 150).map(x => gp.translit[x]).join("")
    };
  });
}

/** Original within-page adjacent doublet sites, zero-based rune offsets. */
const doubletSites = [];
let globalPageOffset = 0;
for (let page = 0; page < parsed.pageIndices.length; page++) {
  const nums = parsed.pageIndices[page];
  for (let local = 1; local < nums.length; local++) {
    if (nums[local] === nums[local - 1]) {
      doubletSites.push({
        page: physicalPage(page),
        local,
        global: globalPageOffset + local,
        rune: gp.translit[nums[local]]
      });
    }
  }
  globalPageOffset += nums.length;
}
assert.equal(ciphertext.length - parsed.pageIndices.length, 12901);
assert.equal(doubletSites.length, 86);

/** Original within-word fifth-back equality sites. */
const lag5Sites = [];
for (const word of parsed.words) {
  for (let j = 5; j < word.nums.length; j++) {
    if (word.nums[j] === word.nums[j - 5]) {
      lag5Sites.push({
        page: physicalPage(word.pages[j]),
        local: word.locals[j],
        global: word.first + j
      });
    }
  }
}
assert.equal(lag5Sites.length, 104);

/** Primary source reading: phi(prime), additive LFG(5,16), positive sign. */
const primary = transform(ciphertext, seedPhi, 1, 1, true);
assert.deepEqual(transform(primary, seedPhi, 1, 1, false), ciphertext);
const primaryState = stateAcrossChapters(seedPhi, 1);

/** Every one of the 86 observed doublets is a state-match exception. */
const doubletChecks = doubletSites.map(site => ({
  page: site.page,
  local: site.local,
  global: site.global,
  rune: site.rune,
  plaintext: gp.translit[primary[site.global]],
  state: gp.translit[primaryState[site.global]],
  matches: primary[site.global] === primaryState[site.global]
}));
assert.ok(doubletChecks.every(x => x.matches));

/**
 * For each within-word C[i] = C[i-5], the five state-adjusted increments
 * P[k]-S[k], k=i-4..i, must sum to zero mod 29.
 */
const lag5Checks = lag5Sites.map(site => {
  let sum = 0;
  for (let k = site.global - 4; k <= site.global; k++) {
    sum += primary[k] - primaryState[k];
  }
  return {...site, fiveStepSum: mod29(sum)};
});
assert.ok(lag5Checks.every(x => x.fiveStepSum === 0));

/** Positive plant: all 29 runes on the exact original punctuation/layout. */
const plant = Array.from({length: 12956}, (_, i) => mod29(7 * i + 11));
assert.equal(new Set(plant).size, 29);
const plantPlainText = buildLayout(plant);
const plantCipher = transform(plant, seedPhi, 1, 1, false);
const plantCipherText = buildLayout(plantCipher);
const plantRecovered = transform(plantCipher, seedPhi, 1, 1, true);
const plantRecoveredText = buildLayout(plantRecovered);
const plantParsed = parseWords(plantCipherText.split("%"));
const positive = {
  runeCount: plant.length,
  distinctRunes: new Set(plant).size,
  exactRuneRoundtrip: plantRecovered.every((x, i) => x === plant[i]),
  exactPunctuation:
    nonRuneSkeleton(plantPlainText) === nonRuneSkeleton(plantCipherText) &&
    nonRuneSkeleton(plantPlainText) === nonRuneSkeleton(plantRecoveredText),
  nonRuneCharacterCount: nonRuneSkeleton(plantPlainText).length,
  wordCount: plantParsed.words.length,
  crossPageWords: plantParsed.cross.length
};
assert.equal(positive.distinctRunes, 29);
assert.ok(positive.exactRuneRoundtrip);
assert.ok(positive.exactPunctuation);
assert.equal(positive.wordCount, 2896);
assert.equal(positive.crossPageWords, 32);

/** Freeze the phi-prime model; raw-prime seed is the source-plausible wrong key. */
const wrongKey = transform(ciphertext, seedPrime, 1, 1, true);
assert.deepEqual(transform(wrongKey, seedPrime, 1, 1, false), ciphertext);

/** Small source-locked sign/seed diagnostic; no parameter fitting. */
const variants = [];
for (const [seedName, seed] of [["prime", seedPrime], ["phi", seedPhi]]) {
  for (const recurrenceSign of [1, -1]) {
    for (const cipherSign of [1, -1]) {
      const plain = transform(ciphertext, seed, recurrenceSign, cipherSign, true);
      assert.deepEqual(
        transform(plain, seed, recurrenceSign, cipherSign, false),
        ciphertext
      );
      const scores = chapterScores(plain);
      variants.push({
        seedName, recurrenceSign, cipherSign,
        wholeBookIoc: ioc(plain),
        chapter1Ioc: scores[0].ioc,
        chapter2Ioc: scores[1].ioc
      });
    }
  }
}

/** The 32 complete words which continue across physical page boundaries. */
const carrySites = parsed.cross.map(word =>
  physicalPage(word.startPage) + "->" + physicalPage(word.endPage) +
  " len=" + word.nums.length + " global=" + word.first
);

console.log(JSON.stringify({
  hypothesis: "chapter-local LFG(5,16) difference-autokey",
  source: {
    runes: ciphertext.length,
    words: parsed.words.length,
    chapterLengths,
    withinPageTransitions: 12901,
    adjacentDoublets: doubletSites.length,
    withinWordFifthBackEqualities: lag5Sites.length,
    crossPageWords: parsed.cross.length
  },
  p15Seeds: {primes, primeMod29: seedPrime, phiMod29: seedPhi},
  primary: {
    wholeBookIoc: ioc(primary),
    randomBaseline: 1 / 29,
    chapters: chapterScores(primary),
    exactForwardReconstruction:
      transform(primary, seedPhi, 1, 1, false).every((x, i) => x === ciphertext)
  },
  wrongKey: {
    seed: "raw primes mod 29",
    chapter1Ioc: chapterScores(wrongKey)[0].ioc,
    chapter2Ioc: chapterScores(wrongKey)[1].ioc,
    wholeBookIoc: ioc(wrongKey)
  },
  finiteSourceVariants: variants,
  exceptionAccounting: {
    adjacentDoubletSites: doubletChecks,
    all86DoubletsMatchState: doubletChecks.every(x => x.matches),
    withinWordLag5Sites: lag5Checks,
    all104Lag5SitesAreFiveStepZeroSums: lag5Checks.every(x => x.fiveStepSum === 0)
  },
  plantedPositive: positive,
  crossPageCarrySites: carrySites,
  decision: "Reject this exact source-constrained mechanism: the inverse is near-uniform in every chapter and yields no 150-rune coherent plaintext. The five-step zero-sum identity is descriptive, not independent evidence for the generator."
}, null, 2));
