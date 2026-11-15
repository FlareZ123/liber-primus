'use strict';

/**
 * LP2 whole-word length crib gate against historically motivated source texts.
 * Reproduction: node sims/lp2_wordlength_reference_quotation_sft.cjs
 * Node.js 22, CommonJS, no external dependencies or file writes.
 *
 * This matches rune counts, not English character counts. Under the GP29
 * source-native register, ING and IO and the seven other multigraphs can
 * each occupy one rune. It never attempts plaintext recovery by fitting keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {string} */
const load = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const canon = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const parts = load('resources/liber-primus/lp2-transcription.txt').split(/\r?\n%\r?\n/);
const runeSet = new Set(canon.runes);
assert.equal(parts.length, 57);

/**
 * Merge source line and physical-page continuations, then preserve only actual
 * printed word boundaries. Dot punctuation terminates words, not fields.
 * @param {string} text
 * @returns {number[]}
 */
function wordLengths(text) {
  const lengths = [];
  let n = 0;
  for (const ch of text) {
    if (runeSet.has(ch)) n++;
    else if ('- .⁘,:&;!?'.includes(ch) && n) {
      lengths.push(n);
      n = 0;
    }
  }
  if (n) lengths.push(n);
  return lengths;
}
const unknown = wordLengths(parts.slice(0, -2).join(''));
const source = canon.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const transcribed = [...parts.slice(0, -2).join('')]
  .filter(ch => runeSet.has(ch))
  .map(ch => canon.runes.indexOf(ch));
assert.deepEqual(transcribed, source);
assert.equal(source.length, 12956);
assert.equal(unknown.length, 2896);
assert.equal(unknown.reduce((a, b) => a + b, 0), source.length);
assert.equal(Math.max(...unknown), 14);

/** @type {string[]} */
const GP_GROUPS = ['ING', 'IO', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
/** @param {string} word @returns {number} */
function gpLength(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  let n = 0;
  for (let i = 0; i < s.length; n++) {
    const g = GP_GROUPS.find(group => s.startsWith(group, i));
    i += g ? g.length : 1;
  }
  return n;
}

// Source-authentic positive: p57 PARABLE is plain GP29 runes.
const parable = 'PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE';
const parableLens = parable.split(' ').map(gpLength);
assert.deepEqual(wordLengths(parts.at(-1)), parableLens);
assert.equal(parableLens.reduce((a, b) => a + b, 0), 95);

const documents = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/external/blake-marriage-1906-gutenberg45315.txt',
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt'
];
// Archived Liber AL bookcode I–III are duplicates of the Crowley texts,
// so indexing both would double-count candidate matches.
const refs = documents.flatMap(sourcePath => {
  const tokens = load(sourcePath).match(/[A-Za-z]+/g) || [];
  return ['latin', 'gp'].map(mode => ({
    sourcePath,
    mode,
    values: tokens.map(word => mode === 'gp' ? gpLength(word) : word.length)
  }));
});
assert.equal(refs.length, 14);

const K = 8;
/**
 * Collision-free base-16 coding for eight GP-rune word lengths in 1..15.
 * @param {number[]} values @param {number} start @returns {number}
 */
function key(values, start) {
  let k = 0;
  for (let i = 0; i < K; i++) {
    const value = values[start + i];
    if (value < 1 || value > 15) return -1;
    k = k * 16 + value;
  }
  return k;
}
/** @type {Map<number, [number, number][]>} */
const index = new Map();
let indexed = 0;
refs.forEach((ref, id) => {
  for (let i = 0; i + K <= ref.values.length; i++) {
    const k = key(ref.values, i);
    if (k < 0) continue;
    const positions = index.get(k);
    if (positions) positions.push([id, i]);
    else index.set(k, [[id, i]]);
    indexed++;
  }
});
assert.equal(indexed, 318842);

/**
 * Exact contiguous lengths, no insertions, edits, omitted words or tuned
 * offsets. Return all 10-word matches and the global longest hit.
 * @param {number[]} values
 * @param {boolean} captureHits
 * @returns {{max:number,ten:number,hits:Array<{word:number,source:string,mode:string,sourceIndex:number,length:number}>}}
 */
function evaluate(values, captureHits = false) {
  let max = 0;
  let ten = 0;
  const hits = [];
  for (let i = 0; i + K <= values.length; i++) {
    const k = key(values, i);
    if (k < 0) continue;
    for (const [refId, j] of index.get(k) || []) {
      const b = refs[refId].values;
      let n = K;
      while (i + n < values.length && j + n < b.length && values[i + n] === b[j + n]) n++;
      if (n >= 10) ten++;
      if (n > max) {
        max = n;
        hits.length = 0;
      }
      if (captureHits && n === max) hits.push({
        word: i,
        source: refs[refId].sourcePath,
        mode: refs[refId].mode,
        sourceIndex: j,
        length: n
      });
    }
  }
  return { max, ten, hits };
}
const original = evaluate(unknown, true);
assert.equal(original.max, 10);
assert.equal(original.ten, 2);
assert.deepEqual(original.hits.map(h => [h.word, h.sourceIndex, h.length]),
  [[910, 72743, 10], [2514, 48612, 10]]);
assert.ok(original.hits.every(h =>
  h.source === 'resources/control/emerson_essays_2944.txt' && h.mode === 'latin'));

// Deterministic conditional null: shuffle single lengths, and shuffle intact
// four-word blocks, preserving the original marginal counts and local motifs.
let seed = 0x51f15e7;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
/** @template T @param {T[]} values @returns {T[]} */
function shuffle(values) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
const sim = {
  word: { max: [], ten: [] },
  block4: { max: [], ten: [] }
};
for (let repeat = 0; repeat < 300; repeat++) {
  const a = evaluate(shuffle(unknown.slice()));
  sim.word.max.push(a.max);
  sim.word.ten.push(a.ten);
  const blocks = [];
  for (let i = 0; i < unknown.length; i += 4) blocks.push(unknown.slice(i, i + 4));
  const b = evaluate(shuffle(blocks).flat());
  sim.block4.max.push(b.max);
  sim.block4.ten.push(b.ten);
}
/** @param {{max:number[],ten:number[]}} values @returns {object} */
function summarize(values) {
  const hist = {};
  for (const n of values.max) hist[n] = (hist[n] || 0) + 1;
  const n = values.max.length;
  return {
    iterations: n,
    maxHistogram: hist,
    exceedMax: values.max.filter(x => x >= original.max).length,
    exceedTen: values.ten.filter(x => x >= original.ten).length,
    meanTen: values.ten.reduce((a, b) => a + b, 0) / n,
    pMax: (values.max.filter(x => x >= original.max).length + 1) / (n + 1),
    pTwoHits: (values.ten.filter(x => x >= original.ten).length + 1) / (n + 1)
  };
}
const word = summarize(sim.word);
const block4 = summarize(sim.block4);
assert.equal(word.exceedMax, 293);
assert.equal(word.exceedTen, 275);
assert.equal(block4.exceedMax, 292);
assert.equal(block4.exceedTen, 271);

console.log(JSON.stringify({
  originalRunes: source.length, originalWords: unknown.length,
  referenceDocuments: documents.length, referenceRegisters: refs.length,
  indexedEightWordWindows: indexed, p57Positive: parableLens.length,
  original, wordNull: word, block4Null: block4,
  conclusion: 'no distinctive full-word source quotation or authentic unknown plaintext'
}, null, 2));
