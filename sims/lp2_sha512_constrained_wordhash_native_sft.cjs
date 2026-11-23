"use strict";

/**
 * Original-cipher word-hash inversion screen.
 *
 * A bounded, lossless n-symbol rank-28 codeword can be obtained from a SHA
 * digest: the initial glyph is a residue modulo29; the next n-1 glyphs are
 * residues modulo28, unranked against the previous visible glyph.
 *
 * The displayed source is a GP29 rune string with explicit printed words,
 * near-absent adjacent runic doublets, and an authenticated solved p56 SHA512
 * digest. This motivates the operation but does not authenticate it.
 *
 * All method variants are fixed in this file, ahead of inspecting any hit.
 * 2 period-available digests x 4 explicit hash input serializations
 * x 2 reading orientations = 16; no password, salt, offset, score tuning.
 *
 * Run: node sims/lp2_sha512_constrained_wordhash_native_sft.cjs
 * Node.js 22 on Windows 11, read-only, dependency-free CommonJS.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const source = parseSharedCorpus();
assert.equal(source.words.length, 2896);
assert.equal(source.runeCount, 12956);
assert.equal(source.crossPageWords, 32);
const runeOrd = new Map(gp.runes.map((r, i) => [r, i]));
const gpTokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * The same creator-source-attested DIGRAPH conventions as solved LP1:
 * ING->one NG rune; IO->one IA rune; QU->CW, V->U, K/Q->C, Z->S.
 * @param {string} original
 * @returns {number[]}
 */
function nativeGP(original) {
  const word = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (word.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const hit = gpTokens.find(t => word.startsWith(t.s, i));
      assert(hit, "GP29 alphabet missing " + word.slice(i));
      out.push(hit.i);
      i += hit.s.length;
    }
  }
  return out;
}

/**
 * @param {number[]} sourceSymbols
 * @returns {string}
 */
function digitKey(sourceSymbols) {
  return sourceSymbols.join(",");
}

/**
 * @param {Buffer} hashBytes
 * @param {number} n
 * @returns {number[]}
 */
function digestToNoDoublet(hashBytes, n) {
  let integer = BigInt("0x" + hashBytes.toString("hex"));
  const result = [Number(integer % 29n)];
  integer /= 29n;
  for (let k = 1; k < n; k++) {
    let v = Number(integer % 28n);
    integer /= 28n;
    if (v >= result[result.length - 1]) v++;
    result.push(v);
  }
  return result;
}

/**
 * Input spellings are all literally calculable from the putative Latin word.
 * @param {string} word
 * @param {number[]} native
 * @param {string} mode
 * @returns {Buffer}
 */
function spellingBytes(word, native, mode) {
  if (mode === "latin-lower") return Buffer.from(word, "utf8");
  if (mode === "latin-upper") return Buffer.from(word.toUpperCase(), "utf8");
  if (mode === "native-runes") {
    return Buffer.from(native.map(n => gp.runes[n]).join(""), "utf8");
  }
  if (mode === "gp-ordinals") return Buffer.from(native);
  throw new Error("invalid fixed source spelling");
}

const hashKinds = ["sha512", "sha256"];
const spellings = ["latin-lower", "latin-upper", "native-runes", "gp-ordinals"];
const directions = ["forward", "reverse"];
const src = source.words.map((word, i) => ({
  i,
  page: word.startPage,
  gp: [...word.runes].map(r => {
    assert(runeOrd.has(r));
    return runeOrd.get(r);
  }),
}));
assert.equal(src.reduce((s, w) => s + w.gp.length, 0), 12956);
const hashesByLength = new Map();
let internalDoublets = 0;
for (const w of src) {
  internalDoublets += w.gp.slice(1).filter((v, i) => v === w.gp[i]).length;
  if (!hashesByLength.has(w.gp.length)) hashesByLength.set(w.gp.length, new Map());
  const key = digitKey(w.gp);
  const arr = hashesByLength.get(w.gp.length).get(key) || [];
  arr.push(w);
  hashesByLength.get(w.gp.length).set(key, arr);
}
assert.equal(internalDoublets, 63);

