"use strict";

/**
 * SFT: infer one secret GP29 offset for a causal preceding-word
 * GP-prime-sum -> within-word prime-totient alphabet shift.
 *
 * Human-visible premises (NOT cipher authentication): Gematria Primus
 * assigns a prime to each rune; solved LP2 p56 used phi(prime) shifts;
 * Cicada's signed 2016 clue describes words, numbers and direction.
 *
 * One frozen reversible architecture, no clock/key variation:
 * prior_0 = 3301 mod 29;
 * prior_w = sum(GPprime(C[w-1])) mod 29 for w > 0;
 * C[w][j] = (P[w][j] + prime[prior_w + b + j] - 1) mod 29,
 * b in 0..28, prime indexed from zero, j zero-based inside each
 * actual printed word (including words carried across physical pages).
 *
 * Training language model: Emerson source-native within-word GP trigrams,
 * Dirichlet 0.5, no knowledge of original cipher. Hold-out source-native
 * plants are sampled from Shakespeare and Gibran, preserving the EXACT
 * 2896 original printed word lengths. Different-cipher controls use a
 * reversible GP29 previous-ciphertext nonzero-step state machine with a
 * low adjacent-repeat rate. Select b using only the first 1448 words.
 *
 * Original decision: key selected on p0..p2; p40..p53 held out. Native
 * controls score >= -7.47, wrong-family scores <= -12.21; the frozen
 * -9.5 nats/trigram threshold splits these without testing original.
 *
 * NOT a claimed LP2 decryption or a general exclusion of state machines.
 * Run locally: node sims/lp2_wordprime_phi_smallstate_identifiability_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const shared = parseSharedCorpus();
const map = new Map(gp.runes.map((r, i) => [r, i]));
const words = shared.words.map(w => ({
  x: [...w.runes].map(r => map.get(r)),
  startPage: w.startPage
}));
assert.equal(words.length, 2896);
assert.equal(shared.runeCount, 12956);
assert.deepEqual(words.flatMap(w => w.x),
  gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
const lengths = words.map(w => w.x.length);
assert.ok(lengths.every(n => n >= 1 && n <= 14));

const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** Source-attested 2014 spellings: ING -> GP index21, IO -> index27.
 * @param {string} text Original English input.
 * @returns {number[][]} GP29 words.
 */
function nativeEnglish(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    const w = [];
    for (let j = 0; j < word.length;) {
      if (word.startsWith("ING", j)) { w.push(21); j += 3; }
      else if (word.startsWith("IO", j)) { w.push(27); j += 2; }
      else {
        const t = tokens.find(x => word.startsWith(x.s, j));
        assert(t, "English GP token: " + word);
        w.push(t.i);
        j += t.s.length;
      }
    }
    out.push(w);
  }
  return out;
}

const emerson = nativeEnglish(read("resources/control/emerson_essays_2944.txt"));
const sources = [
  { name: "Shakespeare", words: nativeEnglish(read("resources/control/shakespeare_first300k.txt")) },
  { name: "Gibran", words: nativeEnglish(read("resources/control/gibran_prophet_58585.txt")) }
];
const M = 29, M3 = 29 ** 3, ALPHA = 0.5, THRESHOLD = -9.5;
const TRAIN_END = 1448;
const trigrams = new Int32Array(M3);
let trainedCount = 0;
for (const w of emerson) for (let j = 2; j < w.length; j++) {
  trigrams[(w[j - 2] * M + w[j - 1]) * M + w[j]]++;
  trainedCount++;
}
assert.equal(trainedCount, 167823);
const weights = Float64Array.from(trigrams, count =>
  Math.log((count + ALPHA) / (trainedCount + ALPHA * M3)));
const primes = [];
for (let n = 2; primes.length < 80; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
  if (prime) primes.push(n);
}
const shifts = primes.map(p => (p - 1) % M);
const mod = x => (x % M + M) % M;
const primeSum = word => word.reduce((s, x) => s + gp.prime[x], 0) % M;

/** @param {number[][]} native
 * @param {number} seed
 */
