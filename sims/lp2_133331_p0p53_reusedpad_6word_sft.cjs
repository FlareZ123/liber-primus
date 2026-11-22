'use strict';

/**
 * Source-frozen candidate 133/331 p0/p53 paired 36-rune receiver:
 * an exact unkeyed six-rune overlap constraint for a reused additive GP29 pad.
 *
 * Read-only single-file test. No ciphertext/plaintext fitting, only a pinned
 * 2014 participant HTML, 2014 original LP2 rune pages and a public English
 * word-frequency lexicon. This only excludes a conditional limited word set.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/base60-grid.json')).byte_rows.flat();
const html = read('resources/historical/stage11-2014-index.html');
const lexicon = read('resources/control/english_wordfreq_textblob.txt');
const runeIndex = new Map(corpus.translit.map((r, i) => [r, i]));

const sourceTitle = Number(html.match(/<title>(\d+)<\/title>/)[1]);
const sourceId = Number(html.match(/<div id="(\d+)">/)[1]);
assert.equal(sourceTitle, 133);
assert.equal(sourceId, 331);
assert.equal(table[sourceTitle], 141);
assert.equal(table[sourceId % 256], 177);

// Both original p0 and p53 have word boundaries at offsets 141 and 177.
// At rune offsets145..150, the p0 second selected word is six GP runes.
// The p53 FIRST selected word is eleven GP runes, offsets141..151.
const a = corpus.pages[0].indices.slice(145, 151);
const b = corpus.pages[53].indices.slice(145, 151);
assert.equal(a.length, 6);
assert.equal(b.length, 6);
const delta = a.map((x, i) => (x - b[i] + 29) % 29);
assert.deepEqual(delta, [26, 16, 28, 8, 10, 3]);

const MULTI = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'EA', 'IA'];
/**
 * Enumerate ordinary roman-to-GP spellings. Single letters are always
 * allowed, and a conservative set of authentic GP ligatures can replace
 * their roman substrings. Legacy K->C and V->U convention also included.
 * @param {string} input A plain English lexicon word.
 * @returns {number[][]} Distinct GP runic candidates of length six or eleven.
 */
function gpForms(input) {
  const word = input.toUpperCase().replaceAll('K', 'C')
    .replaceAll('V', 'U').replaceAll('Q', 'C').replaceAll('Z', 'S');
  const stack = [[0, []]];
  const unique = new Map();
  while (stack.length) {
    const [i, sequence] = stack.pop();
    if (sequence.length > 11) continue;
    if (i === word.length) {
      if (sequence.length === 6 || sequence.length === 11) {
        unique.set(sequence.join(','), sequence);
      }
      continue;
    }
    const plain = runeIndex.get(word[i]);
    if (plain === undefined) continue;
    stack.push([i + 1, [...sequence, plain]]);
    for (const text of MULTI) {
      if (word.startsWith(text, i)) {
        const gp = text === 'ING' ? 'NG' : text;
        const symbol = runeIndex.get(gp);
        assert.notEqual(symbol, undefined);
        stack.push([i + text.length, [...sequence, symbol]]);
      }
    }
  }
  return [...unique.values()];
}

const runeLabels = (a) => a.map((x) => corpus.translit[x]).join('');
assert.ok(gpForms('DIVINITY').some((form) => runeLabels(form) === 'DIUINITY'));
// Independent known clear LP2 p57 positive for the orthographic rules.
const p57Plain = runeLabels(corpus.pages[57].indices);
assert.ok(p57Plain.includes('DIUINITY'));
assert.ok(p57Plain.includes('TUNNELNG'));
assert.ok(gpForms('TUNNELING').some((f) => runeLabels(f) === 'TUNNELNG'));
// GP6 word "WITHIN" from the actual p57 phrase is included by the encoder.
assert.ok(gpForms('WITHIN').some((f) => runeLabels(f) === 'WITHIN'));

const wordSix = [];
const wordEleven = [];
let lexicalItems = 0;
for (const line of lexicon.split('\n')) {
  if (!line.trim() || line.startsWith(';')) continue;
  const [word, count] = line.trim().split(/\s+/);
  if (!/^[a-z]+$/.test(word)) continue;
  lexicalItems++;
  for (const runes of gpForms(word)) {
    const item = { word, weight: Number(count) || 1, runes };
    if (runes.length === 6) wordSix.push(item);
    else wordEleven.push(item);
  }
}
assert.equal(lexicalItems, 29157);
assert.equal(wordSix.length, 5935);
assert.equal(wordEleven.length, 2247);

const rightIndex = new Map();
for (const item of wordEleven) {
  const key = item.runes.slice(4, 10).join(',');
  if (!rightIndex.has(key)) rightIndex.set(key, []);
  rightIndex.get(key).push(item);
}
assert.equal(rightIndex.size, 1798);

// Key cancels under C0=P0+K mod29, C53=P53+K mod29.
// Thus p53 B[4..9] MUST be (p0 A[0..5]-delta) mod29 for a common pad.
let candidates = [];
for (const left of wordSix) {
  const key = left.runes.map((x, i) => (x - delta[i] + 29) % 29).join(',');
  for (const right of rightIndex.get(key) || []) {
    candidates.push({ left: left.word, right: right.word });
  }
}
assert.deepEqual(candidates, []);

// Planted source-vocabulary positive: changing ONLY the target differences
// to a known-six/known-eleven original alphabet pair MUST detect a pair.
const seedSix = wordSix.find((item) => item.word === 'within');
const seedEleven = wordEleven.find((item) => item.word.length >= 11);
assert.ok(seedSix && seedEleven);
const plantedDelta = seedSix.runes.map(
  (x, i) => (x - seedEleven.runes[i + 4] + 29) % 29,
);
const plantedExpected = seedSix.runes.map(
  (x, i) => (x - plantedDelta[i] + 29) % 29,
).join(',');
assert.ok(rightIndex.get(plantedExpected)?.some(
  (item) => item.word === seedEleven.word,
));

console.log('Original source HTML address pair:', sourceTitle, sourceId);
console.log('Original aligned pages:', 0, 53, 'word lengths: p0=6, p53=11');
console.log('Original 6-rune additive-pad-eliminated delta:', delta.join(','));
console.log('TextBlob English valid tokens:', lexicalItems);
console.log('GP6 candidate spellings:', wordSix.length);
console.log('GP11 candidate spellings:', wordEleven.length);
console.log('Unique six-rune GP11 interior substrings:', rightIndex.size);
console.log('Actual original same-pad two-English-word exact matches:', candidates.length);
console.log('Planted English known-pair differential and source-rune positives: PASS');
console.log('Decision: direct common GP29 additive pad excluded within the');
console.log('stated GP orthography and ~29k English lexicon; unknown plaintext remains');
