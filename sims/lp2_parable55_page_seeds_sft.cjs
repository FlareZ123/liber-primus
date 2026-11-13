"use strict";
/**
 * A source-constrained Parable->unsolved-page key experiment.
 * The solved 2014 p57 PARABLE contains 20 words, 95 GP29 runes. Its own
 * instruction "shed our own circumferences; find the divinity within"
 * motivates removing BOTH boundary runes from each word. This produces
 * 55 original-source runes, exactly one for each rune-bearing p0–p55 page.
 *
 * Test only source-natural consumers: matching page-initial/final runes,
 * and the p56 native totient/prime cipher with one source-selected start
 * phase per page. No tuned per-page phase or textual crib.
 *
 * Run: node sims/lp2_parable55_page_seeds_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const lastPage = transcription.split("%").at(-1)
  .replace(/\/\s*/g, "").replace(/\s+/g, "");
const words = lastPage.split(/[\-.$&§]/).filter(Boolean)
  .map(word => [...word].map(rune => {
    assert.ok(runeIndex.has(rune), "Unexpected solved rune");
    return runeIndex.get(rune);
  }));
const parable = corpus.pages.find(p => p.page === 57).indices;
assert.equal(words.length, 20);
assert.equal(parable.length, 95);
assert.deepEqual(words.flat(), parable);
const interior = words.flatMap(word => word.slice(1, -1));
const pages = corpus.pages.filter(page => page.page <= 55 && page.runic_count);
assert.equal(pages.length, 55);
assert.deepEqual(corpus.pages.filter(p => p.page <= 55 && !p.runic_count).map(p => p.page), [50]);
assert.equal(interior.length, pages.length);
const mod = x => ((x % 29) + 29) % 29;
const translit = indices => indices.map(i => corpus.translit[i]).join("");
const ioc = indices => {
  const counts = new Array(29).fill(0);
  for (const i of indices) counts[i]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (indices.length * (indices.length - 1));
};
const primes = [];
for (let candidate = 2; primes.length < 1000; candidate++) {
  if (primes.every(p => p * p > candidate || candidate % p !== 0))
    primes.push(candidate);
}
/** @param {number[]} text @param {number} start @returns {number[]} */
function phiDecipher(text, start) {
  return text.map((rune, i) => mod(rune - (primes[start + i] - 1)));
}
/** Authentic p56 has exactly one proven literal-F exception at index56. */
function decodeKnownPage56(cipher) {
  let keyAt = 0;
  return cipher.map((rune, at) => {
    if (at === 56) {
      assert.equal(rune, 0);
      return 0;
    }
    return mod(rune - (primes[keyAt++] - 1));
  });
}
const p56 = corpus.pages.find(p => p.page === 56).indices;
const solved = decodeKnownPage56(p56);
assert.equal(translit(solved),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
assert.ok(ioc(solved) > 0.065);
const plantPhase = 17;
const plantCipher = solved.map((rune, i) => mod(rune + primes[plantPhase + i] - 1));
assert.deepEqual(phiDecipher(plantCipher, plantPhase), solved);

const acrostic = [];
for (const edge of ["first", "last"]) {
  const letters = pages.map(page => edge === "first" ? page.indices[0] : page.indices.at(-1));
  for (const sign of [-1, 1]) {
    const plaintext = letters.map((letter, i) => mod(letter + sign * interior[i]));
    acrostic.push({edge, sign, ioc: ioc(plaintext), text: translit(plaintext)});
  }
}
const models = [];
for (const mode of ["ordinal", "prime-value"]) {
  const decoded = pages.map((page, i) => phiDecipher(
    page.indices, mode === "ordinal" ? interior[i] : corpus.prime[interior[i]]));
  const flat = decoded.flat();
  models.push({
    mode,
    fullIoc: ioc(flat),
    strongestPerPageIoc: Math.max(...decoded.map(ioc)),
    meanPerPageIoc: decoded.map(ioc).reduce((a,b)=>a+b,0)/decoded.length,
    p55: translit(decoded.at(-1)),
    p0Start: translit(decoded[0]).slice(0, 100)
  });
}
const p55 = pages.at(-1).indices;
const p57BoundaryKeys = {
  "all-20-heads": words.flatMap(word => word.slice(1)),
  "all-20-tails": words.flatMap(word => word.slice(0,-1)),
  "body-19-heads": [ ...words[0], ...words.slice(1).flatMap(word=>word.slice(1)) ],
  "body-19-tails": [ ...words[0], ...words.slice(1).flatMap(word=>word.slice(0,-1)) ]
};
const p55Candidates = [];
for (const [name, key] of Object.entries(p57BoundaryKeys)) {
  const target = key.length === 75 ? p55.slice(1) : p55;
  assert.equal(key.length, target.length);
  for (const sign of [-1, 1]) {
    const output = target.map((letter, i)=>mod(letter+sign*key[i]));
    p55Candidates.push({name, sign, ioc:ioc(output),
      first60:translit(output).slice(0,60)});
  }
}
console.log(JSON.stringify({
  source: "p57 cleartext words, word-by-word interior/rim",
  sourceWordCount: words.length,
  sourceRunes: parable.length,
  interiors: interior.length,
  interiorTransliteration: translit(interior),
  recipientRunicPages: pages.map(p => p.page),
  skippedNumericOnlyPage: 50,
  solvedP56PositiveControl: {
    method: "sequential phi(prime), exactly one literal F at position56",
    ioc:ioc(solved), fullyVerified:true
  },
  syntheticP56Phase17PositiveControl:true,
  rawUnsolvedIoc:ioc(pages.flatMap(p=>p.indices)),
  acrostic,
  perPageTotientModels:models,
  p55TerminalBoundaryKeys:p55Candidates,
  decision:"No native plaintext under direct p57 55-symbol acrostic, per-page phi prime-clock seeds, or 75/76-symbol adjacent-p55 additive keys; count equality is an unselected structural observation",
  scope:"No transpositions, reverse page order, extra phases, word reordering, or custom key schedules tested"
},null,2));