function plantOriginalLengths(native, seed) {
  const pools = Array.from({ length: 15 }, () => []);
  for (const word of native) if (word.length <= 14) pools[word.length].push(word);
  assert(lengths.every(n => pools[n].length));
  let state = seed >>> 0;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  return lengths.map(n => pools[n][next() % pools[n].length]);
}

/** Reversible original family, source-fixed prime clock and one 29-state seed.
 * @param {number[][]} plaintext
 * @param {number} b
 */
function encrypt(plaintext, b) {
  assert(Number.isInteger(b) && b >= 0 && b < M);
  const output = [];
  let prev = 3301 % M;
  for (const word of plaintext) {
    const base = (prev + b) % M;
    const cipher = word.map((p, j) => (p + shifts[base + j]) % M);
    output.push(cipher);
    prev = primeSum(cipher);
  }
  return output;
}

/** @param {number[][]} ciphertext
 * @param {number} b
 */
function decrypt(ciphertext, b) {
  assert(Number.isInteger(b) && b >= 0 && b < M);
  const output = [];
  let prev = 3301 % M;
  for (const cipher of ciphertext) {
    const base = (prev + b) % M;
    output.push(cipher.map((c, j) => mod(c - shifts[base + j])));
    prev = primeSum(cipher);
  }
  return output;
}

/** Different but low-doublet reversible stateful cipher.
 * The GP rune EA/index28 directly emits a duplicate, otherwise
 * each plaintext rune causes a nonzero previous-ciphertext step.
 * @param {number[][]} plaintext
 */
function wrongFamily(plaintext) {
  let prev = 0;
  return plaintext.map(word => word.map(p => {
    const c = (prev + p + 1) % M;
    prev = c;
    return c;
  }));
}

/** @param {number[][]} data
 * @param {(index:number)=>boolean} included
 */
function logTrigram(data, included) {
  let count = 0, logsum = 0;
  for (let i = 0; i < data.length; i++) {
    if (!included(i)) continue;
    const w = data[i];
    for (let j = 2; j < w.length; j++) {
      logsum += weights[(w[j - 2] * M + w[j - 1]) * M + w[j]];
      count++;
    }
  }
  return { n: count, logMean: logsum / count };
}

/** Exact exhaustive constrained inference; no language-model generation.
 * @param {number[][]} ciphertext
 * @param {(index:number)=>boolean} train
 * @param {(index:number)=>boolean} holdout
 */
function infer(ciphertext, train, holdout) {
  const candidates = [];
  for (let b = 0; b < 29; b++) {
    const text = decrypt(ciphertext, b);
    candidates.push({
      b,
      fit: logTrigram(text, train),
      heldout: logTrigram(text, holdout)
    });
  }
  candidates.sort((a, b) => b.fit.logMean - a.fit.logMean);
  return candidates;
}

const firstHalf = i => i < TRAIN_END;
const secondHalf = i => i >= TRAIN_END;
const positive = [], wrong = [];
for (const source of sources) for (let i = 0; i < 5; i++) {
  const seed = 0x3301 + 100 * i + (source.name === "Gibran" ? 991 : 0);
  const native = plantOriginalLengths(source.words, seed);
  const trueB = (i * 7 + source.name.length) % M;
  const cipher = encrypt(native, trueB);
  assert.deepEqual(decrypt(cipher, trueB), native,
    "correct planted model and b must exactly recover native text");
  const fitted = infer(cipher, firstHalf, secondHalf);
  const rank = fitted.findIndex(x => x.b === trueB) + 1;
  const wrongTop = infer(wrongFamily(native), firstHalf, secondHalf)[0];
  positive.push({
    source: source.name, trial: i, trueB, recoveredB: fitted[0].b,
    rank, train: fitted[0].fit.logMean,
    heldout: fitted[0].heldout.logMean,
    secondBest: fitted[1].fit.logMean
  });
  wrong.push({
    source: source.name, trial: i, fittedB: wrongTop.b,
    train: wrongTop.fit.logMean, heldout: wrongTop.heldout.logMean
  });
}
assert(positive.every(x => x.rank === 1 && x.train > THRESHOLD &&
  x.heldout > THRESHOLD), "blind source-native key recovery");
