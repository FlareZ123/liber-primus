"use strict";

/**
 * LP2 original-cipher per-word secret-polynomial GP29 gate.
 * Each word has wholly independent unknown coefficients:
 * C[w,j] = P[w,j] + sum(k=0..d) a[w,k] * binomial(j,k) mod 29.
 * The (d+1)-st forward difference is a complete key-independent invariant.
 * CJS / Node 22, no external dependencies, no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rmap = new Map(corpus.runes.map((s, i) => [s, i]));
const gp = new Map(corpus.translit.map((s, i) => [s, i]));
for (const [alias, canonical] of [
  ["K", "C"], ["Q", "C"], ["Z", "S"], ["V", "U"],
  ["ING", "NG"], ["IO", "IA"]
]) gp.set(alias, gp.get(canonical));
const groups = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;

/** @param {string} word @returns {number[]} */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW");
  const result = [];
  for (let i = 0; i < s.length;) {
    const token = groups.find(g => s.startsWith(g, i)) || s[i];
    const v = gp.get(token);
    assert.notEqual(v, undefined, token);
    result.push(v);
    i += token.length;
  }
  return result;
}

/** @param {number[]} a @param {number} d @returns {string} */
function signature(a, d) {
  let values = a.slice();
  for (let k = 0; k <= d; k++) {
    for (let j = 0; j + 1 < values.length; j++)
      values[j] = mod(values[j + 1] - values[j]);
    values.pop();
  }
  return a.length + ":" + values.join(",");
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k > n) return 0;
  let value = 1;
  for (let i = 1; i <= k; i++) value = value * (n - i + 1) / i;
  return value;
}
/** @param {number[]} p @param {number[]} coeff @param {number} sign */
function transform(p, coeff, sign) {
  return p.map((x, j) => {
    let key = 0;
    for (let k = 0; k < coeff.length; k++)
      key += coeff[k] * choose(j, k);
    return mod(x + sign * key);
  });
}

/**
 * Recover a compatible degree-d Newton key directly from a proposed plaintext.
 * No historical key knowledge is needed. Null proves incompatibility.
 * @param {number[]} plaintext @param {number[]} ciphertext
 * @param {number} degree @returns {number[] | null}
 */
function recoverCoefficients(plaintext, ciphertext, degree) {
  assert.equal(plaintext.length, ciphertext.length);
  let differences = ciphertext.map((x, i) => mod(x - plaintext[i]));
  const coeff = [];
  for (let k = 0; k <= degree; k++) {
    coeff.push(differences.length ? differences[0] : 0);
    differences = differences.slice(1).map((x, i) =>
      mod(x - differences[i]));
  }
  const recreated = transform(plaintext, coeff, +1);
  return recreated.every((x, i) => x === ciphertext[i]) ? coeff : null;
}

const lex = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const m = /^([a-z]+)\s+\d+$/.exec(line);
  if (m) lex.add(m[1]);
}
for (const file of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
]) for (const word of read(file).match(/[A-Za-z]+/g) || [])
  lex.add(word.toLowerCase());
assert(lex.size > 32000 && lex.size < 33000);
const encoded = [...lex].map(word => ({ word, gp: encode(word) }));
const byLength = new Map();
for (const item of encoded) {
  if (!byLength.has(item.gp.length)) byLength.set(item.gp.length, []);
  byLength.get(item.gp.length).push(item);
}

const input = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(input.words.length, 2896);
assert.equal(input.runeCount, 12956);
const words = input.words.map(w => ({
  page: w.startPage,
  seq: [...w.runes].map(r => {
    assert(rmap.has(r), r);
    return rmap.get(r);
  })
}));
assert.deepEqual(words.flatMap(w => w.seq),
  corpus.pages.slice(0, 56).flatMap(p => p.indices));
const counts = new Map();
for (const { seq } of words) counts.set(seq.length, (counts.get(seq.length) || 0) + 1);
assert.equal([...counts].filter(([L]) => L >= 7).reduce((n, [, v]) => n + v, 0), 559);
assert.equal([...counts].filter(([L]) => L >= 10).reduce((n, [, v]) => n + v, 0), 109);
const solved = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1].trim().match(/[A-Za-z]+/g);
assert(solved);
assert.deepEqual(solved.flatMap(encode), corpus.pages[57].indices);

