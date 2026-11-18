"use strict";

/**
 * Self-word prime-ordinal totient cipher: plaintext-to-ciphertext dictionary attack.
 *
 * Candidate sender: compute the sum S of GP-prime weights of the *plaintext*
 * word; start the prime counter at the S-th prime (one-based); for each
 * plaintext non-F rune add phi(p) = p-1 modulo 29, advancing the counter.
 * An F is copied literally and does not advance the counter, as on solved
 * LP2 p56. Reset the counter at each printed word boundary.
 *
 * The sender is well-defined without knowing the ciphertext. Its exact
 * inverse is dictionary enumeration; no ciphertext-word prime sum is fitted.
 * The model is a hypothesis, not a Cicada-authenticated encryption rule.
 *
 * Run on Windows Node 22: node sims/lp2_word_selfprime_forwarddictionary_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const native = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const glyphToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const {words, runeCount, crossPageWords} = parseSharedCorpus();
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);
const original = gp.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const observedWords = words.map(w => [...w.runes].map(c => glyphToIndex.get(c)));
assert.deepEqual(observedWords.flat(), original);
const tokens = gp.translit.map((spelling, value) => ({spelling, value}))
  .sort((a, b) => b.spelling.length - a.spelling.length);

/**
 * Attested, source-calibrated GP spelling: ING and IO digraphs precede the
 * general longest-spelling lookup. All output values are GP29 indexes.
 * @param {string} word
 * @returns {number[]}
 */
function latinToGP(word) {
  const latin = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < latin.length;) {
    if (latin.startsWith("ING", i)) {out.push(21); i += 3;}
    else if (latin.startsWith("IO", i)) {out.push(27); i += 2;}
    else {
      const t = tokens.find(x => latin.startsWith(x.spelling, i));
      assert(t, "Unmapped GP text: " + word);
      out.push(t.value);
      i += t.spelling.length;
    }
  }
  return out;
}
const textToWords = text => (text.match(/[A-Za-z]+/g) || []).map(latinToGP);
const nativeToWords = text => (text.match(/[\u16a0-\u16ff]+/gu) || [])
  .map(w => [...w].map(c => glyphToIndex.get(c)));

/** @param {number[]} word */
const signature = word => word.join(",");

/**
 * Generate a list long enough for every candidate native GP word.
 * The 300,000 ceiling provides 25,997 successive prime indexes.
 * @returns {number[]}
 */
function generatePrimes() {
  const limit = 300000;
  const marked = new Uint8Array(limit + 1);
  const output = [];
  for (let n = 2; n <= limit; n++) {
    if (!marked[n]) {
      output.push(n);
      if (n * n <= limit) {
        for (let k = n * n; k <= limit; k += n) marked[k] = 1;
      }
    }
  }
  return output;
}
const primes = generatePrimes();

/**
 * First party p56 F-transparent prime-totient step, but *hypothetical*
 * plaintext-word-sum prime index reset. This is an exact forward sender.
 * @param {number[]} plainWord
 * @returns {number[]}
 */
function encrypt(plainWord) {
  const sum = plainWord.reduce((s, index) => s + gp.prime[index], 0);
  assert(sum > 0 && sum + plainWord.length < primes.length);
  let keyAt = sum - 1;
  return plainWord.map(p => {
    if (p === 0) return 0;
    const key = (primes[keyAt++] - 1) % 29;
    return (p + key) % 29;
  });
}

const trainingPaths = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const tokenCounts = [];
const vocabulary = new Map();
function register(word) {
  const key = signature(word);
  vocabulary.set(key, (vocabulary.get(key) || 0) + 1);
}
for (const section of native.sections) {
  for (const word of nativeToWords(section.source_text)) register(word);
}
for (const file of trainingPaths) {
  const ws = textToWords(read(file));
  tokenCounts.push(ws.length);
  for (const w of ws) register(w);
}
const encodeLookup = new Map();
const lengthTotals = new Map();
let maxPlainPrimeSum = 0;
for (const plain of vocabulary.keys()) {
  const word = plain.split(",").map(Number);
  const sum = word.reduce((s, x) => s + gp.prime[x], 0);
  maxPlainPrimeSum = Math.max(maxPlainPrimeSum, sum);
  const cipher = signature(encrypt(word));
  const candidate = encodeLookup.get(cipher);
  if (candidate) candidate.push(plain);
  else encodeLookup.set(cipher, [plain]);
}
for (const cipher of encodeLookup.keys()) {
  const n = cipher.split(",").length;
  lengthTotals.set(n, (lengthTotals.get(n) || 0) + 1);
}

