"use strict";

/**
 * Original-cipher all-key GF(29) quadratic ciphertext-feedback gate.
 *
 * Hypothesis (one intact printed word, length n):
 *   C[j] = d * P[j] + a * C[j-1]^2 + b * C[j-1] + z (mod 29), j>=1,
 *   with a,b,z independently secret for every word and d any nonzero field
 *   element. C[0] is an arbitrary, unrestricted header/initial symbol.
 *
 * This is deliberately more generous than a fixed p39 quadratic or a
 * manuscript-wide key: every word gets its own 29^3*28 secret possibilities,
 * and the first ciphertext rune is unconstrained. Exact GF29 row reduction
 * decides the existence of ANY key for each intact candidate native word.
 *
 * Source shape: the printed GP29 prime alphabet, p39's source-visible
 * quadratic, and original intact printed word boundaries. This is a
 * bounded cipher-architecture gate, not an authenticated opcode.
 *
 * Run: node sims/lp2_wordlocal_quadratic_cfeedback_allsecret_sft.cjs
 * Windows Node.js 22; read-only, deterministic, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rune = new Map(gp.runes.map((symbol, i) => [symbol, i]));
const token = gp.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const original = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(original.length, 12956);
const source = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("").replace(/[\/\r\n]/g, "");
const words = source.split(/[-.&$§]/)
  .map(piece => [...piece].filter(symbol => rune.has(symbol)).map(symbol => rune.get(symbol)))
  .filter(word => word.length > 0);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
/** @param {number} value @returns {number} */
const mod = value => ((value % 29) + 29) % 29;
const inv = new Int8Array(29);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) if (a * b % 29 === 1) {inv[a] = b; break;}
  assert.notEqual(inv[a], 0);
}
/** @param {string} raw @returns {number[]} */
function encode(raw) {
  const s = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {output.push(21); i += 3; continue;}
    if (s.startsWith("IO", i)) {output.push(27); i += 2; continue;}
    const match = token.find(item => s.startsWith(item.symbol, i));
    assert.ok(match, "Unmapped native GP word " + raw);
    output.push(match.value);
    i += match.symbol.length;
  }
  return output;
}
const dictionary = Array.from({length: 30}, () => []);
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = /^([a-z]+)\s+\d+$/.exec(line);
  if (!match) continue;
  const p = encode(match[1]);
  if (p.length < dictionary.length) dictionary[p.length].push({word: match[1], p});
}
const dictionaryWords = dictionary.reduce((n, pool) => n + pool.length, 0);
assert.equal(dictionaryWords, 29157);

/**
 * Solve ALL four field coefficients by reduced-row-echelon elimination;
 * d must be nonzero. Free parameters can take arbitrary values, so a
 * contradictory original word is rejected under every secret key.
 * The initial glyph is deliberately exempt from the relation.
 *
 * @param {number[]} c Original or planted word
 * @param {number[]} p Native GP candidate of identical length
 * @returns {number[]|null} [d,a,b,z] or null
 */
function solve(c, p) {
  assert.equal(c.length, p.length);
  const rows = [];
  for (let j = 1; j < c.length; j++) {
    const x = c[j-1];
    rows.push([p[j], x*x%29, x, 1, c[j]]);
  }
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < 4 && rank < rows.length; col++) {
    let pivot = rank;
    while (pivot < rows.length && rows[pivot][col] === 0) pivot++;
    if (pivot === rows.length) continue;
    [rows[pivot], rows[rank]] = [rows[rank], rows[pivot]];
    const pivotInverse = inv[rows[rank][col]];
    for (let k = 0; k < 5; k++) rows[rank][k] = rows[rank][k] * pivotInverse % 29;
    for (let j = 0; j < rows.length; j++) {
      if (j === rank || rows[j][col] === 0) continue;
      const multiplier = rows[j][col];
      for (let k = 0; k < 5; k++)
        rows[j][k] = mod(rows[j][k] - multiplier * rows[rank][k]);
    }
    pivots.push(col);
    rank++;
  }
  for (let j = rank; j < rows.length; j++)
    if (rows[j][4] !== 0) return null;
  const coeff = [0, 0, 0, 0];
  if (!pivots.includes(0)) coeff[0] = 1;
  for (let i = rank-1; i >= 0; i--) {
    const col = pivots[i];
    let value = rows[i][4];
    for (let k = col+1; k < 4; k++) value -= rows[i][k] * coeff[k];
    coeff[col] = mod(value);
  }
  if (coeff[0] === 0) return null;
  for (let j = 1; j < c.length; j++) {
    const x = c[j-1];
    assert.equal(mod(coeff[0]*p[j] + coeff[1]*x*x +
      coeff[2]*x + coeff[3]), c[j]);
  }
  return coeff;
}
/**
 * Controlled reversible native-GP plant with arbitrary independent
 * wordwise secrets and a freely selected first ciphertext rune.
 * @param {number[]} p
 * @param {number[]} coeff [d,a,b,z]
 * @param {number} header
 * @returns {number[]}
 */
