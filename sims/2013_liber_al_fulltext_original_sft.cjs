"use strict";

/**
 * Frozen original-LP2 test of the historically selected 2013 Book of the Law
 * as an unshifted GP29 running key and as a literal plaintext word-length crib.
 * The exact archived source chapters remain separate, in I/II/III order.
 * No fitted phase, word permutation, text source or alphabet is permitted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const original = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
const words = parseSharedCorpus().words;
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);

const gp = new Map(corpus.translit.map((s, i) => [s, i]));
const mod29 = n => (n % 29 + 29) % 29;
/** @param {string} source @returns {number[]} */
function normalize(source) {
  const letters = source.replace(/^\s*\d+[.:]\s*/gm, "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/K/g, "C").replace(/V/g, "U")
    .replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < letters.length; i++) {
    const pair = letters.slice(i, i + 2);
    if (gp.has(pair)) { out.push(gp.get(pair)); i++; }
    else if (gp.has(letters[i])) out.push(gp.get(letters[i]));
  }
  return out;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const f = Array(29).fill(0);
  for (const i of values) f[i]++;
  return f.reduce((s, n) => s + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
const sources = ["I", "II", "III"].map(ch =>
  fs.readFileSync(path.join(root, "resources", "external",
    "2013-book-of-law-" + ch + ".txt"), "utf8"));
const chapterKeys = sources.map(normalize);
const fullKey = chapterKeys.flat();
assert.deepEqual(chapterKeys.map(k => k.length), [7003,7103,7524]);
assert.equal(fullKey.length, 21630);

/** @param {number[]} input @param {number[]} key
 * @param {"minus"|"plus"|"beaufort"} rule
 * @returns {number[]} */
function decode(input, key, rule) {
  return input.map((c, i) => {
    const k = key[i % key.length];
    return mod29(rule === "minus" ? c - k
      : rule === "plus" ? c + k : k - c);
  });
}
/** @param {number[]} input @param {number[]} key
 * @param {"minus"|"plus"|"beaufort"} rule
 * @returns {number[]} */
function encode(input, key, rule) {
  return input.map((p, i) => {
    const k = key[i % key.length];
    return mod29(rule === "minus" ? p + k
      : rule === "plus" ? p - k : k - p);
  });
}
const p57 = corpus.pages.find(p => p.page === 57).indices;
const plant = original.map((_, i) => p57[i % p57.length]);
const cases = [];
for (const [label, key] of [
  ["I", chapterKeys[0]], ["II", chapterKeys[1]],
  ["III", chapterKeys[2]], ["I-II-III", fullKey]
]) {
  for (const rule of ["minus", "plus", "beaufort"]) {
    const output = decode(original, key, rule);
    assert.deepEqual(encode(output, key, rule), original);
    assert.deepEqual(decode(encode(plant, key, rule), key, rule), plant);
    cases.push({key:label, rule, length:key.length,
      ioc:ioc(output), first60:output.slice(0, 60)
        .map(i => corpus.translit[i]).join(""),
      reencryptionExact:true, sourceNativePlantExact:true});
  }
}

/** Count the longest exact run of original word lengths aligned with the
 * archived source, with no fitted source edit or language decoding.
 * @param {number[]} lhs @param {number[]} rhs @returns {number} */
function maxAlignedRun(lhs, rhs) {
  const n = 8, index = new Map();
  for (let i = 0; i <= lhs.length - n; i++) {
    const key = lhs.slice(i, i + n).join(",");
    const found = index.get(key);
    if (found) found.push(i); else index.set(key, [i]);
  }
  let max = 0;
  for (let j = 0; j <= rhs.length - n; j++) {
    const key = rhs.slice(j, j + n).join(",");
    for (const i of index.get(key) || []) {
      let len = n;
      while (i + len < lhs.length && j + len < rhs.length &&
        lhs[i + len] === rhs[j + len]) len++;
      if (len > max) max = len;
    }
  }
  return max;
}
const unknownWordLengths = words.map(w => w.length);
const literalCribs = sources.map((s, i) => {
  const sourceWords = s.replace(/^\s*\d+[.:]\s*/gm, "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().match(/[A-Z]+/g) || [];
  const gpLengths = sourceWords.map(w => normalize(w).length);
  return {chapter:["I","II","III"][i], words:sourceWords.length,
    longestLiteralLetterMatch:maxAlignedRun(unknownWordLengths,
      sourceWords.map(w => w.length)),
    longestGPRuneMatch:maxAlignedRun(unknownWordLengths, gpLengths)};
});
const maxIoc = Math.max(...cases.map(x => x.ioc));
assert.ok(maxIoc < 0.035, "Original input unexpectedly displays a high-IoC output");
console.log(JSON.stringify({
  conclusion:"Direct running-key and literal-quotation interpretations negative",
  historicalInputs:"2013 Book of the Law I/II/III source files",
  inputRunes:original.length, originalIoc:ioc(original),
  keyClock:"Continuous from unsolved physical page 0, no fitted phase",
  sourceAlphabet:"GP29 transliteration; K/Q->C, V->U, Z->S",
  cases,literalCribs
},null,2));
