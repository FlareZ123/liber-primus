"use strict";
/**
 * Original-input, key-independent p55 fractionated-Morse quote search.
 *
 * The source manuscript p55 has only 25 distinct GP29 rune symbols, so a
 * 26-code standard fractionated Morse output cannot be excluded by alphabet
 * cardinality alone. This program tests a strictly bounded hypothesis:
 * the 76-rune p55 ciphertext, or any contiguous part of it, is a keyed
 * monoalphabetic recoding of exact conventional Morse trigrams for a passage
 * from one of the named source texts. The 26 code words are all length-three
 * strings over . - x except xxx; x denotes a Morse separator.
 *
 * Exact double-sided injection checks operate directly on the original
 * ciphertext and trigrams. All secret codeword permutations, both reading
 * directions and all trit phases are covered without optimization/crib tuning.
 * English normalization is uppercase A-Z, discarding punctuation.
 *
 * The supplied historical donor list is finite and a failed exact source
 * match cannot exclude original plaintext from an untested source or a
 * free-form standard keyed fractionated Morse cipher.
 *
 * Run on Windows 11: node sims/lp2_p55_fractionated_morse_quote_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const input = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const target = input.pages.find((p) => p.page === 55).indices;
assert.equal(target.length, 76);
assert.equal(new Set(target).size, 25);
const M = Object.freeze({
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
});
const alphabet = new Map();
for (const a of ".-x") for (const b of ".-x") for (const c of ".-x") {
  const t = a + b + c;
  if (t !== "xxx") alphabet.set(t, alphabet.size);
}
assert.equal(alphabet.size, 26);
/** @param {string} text @returns {string} */
function morse(text) {
  const words = (text.toUpperCase().match(/[A-Z]+/g) || [])
    .filter((word) => [...word].every((c) => M[c]));
  return words.map((word) => [...word].map((c) => M[c]).join("x")).join("xx");
}
/** @param {string} trits @param {number} phase @returns {Int8Array} */
function symbols(trits, phase) {
  const output = new Int8Array(Math.floor((trits.length - phase) / 3));
  for (let i = 0; i < output.length; i++) {
    const value = alphabet.get(trits.slice(phase + 3 * i, phase + 3 * i + 3));
    assert.notEqual(value, undefined, "Standard Morse is never xxx");
    output[i] = value;
  }
  return output;
}
/**
 * Search all admissible secret injective substitutions without enumerating
 * any of the 26! keys. A candidate mapping extends until a repeated GP
 * symbol or previously mapped Morse triple violates its consistency.
 *
 * @param {readonly number[]} cipher
 * @param {string} trits
 * @returns {{n:number,p:number,q:number,phase:number,reverse:boolean,symbols:number}}
 */
function longest(cipher, trits) {
  const xe = new Int32Array(29), xv = new Int8Array(29);
  const ye = new Int32Array(26), yv = new Int8Array(26);
  let epoch = 0, best = {n: 0, p: 0, q: 0, phase: 0, reverse: false, symbols: 0};
  for (const reverse of [false, true]) {
    const obs = reverse ? cipher.slice().reverse() : cipher;
    for (let phase = 0; phase < 3; phase++) {
      const donor = symbols(trits, phase);
      for (let p = 0; p < obs.length; p++) {
        for (let q = 0; q < donor.length; q++) {
          if (Math.min(obs.length - p, donor.length - q) <= best.n) continue;
          ++epoch;
          let n = 0, distinct = 0;
          while (p + n < obs.length && q + n < donor.length) {
            const x = obs[p + n], y = donor[q + n];
            if (xe[x] === epoch) {
              if (xv[x] !== y) break;
            } else if (ye[y] === epoch) {
              break;
            } else {
              xe[x] = epoch; xv[x] = y;
              ye[y] = epoch; yv[y] = x;
              distinct++;
            }
            n++;
          }
          if (n > best.n) best = {n, p, q, phase, reverse, symbols: distinct};
        }
      }
    }
  }
  return best;
}
const donors = [
  "resources/control/shakespeare_first300k.txt",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/blake-marriage-1906-gutenberg45315.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
  "resources/external/tennyson-lady-of-shalott-1832-mptc.txt",
  "resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt",
  "resources/external/kjv-passion-gospels-2014.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
];
const results = [];
for (const relative of donors) {
  const raw = fs.readFileSync(path.join(ROOT, relative), "utf8");
  const source = morse(raw);
  const match = longest(target, source);
  results.push({donor: relative, trits: source.length, ...match});
}
console.log("ORIGINAL", JSON.stringify(results, null, 2));
assert.ok(results.every((r) => r.n < target.length), "Full-length exact FM donor found; inspect plaintext and holdout immediately!");
const native = fs.readFileSync(path.join(ROOT, donors[0]), "utf8");
const trits = morse(native);
const streams = [symbols(trits, 0), symbols(trits, 1), symbols(trits, 2)];
let sample = null, sourcePhase = 0, sourceOffset = 0;
for (const [phase, s] of streams.entries()) {
  if (sample) break;
  for (let at = Math.floor(s.length * 0.70); at + target.length < s.length; at++) {
    const part = s.slice(at, at + target.length);
    if (new Set(part).size !== 25) continue;
    sample = part; sourcePhase = phase; sourceOffset = at;
    break;
  }
}
assert.ok(sample && sample.length === target.length, "Need a 25-type native control");
let state = 0x29f55aa1;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 0x100000000;
}
const mapping = Array.from({length:26}, (_, i) => i);
for (let i = 25; i > 0; i--) {
  const j = Math.floor(random() * (i + 1));
  [mapping[i], mapping[j]] = [mapping[j], mapping[i]];
}
// The symbol table maps every standard FM code to a unique GP rune.
const ciphertext = Array.from(sample, (x) => mapping[x]);
assert.equal(ciphertext.length, 76);
assert.equal(new Set(ciphertext).size, 25);
const inverse = new Map(mapping.map((v, k) => [v, k]));
assert.deepEqual(ciphertext.map((c) => inverse.get(c)), [...sample]);
const planted = longest(ciphertext, trits);
assert.equal(planted.n, 76, "Secret-key-positive source match must be recovered");
const expectedOffset = sourcePhase + 3 * sourceOffset;
console.log("POSITIVE", JSON.stringify({
  phase: sourcePhase, sourceOffset, donorTritOffset: expectedOffset,
  recoveredSymbols: planted.n, found: planted,
}));
console.log("DECISION: Exact secret 26-letter fractionated-Morse substitutions do not map any complete 76-rune original p55 register to a verbatim passage in the finite donor set. This is a quote exclusion only, not a general cipher exclusion.");
