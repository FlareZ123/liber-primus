'use strict';
/**
 * SFT for Director Issue #651. Test the exact first 119 original LP2 runes
 * on physical p3 and p39 under a SAME additive GP29 pad, using lexical
 * compatibility of their original printed word boundaries.
 *
 * Run from repository root: node sims/lp2_p3_p39_119_twotimepad_lexicon_sft.cjs
 * The actual original inputs are never fitted, shuffled, or phase-shifted.
 * Negative scope: GP-English plaintext with printed word boundaries
 * preserved and each complete word in the specified finite lexicon.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments = read('resources/liber-primus/lp2-transcription.txt').split('%');
const tokenTable = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
const gpSymbols = new Set(db.runes);
const mod = x => (x % 29 + 29) % 29;

/** @param {string} raw @returns {number[] | null} */
function gpWord(raw) {
  const word = raw.toUpperCase().replace(/[KVZQ]/g,
    c => ({K: 'C', V: 'U', Z: 'S', Q: 'C'})[c]);
  const out = [];
  for (let i = 0; i < word.length;) {
    const hit = tokenTable.find(t => word.startsWith(t.token, i));
    if (!hit) return null;
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}
const dictionary = Array.from({length: 30}, () => new Map());
/** @param {string} word */
function add(word) {
  const values = gpWord(word);
  if (values && values.length > 0 && values.length < 30) {
    dictionary[values.length].set(values.join(','), values);
  }
}
for (const line of read('resources/control/english_wordfreq_textblob.txt').split('\n')) {
  const found = line.match(/^([a-z]+)\s+\d+/);
  if (found) add(found[1]);
}
for (const name of [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt',
]) {
  for (const word of read(name).match(/[A-Za-z]+/g) || []) add(word);
}

/** @typedef {{start: number, length: number}} PrintedWord */
/** @param {number} page @returns {PrintedWord[]} */
function words(page) {
  const out = [];
  let n = 0, open = false;
  const actual = [];
  for (const char of segments[page]) {
    if (gpSymbols.has(char)) {
      if (!open) {
        out.push({start: n, length: 0});
        open = true;
      }
      out[out.length - 1].length++;
      actual.push(db.runes.indexOf(char));
      n++;
    } else if ("-.'&$;,:".includes(char)) {
      open = false;
    }
    if (n === 119) break;
  }
  assert.equal(n, 119);
  assert.deepEqual(actual, db.pages[page].indices.slice(0, 119));
  return out;
}
const aWords = words(3), bWords = words(39);
assert.equal(aWords.length, 22);
assert.equal(bWords.length, 26);
const c3 = db.pages[3].indices.slice(0, 119);
const c39 = db.pages[39].indices.slice(0, 119);
const observed = c3.map((x, i) => mod(x - c39[i]));

/** @typedef {{a: number,b: number,start: number,end: number,span: number}} Edge */
const edges = [];
for (let i = 0; i < aWords.length; i++) {
  for (let j = 0; j < bWords.length; j++) {
    const aw = aWords[i], bw = bWords[j];
    const start = Math.max(aw.start, bw.start);
    const end = Math.min(aw.start + aw.length, bw.start + bw.length);
    if (end > start) edges.push({a: i, b: j, start, end, span: end - start});
  }
}
assert.equal(edges.length, 42);

/** Does any complete dictionary word pair match the exact local difference? */
function supported(edge, diff) {
  const aw = aWords[edge.a], bw = bWords[edge.b];
  const signatures = new Set();
  for (const b of dictionary[bw.length].values()) {
    signatures.add(b.slice(edge.start - bw.start, edge.end - bw.start).join(','));
  }
  for (const a of dictionary[aw.length].values()) {
    const needed = [];
    for (let i = edge.start; i < edge.end; i++) {
      needed.push(mod(a[i - aw.start] - diff[i]));
    }
    if (signatures.has(needed.join(','))) return true;
  }
  return false;
}
/** @param {number[]} diff @returns {Edge[]} */
const incompatible = diff => edges.filter(edge => !supported(edge, diff));

/** Maximum matching in the bipartite graph of unsupported overlaps.
 *  Thus a lower bound on the number of out-of-dictionary plaintext words.
 *  @param {Edge[]} list @returns {number}
 */
function minOutsideWords(list) {
  const adjacent = aWords.map((_, i) => list.filter(x => x.a === i).map(x => x.b));
  const matches = Array(bWords.length).fill(-1);
  function augment(a, seen) {
    for (const b of adjacent[a]) {
      if (seen[b]) continue;
      seen[b] = true;
      if (matches[b] < 0 || augment(matches[b], seen)) {
        matches[b] = a;
        return true;
      }
    }
    return false;
  }
  let count = 0;
  for (let a = 0; a < aWords.length; a++) {
    if (augment(a, Array(bWords.length).fill(false))) count++;
  }
  return count;
}
const bad = incompatible(observed);
assert.deepEqual(bad.map(e => [e.a, e.b, e.start, e.end]), [
  [1, 2, 3, 8],
  [9, 12, 52, 59],
  [11, 15, 67, 73],
  [15, 18, 82, 88],
  [21, 25, 113, 119],
]);
assert.equal(minOutsideWords(bad), 5);

let seed = 0x81cc6fd9;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {PrintedWord[]} pattern @returns {number[]} */
function nativePlant(pattern) {
  return pattern.flatMap(word => {
    const options = [...dictionary[word.length].values()];
    assert(options.length > 0, 'Missing native word pool');
    return options[random() % options.length];
  });
}
let positivePasses = 0;
const independentFailures = [];
for (let t = 0; t < 30; t++) {
  const p3 = nativePlant(aWords), p39 = nativePlant(bWords);
  assert.equal(p3.length, 119);
  assert.equal(p39.length, 119);
  const key = p3.map(() => random() % 29);
  const cp3 = p3.map((x, i) => mod(x + key[i]));
  const cp39 = p39.map((x, i) => mod(x + key[i]));
  assert.deepEqual(cp3.map((x, i) => mod(x - key[i])), p3);
  assert.deepEqual(cp39.map((x, i) => mod(x - key[i])), p39);
  const commonDiff = cp3.map((x, i) => mod(x - cp39[i]));
  assert.deepEqual(commonDiff, p3.map((x, i) => mod(x - p39[i])));
  assert.equal(incompatible(commonDiff).length, 0);
  positivePasses++;
  const separatelyCiphered = p39.map(x => mod(x + random() % 29));
  const independentDiff = cp3.map((x, i) => mod(x - separatelyCiphered[i]));
  independentFailures.push(incompatible(independentDiff).length);
}
assert.equal(positivePasses, 30);
assert(independentFailures.every(n => n > 0));
const output = {
  originalPages: [3, 39],
  prefixLength: 119,
  printedWordCounts: [aWords.length, bWords.length],
  lexiconSize: dictionary.reduce((n, x) => n + x.size, 0),
  overlappingWordPairs: edges.length,
  incompatibleOriginalOverlaps: bad,
  minimumWordsOutsideFiniteLexicon: minOutsideWords(bad),
  positivePlants: positivePasses,
  independentPadTrials: independentFailures.length,
  independentPadBadOverlapRange: [
    Math.min(...independentFailures), Math.max(...independentFailures),
  ],
  conclusion: 'Negative only under the finite lexicon and unaltered printed word boundaries.',
};
console.log(JSON.stringify(output, null, 2));
