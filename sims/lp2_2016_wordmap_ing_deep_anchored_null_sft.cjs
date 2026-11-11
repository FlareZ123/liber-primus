"use strict";
/**
 * Authenticated 2016 43-word base58 address hypothesis after the independently
 * source-attested ING token. A source-preserving exact 58-page phase null
 * and a matched 50,000-shuffle GP-prime-alphabet null are familywise over
 * the NG and ING readings. No unknown plaintext is assumed or recovered.
 *
 * Single runnable test file (SFT), read only, Node.js 22 CommonJS:
 * node sims/lp2_2016_wordmap_ing_deep_anchored_null_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/lp2-transcription.txt");
const clear = signed.slice(signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
assert.ok(clear.startsWith("Hello."));
const words = clear.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(words.length, 43);
const wordTypes = [...new Set(words.map(x => x.toLowerCase()))];
assert.equal(wordTypes.length, 34);
const tokens = corpus.translit.map((token, index) =>
  ({token: token.toLowerCase(), index}))
  .sort((a, b) => b.token.length - a.token.length);
/**
 * Canonical GP encoding with an explicitly controlled additional -ING rune.
 * The historical phonemic ING reading is independently attested in solved LP.
 * @param {string} word
 * @param {boolean} ing
 * @returns {number[]}
 */
