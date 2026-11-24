"use strict";
/**
 * Test one source-motivated six-column whole-word transposition on original LP2.
 * Node.js 22: node sims/lp2_signed2016_sixword_primecolumnar_sft.cjs
 *
 * Hypothesis: the six words selected by p28-derived THE positions in the
 * signed 2016 message define a six-column key; canonical GP29 prime sums
 * determine ascending column order. This is one frozen global route, not a
 * search over widths, keys, resets, or orientations.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(corpus.runes);
const originalText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");

const words = [];
let page = 0, startPage = 0, length = 0, runeCount = 0;
function finish(punct = false) {
  if (!length) return;
  words.push({len: length, page: startPage, punct});
  length = 0;
}
for (const ch of originalText) {
  if (runeSet.has(ch)) {
    if (!length) startPage = page;
    length++;
    runeCount++;
  } else if (ch === "%") {
    page++;
  } else if ("-.$&§0123456789".includes(ch)) {
    finish(ch === ".");
  }
}
finish();
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(words.filter((w) => w.punct).length, 175);
assert.equal(page, 54);

// The p28-derived positions are 1-based positions of THE in the authenticated
// 2016 signed message. The following words are the six candidate key words.
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc")
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n/).slice(3).join("\n");
const signedWords = (signed.match(/[A-Za-z]+/g) || [])
  .map((w) => w.toUpperCase());
const anchorPositions = [2, 8, 13, 18, 23, 29];
const keyWords = anchorPositions.map((p) => {
  assert.equal(signedWords[p - 1], "THE");
  return signedWords[p];
});
assert.deepEqual(keyWords,
  ["PATH", "DEVOTED", "WAY", "MAP", "ROAD", "DIRECTION"]);

// Use the repository's exact GP29 transliteration and prime-value tables.
// The solved-page spelling convention maps V to U.
const gpPrime = new Map(corpus.translit.map((label, i) => [label, corpus.prime[i]]));
const labels = [...gpPrime.keys()].sort((a, b) => b.length - a.length);
function gpTokens(word) {
  const normalized = word.toUpperCase().replace(/V/g, "U");
  const tokens = [];
  for (let i = 0; i < normalized.length;) {
    const label = labels.find((x) => normalized.startsWith(x, i));
    assert.ok(label, "Unmapped GP29 key word: " + normalized);
    tokens.push(label);
    i += label.length;
  }
  return tokens;
}
const key = keyWords.map((word, index) => {
  const tokens = gpTokens(word);
  return {word, index, tokens,
    primeSum: tokens.reduce((sum, token) => sum + gpPrime.get(token), 0)};
});
assert.deepEqual(key.map((x) => x.primeSum), [145, 381, 219, 211, 204, 337]);
const order = key.slice()
  .sort((a, b) => a.primeSum - b.primeSum || a.index - b.index)
  .map((x) => x.index);
assert.deepEqual(order, [0, 4, 3, 2, 5, 1]);

// Standard row-fill / column-read columnar transposition. The ciphertext is
// interpreted as the columns concatenated in ascending numeric-key order.
const columnCount = 6;
const rowCount = Math.ceil(words.length / columnCount);
const columnLengths = Array.from({length: columnCount}, (_, c) =>
  Math.floor(words.length / columnCount) + (c < words.length % columnCount ? 1 : 0));

function encryptColumnar(items, keyOrder) {
  const columns = Array.from({length: columnCount}, () => []);
  for (let i = 0; i < items.length; i++) columns[i % columnCount].push(items[i]);
  return keyOrder.flatMap((c) => columns[c]);
}
function decryptColumnar(cipher, keyOrder) {
  const columns = Array(columnCount);
  let cursor = 0;
  for (const c of keyOrder) {
    const size = columnLengths[c];
    columns[c] = cipher.slice(cursor, cursor + size);
    cursor += size;
  }
  assert.equal(cursor, cipher.length);
  const plain = [];
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < columnCount; col++) {
      if (row < columns[col].length) plain.push(columns[col][row]);
    }
  }
  return plain;
}
assert.deepEqual(decryptColumnar(encryptColumnar(words, order), order), words);
assert.deepEqual(columnLengths, [483, 483, 483, 483, 482, 482]);
const recovered = decryptColumnar(words, order);
assert.equal(recovered.length, words.length);

const cap = (x) => Math.min(x, 9);
function adjacencyMI(items) {
  const table = Array.from({length: 10}, () => Array(10).fill(0));
  const count = items.length - 1;
  for (let i = 1; i < items.length; i++) {
    table[cap(items[i - 1].len)][cap(items[i].len)]++;
  }
  const rows = table.map((r) => r.reduce((a, b) => a + b, 0));
  const cols = Array.from({length: 10}, (_, j) =>
    table.reduce((a, r) => a + r[j], 0));
  let result = 0;
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) {
    const n = table[a][b];
    if (n) result += n / count * Math.log(n * count / (rows[a] * cols[b]));
  }
  return result;
}
function sentenceMI(items) {
  const table = Array.from({length: 3}, () => Array(10).fill(0));
  const rows = [0, 0, 0], cols = Array(10).fill(0);
  for (let i = 0; i < items.length; i++) {
    const start = i === 0 || items[i - 1].punct;
    const role = start ? 0 : items[i].punct ? 1 : 2;
    const l = cap(items[i].len);
    table[role][l]++;
    rows[role]++;
    cols[l]++;
  }
  let result = 0;
  for (let a = 0; a < 3; a++) for (let b = 0; b < 10; b++) {
    const n = table[a][b];
    if (n) result += n / items.length *
      Math.log(n * items.length / (rows[a] * cols[b]));
  }
  return result;
}
function permute(items, seed) {
  const out = items.slice();
  let state = seed >>> 0;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const originalAdj = adjacencyMI(words);
const originalSentence = sentenceMI(words);
const candidateAdj = adjacencyMI(recovered);
const candidateSentence = sentenceMI(recovered);
const trials = 5000;
let adjSum = 0, adjSquares = 0, adjHigh = 0;
let sentenceSum = 0, sentenceSquares = 0, sentenceHigh = 0;
for (let i = 0; i < trials; i++) {
  const shuffled = permute(recovered, ((i + 1) * 0x9e3779b9) ^ 0x6a09e667);
  const a = adjacencyMI(shuffled);
  const s = sentenceMI(shuffled);
  adjSum += a;
  adjSquares += a * a;
  if (a >= candidateAdj) adjHigh++;
  sentenceSum += s;
  sentenceSquares += s * s;
  if (s >= candidateSentence) sentenceHigh++;
}
const adjMean = adjSum / trials;
const adjSd = Math.sqrt(adjSquares / trials - adjMean * adjMean);
const sentenceMean = sentenceSum / trials;
const sentenceSd = Math.sqrt(sentenceSquares / trials - sentenceMean * sentenceMean);
const result = {
  source: {runes: runeCount, printedGroups: words.length,
    periods: words.filter((w) => w.punct).length},
  anchors: anchorPositions,
  key: key.map(({word, tokens, primeSum}) => ({word, tokens, primeSum})),
  columnOrder1Based: order.map((x) => x + 1),
  grid: {rows: rowCount, columns: columnCount, columnLengths},
  metrics: {
    originalGlobalAdjacencyMI: Number(originalAdj.toFixed(8)),
    candidateGlobalAdjacencyMI: Number(candidateAdj.toFixed(8)),
    adjacencyNullMean: Number(adjMean.toFixed(8)),
    adjacencyNullSD: Number(adjSd.toFixed(8)),
    adjacencyZ: Number(((candidateAdj - adjMean) / adjSd).toFixed(3)),
    adjacencyUpperTail: Number(((adjHigh + 1) / (trials + 1)).toFixed(6)),
    originalGlobalSentenceMI: Number(originalSentence.toFixed(8)),
    candidateSentenceMI: Number(candidateSentence.toFixed(8)),
    sentenceNullMean: Number(sentenceMean.toFixed(8)),
    sentenceNullSD: Number(sentenceSd.toFixed(8)),
    sentenceZ: Number(((candidateSentence - sentenceMean) / sentenceSd).toFixed(3)),
    sentenceUpperTail: Number(((sentenceHigh + 1) / (trials + 1)).toFixed(6)),
    nullTrials: trials,
    seed: "0x6a09e667"
  }
};
assert.ok(Math.abs(candidateAdj - 0.01078754) < 1e-8);
assert.ok(Math.abs(candidateSentence - 0.00185059) < 1e-8);
assert.ok(Math.abs(result.metrics.adjacencyUpperTail - 0.567487) < 1e-6);
assert.ok(Math.abs(result.metrics.sentenceUpperTail - 0.715657) < 1e-6);
console.log(JSON.stringify(result, null, 2));
