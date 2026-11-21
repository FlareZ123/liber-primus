"use strict";
/**
 * Source-first SFT. The 11 red p6 runes + 14 red p7 runes form a physically
 * ordered 5x5 GF29 matrix. p7 prints a five-dot separator; next p8 is exactly
 * 255 runes = 51 consecutive 5-rune blocks. Test all four canonical direct
 * Hill directions on original p8, with literal printed word boundaries.
 * Run: node sims/lp2_p6_p7_red25_hill5_p8_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const trans = read("resources/liber-primus/lp2-transcription.txt").split("%");
const freq = read("resources/control/english_wordfreq_textblob.txt");
const solved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const index = new Map(gp.runes.map((c, i) => [c, i]));
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;
assert.equal(gp.pages.length, 58);
for (const [page, start, length] of [[6, 71, 11], [7, 194, 14]]) {
  assert(ink.pages.some(item => item.page === page &&
    item.red_spans.some(span => span.start === start && span.length === length)));
  assert.deepEqual([...trans[page]].filter(c => index.has(c))
    .map(c => index.get(c)), gp.pages[page].indices);
}
const key25 = [...gp.pages[6].indices.slice(71, 82),
  ...gp.pages[7].indices.slice(194, 208)];
assert.equal(key25.length, 25);
const M = Array.from({length: 5}, (_, i) => key25.slice(5*i, 5*i + 5));
assert.deepEqual(M, [
  [24,16,14,17,19],
  [6,27,15,17,14],
  [12,23,3,22,16],
  [2,25,5,7,11],
  [14,28,6,28,19]
]);
/**
 * Exact Gauss-Jordan inverse in the prime field, with determinant.
 * @param {number[][]} matrix
 */
function invert(matrix) {
  const aug = matrix.map((row, i) => [...row,
    ...Array.from({length:5}, (_, j) => Number(i === j))]);
  let determinant = 1;
  for (let k = 0; k < 5; k++) {
    let row = k;
    while (row < 5 && aug[row][k] === 0) row++;
    assert(row < 5, "key matrix is singular");
    if (row !== k) {
      [aug[row], aug[k]] = [aug[k], aug[row]];
      determinant = mod(-determinant);
    }
    const pivot = aug[k][k];
    determinant = mod(determinant * pivot);
    let inverse = 1;
    while (mod(pivot * inverse) !== 1) inverse++;
    for (let j = 0; j < 10; j++) aug[k][j] = mod(aug[k][j] * inverse);
    for (let i = 0; i < 5; i++) {
      if (i === k) continue;
      const factor = aug[i][k];
      for (let j = 0; j < 10; j++) {
        aug[i][j] = mod(aug[i][j] - factor * aug[k][j]);
      }
    }
  }
  return {determinant, matrix: aug.map(row => row.slice(5))};
}
/** @param {number[][]} matrix */
const transpose = matrix => matrix[0].map((_, i) => matrix.map(row => row[i]));
/**
 * Direct block transform, keeping every original rune and no padding.
 * @param {number[][]} matrix
 * @param {number[]} ciphertext
 */
function apply(matrix, ciphertext) {
  assert.equal(ciphertext.length % 5, 0);
  const out = [];
  for (let offset = 0; offset < ciphertext.length; offset += 5) {
    for (let row = 0; row < 5; row++) {
      out.push(mod(matrix[row].reduce((sum, value, col) =>
        sum + value * ciphertext[offset + col], 0)));
    }
  }
  return out;
}
/**
 * First-party native GP transliteration, including doublet handling.
 * @param {string} text
 * @returns {number[]}
 */