const lexicon = fs.readFileSync(path.join(root,
  "resources/control/english_wordfreq_textblob.txt"), "utf8");
const seen = new Set();
const lex = [];
for (const line of lexicon.split(/\r?\n/)) {
  if (!line || line.startsWith(";")) continue;
  const m = /^([a-z]+)\s+\d+$/.exec(line.trim());
  if (!m || seen.has(m[1])) continue;
  seen.add(m[1]);
  const native = nativeGP(m[1]);
  if (native.length < 6 || !hashesByLength.has(native.length)) continue;
  lex.push({word: m[1], native});
}
assert(lex.length > 3000);
console.log("SOURCE", JSON.stringify({
  words: src.length, runes: source.runeCount, crossPageWords: source.crossPageWords,
  internalDoublets, dictionaryNativeLengthAtLeast6: lex.length
}));

const nativeCount = new Map();
for (const item of lex) nativeCount.set(item.native.length,
  (nativeCount.get(item.native.length) || 0) + 1);
const sourceCount = new Map();
for (const word of src) sourceCount.set(word.gp.length,
  (sourceCount.get(word.gp.length) || 0) + 1);
let expectedPerFamily = 0;
for (const [n, count] of sourceCount) {
  if (n < 6) continue;
  expectedPerFamily += count * (nativeCount.get(n) || 0) /
    (29 * Math.pow(28, n - 1));
}
console.log("UNIFORM_NULL", JSON.stringify({
  expectedAccidentalMatchesPerFamily: expectedPerFamily,
  expectedAcross16FixedFamilies: expectedPerFamily * 16,
  note: "Null assumes SHA output uniform and target words independent"
}));

let hits = 0;
for (const algorithm of hashKinds) for (const spelling of spellings) {
  for (const direction of directions) {
    const found = [];
    for (const item of lex) {
      const digest = crypto.createHash(algorithm)
        .update(spellingBytes(item.word, item.native, spelling)).digest();
      let encoded = digestToNoDoublet(digest, item.native.length);
      if (direction === "reverse") encoded = encoded.reverse();
      const group = hashesByLength.get(encoded.length);
      const target = group && group.get(digitKey(encoded));
      if (target) {
        for (const w of target) found.push({
          plaintext: item.word, page: w.page, wordIndex: w.i,
          ciphertext: w.gp.join(","), n: w.gp.length
        });
      }
    }
    found.sort((a, b) => a.wordIndex - b.wordIndex);
    hits += found.length;
    console.log("ORIGINAL", JSON.stringify({algorithm, spelling, direction,
      hits: found.length, matches: found.slice(0, 50)}));
  }
}
console.log("FULL_FAMILY_RESULT", JSON.stringify({
  variants: hashKinds.length * spellings.length * directions.length,
  sourceWordHits: hits, expectedUniformNullHits: expectedPerFamily * 16
}));

// Exact invertible information mapping is not claimed: dictionary inversion
// relies on target language, while encoder itself maps a finite hash output
// into a fixed-length forbidden-doublet GP29 code. Check a native English
// positive and its wrong-key/hash discrimination with untouched source schema.
for (const word of ["divinity", "revelation", "knowledge", "instruction"]) {
  const native = nativeGP(word);
  const cipher = digestToNoDoublet(crypto.createHash("sha512")
    .update(Buffer.from(word, "utf8")).digest(), native.length);
  const again = digestToNoDoublet(crypto.createHash("sha512")
    .update(Buffer.from(word, "utf8")).digest(), native.length);
  const wrong = digestToNoDoublet(crypto.createHash("sha256")
    .update(Buffer.from(word, "utf8")).digest(), native.length);
  assert.deepEqual(again, cipher);
  assert.notDeepEqual(wrong, cipher);
  assert(cipher.every((n, i) => n >= 0 && n < 29 &&
    (i === 0 || n !== cipher[i - 1])));
  console.log("POSITIVE", JSON.stringify({word,
    n: native.length, cipher: cipher.join(","), verified: true}));
}
console.log("PASS original-input hash-index inversion test");
