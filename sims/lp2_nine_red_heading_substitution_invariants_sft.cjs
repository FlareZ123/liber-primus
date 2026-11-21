'use strict';

/**
 * Nine original LP2 red-heading substitution and shared-clock gates.
 * Run as a single CommonJS SFT under Node.js 22.
 * Original headings are selected only by ink annotation and printed source order.
 * Title word lengths, source ciphertext, and native-GP English controls are fixed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const starts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const byPage = new Map(ink.pages.map(p => [p.page, p]));
const runeSet = new Set(corpus.runes);
const physicalTexts = transcript.split('%');
const titles = [];
const wordLengths = [];
for (const page of starts) {
  const mark = byPage.get(page);
  const spans = mark.red_spans.filter(span => span.start === 0);
  assert.equal(spans.length, 1);
  const expected = spans[0].length;
  const original = corpus.pages[page].indices.slice(0, expected);
  assert.equal(original.length, expected);
  titles.push(original);
  const source = physicalTexts[page < 50 ? page : page - 1];
  let seen = 0;
  let word = 0;
  const lengths = [];
  for (const ch of source) {
    if (seen === expected) break;
    if (runeSet.has(ch)) {
      seen++;
      word++;
    } else if ('-.$&§'.includes(ch) && word) {
      lengths.push(word);
      word = 0;
    }
  }
  if (word) lengths.push(word);
  assert.equal(seen, expected);
  assert.equal(lengths.reduce((a, b) => a + b, 0), expected);
  wordLengths.push(lengths);
}
assert.deepEqual(titles.map(t => t.length), [13,16,12,9,16,19,10,8,9]);
assert.deepEqual(wordLengths, [
  [8,5],[2,11,3],[4,8],[4,5],[2,6,3,5],
  [3,12,4],[2,8],[3,5],[1,8]
]);

/** @param {number[]} values @returns {number} */
function collision(values) {
  const counts = new Uint16Array(29);
  for (const v of values) counts[v]++;
  let total = 0;
  for (const v of counts) total += v * (v - 1) / 2;
  return total;
}
/** @param {number[][]} items @returns {{flat:number,within:number,aligned:number}} */
function statistic(items) {
  const flat = collision(items.flat());
  const within = items.reduce((t, item) => t + collision(item), 0);
  let aligned = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      for (let k = 0; k < Math.min(items[i].length, items[j].length); k++) {
        if (items[i][k] === items[j][k]) aligned++;
      }
    }
  }
  return {flat, within, aligned};
}
const original = statistic(titles);
assert.deepEqual(original, {flat:217,within:27,aligned:11});

// Exact invariants for three genuinely different candidate cipher families.
// These are implementation positives, not historical claims.
const globalSubstitution = titles.map(title => title.map(v => (7*v+3)%29));
assert.deepEqual(statistic(globalSubstitution), original);
const independentTitleCaesar = titles.map((title,i) => title.map(v => (v+3*i)%29));
assert.equal(statistic(independentTitleCaesar).within, original.within);
const commonPositionKey = titles.map(title => title.map((v,i) => (v+7*i+3)%29));
assert.equal(statistic(commonPositionKey).aligned, original.aligned);

const alphabet = corpus.translit.map((symbol,i) => ({symbol,i}))
  .sort((a,b) => b.symbol.length - a.symbol.length);
/** @param {string} originalWord @returns {number[]} */
function gpWord(originalWord) {
  const word = originalWord.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/Q/g, 'C');
  const out = [];
  for (let i = 0; i < word.length;) {
    const m = alphabet.find(item => word.startsWith(item.symbol, i));
    if (!m) return [];
    out.push(m.i);
    i += m.symbol.length;
  }
  return out;
}
const dictionary = Array.from({length:16}, () => []);
for (const file of [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt'
]) {
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const gp = gpWord(word);
    if (gp.length && gp.length < dictionary.length) {
      dictionary[gp.length].push(gp);
    }
  }
}
for (const l of new Set(wordLengths.flat())) {
  assert.ok(dictionary[l].length > 0, 'missing native GP word length ' + l);
}

let state = 0x33012026;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @returns {number[][]} */
function sampleTitles() {
  return wordLengths.map(lengths =>
    lengths.flatMap(n => dictionary[n][random32()%dictionary[n].length]));
}
const samples = 30000;
const keys = ['flat','within','aligned'];
const countLE = {flat:0,within:0,aligned:0};
const min = {flat:Infinity,within:Infinity,aligned:Infinity};
const sum = {flat:0,within:0,aligned:0};
for (let iter = 0; iter < samples; iter++) {
  const sample = statistic(sampleTitles());
  for (const key of keys) {
    countLE[key] += Number(sample[key] <= original[key]);
    min[key] = Math.min(min[key], sample[key]);
    sum[key] += sample[key];
  }
}
assert.deepEqual(countLE, {flat:0,within:730,aligned:53});
assert.deepEqual(min, {flat:282,within:19,aligned:8});
console.log(JSON.stringify({
  hypothesis: 'GP-English original title plaintext under global title substitution, independently rekeyed per-title substitution, or common title-position bijection',
  sourcePages: starts,
  titleLengths: titles.map(t => t.length),
  original,
  possiblePairs: {flat:6216,within:700,aligned:366},
  nativeEnglishControls: {
    sourceFiles: ['shakespeare_first300k.txt','gibran_prophet_58585.txt'],
    samples,
    seed: '0x33012026',
    mean: Object.fromEntries(keys.map(k => [k,sum[k]/samples])),
    minimum: min,
    lessOrEqual: countLE,
    empiricalLowerTail: Object.fromEntries(keys.map(k => [k,(countLE[k]+1)/(samples+1)]))
  },
  positivePermutationControlsPassed: true,
  result: 'No original plaintext or key recovered. Restricts three fixed title-only English substitution/key-reuse hypotheses, not arbitrary keyed chapter ciphers.'
}, null, 2));
