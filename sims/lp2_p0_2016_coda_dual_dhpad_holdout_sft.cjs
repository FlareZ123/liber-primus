"use strict";

/**
 * Source-frozen signed-2016 YOU->WILL / GOOD->LUCK p50-p0 double holdout.
 * Tests one *reusable* [K*a,a,A-B,A+B] GP29 pad under the proposed K=2.
 *
 * Single-file Windows 11 / Node.js 22 CommonJS test; run from repo root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = path.join(__dirname, "..", "resources");
const corpus = JSON.parse(fs.readFileSync(
  path.join(base, "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(base, "liber-primus", "lp2-grid-256.json"), "utf8"));
const original = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8");
const byRune = new Map(corpus.runes.map((r, i) => [r, i]));
const gpTokens = corpus.translit.map((name, i) => ({ name, i }))
  .sort((a, b) => b.name.length - a.name.length);

/** @param {number} x */
function mod29(x) { return ((x % 29) + 29) % 29; }

/** @param {number} base @param {number} exp @param {number} prime */
function powMod(base, exp, prime) {
  let result = 1;
  for (let i = 0; i < exp; ++i) result = result * base % prime;
  return result;
}

/** @param {string} word */
function spellGP(word) {
  let source = word.toUpperCase()
    .replaceAll("QU", "CW").replaceAll("V", "U")
    .replaceAll("K", "C").replaceAll("Q", "C").replaceAll("Z", "S");
  const symbols = [];
  while (source.length) {
    const token = gpTokens.find(t => source.startsWith(t.name));
    assert.ok(token, "Unencodable GP source word: " + source);
    symbols.push(token.i);
    source = source.slice(token.name.length);
  }
  return symbols;
}

/** @param {string} source */
function gp0(source) { return spellGP(source).reduce((s, n) => s + n, 0); }

// A printed rune-word can continue across a physical line (slash).
// Use p0's original hyphen/period word delimiters, preserving page-local
// GP rune offsets exactly; never synthesize word positions from a crib.
const p0Raw = original.split("%")[0];
const originalWords = [];
let localIndex = 0, wordStart = 0, word = [];
function endWord() {
  if (word.length) {
    originalWords.push({ start: wordStart, length: word.length, runes: word });
    word = [];
  }
}
for (const glyph of p0Raw) {
  if (byRune.has(glyph)) {
    if (!word.length) wordStart = localIndex;
    word.push(byRune.get(glyph));
    localIndex++;
  } else if (glyph === "/" || /\s/u.test(glyph)) {
    // Physical wrap is not a printed word delimiter.
  } else endWord();
}
endWord();
const p0 = corpus.pages[0].indices;
assert.equal(localIndex, 262);
assert.deepEqual(originalWords.flatMap(w => w.runes), p0);

/** @param {number} start */
function printedWordAt(start) {
  const result = originalWords.find(word => word.start === start);
  assert.ok(result, "Signed-source p50 address does not select a whole p0 word");
  return result;
}
assert.equal(gp0("YOU"), 30);
assert.equal(gp0("GOOD"), 35);
assert.equal(grid.bytes[30], 141); // Original printed p50[30] = 2L.
assert.equal(grid.bytes[35], 39);  // Original printed p50[35] = 0d.
assert.equal(grid.bytes[210], 6); // Original printed p50[210] = 06.

const will = spellGP("WILL"); // GP [7,10,20,20]
const luck = spellGP("LUCK"); // K->C, GP [20,1,5,5]
assert.deepEqual(will, [7, 10, 20, 20]);
assert.deepEqual(luck, [20, 1, 5, 5]);
const willCipher = printedWordAt(grid.bytes[30]);
const luckCipher = printedWordAt(grid.bytes[35]);
assert.equal(willCipher.length, will.length);
assert.equal(luckCipher.length, luck.length);
assert.deepEqual(willCipher.runes, [19, 16, 9, 18]);
assert.deepEqual(luckCipher.runes, [8, 17, 9, 27]);

const difference = (cipher, plain) => cipher.map((c, i) => mod29(c - plain[i]));
const kw = difference(willCipher.runes, will);
const kl = difference(luckCipher.runes, luck);
assert.deepEqual(kw, [12, 6, 18, 27]);
assert.deepEqual(kl, [17, 16, 4, 22]);

// The preexisting reciprocal p38 complete word is typed conditionally
// [g, K*a, B] = [5,12,19]. Source p50[210]=06 supplies a=6.
// The distinct original DH23 calculation gives K=19^6 mod23 = 2.
assert.deepEqual(corpus.pages[38].indices.slice(54, 57), [5, 12, 19]);
const a = grid.bytes[210];
const K = mod29(12 * 5); // Inverse(6) mod29 = 5.
assert.equal(mod29(a * 5), 1);
assert.equal(K, 2);
assert.equal(powMod(19, 6, 23), K);
const A = powMod(5, a, 23);
const printedWillPad = [mod29(K * a), a, mod29(A - 19), mod29(A + 19)];
assert.deepEqual(printedWillPad, kw);

// Transfer only this exact *typed* four-rune key grammar to the independent
// signed coda pair GOOD->LUCK. The first two pad slots are K*a and a for
// any secret a, so the invariant k0 = K*k1 must hold even if a changes.
const willEquation = mod29(kw[0] - K * kw[1]);
const luckEquation = mod29(kl[0] - K * kl[1]);
assert.equal(willEquation, 0);
assert.equal(luckEquation, 14);
assert.notEqual(luckEquation, 0);

// Positive inverse control on native solved p57 GP29 clear runes.
// Plant a different private a=16 with the same K2, and replay a 4-symbol
// source native word (no invented plain alphabet or fitted state).
const nativePlant = corpus.pages[57].indices.slice(0, 4);
assert.equal(nativePlant.length, 4);
const testA = 16;
const plantPad = [mod29(K * testA), testA, 4, 22];
const encrypted = nativePlant.map((p, i) => mod29(p + plantPad[i]));
const decrypted = difference(encrypted, plantPad);
assert.deepEqual(decrypted, nativePlant);
assert.equal(mod29(plantPad[0] - K * plantPad[1]), 0);

console.log(JSON.stringify({
  signedPairs: ["YOU→WILL", "GOOD→LUCK"],
  originalP50: { fromYOU: [30, 141], fromGOOD: [35, 39], sourceExponent: [210, 6] },
  originalP0: {
    will: { offset: 141, cipher: willCipher.runes, plain: will, impliedPad: kw },
    luck: { offset: 39, cipher: luckCipher.runes, plain: luck, impliedPad: kl }
  },
  originalP38Packet: [5, 12, 19],
  candidateSharedK: K,
  originalWillDHRegeneration: printedWillPad,
  necessaryInvariant: "k0 − K*k1 = 0 mod29",
  willResidue: willEquation,
  luckResidue: luckEquation,
  result: "GOOD→LUCK fails this reusable K=2 four-rune DH-pad grammar",
  nativePlantRecovered: nativePlant.length
}, null, 2));
