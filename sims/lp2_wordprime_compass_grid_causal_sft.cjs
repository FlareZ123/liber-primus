"use strict";

/**
 * Source-frozen, causal word-prime 8-direction navigation of the original
 * 32x8 LP2 base60 grid. One full-stream reversible cipher candidate.
 *
 * The signed 2016 clue specifically names words, numbers and direction.
 * Earlier LP1 GP arithmetic sums prime weights for a printed word.
 * This proposed consumer lets the preceding ciphertext word's sum mod 8
 * choose one of the eight conventional compass moves on the printed 32x8
 * torus. At each subsequent rune move once and read the mapped grid byte
 * modulo 29 as a GP additive key. The sign is selected by the known p56
 * C=P+K convention. Initial grid position (0,0), direction north.
 *
 * This is a hypothesis, not an authenticated Cicada instruction.
 * Both encoder and decoder use the earlier C word, never the earlier P.
 * No key, seed, phase, sign, direction ordering or output subset is fitted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const words = parseSharedCorpus();
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const table = grid.pages.flatMap(p => p.bytes);
assert.equal(table.length, 256);
assert.equal(words.words.length, 2896);
assert.equal(words.runeCount, 12956);
assert.equal(words.crossPageWords, 32);

const DIRECTIONS = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]
];
const mod = (n, p) => (n % p + p) % p;
/** @param {string} runes @returns {number[]} */
function ordinals(runes) {
  return [...runes].map(r => {
    const i = runeIndex.get(r);
    assert.notEqual(i, undefined);
    return i;
  });
}
/** @param {number[]} v @returns {number} */
function ioc(v) {
  const f = Array(29).fill(0);
  v.forEach(x => f[x]++);
  return f.reduce((s, n) => s + n * (n - 1), 0) /
    (v.length * (v.length - 1));
}
/** @param {number[][]} ww */
function intrawordRepeats(ww) {
  let count = 0;
  for (const w of ww) for (let i = 1; i < w.length; i++) count += +(w[i] === w[i - 1]);
  return count;
}
/** @param {number[]} cipherWord @returns {number} */
function wordDirection(cipherWord) {
  return cipherWord.reduce((n, v) => n + corpus.prime[v], 0) % 8;
}
/**
 * @param {number[][]} sourceWords Plaintext for encrypt, ciphertext for decrypt.
 * @param {boolean} decrypt Whether to subtract the table pad.
 * @param {number[]} tableBytes Original source table, or explicit null control.
 * @returns {number[][]}
 */
function transform(sourceWords, decrypt, tableBytes = table) {
  let row = 0, column = 0, direction = 0;
  const result = [];
  for (const word of sourceWords) {
    const converted = [];
    const [dy, dx] = DIRECTIONS[direction];
    for (const v of word) {
      row = mod(row + dy, 32);
      column = mod(column + dx, 8);
      const k = tableBytes[row * 8 + column] % 29;
      converted.push(mod(v + (decrypt ? -k : k), 29));
    }
    result.push(converted);
    direction = wordDirection(decrypt ? word : converted);
  }
  return result;
}
/**
 * @param {number[]} lengths Original word segmentation.
 * @returns {number[][]} Native GP English control with same rune counts.
 */
function gpEnglishPlant(lengths) {
  const raw = fs.readFileSync(path.join(
    root, "resources/control/gibran_prophet_58585.txt"), "utf8");
  const tokens = corpus.translit.map((t, i) => ({ t, i }))
    .sort((a, b) => b.t.length - a.t.length);
  const normalized = raw.toUpperCase().replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const stream = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      const token = tokens.find(x => word.startsWith(x.t, at));
      assert.ok(token);
      stream.push(token.i);
      at += token.t.length;
    }
  }
  assert(stream.length >= 12956);
  const control = [], total = lengths.reduce((a, b) => a + b, 0);
  assert.equal(total, 12956);
  let i = 0;
  for (const length of lengths) {
    control.push(stream.slice(i, i + length));
    i += length;
  }
  return control;
}

const original = words.words.map(w => ordinals(w.runes));
const english = gpEnglishPlant(original.map(w => w.length));
const plantedCipher = transform(english, false);
const recoveredPlant = transform(plantedCipher, true);
assert.deepEqual(recoveredPlant, english, "Known English positive control failed");

const decoded = transform(original, true);
const originalRoundtrip = transform(decoded, false);
assert.deepEqual(originalRoundtrip, original, "Original source re-encryption failed");

// Exact source-relative negative controls keep every grid value but destroy
// the printed row-major navigation. They are diagnostic rather than tuning.
const nulls = [table.slice().reverse(), table.slice(128).concat(table.slice(0, 128))];
assert.notDeepEqual(transform(plantedCipher, true, nulls[0]), english,
  "Wrong-table control erroneously recovers planted plaintext");

const result = {
  test: "PASS",
  frozen_rule: "previous ciphertext-word GP-prime sum mod8 chooses N/NE/E/SE/S/SW/W/NW; navigate original 32x8 torus once per cipher rune; C=P+byte mod29",
  original_runes: words.runeCount,
  original_words: words.words.length,
  original_page_carries: words.crossPageWords,
  exact_plant_recovery: recoveredPlant.flat().length,
  exact_original_reencrypt: originalRoundtrip.flat().length,
  native_gp_ioc: ioc(english.flat()),
  native_gp_intra_repeats: intrawordRepeats(english),
  native_plant_cipher_ioc: ioc(plantedCipher.flat()),
  native_plant_cipher_intra_repeats: intrawordRepeats(plantedCipher),
  original_cipher_ioc: ioc(original.flat()),
  original_cipher_intra_repeats: intrawordRepeats(original),
  original_decoded_ioc: ioc(decoded.flat()),
  original_decoded_intra_repeats: intrawordRepeats(decoded),
  wrong_grid_decoded_ioc: nulls.map(t => ioc(transform(original, true, t).flat())),
  first80_decoded: decoded.flat().slice(0, 80).map(i => corpus.translit[i]).join(" "),
};
assert(Math.abs(result.native_gp_ioc - 0.06042070486707437) < 1e-11);
assert(Math.abs(result.original_cipher_ioc - 0.03447839786450569) < 1e-11);
console.log(JSON.stringify(result, null, 2));
