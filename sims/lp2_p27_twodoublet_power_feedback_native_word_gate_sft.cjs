"use strict";

/**
 * Original p27 12-rune word constrains the entire nonzero-secret five-back
 * power-feedback family from its two disjoint immediate-repeat events.
 * This is a finite native-English lexicon test and adversarial existence
 * witness: multiple postselected words can encrypt to the SAME ciphertext
 * under different free nonzero keys and five unconstrained initial runes.
 * Do not treat reencryption as recovered creator plaintext.
 *
 * Windows 11 Node22 CJS SFT:
 * node sims/lp2_p27_twodoublet_power_feedback_native_word_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const indexed = new Map(source.runes.map((glyph, i) => [glyph, i]));
const text = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const allWords = (text.match(new RegExp(
  "[" + source.runes.join("") + "]+", "gu")) || [])
  .map(word => Array.from(word, glyph => indexed.get(glyph)));
const flat = source.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(allWords.length, 2896);
assert.equal(flat.length, 12956);
assert.deepEqual(allWords.flat(), flat);

const wordIndex = 1476;
const word = allWords[wordIndex];
assert.deepEqual(word, [12,4,9,15,3,3,5,24,18,26,18,18]);
const wordStart = allWords.slice(0, wordIndex)
  .reduce((sum, part) => sum+part.length, 0);
assert.equal(wordStart, 6606);
const indices = Array.from({length: 7}, (_, i) => i+5);
const marks = indices.filter(j => word[j] === word[j-1]);
assert.deepEqual(marks, [5,11]);

const lexicon = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/g)) {
  const match = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!match) continue;
  const sourceGP = encodeSourceNativeGP(match[1]);
  if (sourceGP.length !== word.length) continue;
  lexicon.set(match[1], {gp: sourceGP, frequency: Number(match[2])});
}
assert.equal(lexicon.size, 772);

/** @param {number} n @param {number} exponent */
function power(n, exponent) {
  let result = 1;
  for (let i = 0; i < exponent; i++) result = result*n % 29;
  return result;
}
/** @param {number[]} candidate @param {number} exponent */
function validSignature(candidate, exponent) {
  return indices.every(j =>
    (word[j] === word[j-1]) ===
    (candidate[j] === power(candidate[j-5], exponent)));
}
/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;
/** @param {number} value */
function inverse(value) {
  assert(value > 0 && value < 29);
  for (let k = 1; k < 29; k++)
    if (value*k % 29 === 1) return k;
  throw Error("unreachable inverse");
}

/**
 * Fit the five otherwise completely free nonzero key slots on original
 * ciphertext for one candidate. All five initial ciphertext/plaintext runes
 * are independent. This is a deliberately adversarial overfit control:
 * exactly re-encrypting under arbitrary k is not evidence of the real key.
 * @param {string} name
 * @param {number} exponent
 */
function originalOverfit(name, exponent) {
  const candidate = lexicon.get(name)?.gp;
  assert(candidate && validSignature(candidate, exponent));
  const keys = [];
  const reen = word.slice(0, 5);
  const recovered = candidate.slice(0, 5);
  for (let j = 5; j < 12; j++) {
    const delta = mod(word[j] - word[j-1]);
    const residue = mod(candidate[j] - power(candidate[j-5], exponent));
    if (delta === 0) {
      assert.equal(residue, 0);
      keys.push(1);
    } else {
      assert.notEqual(residue, 0);
      keys.push(mod(delta*inverse(residue)));
    }
    assert(keys.at(-1) > 0);
    reen.push(mod(reen[j-1] + keys.at(-1) *
      (candidate[j] - power(recovered[j-5], exponent))));
    recovered.push(mod(power(recovered[j-5], exponent) +
      mod(word[j] - word[j-1]) * inverse(keys.at(-1))));
  }
  assert.deepEqual(reen, word);
  assert.deepEqual(recovered, candidate);
  return {plaintext: name, exponent, arbitraryFirstFive: candidate.slice(0, 5),
    fittedKeysAtJ5Through11: keys, cipherReconstructed: reen.length,
    nativeRecovered: recovered.length};
}

const scored = Array.from({length: 28}, (_, i) => {
  const exponent = i+1;
  const candidates = [...lexicon.entries()]
    .filter(([, v]) => validSignature(v.gp, exponent))
    .sort((a,b) => b[1].frequency-a[1].frequency)
    .map(x => x[0]);
  return {exponent, matchingCount: candidates.length,
    bestCandidates: candidates.slice(0, 6)};
});
assert.deepEqual(
  [3, 19, 21].map(e => scored[e-1].matchingCount), [0,0,0]);
assert.deepEqual(scored[1].bestCandidates, ["indisposition"]);
assert.deepEqual(scored[5].bestCandidates.slice().sort(),
  ["confederation","consideration","enfranchised"].sort());

const ambiguities = [
  originalOverfit("indisposition", 2),
  originalOverfit("consideration", 6),
  originalOverfit("confederation", 6),
  originalOverfit("enfranchised", 6)
];
console.log(JSON.stringify({
  status: "Original word1476 local necessary condition; no plaintext claimed",
  original: {page:27,globalWord:1476,globalRuneOffset:6606,
    indices:word, marks, eligibleSites:indices.length},
  lexicon: {source: "pinned TextBlob GP-encoded dictionary", gp12Words: lexicon.size},
  sourceMotivated: scored.filter(x => [2,3,6,8,19,21].includes(x.exponent)),
  exploratoryAllExponents: scored,
  exactlyReencryptedCompetingArbitraryKeyCandidates: ambiguities,
  decision: "Both source-selected cubic powers and aggregate-best e21 have no intact GP12 English witness in the pinned lexicon. Multiple other powers overfit this same original word, so their inverse is not authenticated."
}, null, 2));
