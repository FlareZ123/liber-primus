"use strict";

/**
 * Source-registered 85-event-bearing-word cipher-crib gate.
 *
 * The 86 same-page identical-adjacent-rune events occupy 85 of the 2,896
 * original printed words. This asks one bounded question: could the first
 * repeated glyph from each such word literally reproduce the 85-rune solved
 * p56 plaintext/ciphertext through any fixed, secret 29-rune relabeling?
 *
 * Full per-symbol frequency profiles are invariant under every fixed
 * alphabet bijection. Their inequality gives a complete impossibility proof
 * for this literal readout, independently of a language score or fitted key.
 *
 * Standalone: node sims/lp2_doublet_85_eventword_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const master = fs.readFileSync(path.join(root,
  "resources/transcriptions/liber_primus_master.txt"), "utf8");

/** @param {number[]} values @returns {number[]} */
function profile(values) {
  const freq = Array(29).fill(0);
  for (const x of values) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    freq[x]++;
  }
  return freq.filter(v => v > 0).sort((a, b) => b - a);
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const x of values) freq[x]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function agreement(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((n, x, i) => n + Number(x === b[i]), 0);
}

/** @param {string} text @returns {number[]} */
function tokenizeGP(text) {
  const tokens = corpus.translit.map((token, value) => ({token, value}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text[i] === " ") { i++; continue; }
    const match = tokens.find(item => text.startsWith(item.token, i));
    assert.ok(match, "Unknown GP token at " + text.slice(i));
    out.push(match.value);
    i += match.token.length;
  }
  return out;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const output = [];
  for (let n = 2; output.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) output.push(n);
  }
  return output;
}

const index = new Map(corpus.runes.map((r, i) => [r, i]));
const sectionText = master.slice(master.indexOf("\n\n") + 2).split("$")
  .slice(7, 16);
assert.equal(sectionText.length, 9);
const printedWords = sectionText.flatMap(section => section
  .split(/[-.&§]/u)
  .map(part => Array.from(part).filter(r => index.has(r)).map(r => index.get(r)))
  .filter(w => w.length > 0));
assert.equal(printedWords.length, 2896);

const physicalPages = corpus.pages.slice(0, 56);
const symbols = physicalPages.flatMap(page => page.indices);
assert.equal(symbols.length, 12956);
const pageStarts = new Set();
let cursor = 0;
for (const page of physicalPages) {
  pageStarts.add(cursor);
  cursor += page.indices.length;
}
assert.equal(cursor, symbols.length);

let position = 0;
const eventWords = [];
const eventSites = [];
for (let wordId = 0; wordId < printedWords.length; wordId++) {
  const word = printedWords[wordId];
  const hits = [];
  for (let j = 0; j < word.length; j++) {
    const site = position + j;
    if (site > 0 && !pageStarts.has(site) &&
        symbols[site] === symbols[site - 1]) {
      hits.push({site, rune: symbols[site]});
      eventSites.push(site);
    }
  }
  if (hits.length) eventWords.push({wordId, hits});
  position += word.length;
}
assert.equal(position, 12956);
assert.equal(eventSites.length, 86);
assert.equal(eventWords.length, 85);
assert.deepEqual(eventWords.filter(w => w.hits.length > 1), [
  {wordId: 1476, hits: [
    {site: 6611, rune: 3},
    {site: 6617, rune: 18}
  ]}
]);

