"use strict";
/**
 * Single-file source-first test: Node22, Windows-compatible CommonJS.
 * Original PARABLE clause prime ordinals select a 5x5 p50 grid tile;
 * consume the 75 complete-word glyphs on p55 under a direct Hill5 inverse.
 *
 * Run: node sims/lp2_p57_parable_p50_tile_p55_hill5_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} filename */
const read = filename => fs.readFileSync(path.join(root, filename), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const gpLatin = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
const M = 29;
/** @param {number} n */
const mod = n => ((n % M) + M) % M;

/* Recover the contemporary prime-weight clause sums from the full parable
 * and source chart, before reading p50 or selecting p55.
 */
const p57 = gp.pages[57].indices;
assert.equal(p57.length, 95);
const clauses = [p57.slice(7, 37), p57.slice(37, 67), p57.slice(67, 95)];
assert.deepEqual(clauses.map(x => x.length), [30, 30, 28]);
const clauseSums = clauses.map(s => s.reduce((a, i) => a + gp.prime[i], 0));
assert.deepEqual(clauseSums, [1259, 1031, 1229]);
assert.equal(clauseSums.reduce((a, b) => a * b, 1), 1595277641);
/** @param {number} n */
function primeRank(n) {
  let rank = 0;
  for (let candidate = 2; candidate <= n; candidate++) {
    let isPrime = true;
    for (let k = 2; k * k <= candidate; k++) {
      if (candidate % k === 0) { isPrime = false; break; }
    }
    if (isPrime) rank++;
  }
  return rank;
}
const ranks = clauseSums.map(primeRank);
assert.deepEqual(ranks, [205, 173, 201]);
const allTokens = grid.pages.flatMap(p => p.tokens);
assert.equal(allTokens.length, 256);
const cell = i => allTokens[i];
assert.deepEqual(ranks.map(cell), ["1G", "1v", "1E"]);
const positions = ranks.map(i => [Math.floor(i / 8), i % 8]);
assert.deepEqual(positions, [[25, 5], [21, 5], [25, 1]]);
const fourthCorner = 21 * 8 + 1;
assert.equal(fourthCorner, 169);
assert.equal(cell(fourthCorner), "3m");
const tile = Array.from({length: 5}, (_, r) =>
  Array.from({length: 5}, (_, col) => allTokens[(21 + r) * 8 + (1 + col)]));
assert.deepEqual(tile, [
  ["3m", "4E", "0s", "2S", "1v"],
  ["2B", "2k", "2t", "2O", "0e"],
  ["2a", "0J", "1L", "0c", "3C"],
  ["2Z", "2d", "1T", "2u", "1t"],
  ["1E", "3T", "18", "3E", "1G"],
]);
const base60 = grid.alphabet;
const base59 = base60.replace("f", "");
assert.equal(base60.length, 60);
assert.equal(base59.length, 59);
/** @param {string} token @param {number} radix */
function readToken(token, radix) {
  const alphabet = radix === 59 ? base59 : base60;
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  return radix * a + b;
}
assert.deepEqual([205, 173, 201, 169].map(cell).map(t => readToken(t, 59)),
  [75, 115, 73, 224]);

/** @param {number[][]} source @returns {number[][]} */
function invert(source) {
  const n = source.length;
  const a = source.map((row, i) => [
    ...row.map(mod), ...Array.from({length: n}, (_, j) => i === j ? 1 : 0),
  ]);
  for (let col = 0; col < n; col++) {
    const pivot = a.findIndex((row, i) => i >= col && row[col] !== 0);
    assert(pivot >= 0, "source matrix must be nonsingular");
    [a[pivot], a[col]] = [a[col], a[pivot]];
    const pivotInverse = Array.from({length: M}, (_, i) => i)
      .find(x => mod(x * a[col][col]) === 1);
    assert.notEqual(pivotInverse, undefined);
    a[col] = a[col].map(x => mod(x * pivotInverse));
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = a[r][col];
      a[r] = a[r].map((x, j) => mod(x - factor * a[col][j]));
    }
  }
  return a.map(row => row.slice(n));
}
/**
 * Natural Hill vectors of 5 source runes each, with either column or row
 * convention; no rotation, phase fitting or plaintext-dependent choices.
 * @param {number[][]} matrix
 * @param {number[]} input
 * @param {"col"|"row"} convention
 */
