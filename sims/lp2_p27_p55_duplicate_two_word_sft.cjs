'use strict';

/**
 * Exact-original LP2 p27/p55 repeated terminal phrase audit.
 *
 * Reads canonical original-runic transcriptions and leaves all runes unaltered.
 * The restricted word-order null permutes only whole three-rune tokens across
 * the fixed three-rune positions; it preserves the complete word inventory,
 * punctuation, line/page geometry and eligibility of each 3+3 adjacency.
 * Its expectation and union bound are analytical, with no random tuning.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const transcript = fs.readFileSync(
  path.join(root, 'resources', 'transcriptions', 'liber_primus_master.txt'),
  'utf8'
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const motif = 'ᛞᛄᚢ-ᛒᛖᛁ';
const runes = new Set('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ');

const unknown = corpus.pages.filter(p => p.page <= 55);
const ciphertext = [];
const locations = [];
for (const page of unknown) {
  for (let i = 0; i < page.indices.length; i++) {
    ciphertext.push(page.indices[i]);
    locations.push({ page: page.page, offset: i });
  }
}
assert.equal(ciphertext.length, 12956);
assert.equal(unknown.length, 56);

const repeatedGrams = new Map();
const knownGrams = new Map();
for (let i = 0; i + 6 <= ciphertext.length; i++) {
  const key = ciphertext.slice(i, i + 6).join(',');
  if (knownGrams.has(key)) {
    const old = repeatedGrams.get(key) || [knownGrams.get(key)];
    old.push(i);
    repeatedGrams.set(key, old);
  } else {
    knownGrams.set(key, i);
  }
}
assert.equal(repeatedGrams.size, 1);
const repeatIndices = [...repeatedGrams.values()][0];
assert.deepEqual(repeatIndices.map(i => locations[i]), [
  { page: 27, offset: 28 },
  { page: 55, offset: 70 }
]);
assert.deepEqual(
  ciphertext.slice(repeatIndices[0], repeatIndices[0] + 6),
  [23, 11, 1, 17, 18, 10]
);
assert.equal(repeatIndices[1] - repeatIndices[0], 6395);

const sourceStart = transcript.indexOf('ᛋᚻᛖᚩᚷᛗᛡᚠ');
const first = transcript.indexOf(motif, sourceStart);
const second = transcript.indexOf(motif, first + motif.length);
assert.ok(sourceStart > 0);
assert.equal(first, 12896);
assert.equal(second, 22193);
assert.equal(transcript.indexOf(motif, second + motif.length), -1);
assert.equal(transcript[second + motif.length], '.');
assert.equal(transcript[first + motif.length], '-');

// "/" is a printed line break, not a word boundary. A physical page
// break can divide a word: the token count below counts 32 split fragments.
const original = transcript.slice(sourceStart, second + motif.length + 1)
  .replace(/\/\s*/g, '')
  .replace(/\n/g, '');
const pieces = [];
let current = '';
let currentKind = '';
for (const rune of original) {
  const kind = runes.has(rune) ? 'rune' : (rune === '-' ? 'dash' : 'other');
  if (kind === currentKind) {
    current += rune;
  } else {
    if (current) pieces.push({ kind: currentKind, text: current });
    current = rune;
    currentKind = kind;
  }
}
if (current) pieces.push({ kind: currentKind, text: current });

const words = pieces.filter(p => p.kind === 'rune').map(p => p.text);
assert.equal(words.length, 2928); // 2896 complete printed words + 32 page carries
const pairs = new Map();
for (let i = 0; i + 2 < pieces.length; i++) {
  if (pieces[i].kind !== 'rune' || pieces[i + 1].kind !== 'dash' ||
      pieces[i + 1].text !== '-' || pieces[i + 2].kind !== 'rune') continue;
  const term = pieces[i].text + '-' + pieces[i + 2].text;
  pairs.set(term, (pairs.get(term) || 0) + 1);
}
const repeatedPairs = [...pairs].filter(([term, n]) => n > 1);
assert.equal([...pairs.values()].reduce((a, b) => a + b, 0), 2715);
assert.deepEqual(repeatedPairs, [[motif, 2]]);

const alphabet3 = [];
const loc3 = new Map();
for (let i = 0; i < pieces.length; i++) {
  if (pieces[i].kind === 'rune' && pieces[i].text.length === 3) {
    loc3.set(i, alphabet3.length);
    alphabet3.push(pieces[i].text);
  }
}
const edges = [];
for (let i = 0; i + 2 < pieces.length; i++) {
  if (!loc3.has(i) || !loc3.has(i + 2) ||
      pieces[i + 1].kind !== 'dash' || pieces[i + 1].text !== '-') continue;
  edges.push([loc3.get(i), loc3.get(i + 2)]);
}
const freq = new Map();
for (const word of alphabet3) freq.set(word, (freq.get(word) || 0) + 1);
const actual3 = new Map();
for (const [a, b] of edges) {
  const pair = alphabet3[a] + '-' + alphabet3[b];
  actual3.set(pair, (actual3.get(pair) || 0) + 1);
}
assert.deepEqual([...actual3].filter(([term, n]) => n > 1), [[motif, 2]]);
assert.equal(alphabet3.length, 726);
assert.equal(edges.length, 174);
assert.equal(freq.size, 710);

let overlap = 0;
for (let i = 0; i < edges.length; i++) {
  for (let j = i + 1; j < edges.length; j++) {
    const a = edges[i];
    const b = edges[j];
    if (a[0] === b[0] || a[0] === b[1] ||
        a[1] === b[0] || a[1] === b[1]) overlap++;
  }
}
const counts = [...freq.values()];
const orderedDoublets = counts.reduce((sum, n) => sum + n * (n - 1), 0);
const orderedDoubletsSquared = counts.reduce(
  (sum, n) => sum + (n * (n - 1)) ** 2, 0
);
const orderedTriples = counts.reduce(
  (sum, n) => sum + n * (n - 1) * (n - 2), 0
);
const n = alphabet3.length;
const numberOfEdgePairs = edges.length * (edges.length - 1) / 2;
const pDisjoint = (orderedDoublets ** 2 - orderedDoubletsSquared) /
  (n * (n - 1) * (n - 2) * (n - 3));
const pOverlap = orderedTriples / (n * (n - 1) * (n - 2));
const expectation = (numberOfEdgePairs - overlap) * pDisjoint +
  overlap * pOverlap;
assert.equal(overlap, 33);
assert.equal(orderedDoublets, 34);
assert.equal(orderedDoubletsSquared, 92);
assert.equal(orderedTriples, 6);
assert.ok(expectation > 0.0000585 && expectation < 0.0000586);

// This expectation is also an exact union/Markov upper bound on the
// probability of >=1 duplicated 3+3 phrase under this conditional null.
// It is not a p-value adjusted for the search history of Liber Primus.
console.log(JSON.stringify({
  originalRuneCount: ciphertext.length,
  uniqueRepeatedSixRuneString: motif,
  repeatedAt: repeatIndices.map(i => ({ ...locations[i], globalOffset: i })),
  repeatedEntireWordPairs: repeatedPairs,
  threeRuneWords: n,
  threePlusThreeSlots: edges.length,
  threeRuneDuplicatedWordTypes: counts.filter(k => k > 1).length,
  null: {
    model: 'shuffle the 726 three-rune whole words among fixed length-three slots',
    overlappingEdgePairs: overlap,
    disjointEdgePairs: numberOfEdgePairs - overlap,
    expectedDuplicatePhrasePairs: expectation,
    rigorousPAnyDuplicateUpperBound: expectation
  }
}, null, 2));
