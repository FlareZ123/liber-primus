"use strict";
/**
 * Source-locked p57 inner-rune key -> p53 red passage, with p55 heldout.
 * The solved PARABLE says "shed our own circumferences"; removing each
 * p57 body-word's first and final runes produces exactly 50 GP29 indices.
 * The original p53 colored passage has 51 runes and a single ciphertext F.
 *
 * This evaluates three historically interpretable 50-rune key registers:
 * GP index, the rune's GP prime modulo 29, and Euler phi(prime) modulo 29.
 * The two additive signs and the conjectural plaintext-F bypass are frozen.
 * A 50-symbol ciphertext-minus-presumed-plaintext pad is also applied to
 * previously untouched original p54 and p55. No plaintext is claimed.
 *
 * Run from repository root: node sims/lp2_p57_instar_p53red_key_source_gate_sft.cjs
 * Node.js 22, CommonJS, built-in modules only, no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/lp2-transcription.txt");
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const mod = value => ((value % 29) + 29) % 29;
const roman = indices => indices.map(index => corpus.translit[index]).join("");
const ioc = indices => {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (indices.length * (indices.length - 1));
};

// The original master has 57 non-empty '%' page segments since physical p50
// carries no GP runes. The last segment is the complete solved physical p57.
const sourcePages = transcription.split("%");
assert.equal(sourcePages.length, 57);
const lastPage = sourcePages[56].replace(/[\/\r\n]/gu, "");
const words = (lastPage.match(/[ᚠ-᛿]+/gu) || []).map(glyphs =>
  [...glyphs].map(rune => {
    const index = runeToIndex.get(rune);
    assert.notEqual(index, undefined);
    return index;
  }));
assert.equal(words.length, 20);
assert.equal(words[0].length, 7); // PARABLE heading
assert.deepEqual(words.flat(), corpus.pages.find(p => p.page === 57).indices);
const body = words.slice(1);
assert.equal(body.length, 19);
const inner50 = body.flatMap(word => word.slice(1, -1));
assert.equal(inner50.length, 50);
const outer38 = body.flatMap(word => [word[0], word[word.length - 1]]);
assert.equal(outer38.length, 38);
assert.equal(inner50.length + outer38.length, 88);

const p53 = corpus.pages.find(page => page.page === 53).indices;
const redSpan = ink.pages.find(page => page.page === 53).red_spans[0];
assert.equal(redSpan.start, 128);
assert.equal(redSpan.length, 51);
const red51 = p53.slice(redSpan.start, redSpan.start + redSpan.length);
assert.deepEqual(red51.map(index => corpus.runes[index]).join(""), redSpan.runes);
assert.deepEqual(red51.flatMap((value, i) => value === 0 ? [i] : []), [38]);
const p54 = corpus.pages.find(page => page.page === 54).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.deepEqual(p55.flatMap((value, i) => value === 0 ? [i] : []), [15, 25, 41]);

const keys = [
  {name: "GP-index", symbols: inner50},
  {name: "GP-prime", symbols: inner50.map(index => corpus.prime[index] % 29)},
  {name: "GP-prime-totient", symbols: inner50.map(index => (corpus.prime[index] - 1) % 29)}
];

/** @param {number[]} cipher @param {number[]} key
 * @param {number} sign @param {boolean} bypass
 * @returns {number[]} */
function decode(cipher, key, sign, bypassPositions) {
  const excluded = new Set(bypassPositions);
  let clock = 0;
  return cipher.map((value, position) => {
    if (excluded.has(position)) {
      assert.equal(value, 0);
      return 0;
    }
    return mod(value + sign * key[clock++ % key.length]);
  });
}

/** @param {number[]} plain @param {number[]} key
 * @param {number} sign @param {boolean} bypass
 * @returns {number[]} */
function encode(plain, key, sign, bypassPositions) {
  const excluded = new Set(bypassPositions);
  let clock = 0;
  return plain.map((value, position) => {
    if (excluded.has(position)) {
      assert.equal(value, 0);
      return 0;
    }
    return mod(value - sign * key[clock++ % key.length]);
  });
}
const nativePositive = corpus.pages.find(page => page.page === 57).indices.slice(0, 51);
assert.equal(nativePositive.length, 51);
const table = [];
for (const {name, symbols} of keys) {
  assert.equal(symbols.length, 50);
  for (const sign of [-1, 1]) {
    for (const bypass of [false, true]) {
      const redSkip = bypass ? [38] : [];
      const p55Skip = bypass ? [15, 25, 41] : [];
      const decoded = decode(red51, symbols, sign, redSkip);
      assert.deepEqual(encode(decoded, symbols, sign, redSkip), red51);
      const known = nativePositive.slice();
      if (bypass) known[38] = 0;
      const plant = encode(known, symbols, sign, redSkip);
      assert.deepEqual(decode(plant, symbols, sign, redSkip), known);
      const heldout = decode(p55, symbols, sign, p55Skip);
      table.push({
        key: name, sign, ciphertextFBypass: bypass,
        redGP29IoC: ioc(decoded),
        p55GP29IoC: ioc(heldout),
        redRomanized: roman(decoded)
      });
    }
  }
}
assert.equal(table.length, 12);
const strongest = table.reduce((x, y) => y.redGP29IoC > x.redGP29IoC ? y : x);
assert.equal(strongest.key, "GP-prime");
assert.equal(strongest.sign, -1);
assert.equal(strongest.ciphertextFBypass, true);
assert.ok(Math.abs(strongest.redGP29IoC - 0.047058823529411764) < 1e-12);

// Alternative model: presuming the 50 known internal runes are the literal
// source plaintext encrypted into the 50 non-F positions of the p53 span
// recovers an arbitrary 50-symbol pad; reuse on p54 and p55 is an
// independently checkable, previously untouched prediction.
const selectedCipher = red51.filter((_, index) => index !== 38);
assert.equal(selectedCipher.length, inner50.length);
const recoveredPad = selectedCipher.map((value, i) => mod(value - inner50[i]));
const replay = selectedCipher.map((_, i) => mod(inner50[i] + recoveredPad[i]));
assert.deepEqual(replay, selectedCipher);
const padDecode = (cipher, bypass) => {
  let clock = 0;
  return cipher.map(value => bypass && value === 0 ? 0
    : mod(value - recoveredPad[clock++ % recoveredPad.length]));
};
const padResults = {
  recoveredPad50IoC: ioc(recoveredPad),
  p55_noBypassIoC: ioc(padDecode(p55, false)),
  p55_literalFBypassIoC: ioc(padDecode(p55, true)),
  p54_noBypassIoC: ioc(padDecode(p54, false)),
  p54_literalFBypassIoC: ioc(padDecode(p54, true))
};
assert.ok(Math.abs(padResults.p55_noBypassIoC - 0.03614035087719298) < 1e-12);
assert.ok(Math.abs(padResults.p55_literalFBypassIoC - 0.03964912280701754) < 1e-12);
console.log(JSON.stringify({
  exactOriginalSources: {
    sourcePage57BodyWords: body.length,
    p57BodyInteriorKeyRunes: inner50.length,
    p57BodyOuterRunes: outer38.length,
    p53RedRunes: red51.length,
    p53RedOnlyFIndex: 38,
    p55RuneCount: p55.length
  },
  knownClearP57IoC: ioc(corpus.pages.find(page => page.page === 57).indices),
  directKeyCandidates: table,
  p57AssumedKnownPlaintextPadReuse: padResults,
  note: "Bounded negative original-cipher gate. A 50/51 size match alone does not select a key or prove identical plaintext."
}, null, 2));