function apply(matrix, input, convention) {
  assert.equal(input.length % 5, 0);
  const output = [];
  for (let start = 0; start < input.length; start += 5) {
    const v = input.slice(start, start + 5);
    for (let j = 0; j < 5; j++) {
      let n = 0;
      for (let i = 0; i < 5; i++) {
        n += (convention === "col" ? matrix[j][i] : matrix[i][j]) * v[i];
      }
      output.push(mod(n));
    }
  }
  return output;
}
/** @param {number[]} input */
function normalizedIC(input) {
  const hist = Array(M).fill(0);
  for (const k of input) hist[k]++;
  return M * hist.reduce((a, b) => a + b * (b - 1), 0) /
    (input.length * (input.length - 1));
}
/** @param {string} str @returns {number[]|null} */
function native(str) {
  const word = str.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (word.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const next = gpLatin.find(x => word.startsWith(x.s, i));
    if (!next) return null;
    out.push(next.i);
    i += next.s.length;
  }
  return out;
}
const dictionary = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/u)) {
  const match = /^([a-z]+) (\d+)$/u.exec(line);
  if (!match) continue;
  const v = native(match[1]);
  if (v) dictionary.add(v.join(","));
}
assert.equal(dictionary.size, 29060);

/* Canonical corpus includes the blank p50, but the historical rune
 * transcription omits p50; therefore physical p55 is transcript slot54.
 * Explicit equality check prevents an off-by-one false word-boundary test.
 */
assert.equal(gp.pages[55].indices.length, 76);
assert.deepEqual([...transcription[54]].filter(c => runeIndex.has(c))
  .map(c => runeIndex.get(c)), gp.pages[55].indices);
const body = gp.pages[55].indices.slice(1);
assert.equal(body.length, 75);
assert.equal(body[0], gp.pages[55].indices[1]);
assert.equal(gp.pages[55].indices[0], 21); // carried NG from p54
const wordPositions = [];
let offset = 0, word = [];
for (const c of transcription[54]) {
  const v = runeIndex.get(c);
  if (v !== undefined) {
    if (offset > 0) word.push(offset - 1);
    offset++;
  } else if ("-.$&§".includes(c)) {
    if (word.length) wordPositions.push(word);
    word = [];
  }
}
if (word.length) wordPositions.push(word);
assert.equal(offset, 76);
assert.deepEqual(wordPositions.map(w => w.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const longWords = wordPositions.filter(w => w.length >= 4);
assert.equal(longWords.length, 9);

/* 75 native-clear p57 symbols are the untouched positive source. */
const plant = gp.pages[57].indices.slice(0, 75);
assert.equal(plant.length, 75);
const results = [];
for (const radix of [59, 60]) {
  const matrix = tile.map(row => row.map(t => mod(readToken(t, radix))));
  const inverse = invert(matrix);
  for (const convention of ["col", "row"]) {
    const plaintext = apply(inverse, body, convention);
    assert.deepEqual(apply(matrix, plaintext, convention), body);
    assert.deepEqual(apply(inverse, apply(matrix, plant, convention), convention), plant);
    const hitCount = longWords.filter(word =>
      dictionary.has(word.map(i => plaintext[i]).join(","))).length;
    assert.equal(hitCount, 0);
    results.push({
      radix,
      convention,
      normalizedIC: normalizedIC(plaintext),
      longWords: longWords.length,
      dictionaryHits: hitCount,
      prefix: plaintext.slice(0, 35).map(i => gp.translit[i]).join(""),
    });
  }
}
assert.equal(results.length, 4);
assert.deepEqual(results.map(r => Math.round(r.normalizedIC * 1e12)), [
  982342342342, 1055495495495, 836036036036, 982342342342,
]);
console.log(JSON.stringify({
  sourcePrimeSums: clauseSums,
  originalP50PrimeRanks: ranks,
  originalTile: tile,
  receiver: "physical p55; first carried rune omitted; 75 runes; 15 Hill5 vectors",
  sourceNormalizedIC: normalizedIC(body),
  authenticClear75NormalizedIC: normalizedIC(plant),
  variants: results,
  control: "4/4 original complete reencrypt and source-native 75/75 Hill5 plants",
}, null, 2));