function encode(word, ing) {
  let text = word.toLowerCase().replace(/qu/g, "cw").replace(/k/g, "c")
    .replace(/v/g, "u").replace(/z/g, "s").replace(/q/g, "c");
  const result = [];
  while (text.length > 0) {
    const match = ing && text.startsWith("ing")
      ? {token: "ing", index: 21}
      : tokens.find(item => text.startsWith(item.token));
    assert.ok(match, "cannot GP-encode " + word);
    result.push(match.index);
    text = text.slice(match.token.length);
  }
  return result;
}
/** @param {string} source */
function printedWords(source) {
  return source.replace(/[\/\r\n]/gu, "")
    .split(/[-.&$§,:!?]/u)
    .map(part => (part.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const originalPages = transcription.split("%");
assert.equal(originalPages.length, 57);
const pages = Array.from({length: 58}, (_, page) => page === 50
  ? [] : printedWords(originalPages[page > 50 ? page - 1 : page]));
assert.equal(pages[50].length, 0);
assert.equal(pages[56].length, 25);
assert.equal(pages[14][1], "ᚠᚩᛚᛞ");

const knownP56Words = ("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT " +
  "HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE")
  .split(" ");
assert.equal(knownP56Words.length, 25);
assert.equal(knownP56Words[1], "END");
assert.equal(knownP56Words[4], "DEEP");

/** Exact solved LP2 p56 prime-totient regression, no heuristic cribs. */
function firstPrimes(n) {
  const out = [];
  for (let p = 2; out.length < n; p++) {
    let prime = true;
    for (let k = 2; k * k <= p; k++) if (p % k === 0) prime = false;
    if (prime) out.push(p);
  }
  return out;
}
const p56cipher = corpus.pages[56].indices;
assert.equal(p56cipher.length, 85);
const primes = firstPrimes(85);
let k = 0;
const p56decoded = p56cipher.map((x, i) => {
  if (i === 56) {
    assert.equal(x, 0);
    return 0; // Authentic literal-F nonconsuming exception.
  }
  const shift = primes[k++] - 1;
  return ((x - shift) % 29 + 29) % 29;
});
const knownP56Plain = knownP56Words.flatMap(word => encode(word, false));
assert.deepEqual(p56decoded, knownP56Plain);
assert.equal(k, 84);

const encoded = wordTypes.map(word => ({
  word, regular: encode(word, false), ing: encode(word, true)
}));
const gpSum = (ids, primeWeights) =>
  ids.reduce((sum, index) => sum + primeWeights[index], 0);
/**
 * Unique solved-p56 page-word hits. Repeated source words count once.
 * @param {number[]} primeWeights
 * @param {number} pagePhase
 * @param {number} wordOrigin
 * @param {boolean} allowIng
 */
function p56Hits(primeWeights, pagePhase, wordOrigin, allowIng) {
  const hits = new Map();
  for (const record of encoded) {
    const sum = gpSum(allowIng ? record.ing : record.regular, primeWeights);
    const page = (sum + pagePhase) % 58;
    const index = Math.floor(sum / 58) + wordOrigin;
    if (page === 56 && index >= 0 && index < knownP56Words.length) {
      if (!hits.has(index)) hits.set(index, []);
      hits.get(index).push(record.word);
    }
  }
  return [...hits].sort((a, b) => a[0] - b[0])
    .map(([index, sourceWords]) =>
      ({page: 56, wordIndex: index, plain: knownP56Words[index], sourceWords}));
}
const sourceNG = p56Hits(corpus.prime, 0, 0, false);
const sourceING = p56Hits(corpus.prime, 0, 0, true);
assert.deepEqual(sourceNG,
  [{page: 56, wordIndex: 1, plain: "END", sourceWords: ["their"]}]);
assert.deepEqual(sourceING, [
  {page: 56, wordIndex: 1, plain: "END", sourceWords: ["their"]},
  {page: 56, wordIndex: 4, plain: "DEEP", sourceWords: ["meaning"]}
]);
const number = record => gpSum(record.ing, corpus.prime);
assert.equal(number(encoded.find(x => x.word === "meaning")), 288);
assert.equal(gpSum(encoded.find(x => x.word === "meaning").regular,
  corpus.prime), 319);
assert.equal(number(encoded.find(x => x.word === "their")), 114);
assert.equal(number(encoded.find(x => x.word === "lies")), 224);
assert.equal(gpSum(encoded.find(x => x.word === "the").regular,
  corpus.prime), 72);

// Exact source-preserving page-phase negative control; the signed-message
// words, duplicate structure, original LP2 page and word inventory all stay
// unchanged. Familywise count BOTH independently plausible ING readings.
const phaseNull = [];
const perReadingCounts = {regular: [0, 0, 0], withING: [0, 0, 0]};
for (let phase = 0; phase < 58; phase++) {
  const ng = p56Hits(corpus.prime, phase, 0, false).length;
  const ing = p56Hits(corpus.prime, phase, 0, true).length;
  assert.ok(ng <= 2 && ing <= 2);
  perReadingCounts.regular[ng]++;
  perReadingCounts.withING[ing]++;
  phaseNull.push({phase, countNG: ng, countING: ing,
    familywiseCount: Math.max(ng, ing)});
}
assert.deepEqual(perReadingCounts,
  {regular: [30, 23, 5], withING: [30, 23, 5]});
const atLeastTwo = phaseNull.filter(x => x.familywiseCount >= 2)
  .map(x => x.phase);
assert.deepEqual(atLeastTwo, [0, 26, 27, 30, 42, 51]);
const wrongWordOrigins = [-1, 1].map(shift =>
  ({shift, selected: p56Hits(corpus.prime, 0, shift, true)}));
assert.deepEqual(wrongWordOrigins.map(x =>
  x.selected.map(z => z.plain)), [["AN", "THE"], ["WITHIN", "WEB"]]);

// Wrong-alphabet controls: independently shuffle the original 29 GP prime
// weights, preserving exactly the source-message 43-word orthography, all
// repeated-word identities, the original prime-weight multiset, both ING
// interpretations, and the entire original p56 word inventory.
let state = 0x20164358;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const nTrials = 50000;
const hist = Array(8).fill(0);
for (let trial = 0; trial < nTrials; trial++) {
  const weights = corpus.prime.slice();
  for (let j = weights.length - 1; j > 0; j--) {
    const a = random32() % (j + 1);
    [weights[j], weights[a]] = [weights[a], weights[j]];
  }
  const count = Math.max(p56Hits(weights, 0, 0, false).length,
    p56Hits(weights, 0, 0, true).length);
  hist[count]++;
}
assert.deepEqual(hist, [27201, 17749, 4385, 614, 49, 2, 0, 0]);
const upperCount = hist.slice(2).reduce((sum, value) => sum + value, 0);
assert.equal(upperCount, 5050);
process.stdout.write(JSON.stringify({
  source: {signedWords: words.length, uniqueWordTypes: wordTypes.length,
    physicalPages: pages.length, solvedP56Words: knownP56Words.length,
    p56CipherDecodedExactly: p56decoded.length,
    signedMeaningGPsum: {NG: 319, ING: 288},
    fixedRule: "page = sum mod 58; wordIndex = floor(sum/58), zero based"},
  original: {NG: sourceNG, ING: sourceING,
    note: "All p56 target plaintext is independently solved, no LP2 unknown text."},
  exactPhaseFamilywise: {phaseCount: 58, phasesAtLeastTwo: atLeastTwo,
    upperTail: atLeastTwo.length / 58, countsByReading: perReadingCounts,
    wrongWordOrigins},
  wrongAlphabetFamilywise: {trialCount: nTrials, seed: "0x20164358",
    countsByMax: hist, atLeastTwo: upperCount,
    addOneUpperTail: (upperCount + 1) / (nTrials + 1)},
  decision: "Two solved-word matches are insufficiently specific to authenticate the zero-based, mod58 signed-word address grammar. No new plaintext or key."
}, null, 2) + "\n");