// Freeze the literal rule: read the glyph at the *first* repeat site per word.
const carrier = eventWords.map(w => w.hits[0].rune);
assert.equal(carrier.length, 85);
const solvedCipher = corpus.pages[56].indices;
const solvedPlain = tokenizeGP("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(solvedCipher.length, 85);
assert.equal(solvedPlain.length, 85);

// Reproduce the authentic solved p56 prime-totient cipher, including the
// sole literal-F key-clock interruption at original p56 rune position 56.
const primes = firstPrimes(85);
let keyClock = 0;
const shifts = solvedCipher.map((_, i) => i === 56 ? 0 :
  (primes[keyClock++] - 1) % 29);
assert.equal(keyClock, 84);
const genuineInverse = solvedCipher.map((x, i) => i === 56 ? 0 :
  (x - shifts[i] + 29) % 29);
assert.deepEqual(genuineInverse, solvedPlain);

// Independent direct consumer: reuse the exact solved-page prime-totient rule,
// where a literal ciphertext F (GP index zero) is copied without consuming
// a prime. This is a hypothesis about the 85-event carrier, not an LP2 key.
// A true p56 positive control must pass with the same decoder.
const nativePrimeTotient = (cipher, direction) => {
  let clock = 0;
  const plain = cipher.map(x => x === 0 ? 0 :
    ((x + direction * (primes[clock++] - 1)) % 29 + 29) % 29);
  return {plain, consumedPrimes: clock};
};
const nativeSolved = nativePrimeTotient(solvedCipher, -1);
assert.deepEqual(nativeSolved.plain, solvedPlain);
assert.equal(nativeSolved.consumedPrimes, 84);
const eventPrimeSubtract = nativePrimeTotient(carrier, -1);
const eventPrimeAdd = nativePrimeTotient(carrier, 1);
assert.equal(eventPrimeSubtract.consumedPrimes, 81);
assert.equal(eventPrimeAdd.consumedPrimes, 81);
assert.ok(Math.abs(ioc(eventPrimeSubtract.plain) - 0.031932773109243695) < 1e-13);
assert.ok(Math.abs(ioc(eventPrimeAdd.plain) - 0.04145658263305322) < 1e-13);
// Source target position 56 is not a literal F in this readout, so a fixed
// copy of the p56 exception clock would not be source consistent.
assert.equal(carrier[56], 24);

// Any static relabeling, even one of all 29! possibilities, preserves
// profile. The source profiles differ, so no search is needed.
const eventProfile = profile(carrier);
const solvedCipherProfile = profile(solvedCipher);
const solvedPlainProfile = profile(solvedPlain);
assert.notDeepEqual(eventProfile, solvedCipherProfile);
assert.notDeepEqual(eventProfile, solvedPlainProfile);
assert.deepEqual(eventProfile, [7,6,6,5,4,4,4,4,4,4,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,1,1,1]);

// Hidden-relabeling positive control: every genuine permutation preserves
// its original profile, even though the identities and positions change.
const permutation = Array.from({length: 29}, (_, i) => (5 * i + 7) % 29);
const planted = solvedPlain.map(x => permutation[x]);
assert.deepEqual(profile(planted), solvedPlainProfile);
assert.deepEqual(planted.map(x => (6 * (x - 7 + 29)) % 29), solvedPlain);
assert.notDeepEqual(profile(carrier), profile(planted));

assert.equal(agreement(carrier, solvedCipher), 4);
assert.equal(agreement(carrier, solvedPlain), 2);
assert.equal(agreement(carrier, shifts), 5);
assert.equal(agreement(carrier, corpus.pages[57].indices.slice(0, 85)), 1);
assert.ok(Math.abs(ioc(carrier) - 0.03361344537815126) < 1e-13);

process.stdout.write(JSON.stringify({
  originalUnsolvedRunes: symbols.length,
  printedWords: printedWords.length,
  adjacentSamePageEvents: eventSites.length,
  eventBearingWords: eventWords.length,
  doubledEventWord: eventWords.find(w => w.hits.length === 2),
  readoutRule: "first repeated ciphertext rune of each event-bearing word",
  carrierLength: carrier.length,
  carrierGP29IoC: ioc(carrier),
  solvedPlainGP29IoC: ioc(solvedPlain),
  authenticP56PrimeTotientCarrierTransfer: {
    literalFCopyAndPrimeNonconsumption: true,
    eventCarrierSubtractIoC: ioc(eventPrimeSubtract.plain),
    eventCarrierAddIoC: ioc(eventPrimeAdd.plain),
    consumedPrimes: eventPrimeSubtract.consumedPrimes,
    first25SymbolsSubtract: eventPrimeSubtract.plain.slice(0,25).map(i => corpus.translit[i]).join(" "),
    first25SymbolsAdd: eventPrimeAdd.plain.slice(0,25).map(i => corpus.translit[i]).join(" "),
    recoveredUnknownOriginalPlaintext: false
  },
  directMatches: {
    solvedP56Cipher: agreement(carrier, solvedCipher),
    solvedP56Plain: agreement(carrier, solvedPlain),
    solvedP56PrimeTotientKey: agreement(carrier, shifts),
    solvedP57First85: agreement(carrier, corpus.pages[57].indices.slice(0, 85))
  },
  carrierFrequencyProfile: eventProfile,
  solvedCipherFrequencyProfile: solvedCipherProfile,
  solvedPlainFrequencyProfile: solvedPlainProfile,
  anyFixedAlphabetBijectionCanMatchP56: false,
  authenticP56PositiveControl: true,
  secretPermutationPlantPositiveControl: true,
  result: "No p56 plaintext or source-selected key recovered."
}, null, 2) + "\n");