function nativeGP(text) {
  const s = text.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const numbers = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {numbers.push(21); i += 3;}
    else if (s.startsWith("IO", i)) {numbers.push(27); i += 2;}
    else {
      const token = tokens.find(x => s.startsWith(x.s, i));
      assert(token, "unrecognized source Latin rune transliteration " + s);
      numbers.push(token.i);
      i += token.s.length;
    }
  }
  return numbers;
}
const lex = new Map();
for (const line of freq.split(/\r?\n/gu)) {
  const match = /^([a-z]+) (\d+)$/u.exec(line);
  if (!match) continue;
  const code = nativeGP(match[1]).join(",");
  lex.set(code, Math.max(lex.get(code) || 0, Number(match[2])));
}
/**
 * Keep p8 printed red/black titles and ordinary GP separators, but do not
 * split at physical slash line wraps. No artificial word resequencing.
 * @param {number[]} values
 */
function p8Words(values) {
  let offset = 0;
  const words = [], word = [];
  for (const char of trans[8]) {
    if (index.has(char)) {
      word.push(values[offset++]);
    } else if ("-.$&§".includes(char)) {
      if (word.length) words.push(word.splice(0));
    }
  }
  if (word.length) words.push(word);
  assert.equal(offset, 255);
  return words;
}
/** @param {number[][]} words */
function score(words) {
  const long = words.filter(word => word.length >= 4);
  return {words:words.length, longWords:long.length,
    matches:long.filter(word => lex.has(word.join(","))).length};
}
/** @param {number[]} values */
function ioc(values) {
  const counts = values.reduce((a, x) => (a[x]++, a), Array(29).fill(0));
  return counts.reduce((sum, c) => sum + c*(c-1), 0) /
    (values.length * (values.length - 1));
}
const {determinant, matrix: Minv} = invert(M);
assert.equal(determinant, 12);
assert.deepEqual(apply(M, apply(Minv, gp.pages[8].indices)),
  gp.pages[8].indices);
assert.deepEqual(apply(Minv, apply(M, gp.pages[8].indices)),
  gp.pages[8].indices);
const directions = [
  ["C=M*P", Minv, M],
  ["C=Minv*P", M, Minv],
  ["C=P*M", transpose(Minv), transpose(M)],
  ["C=P*Minv", transpose(M), transpose(Minv)]
];
const original = gp.pages[8].indices;
assert.equal(original.length, 255);
assert.deepEqual([...trans[8]].filter(c => index.has(c)).map(c => index.get(c)),
  original);
const originalScore = score(p8Words(original));
assert.deepEqual(originalScore, {words:51, longWords:34, matches:0});
const clear = solved.replace(/\r\n/gu, "\n").split("### 57\n")[1];
const clearNative = (clear.match(/[A-Z]+/gu) || []).map(nativeGP);
assert.deepEqual(clearNative.flat(), gp.pages[57].indices);
assert.equal(clearNative.flat().length, 95);
const positiveLong = clearNative.filter(word => word.length >= 4)
  .map(word => lex.get(word.join(",")) || 0);
assert.equal(positiveLong.filter(n => n >= 5).length, 8);
const outputs = [];
for (const [operation, decoder, encoder] of directions) {
  const plain = apply(decoder, original);
  assert.deepEqual(apply(encoder, plain), original,
    "p8 original full forward replay");
  const positivePlant = apply(encoder, gp.pages[57].indices);
  assert.deepEqual(apply(decoder, positivePlant), gp.pages[57].indices,
    "95-rune actual solved source positive");
  const words = score(p8Words(plain));
  assert.deepEqual(words, {words:51, longWords:34, matches:0});
  outputs.push({operation, ...words, IoC:ioc(plain),
    opening:plain.slice(0,25).map(v => gp.translit[v]).join("")});
}
console.log(JSON.stringify({
  originalSources: ["23.jpg (p6 red11)", "24.jpg (p7 red14)",
    "25.jpg (p8 all 255 runes)"],
  redKeyCount:key25.length,
  redMatrix:M, determinantMod29:determinant, inverse:Minv,
  p8:{runes:original.length, baselineIoC:ioc(original), ...originalScore},
  directions:outputs,
  clearControl:{page:57, runes:95, longWordMatchesAtLeastFive:8},
  decision:"All four natural red25 Hill5 consumers lack authentic p8 words"
},null,2));
