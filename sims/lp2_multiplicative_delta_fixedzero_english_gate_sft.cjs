"use strict";
/**
 * Key-independent source-native exclusion of shifted multiplicative-difference
 * GP29 encoders. Node.js 22/CommonJS read-only standalone SFT.
 *
 * Model: C[p,i] = C[p,i-1] + k[p,i]*(P[p,i]-b) mod 29,
 * where EVERY nonzero k[p,i] can be a different hidden value, b is one
 * fixed plaintext symbol, and first glyphs of 55 physical pages are free.
 * Hence C[p,i] == C[p,i-1] iff P[p,i] == b, independently of all secrets.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const N = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(N, 12956);
assert.equal(pages.length, 55);

const transcript = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/\/\r?\n/g, "").replace(/\r?\n/g, "").replace(/[%&$]/g, "");
const pattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const runeMap = new Map(gp.runes.map((v, i) => [v, i]));
const wordStrings = transcript.match(pattern) || [];
const sourceWords = [];
let consumed = 0;
for (const text of wordStrings) {
  const symbols = Array.from(text, x => runeMap.get(x));
  if (consumed === N) break;
  assert(consumed + symbols.length <= N);
  sourceWords.push({ start: consumed, symbols });
  consumed += symbols.length;
}
assert.equal(consumed, N);
assert.equal(sourceWords.length, 2896);
const ciphertext = pages.flatMap(p => p.indices);
assert.deepEqual(sourceWords.flatMap(w => w.symbols), ciphertext);

const pageStarts = new Set();
let offset = 0;
for (const p of pages) { pageStarts.add(offset); offset += p.indices.length; }
let repeatEvents = 0;
for (let i = 1; i < N; i++) {
  if (!pageStarts.has(i) && ciphertext[i] === ciphertext[i - 1]) repeatEvents++;
}
assert.equal(repeatEvents, 86);
const wordMask = word => word.symbols.flatMap((v, j) => {
  const i = word.start + j;
  return i && !pageStarts.has(i) && ciphertext[i] === ciphertext[i - 1] ? [j] : [];
});
const p27start = pages.filter(p => p.page < 27).reduce((n, p) => n + p.indices.length, 0);
const p27end = p27start + pages.find(p => p.page === 27).indices.length;
const twin = sourceWords.filter(w => w.start >= p27start && w.start < p27end &&
  w.symbols.length === 12 && wordMask(w).join(",") === "5,11");
assert.equal(twin.length, 1, "original p27 two-disjoint-doublet word");
assert.equal(twin[0].symbols.map(i => gp.translit[i]).join(""), "EORNSOOCAEYEE");

// Identical source-calibrated orthography to the repository's
// lp2_native_gp_source_orthography_sft.cjs: ING->NG and IO->IA precede
// descending GP tokens, with Cicada's documented K/V/QU merges.
const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
function encodeNativeGP(original) {
  const word = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  if (!/^[A-Z]+$/.test(word)) return [];
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (word.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const token = tokens.find(t => word.startsWith(t.s, i));
    assert(token, "unmapped character in source-native word");
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}
const lexSources = [
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/blake_song_of_liberty_train.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
const lex = new Map();
for (const file of lexSources) {
  for (const w of read(file).match(/[A-Za-z]{2,}/g) || []) {
    const word = w.toUpperCase();
    if (!lex.has(word)) lex.set(word, encodeNativeGP(word));
  }
}
lex.set("CIRCUMFERENCES", encodeNativeGP("CIRCUMFERENCES"));
assert.equal(encodeNativeGP("CIRCUMFERENCES").length, 14);
const eligible = [];
const twelve = [...lex].filter(([, v]) => v.length === 12);
for (let b = 0; b < 29; b++) {
  const candidates = twelve.filter(([, v]) =>
    v.flatMap((x, i) => x === b ? [i] : []).join(",") === "5,11");
  if (candidates.length) eligible.push({
    b, rune: gp.translit[b], nWords: candidates.length,
    examples: candidates.slice(0, 4).map(([word]) => word)
  });
}
assert.equal(twelve.length, 872);
assert.deepEqual(eligible.map(x => x.rune), ["C","N","S","T","E","L","D","A"]);

// Sliding over EVERY contiguous N-rune source-native literary window.
// This is an empirical source-register test; it does not assume independent
// English letters or derive a universal probability.
const referenceTexts = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const minima = [];
const firstPageFreeAllowance = repeatEvents + pages.length; // 86+55 =141
for (const file of referenceTexts) {
  const text = read(file);
  const plain = (text.match(/[A-Za-z]+/g) || []).flatMap(encodeNativeGP);
  assert(plain.length >= N);
  const perGlyph = [];
  for (const item of eligible) {
    const b = item.b;
    let n = 0;
    for (let i = 0; i < N; i++) n += Number(plain[i] === b);
    let min = n, max = n, argmin = 0;
    for (let i = N; i < plain.length; i++) {
      n += Number(plain[i] === b) - Number(plain[i - N] === b);
      if (n < min) { min = n; argmin = i - N + 1; }
      if (n > max) max = n;
    }
    assert(min > firstPageFreeAllowance,
      file + " would require more equal-cipher pairs than original: " + item.rune);
    perGlyph.push({ rune: item.rune, min, max, argmin });
  }
  minima.push({ source: file, gpRunes: plain.length, perGlyph });
}

// A fully reversible secret per-symbol model confirms the algebraic
// equality marker and exactly recovers a source-native 12956-rune plant.
const plantText = read(referenceTexts[1]);
const plant = (plantText.match(/[A-Za-z]+/g) || [])
  .flatMap(encodeNativeGP).slice(0, N);
assert.equal(plant.length, N);
function inverse29(x) {
  for (let a = 1; a < 29; a++) if ((a * x) % 29 === 1) return a;
  throw new Error("nonunit multiplier");
}
let at = 0, plantedRepeats = 0;
for (const p of pages) {
  const seed = (p.page * 11 + 9) % 29;
  const decoded = [], encoded = [];
  for (let i = 0; i < p.indices.length; i++) {
    const P = plant[at + i];
    if (i === 0) {
      encoded.push((P + seed) % 29);
      decoded.push((encoded[i] - seed + 29) % 29);
    } else {
      const key = 1 + (i * 13 + p.page * 7) % 28;
      encoded.push((encoded[i - 1] + key * ((P - 15 + 29) % 29)) % 29);
      decoded.push(((encoded[i] - encoded[i - 1] + 29) *
        inverse29(key) + 15) % 29);
      if (encoded[i] === encoded[i - 1]) plantedRepeats++;
      assert.equal(Number(encoded[i] === encoded[i - 1]), Number(P === 15));
    }
  }
  assert.deepEqual(decoded, plant.slice(at, at + p.indices.length));
  at += p.indices.length;
}
assert.equal(at, N);
console.log(JSON.stringify({
  result: "PASS", original: { N, physicalPages: pages.length,
    words: sourceWords.length, samePageComparisons: N - pages.length,
    repeats: repeatEvents, pageStartAllowance: firstPageFreeAllowance,
    p27Twin: twin[0].symbols.map(i => gp.translit[i]).join(""),
    p27Mask: wordMask(twin[0]) },
  lexicon: { wordTypes: lex.size, nativeGpLength12: twelve.length, eligible },
  windowMinima: minima, positivePlant: { runes: N, repeated: plantedRepeats,
    decryptedAndReencrypted: true }
}, null, 2));