const observedMatches = [];
for (let i = 0; i < observedWords.length; i++) {
  const candidates = encodeLookup.get(signature(observedWords[i]));
  if (candidates) {
    observedMatches.push({wordIndex:i, length:observedWords[i].length,
      ciphertext: observedWords[i].map(v => gp.translit[v]).join(" "),
      candidates: candidates.slice(0, 4).map(s => s.split(",")
        .map(v => gp.translit[Number(v)]).join(" "))});
  }
}
const matchesAtLeast = n => observedMatches.filter(x => x.length >= n).length;
assert.equal(vocabulary.size, 12267);
assert.equal(encodeLookup.size, 12258);
assert.equal(observedMatches.length, 97);
assert.equal(matchesAtLeast(3), 19);
assert.equal(matchesAtLeast(4), 2);
assert.equal(matchesAtLeast(5), 0);

const p57 = native.sections.find(section => section.name === "p57_parable");
assert(p57);
const solvedP57 = nativeToWords(p57.source_text);
assert.equal(solvedP57.length, 20);
const positivePlant = solvedP57.map(encrypt);
assert.equal(positivePlant.length, 20);
assert(positivePlant.every((c, i) =>
  (encodeLookup.get(signature(c)) || []).includes(signature(solvedP57[i]))));

const withheldFile = "resources/control/orthodox_daily_prayers_pg34981.txt";
const heldout = textToWords(read(withheldFile));
const heldoutLong = heldout.filter(x => x.length >= 5);
const heldoutCoverage = heldoutLong.filter(w => vocabulary.has(signature(w))).length;
const heldoutCipherCoverage = heldoutLong.filter(w =>
  (encodeLookup.get(signature(encrypt(w))) || []).includes(signature(w))).length;
assert.equal(heldoutCoverage, heldoutCipherCoverage);
assert(heldoutLong.length > 100);
assert(heldoutCoverage > 0);

const expectation = observedWords.reduce((sum, word) => {
  if (word.length < 5) return sum;
  return sum + (lengthTotals.get(word.length) || 0) / (29 ** word.length);
}, 0);
const adjacentPairs = new Set(observedMatches.map(x => x.wordIndex));
const adjacent = observedMatches.filter(x => adjacentPairs.has(x.wordIndex + 1)).length;
const summary = {
  conclusion: "No original word of 5 or more GP runes matches a direct full-word sender",
  mechanism: "plaintext GP prime-sum -> sum-th prime -> phi(prime) F-bypass word reset",
  original: {runes:runeCount, words:words.length, crossPageWords,
    matchedWords:observedMatches.length, matchedLength3:matchesAtLeast(3),
    matchedLength4:matchesAtLeast(4), matchedLength5:matchesAtLeast(5),
    matchedAdjacentPairs:adjacent, longWordChanceNullExpectation:expectation},
  dictionary: {trainingTokenCounts:tokenCounts,
    distinctPlain:vocabulary.size, distinctEncrypted:encodeLookup.size,
    maxPlainPrimeSum},
  withheldNativeEnglish: {file:withheldFile, longWords:heldoutLong.length,
    longWordsCovered:heldoutCoverage,
    coverage:heldoutCoverage / heldoutLong.length},
  positiveControl: {solvedP57Words:solvedP57.length,
    senderEncryptDictionaryRecover:positivePlant.length},
  originalFourRuneCandidates: observedMatches.filter(x => x.length >= 4)
};
console.log(JSON.stringify(summary, null, 2));
