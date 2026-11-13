/**
 * Original-page sentence-prefix diagnostic. This is an exploratory observation,
 * not a candidate LP2 decipherment. Run: node sims/lp2_sentence_prefix_source_sft.cjs
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const dictionary = read('resources/control/english_wordfreq_textblob.txt');
const runeId = new Map(corpus.runes.map((r, i) => [r, i]));
const gpId = new Map(corpus.translit.map((r, i) => [r, i]));
const multigraphs = ['ING', 'TH', 'EO', 'OE', 'AE', 'EA', 'IO', 'IA', 'NG'];

/** @param {string} raw */
function encode(raw) {
  const word = raw.toUpperCase().replaceAll('QU', 'CW').replaceAll('V', 'U')
    .replaceAll('K', 'C').replaceAll('Q', 'C').replaceAll('Z', 'S');
  /** @type {number[]} */
  const sequence = [];
  for (let i = 0; i < word.length;) {
    const token = multigraphs.find(t => word.startsWith(t, i)) || word[i];
    sequence.push(gpId.get(token === 'ING' ? 'NG' : token === 'IO' ? 'IA' : token));
    i += token.length;
  }
  return sequence;
}

/** @type {Map<string, {word: string, frequency: number}>} */
const word4 = new Map();
for (const line of dictionary.split(/\r?\n/)) {
  const m = /^([a-z]+) (\d+)$/.exec(line);
  if (!m) continue;
  const indices = encode(m[1]);
  if (indices.length !== 4) continue;
  const key = indices.join(',');
  const frequency = Number(m[2]);
  if ((word4.get(key)?.frequency || -1) < frequency) {
    word4.set(key, { word: m[1], frequency });
  }
}

/** @type {{page: number, indices: number[], starts: number[]}[]} */
const pages = [];
for (const [page, source] of transcription.split('%').slice(0, 56).entries()) {
  const indices = Array.from(source).filter(ch => runeId.has(ch)).map(ch => runeId.get(ch));
  assert.deepEqual(indices, corpus.pages.find(p => p.page === page).indices);
  const starts = Array.from(source.matchAll(/\.[\u16A0-\u16FF]{4,}/gu),
    m => Array.from(source.slice(0, m.index + 1)).filter(ch => runeId.has(ch)).length);
  pages.push({ page, indices, starts });
}

/** @param {number[]} indices @param {number} start @param {number} shift */
function matched(indices, start, shift = 0) {
  const key = Array.from({ length: 4 }, (_, i) => indices[(start + shift + i) % indices.length]).join(',');
  return word4.get(key);
}

let observedCount = 0;
let observedScore = 0;
/** @type {{page: number, offset: number, word: string, frequency: number}[]} */
const hits = [];
for (const { page, indices, starts } of pages) {
  for (const start of starts) {
    const match = matched(indices, start);
    if (!match) continue;
    observedCount++;
    observedScore += Math.log2(match.frequency + 1);
    hits.push({ page, offset: start, ...match });
  }
}
assert.equal(pages.reduce((n, p) => n + p.starts.length, 0), 72);
assert.equal(word4.size, 2123);
assert.deepEqual(hits, [
  { page: 19, offset: 152, word: 'rift', frequency: 3 },
  { page: 32, offset: 33, word: 'home', frequency: 295 }
]);

let seed = 0x33012026;
/** @returns {number} */
function rand32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

const trials = 50000;
let nCountGE = 0;
let nScoreGE = 0;
let totalMatches = 0;
for (let t = 0; t < trials; t++) {
  let count = 0;
  let score = 0;
  for (const { indices, starts } of pages) {
    if (starts.length === 0) continue;
    const shift = rand32() % indices.length;
    for (const start of starts) {
      const entry = matched(indices, start, shift);
      if (!entry) continue;
      count++;
      score += Math.log2(entry.frequency + 1);
    }
  }
  if (count >= observedCount) nCountGE++;
  if (score >= observedScore) nScoreGE++;
  totalMatches += count;
}
assert.equal(nCountGE, 954);
assert.equal(nScoreGE, 622);
console.log(JSON.stringify({
  candidateLexiconGP4: word4.size, sentenceStarts: 72, hits,
  observedCount, observedScore, trials, nullMean: totalMatches / trials,
  countTail: (nCountGE + 1) / (trials + 1),
  scoreTail: (nScoreGE + 1) / (trials + 1),
  originalSeed: '0x33012026'
}, null, 2));
