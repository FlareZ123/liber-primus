"use strict";

/**
 * Source-led BASE60/BASE256 -> historical 2013 BASE29 readout gate.
 * Reads original LP2 pp49-51 two-character numerical table without editing it.
 * The signed 2013 protocol specifies numeral BASE29; the cross-era transfer
 * to this later LP2 table is exploratory, never an authored instruction.
 * Run (Node 22): node sims/lp2_p50_2013_base29_fullinteger_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"), "utf8"));
const book = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));

/**
 * Standard unsigned big-endian positional serialization and BASE29 recovery.
 * @param {number[]} digits
 * @param {number} radix
 * @returns {number[]}
 */
function toBase29(digits, radix) {
  let integer = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < radix);
    integer = integer * BigInt(radix) + BigInt(digit);
  }
  if (!integer) return [0];
  const converted = [];
  while (integer) {
    converted.push(Number(integer % 29n));
    integer /= 29n;
  }
  return converted.reverse();
}

/** @param {number[]} digits @returns {bigint} */
function integer29(digits) {
  let n = 0n;
  for (const x of digits) n = n * 29n + BigInt(x);
  return n;
}

/** @param {number[]} symbols @returns {number[]} */
function sortedHistogram(symbols) {
  const counts = Array(29).fill(0);
  for (const x of symbols) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    counts[x]++;
  }
  return counts.sort((a, b) => b - a);
}

/**
 * Lower bound on replacements needed after any secret bijective relabeling
 * AND even after arbitrarily reordering the output positions. Therefore a
 * strictly positive result precludes an exact match under every stationary
 * secret GP29 substitution in the candidate window.
 * @param {number[]} source
 * @param {number[]} target
 */
function allAlphabetWindowGate(source, target) {
  const targetHistogram = sortedHistogram(target);
  let minEdits = Infinity;
  let earliestOffset = -1;
  let exactWindows = 0;
  for (let start = 0; start + target.length <= source.length; start++) {
    const sourceHistogram = sortedHistogram(
      source.slice(start, start + target.length));
    const l1 = sourceHistogram.reduce(
      (total, value, i) => total + Math.abs(value - targetHistogram[i]), 0);
    const edits = l1 / 2;
    assert.ok(Number.isInteger(edits));
    if (edits < minEdits) {
      minEdits = edits;
      earliestOffset = start;
    }
    if (edits === 0) exactWindows++;
  }
  return { minEdits, earliestOffset, exactWindows };
}

/** @param {number[]} source @returns {number} */
function ioc(source) {
  const histogram = sortedHistogram(source);
  return histogram.reduce((total, count) => total + count * (count - 1), 0)
    / (source.length * (source.length - 1));
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return n > 1;
}

/** @returns {number[]} */
function firstPrimes() {
  const primes = [];
  for (let p = 2; primes.length < 84; p++) if (isPrime(p)) primes.push(p);
  return primes;
}

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const base60 = grid.alphabet;
assert.equal(base60.length, 60);
const rowBytes = grid.rows.map(row => row.map(token =>
  60 * base60.indexOf(token[0]) + base60.indexOf(token[1])));
const bytes = rowBytes.flat();
assert.ok(bytes.every(value => value >= 0 && value < 256));
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes))
  .digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

// Independently signed 2013 literal operation: 3301 => 3QO.
const historicDigits = toBase29([3, 3, 0, 1], 10);
assert.deepEqual(historicDigits, [3, 26, 24]);
assert.equal(integer29(historicDigits), 3301n);
assert.equal(historicDigits.map(x =>
  "0123456789ABCDEFGHIJKLMNOPQRS"[x]).join(""), "3QO");

const p56Cipher = book.pages.find(x => x.page === 56).indices;
const p57Clear = book.pages.find(x => x.page === 57).indices;
assert.equal(p56Cipher.length, 85);
assert.equal(p57Clear.length, 95);
assert.equal(p56Cipher[56], 0);
const primes = firstPrimes();
let clock = 0;
const p56Clear = p56Cipher.map((value, position) =>
  position === 56 ? 0 : (value - (primes[clock++] - 1) % 29 + 29) % 29);
