"use strict";

/**
 * A bounded original-LP2 inverse for a word-rotated mixed-alphabet
 * ciphertext-autokey, with Cicada-source-derived alphabet keywords.
 *
 * The hypothesis is K_w(j) = (K(j) + r_w) mod 29, with a free rotation r_w
 * for each printed word. For interior positions the forward step is
 *
 * C_j = K_w( K_w^-1(C_(j-1)) + P_j - e mod 29 ).
 *
 * Therefore P_j = K^-1(C_j-r_w) - K^-1(C_(j-1)-r_w) + e (mod 29).
 * The first rune of each word is left completely unconstrained.
 *
 * Test all 29 rotations and four rare GP identity symbols for each
 * of six separately source-motivated or control mixed alphabets.
 * Match exact interior plaintext against an independently preserved
 * source-native GP English dictionary of the same full-word length.
 *
 * This is a conditional experiment. It cannot exclude arbitrary hidden
 * 29-permutations, other text registers, changed word boundaries, or
 * extra ciphertext symbols. A planted source-English forward encrypt
 * checks that the inverse recognizes genuine examples.
 *
 * Run: node sims/lp2_keyword_autokey_wordrotation_sft.cjs
 * Node.js 22, CommonJS, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyph = new Map(gp.runes.map((r, i) => [r, i]));
const tokenOrder = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Source-calibrated English to original GP29, including ING and IO.
 * @param {string} original
 * @returns {number[]}
 */
function encode(original) {
  const s = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (s.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const t = tokenOrder.find(x => s.startsWith(x.s, i));
      assert(t, "non-GP English source symbol");
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}

/**
 * Construct the usual keyword-mixed alphabet in source GP order.
 * @param {number[]} keyword
 * @returns {number[]}
 */
function mixed(keyword) {
  return [...new Set([
    ...keyword, ...Array.from({length: 29}, (_, i) => i)
  ])];
}

const first = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).filter(row => !row.startsWith(";"))
  .map(row => row.split(/\s+/)[0]);
const other = (read("resources/control/gibran_prophet_58585.txt") + " " +
  read("resources/control/shakespeare_first300k.txt")).match(/[A-Za-z]+/g);

const dictionary = Array.from({length: 15}, () => new Set());
const sourceWords = Array.from({length: 15}, () => []);
for (const original of new Set([...first, ...other].map(x => x.toUpperCase()))) {
  if (!/^[A-Z]{4,}$/.test(original)) continue;
  const indices = encode(original);
  if (indices.length < 8 || indices.length > 14) continue;
  const suffix = indices.slice(1).join(",");
  if (!dictionary[indices.length].has(suffix)) {
    dictionary[indices.length].add(suffix);
    sourceWords[indices.length].push(indices);
  }
}
const dictionarySize = dictionary.reduce((sum, set) => sum + set.size, 0);
assert.equal(dictionarySize, 13196);

const parsed = parseSharedCorpus();
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
const allWords = parsed.words.map(w => [...w.runes].map(c => {
  assert(glyph.has(c));
  return glyph.get(c);
}));
const longWords = allWords.filter(w => w.length >= 8 && w.length <= 14);
assert.equal(longWords.length, 343);

/**
 * Exact inverse family over all possible per-word ciphertext rotations.
 * The first plaintext rune is not fitted or compared.
 * @param {number[]} c
 * @param {number[]} inverse
 * @param {number} e
 * @returns {number}
 */
function countMatches(c, inverse, e) {
  const reference = dictionary[c.length];
  let hits = 0;
  for (let r = 0; r < 29; r++) {
    let previous = inverse[(c[0] - r + 29) % 29];
    const symbols = [];
    for (let j = 1; j < c.length; j++) {
      const current = inverse[(c[j] - r + 29) % 29];
      symbols.push((current - previous + e + 29) % 29);
      previous = current;
    }
    if (reference.has(symbols.join(","))) hits++;
  }
  return hits;
}

const candidateAlphabets = [
  ["canonical", Array.from({length: 29}, (_, i) => i)],
  ["atbash", Array.from({length: 29}, (_, i) => 28 - i)],
  ...["DIVINITY", "FIRFUMFERENFE", "CIRCUMFERENCE", "WISDOM"]
    .map(name => [name, mixed(encode(name))])
];
const identities = [11, 12, 22, 25]; // J, EO, OE, AE
const rows = [];
for (const [name, key] of candidateAlphabets) {
  assert.equal(new Set(key).size, 29);
  const inv = Array(29);
  key.forEach((x, i) => { inv[x] = i; });
  for (const e of identities) {
    const hits = longWords.reduce((n, w) =>
      n + (countMatches(w, inv, e) > 0 ? 1 : 0), 0);
    rows.push({name, e, matches: hits});
    assert.equal(hits, 0, "unexpected original word match: inspect candidate");
  }
}

const controls = [];
for (const [name, key] of candidateAlphabets) {
  if (!["canonical", "DIVINITY", "FIRFUMFERENFE"].includes(name)) continue;
  const inv = Array(29);
  key.forEach((x, i) => { inv[x] = i; });
  let recovered = 0;
  for (let q = 0; q < 64; q++) {
    const len = [8, 9, 10, 11, 12, 13, 14][q % 7];
    const plaintext = sourceWords[len][q % sourceWords[len].length];
    const r = (q * 13 + 7) % 29;
    const e = 12;
    const cipher = [((q * 11 + 8) % 29)];
    for (let j = 1; j < plaintext.length; j++) {
      const previous = inv[(cipher[j-1] - r + 29) % 29];
      cipher.push((key[(previous + plaintext[j] - e + 29) % 29] + r) % 29);
    }
    if (countMatches(cipher, inv, e) > 0) recovered++;
  }
  assert.equal(recovered, 64);
  controls.push({name, recovered, total: 64});
}

console.log(JSON.stringify({
  originalWords: parsed.words.length,
  originalRunes: parsed.runeCount,
  testedWords: longWords.length,
  sourceDictionary: dictionarySize,
  combinations: rows,
  controls
}, null, 2));