assert(wrong.every(x => x.train < THRESHOLD &&
  x.heldout < THRESHOLD), "selection-matched wrong-family rejection");

const original = words.map(w => w.x);
const chapterA = i => words[i].startPage < 3;
const chapterB = i => words[i].startPage >= 40 && words[i].startPage < 53;
const aWords = words.filter((_, i) => chapterA(i));
const bWords = words.filter((_, i) => chapterB(i));
assert.equal(aWords.length, 158);
assert.equal(bWords.length, 669);
assert.equal(aWords.reduce((n, w) => n + w.x.length, 0), 729);
assert.equal(bWords.reduce((n, w) => n + w.x.length, 0), 3008);
const observed = infer(original, chapterA, chapterB);
const independent = infer(original, chapterB, chapterA);
assert.equal(observed[0].fit.n, 418);
assert.equal(observed[0].heldout.n, 1683);
assert.equal(observed[0].b, 14);
assert.equal(independent[0].b, 18);
assert(Math.abs(observed[0].fit.logMean + 12.111817781594768) < 1e-9);
assert(Math.abs(observed[0].heldout.logMean + 12.318446132161347) < 1e-9);
const candidate = decrypt(original, observed[0].b);
assert.deepEqual(encrypt(candidate, observed[0].b), original,
  "lossless complete original source re-encryption");
const visible = included => candidate.filter((w, i) => included(i))
  .flat().slice(0, 80).map(i => gp.translit[i]).join(" ");
const output = {
  status: "Finite source-motivated family rejected on original; no new plaintext",
  provenance: {
    originalRunes: 12956, words: 2896,
    sourceGrammar: "GP prime sums, solved p56 phi(prime), signed 2016 word-number-direction clue",
    sourceInputs: [
      "resources/lp2-transcription.txt",
      "resources/liber-primus/lp2-corpus.json",
      "resources/control/emerson_essays_2944.txt",
      "resources/control/shakespeare_first300k.txt",
      "resources/control/gibran_prophet_58585.txt"
    ]
  },
  architecture: {
    shift: "phi(prime[ (GPprimeSum(previous_cipher_word)%29 + b + j) ]) mod29",
    firstPreviousSum: 3301 % 29, keyChoices: 29,
    keyBits: Math.log2(29),
    origin: "zero-based word-local j",
    resets: "none; carry words are complete",
    allNonKeyParametersFrozen: true
  },
  training: {
    source: "Emerson", GPTrigrams: trainedCount,
    smoothing: ALPHA, threshold: THRESHOLD,
    selectionWords: TRAIN_END, originalScoreUnit: "within-word nats per GP trigram"
  },
  blindPlants: positive,
  wrongFamily: wrong,
  controlledDecision: {
    nativeRecovered: positive.filter(x => x.rank === 1).length,
    of: positive.length, wrongFamilyAccepted: wrong
      .filter(x => x.train >= THRESHOLD).length,
    nativeMinimumTrain: Math.min(...positive.map(x => x.train)),
    wrongMaximumTrain: Math.max(...wrong.map(x => x.train))
  },
  original: {
    firstChapter: "physical p0–2", heldoutChapter: "physical p40–53",
    firstRunes: 729, secondRunes: 3008,
    keySelectedOnlyFromFirst: observed[0].b,
    firstScore: observed[0].fit,
    secondHeldoutScore: observed[0].heldout,
    independentlyFavoredSecondKey: independent[0].b,
    bestSecondScore: independent[0].fit,
    nextFirstKeys: observed.slice(1, 4),
    verifiedCompleteReencryption: true,
    accepted: observed[0].fit.logMean >= THRESHOLD &&
      observed[0].heldout.logMean >= THRESHOLD,
    first80GP: visible(chapterA), second80GP: visible(chapterB)
  },
  scope: "One prior-cipher-word prime-sum + local phi(prime) shift; does not exclude other low-state programs, ciphers, non-English plaintext or hidden pads."
};
assert.equal(output.original.accepted, false);
console.log(JSON.stringify(output, null, 2));