const expected = [
  [1048, 0, 0], [1788, 0, 0], [2127, 0, 0],
  [2380, 44, 0], [2585, 248, 0], [2719, 382, 0],
  [2791, 454, 5], [2841, 504, 54], [2869, 532, 82]
];
const summary = [];
for (let degree = 0; degree <= 8; degree++) {
  const dictionary = new Map();
  for (const item of encoded) {
    const sig = signature(item.gp, degree);
    const entry = dictionary.get(sig) || { count: 0, example: "" };
    entry.count++;
    if (!entry.example) entry.example = item.word;
    dictionary.set(sig, entry);
  }
  let matches = 0, sevenPlus = 0, tenPlus = 0, twelvePlus = 0;
  let uniqueTenPlus = 0;
  const candidates = [];
  for (let i = 0; i < words.length; i++) {
    const entry = dictionary.get(signature(words[i].seq, degree));
    const n = entry?.count || 0;
    if (!n) continue;
    matches++;
    const len = words[i].seq.length;
    if (len >= 7) sevenPlus++;
    if (len >= 10) {
      tenPlus++;
      if (n === 1) uniqueTenPlus++;
      if (len >= 12) {
        const coeff = recoverCoefficients(encode(entry.example), words[i].seq, degree);
        assert(coeff);
        assert.deepEqual(transform(encode(entry.example), coeff, +1), words[i].seq);
        candidates.push({ wordOrdinal: i, length: len,
          example: entry.example, candidates: n, candidateKey: coeff });
      }
    }
    if (len >= 12) twelvePlus++;
  }
  assert.deepEqual([matches, sevenPlus, tenPlus], expected[degree]);

  // Independently keyed, genuinely source-native positive: 559 long words,
  // one fresh polynomial and its inverse per word, per degree.
  let recoveredRunes = 0;
  let plantedMatched = 0;
  for (let i = 0; i < words.length; i++) {
    const len = words[i].seq.length;
    if (len < 7) continue;
    const options = byLength.get(len);
    assert(options?.length);
    const selected = options[(i * 37 + 17) % options.length];
    const coeff = Array.from({ length: degree + 1 },
      (_, k) => mod(i * 17 + k * 11 + 3));
    const c = transform(selected.gp, coeff, +1);
    assert.equal(signature(c, degree), signature(selected.gp, degree));
    const decoded = transform(c, coeff, -1);
    assert.deepEqual(decoded, selected.gp);
    const recoveredKey = recoverCoefficients(selected.gp, c, degree);
    assert(recoveredKey);
    assert.deepEqual(transform(c, recoveredKey, -1), selected.gp);
    if (degree < len) assert.deepEqual(recoveredKey, coeff);
    assert.equal(dictionary.get(signature(c, degree))?.count > 0, true);
    plantedMatched++;
    recoveredRunes += decoded.length;
  }
  assert.equal(plantedMatched, 559);
  assert.equal(recoveredRunes, 4644);
  summary.push({ degree, totalCompatibleWords: matches, compatibleLength7Plus: sevenPlus,
    compatibleLength10Plus: tenPlus, uniqueLength10Plus: uniqueTenPlus,
    compatibleLength12Plus: twelvePlus, length12PlusExamples: candidates.slice(0, 4),
    plantedRecoveredRunes: recoveredRunes });
}
assert.deepEqual(summary.slice(0, 6).map(x => x.compatibleLength10Plus),
  [0, 0, 0, 0, 0, 0]);
assert.equal(summary[8].compatibleLength12Plus, 1);
console.log(JSON.stringify({ status: "PASS", lexiconWordTypes: lex.size,
  originalWords: words.length, originalRunes: input.runeCount,
  originalLength10Plus: 109, originalLength7Plus: 559,
  solvedP57Exact: "95/95", results: summary }, null, 2));
