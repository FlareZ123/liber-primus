"use strict";

/**
 * One frozen transfer of the solved p56 phi(prime) clock to physical p36.
 *
 * Hypothesis: p36 is selected by the 36th prime, 151. The historical
 * participant DH transcript has a private-exponent class e = 11 (mod 550);
 * one representative is 1661 = 11 * 151. This is a weak, retrospective
 * selector, not a signed LP2 instruction.
 *
 * Candidate: P[i] = C[i] - (prime[35+i] - 1) (mod 29), continuously across
 * all 238 original GP runes. Non-rune punctuation and the printed Arabic 1
 * do not consume a GP key. No F skip, reset, phase, sign, or start sweep.
 *
 * Run: node sims/p36_prime36_p56_totient_transfer_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");

const page = corpus.pages.find((p) => p.page === 36);
assert(page);
const cipher = page.indices;
assert.equal(cipher.length, 238);

const physicalPages = transcription.split("%");
assert.equal(physicalPages.length, 57);
function printedWords(section) {
  return section.replace(/[\/\r\n]/gu, "")
    .split(/[-.&$§,:!?]/u)
    .map((part) => (part.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const runeIndex = new Map([...corpus.runes].map((r, i) => [r, i]));
const originalWords = printedWords(physicalPages[36])
  .map((w) => [...w].map((r) => runeIndex.get(r)));
assert.equal(originalWords.length, 50);
assert.equal(originalWords.flat().length, 238);
assert.deepEqual(originalWords.flat(), cipher);

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) out.push(n);
  }
  return out;
}
const primeOrdinal = 36;
const primeIndex = primeOrdinal - 1;
const primes = firstPrimes(primeIndex + cipher.length);
assert.equal(primes[primeIndex], 151);
assert.equal((primes[primeIndex] - 1) % 29, 5);

const mod29 = (n) => ((n % 29) + 29) % 29;
const key = cipher.map((_, i) => mod29(primes[primeIndex + i] - 1));
const decoded = cipher.map((c, i) => mod29(c - key[i]));
const reencoded = decoded.map((p, i) => mod29(p + key[i]));
assert.deepEqual(reencoded, cipher);

let cursor = 0;
const decodedWords = originalWords.map((word) => {
  const out = decoded.slice(cursor, cursor + word.length);
  cursor += word.length;
  return out;
});
assert.equal(cursor, cipher.length);

const translit = new Map(corpus.translit.map((t, i) => [t, i]));
translit.set("ING", 21);
function encodeEnglishWord(source) {
  const word = source.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    let matched = false;
    for (const n of [3, 2, 1]) {
      const token = word.slice(i, i + n);
      if (translit.has(token)) {
        out.push(translit.get(token));
        i += n;
        matched = true;
        break;
      }
    }
    assert(matched, "Unmapped control token: " + word.slice(i));
  }
  return out;
}
const controlWords = (shakespeare.toUpperCase().match(/[A-Z]+/g) || [])
  .map(encodeEnglishWord)
  .filter((w) => w.length >= 1);
const split = Math.floor(controlWords.length * 0.8);
const training = controlWords.slice(0, split);
const holdout = controlWords.slice(split);

const trigramCounts = Array.from({ length: 29 }, () =>
  Array.from({ length: 29 }, () => Array(29).fill(0)));
const contextCounts = Array.from({ length: 29 }, () => Array(29).fill(0));
let trainingTrigrams = 0;
for (const word of training) {
  for (let i = 0; i + 2 < word.length; i++) {
    trigramCounts[word[i]][word[i + 1]][word[i + 2]]++;
    contextCounts[word[i]][word[i + 1]]++;
    trainingTrigrams++;
  }
}
const alpha = 0.1;
function withinWordScore(words) {
  let logScore = 0;
  let transitions = 0;
  for (const word of words) {
    for (let i = 0; i + 2 < word.length; i++) {
      const a = word[i], b = word[i + 1], c = word[i + 2];
      logScore += Math.log(
        (trigramCounts[a][b][c] + alpha) /
        (contextCounts[a][b] + alpha * 29)
      );
      transitions++;
    }
  }
  return { meanLog: logScore / transitions, transitions };
}
const rawScore = withinWordScore(originalWords);
const decodedScore = withinWordScore(decodedWords);

const holdoutByLength = new Map();
for (const word of holdout) {
  if (!holdoutByLength.has(word.length)) holdoutByLength.set(word.length, []);
  holdoutByLength.get(word.length).push(word);
}
const wordLengths = originalWords.map((w) => w.length);
for (const n of wordLengths) {
  assert(holdoutByLength.has(n) && holdoutByLength.get(n).length > 0,
    "No native holdout word of GP length " + n);
}

let randomState = 0x361511;
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 0x100000000;
}
const sampleCount = 2000;
const sampleScores = [];
for (let sample = 0; sample < sampleCount; sample++) {
  const nativeWords = wordLengths.map((n) => {
    const pool = holdoutByLength.get(n);
    return pool[Math.floor(random() * pool.length)];
  });
  sampleScores.push(withinWordScore(nativeWords).meanLog);
}
sampleScores.sort((a, b) => a - b);
const quantile = (p) => sampleScores[Math.floor((sampleScores.length - 1) * p)];

function indexOfCoincidence(values) {
  const freq = Array(29).fill(0);
  for (const v of values) freq[v]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const render = (words) => words
  .map((w) => w.map((i) => corpus.translit[i]).join(""))
  .join(" ");

// Synthetic positive control: exact same word-length register, native GP words.
const plantWords = wordLengths.map((n) => holdoutByLength.get(n)[0]);
const plantCipher = plantWords.map((word, i) =>
  word.map((p) => mod29(p + key[i]))
);
const plantDecoded = plantCipher.map((word, i) =>
  word.map((c) => mod29(c - key[i]))
);
assert.deepEqual(plantDecoded, plantWords);

const result = {
  hypothesis: "p36 prime-ordinal 36 selects the 36th prime 151 as the p56 phi(prime) stream start",
  sourceCaution: "the e=11 (mod 550) participant transcript is not a signed LP2 instruction",
  original: {
    page: 36,
    scan: "50.jpg",
    runeCount: cipher.length,
    printedWords: originalWords.length,
    primeOrdinal,
    zeroBasedPrimeIndex: primeIndex,
    firstPrime: primes[primeIndex],
    firstShift: key[0],
    keyRule: "phi(prime[36+i]) mod 29",
    skipPolicy: "none; no p36 F exception is source-selected",
    rawIoC: indexOfCoincidence(cipher),
    decodedIoC: indexOfCoincidence(decoded),
    rawWithinWordTrigram: rawScore,
    decodedWithinWordTrigram: decodedScore,
    decodedText: render(decodedWords),
    reencodesOriginalExactly: true
  },
  nativeShakespeareControl: {
    trainingWords: training.length,
    trainingTrigrams,
    holdoutWords: holdout.length,
    lengthMatchedSamples: sampleCount,
    seed: "0x361511",
    scoreMin: sampleScores[0],
    scoreP10: quantile(0.10),
    scoreMedian: quantile(0.50),
    scoreP90: quantile(0.90),
    scoreMax: sampleScores.at(-1),
    samplesAtOrBelowCandidate: sampleScores.filter((x) =>
      x <= decodedScore.meanLog).length,
    syntheticPositivePlantRecoversExactly: true
  },
  status: "negative: no unknown plaintext or key recovered"
};
console.log(JSON.stringify(result, null, 2));
