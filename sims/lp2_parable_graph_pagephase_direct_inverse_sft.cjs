'use strict';

/**
 * Original LP2 PARABLE numeric-graph page mapping: bounded direct inverses.
 * A Windows Node 22 single-file test. Read-only: no file writes.
 *
 * Source-pinned base60 table, original p0-57 corpus and printed word/rune layout.
 * The graph-to-page assignment remains hypothetical; this SFT tests only two
 * simple, reproducible GP29 additive receivers and a raw 32x8 coordinate read.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8');
const B = grid.bytes;
assert.equal(B.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(B)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const child = Array.from({ length: 256 }, () => []);
B.forEach((parent, node) => {
  assert(Number.isInteger(parent) && parent >= 0 && parent < 256);
  child[parent].push(node);
});
/** @type {Map<number,number>} */
const sizes = new Map();
/** @param {number} node @returns {number} */
function subtreeSize(node) {
  if (sizes.has(node)) return sizes.get(node);
  const n = 1 + child[node].reduce((sum, x) => sum + subtreeSize(x), 0);
  sizes.set(node, n);
  return n;
}
assert.deepEqual([205, 173, 201, 82, 128].map(subtreeSize), [58, 8, 56, 50, 5]);

/** @type {number[]} */
const pageNode = [];
/** @param {number} node @returns {void} */
function traverse(node) {
  const kids = child[node].slice().sort((a, b) => subtreeSize(b) - subtreeSize(a) || a - b);
  if (kids.length) traverse(kids[0]);
  pageNode.push(node);
  for (const k of kids.slice(1)) traverse(k);
}
traverse(205);
assert.equal(pageNode.length, 58);
assert.equal(new Set(pageNode).size, 58);
assert.deepEqual([pageNode[50], pageNode[55], pageNode[56], pageNode[57]],
  [201, 128, 74, 205]);
/**
 * The pre-existing nine original illustrated chapter starts (p0,3,8,15,23,
 * 27,33,40,54) supply an independent holdout for this conjectural traversal.
 * Only whole reverse subtrees count; unions or fitted swaps are not allowed.
 * @type {[number,number][]}
 */
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const pageOf = new Map(pageNode.map((node, page) => [node, page]));
/** @param {number} node @returns {number[]} */
function descendants(node) {
  return [node, ...child[node].flatMap(descendants)];
}
const subtreeIntervals = pageNode.map(node => {
  const positions = descendants(node).map(n => pageOf.get(n));
  return [Math.min(...positions), Math.max(...positions)];
});
const exactChapters = chapters.flatMap(([start,end],j) =>
  subtreeIntervals.some(([a,b],k) =>
    a===start && b===end && subtreeSize(pageNode[k])===end-start+1) ? [j] : []);
assert.deepEqual(exactChapters, [0,6]);
// Topology-only: no reordering of nodes can create a 14-member rooted subtree.
assert.equal([...sizes.values()].filter(n => n === 14).length, 0);
assert.equal(chapters[7][1] - chapters[7][0] + 1, 14);
console.log('printed illustrated chapters as complete graph subtrees:',
  exactChapters.length, '/', chapters.length, 'chapters', exactChapters);


/** @param {number} n @returns {number} */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const value of sequence) counts[value]++;
  return counts.reduce((sum, v) => sum + v * (v - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
/**
 * @param {'linear'|'walk'} mode
 * @param {number} node
 * @param {number} length
 * @returns {number[]}
 */
function keyStream(mode, node, length) {
  let state = node;
  const result = [];
  for (let i = 0; i < length; i++) {
    const idx = mode === 'linear' ? (node + i) & 255 : state;
    const next = B[idx];
    result.push(mod29(next));
    if (mode === 'walk') state = next;
  }
  return result;
}
/** @param {number[]} text @param {number[]} key @returns {number[]} */
const decrypt = (text, key) => text.map((n, i) => mod29(n - key[i]));
/** @param {number[]} text @param {number[]} key @returns {number[]} */
const encrypt = (text, key) => text.map((n, i) => mod29(n + key[i]));

const unknown = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(unknown.reduce((a, p) => a + p.indices.length, 0), 12956);
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
assert(Math.abs(ioc(known) - 0.06270996640537514) < 1e-12);
for (const mode of ['linear', 'walk']) {
  const decoded = [], byPage = [];
  for (const page of unknown) {
    const key = keyStream(mode, pageNode[page.page], page.indices.length);
    const plain = decrypt(page.indices, key);
    decoded.push(...plain);
    byPage.push(ioc(plain));
    assert.deepEqual(encrypt(plain, key), page.indices);
  }
  const plantedKey = keyStream(mode, pageNode[55], known.length);
  assert.deepEqual(decrypt(encrypt(known, plantedKey), plantedKey), known);
  const score = ioc(decoded);
  assert(Math.abs(score - (mode === 'linear'
    ? 0.03448135297224856 : 0.03447967285050765)) < 1e-12);
  assert.equal(byPage.filter(n => n > 0.05).length, 0);
  console.log(mode, 'original runes', decoded.length, 'IOC', score,
    'pages with IOC > 0.05', 0);
}

const runeId = new Map(corpus.runes.map((r, i) => [r, i]));
const segments = transcript.split('%')
  .map(page => page.replace(/[\s/]/g, '')
    .split(/[-.&$§]+/u).filter(Boolean)
    .map(word => [...word].filter(ch => runeId.has(ch))))
  .filter(words => words.length);
const runePages = corpus.pages.filter(p => p.indices.length);
assert.equal(segments.length, runePages.length);
const words = new Map();
runePages.forEach((page, i) => {
  assert.equal(segments[i].flat().length, page.indices.length);
  words.set(page.page, segments[i]);
});
assert.equal(words.get(55).length, 17);
assert.equal(words.get(57).length, 20);
const text = [], missed = [];
for (const page of runePages) {
  const node = pageNode[page.page];
  const row = Math.floor(node / 8);
  const col = node % 8;
  const pageWords = words.get(page.page);
  if (row >= pageWords.length || col >= pageWords[row].length) {
    missed.push(page.page);
    continue;
  }
  text.push(corpus.translit[runeId.get(pageWords[row][col])]);
}
assert.equal(text.length, 32);
assert.equal(missed.length, 25);
assert(missed.includes(49) && missed.includes(57));
assert.equal(text.join(' '),
  'AE O N X A P C T NG I X S L N P G L U D X G R G W F M U H W C B Y');
console.log('32x8 word/rune receiver:', text.length, 'valid,', missed.length,
  'invalid; stream:', text.join(' '));
console.log('PASS: exact original-input graph mapping and direct inverse gates');