assert.equal(clock, 84);
assert.deepEqual(p56Clear.slice(0, 10), [24, 9, 18, 9, 23, 7, 10, 2, 10, 9]);
assert.deepEqual(p57Clear.slice(0, 4), [13, 24, 4, 24]);

const runs = {
  "whole-512-digit-base60": toBase29(tokens.flatMap(token =>
    [base60.indexOf(token[0]), base60.indexOf(token[1])]), 60),
  "whole-256-byte-base256": toBase29(bytes, 256),
  "32-rows-separately-base60": grid.rows.flatMap(row => toBase29(
    row.flatMap(token => [base60.indexOf(token[0]), base60.indexOf(token[1])]), 60)),
  "32-rows-separately-base256": rowBytes.flatMap(row => toBase29(row, 256))
};

const expected = {
  "whole-512-digit-base60": {
    n: 622, min: [12, 2, 12], offset: [49, 200, 48]
  },
  "whole-256-byte-base256": {
    n: 422, min: [12, 2, 12], offset: [156, 3, 147]
  },
  "32-rows-separately-base60": {
    n: 605, min: [11, 2, 13], offset: [5, 138, 103]
  },
  "32-rows-separately-base256": {
    n: 428, min: [14, 2, 15], offset: [32, 42, 36]
  }
};

const knownTargets = [
  ["independently-solved-p56-plaintext", p56Clear],
  ["original-solved-p56-ciphertext", p56Cipher],
  ["original-clear-p57-plaintext", p57Clear]
];
for (const [name, digits] of Object.entries(runs)) {
  assert.equal(digits.length, expected[name].n);
  const results = knownTargets.map(([targetName, target], i) => {
    const test = allAlphabetWindowGate(digits, target);
    assert.equal(test.minEdits, expected[name].min[i]);
    assert.equal(test.earliestOffset, expected[name].offset[i]);
    assert.equal(test.exactWindows, 0);
    return { targetName, ...test };
  });

  // Synthetic held-out p57 under a genuinely secret fixed 29-letter alphabet.
  // Demonstrates that the all-key necessary-condition test accepts planted
  // known plaintext, including a hidden secret substitution.
  const planted = digits.slice();
  for (let j = 0; j < p57Clear.length; j++) {
    planted[j + 17] = (7 * p57Clear[j] + 3) % 29;
  }
  const positive = allAlphabetWindowGate(planted, p57Clear);
  assert.equal(positive.minEdits, 0);
  assert.ok(positive.exactWindows >= 1);
  console.log(JSON.stringify({ name, length: digits.length,
    ioc: ioc(digits), results, plantedKnownPlaintext: positive }));
}


// Exploratory extension: convert each original p50 cell separately using the
// authenticated 2013 BASE29 integer operation. The signed source does not
// instruct this table transfer; test both live table radices and both the
// literal minimal-width and structure-preserving two-digit serializations.
const BASE29_CHARS = "0123456789ABCDEFGHIJKLMNOPQRS";
const commonTrigrams = [
  "THE","AND","ING","ION","ENT","HER","ERE","FOR","THI","TIO",
  "TER","EST","ERS","ATI","HAT","ATE","ALL","ETH","NTH","ARE",
  "YOU","THA","HEA","WIT","NOT","HIS","WAS","HEN","OUT","VER",
  "THR","EVE","REA","NCE","CON","EDT","NTO","DTH","STH","OTH"
];
const commonWords = [
  "THE","AND","YOU","ARE","NOT","ONE","THAT","THIS","FROM","WITH",
  "FOR","OF","IN","IS","IT","TO","BE","AS","ON","HE","SHE","HIS",
  "HER","WAS","WERE","HAVE","HAS","THERE","HERE","WHERE","WHEN",
  "WHAT","WHO","WHY","HOW","THEIR","THEM","THESE","THOSE","EVER",
  "NEVER","LIFE","DEATH","LIGHT","DARK","GOD","MAN","WOMAN","WORD",
  "WORDS","BOOK","TREE","CICADA"
];

function countOverlapping(text, needle) {
  let count = 0;
  let at = 0;
  while ((at = text.indexOf(needle, at)) !== -1) {
    count++;
    at++;
  }
  return count;
}