function encrypt(p, coeff, header) {
  const [d,a,b,z] = coeff;
  assert.ok(d > 0 && d < 29);
  const c = [header];
  for (let j = 1; j < p.length; j++) {
    const prev = c[j-1];
    c.push(mod(d*p[j] + a*prev*prev + b*prev + z));
  }
  return c;
}
/** @param {number[]} c @param {number[]} coeff @param {number} firstPlain */
function decrypt(c, coeff, firstPlain) {
  const [d,a,b,z] = coeff, p = [firstPlain];
  for (let j = 1; j < c.length; j++) {
    const prev = c[j-1];
    p.push(mod((c[j]-a*prev*prev-b*prev-z)*inv[d]));
  }
  return p;
}
const originals = words.map((c, wordIndex) => ({wordIndex, c}))
  .filter(({c}) => c.length >= 8);
assert.equal(originals.length, 343);
const positive = [];
for (let i = 0; i < Math.min(100, originals.length); i++) {
  const {c} = originals[i], pool = dictionary[c.length];
  assert.ok(pool.length > 0);
  const p = pool[(i*47+7)%pool.length].p;
  const coeff = [1+i%28, (i*7+3)%29, (i*11+5)%29, (i*13+17)%29];
  const header = (i*19+4)%29;
  const planted = encrypt(p, coeff, header);
  assert.deepEqual(decrypt(planted, coeff, p[0]), p);
  const recovered = solve(planted, p);
  assert.ok(recovered);
  assert.deepEqual(encrypt(p, recovered, header), planted);
  positive.push({length: c.length, gpWord: pool[(i*47+7)%pool.length].word});
}
assert.equal(positive.length, 100);
const byLength = {};
const examples = [];
let evaluated = 0;
for (const {wordIndex, c} of originals) {
  const pool = dictionary[c.length];
  const summary = byLength[c.length] || {originalWords: 0,
    dictionaryWords: pool.length, compatibleOriginalWords: 0,
    totalCandidateMatches: 0};
  byLength[c.length] = summary;
  summary.originalWords++;
  let matches = 0;
  for (const item of pool) {
    evaluated++;
    const coefficients = solve(c, item.p);
    if (!coefficients) continue;
    matches++;
    if (examples.length < 20 || c.length >= 9)
      examples.push({wordIndex, length: c.length, native: item.word, coefficients});
  }
  summary.totalCandidateMatches += matches;
  if (matches > 0) summary.compatibleOriginalWords++;
}
const long = Object.entries(byLength).filter(([length]) => Number(length) >= 9);
const totalLong = long.reduce((n, [, s]) => n+s.originalWords, 0);
const compatibleLong = long.reduce((n, [, s]) => n+s.compatibleOriginalWords, 0);
const untouched = originals.filter(w => w.c.length >= 10).length;
const compatibleTen = Object.entries(byLength)
  .filter(([length]) => Number(length) >= 10)
  .reduce((n, [, s]) => n+s.compatibleOriginalWords, 0);
assert.equal(totalLong, 187);
assert.equal(untouched, 109);
assert.equal(compatibleLong, 1);
assert.equal(compatibleTen, 0);
console.log(JSON.stringify({
  hypothesis: "Cj=d*Pj+a*Cprev^2+b*Cprev+z mod29; independent secret per word",
  original: {runes: original.length, words: words.length, candidates8plus: originals.length,
    words9plus: totalLong, matches9plus: compatibleLong,
    words10plus: untouched, matches10plus: compatibleTen,
    fullDictionaryComparisons: evaluated, byLength, firstMatches: examples},
  sourceNativePlant: {tested: positive.length, inverseAndReencrypt: "100/100"},
  conclusion: compatibleTen === 0
    ? "No intact original native-English word of length>=10 can be decoded by any wordwise quadratic ciphertext-feedback key"
    : "Partial native-English long-word matches are insufficient to explain all original words"
}, null, 2));