function englishSubstringScore(text) {
  const trigramCounts = Object.fromEntries(commonTrigrams.map(term =>
    [term, countOverlapping(text, term)]).filter(([, n]) => n > 0));
  const wordCounts = Object.fromEntries(commonWords.map(term =>
    [term, countOverlapping(text, term)]).filter(([, n]) => n > 0));
  const trigramCount = Object.values(trigramCounts).reduce((a, b) => a + b, 0);
  const wordCount = Object.values(wordCounts).reduce((a, b) => a + b, 0);
  return {
    score: trigramCount + 2 * wordCount,
    trigramCount,
    wordCount,
    trigramCounts,
    wordCounts
  };
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function cellOrderNull(chunks, observedScore, trials = 10000) {
  const next = xorshift32(0x3301ab25);
  const scores = [];
  for (let trial = 0; trial < trials; trial++) {
    const shuffled = chunks.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const text = shuffled.flat().map(symbol => book.translit[symbol]).join("");
    scores.push(englishSubstringScore(text).score);
  }
  const mean = scores.reduce((a, b) => a + b, 0) / trials;
  const sd = Math.sqrt(scores.reduce((a, b) => a + (b - mean) ** 2, 0) / trials);
  const upperTail = (scores.filter(score => score >= observedScore).length + 1)
    / (trials + 1);
  return { trials, mean, sd, z: (observedScore - mean) / sd, upperTail };
}

const base59Alphabet = base60.replace("f", "");
assert.equal(base59Alphabet.length, 59);
const cellwiseExpected = {
  "59-variable": { length: 490, score: 45, min: [6, 8, 7], offsets: [108, 56, 104] },
  "59-fixed2": { length: 512, score: 47, min: [5, 6, 6], offsets: [168, 295, 153] },
  "60-variable": { length: 490, score: 73, min: [4, 11, 4], offsets: [261, 9, 191] },
  "60-fixed2": { length: 512, score: 71, min: [4, 9, 5], offsets: [272, 83, 102] }
};

for (const radix of [59, 60]) {
  const alphabet = radix === 59 ? base59Alphabet : base60;
  const values = tokens.map(token => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, "invalid base" + radix + " token " + token);
    return radix * hi + lo;
  });
  assert.equal(values.length, 256);
  assert.equal(new Set(values).size, 161);
  const minimalDigits = values.map(value => toBase29([value], 256));

  for (const width of ["variable", "fixed2"]) {
    const chunks = minimalDigits.map(digits =>
      width === "fixed2" && digits.length === 1 ? [0, ...digits] : digits);
    const symbols = chunks.flat();
    const transliteration = symbols.map(symbol => book.translit[symbol]).join("");
    const observed = englishSubstringScore(transliteration);
    const null = cellOrderNull(chunks, observed.score);
    const gates = knownTargets.map(([targetName, target]) => ({
      targetName,
      ...allAlphabetWindowGate(symbols, target)
    }));
    const expected = cellwiseExpected[radix + "-" + width];
    assert.equal(symbols.length, expected.length);
    assert.equal(observed.score, expected.score);
    assert.deepEqual(gates.map(x => x.minEdits), expected.min);
    assert.deepEqual(gates.map(x => x.earliestOffset), expected.offsets);
    assert.ok(gates.every(x => x.exactWindows === 0));
    assert.ok(observed.score <= null.mean);
    assert.ok(null.upperTail > 0.5);

    const planted = symbols.slice();
    for (let j = 0; j < p57Clear.length; j++) {
      planted[j + 17] = (7 * p57Clear[j] + 3) % 29;
    }
    const positive = allAlphabetWindowGate(planted, p57Clear);
    assert.equal(positive.minEdits, 0);
    assert.ok(positive.exactWindows >= 1);

    console.log(JSON.stringify({
      name: "cellwise-base29-" + radix + "-" + width,
      radix,
      width,
      cells: values.length,
      uniqueValues: new Set(values).size,
      symbols: symbols.length,
      sha256Symbols: crypto.createHash("sha256").update(Buffer.from(symbols)).digest("hex"),
      sha256Transliteration: crypto.createHash("sha256").update(transliteration, "utf8").digest("hex"),
      ioc: ioc(symbols),
      preview: transliteration.slice(0, 240),
      observed,
      cellOrderNull: null,
      knownPlaintextGates: gates,
      plantedP57Control: positive
    }));
  }
}
