'use strict';
/**
 * Original-input SFT for the 2014 14-column permutation followed by the
 * historically solved LP2 p56 prime-totient / plaintext-F-transparent cipher.
 * Node.js 22, CommonJS, Windows 11. No nonstandard dependencies.
 *
 * Historical fixed permutation: 2,8,9,1,12,13,11,4,5,7,3,0,6,10 (zero based).
 * Its application to LP2 is a deliberately frozen hypothesis, not a claimed clue.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const ranges = [[0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,53], [54,55]];
const lengths = ranges.map(([lo, hi]) => gp.pages
  .filter(p => p.page >= lo && p.page <= hi)
  .reduce((s, p) => s + p.indices.length, 0));
const ends = lengths.map((_, i) => lengths.slice(0, i + 1)
  .reduce((s, n) => s + n, 0));
const order = [2,8,9,1,12,13,11,4,5,7,3,0,6,10];

/** @returns {number[][][]} Source-stopped spans containing printed words. */
function parseOriginal() {
  /** @type {number[][][]} */
  const spans = [];
  /** @type {number[][]} */
  let words = [];
  /** @type {number[]} */
  let word = [];
  let runeCount = 0;
  const finishWord = () => { if (word.length) { words.push(word); word = []; } };
  const finishSpan = () => { finishWord(); if (words.length) { spans.push(words); words = []; } };
  for (const ch of transcript) {
    if (alphabet.has(ch)) {
      if (runeCount === 12956) break;
      assert.equal(alphabet.get(ch), gp.pages
        .filter(p => p.page <= 55).flatMap(p => p.indices)[runeCount]);
      word.push(alphabet.get(ch));
      runeCount++;
    } else if (ch === '-') finishWord();
    else if ('.$&§'.includes(ch)) finishSpan();
  }
  finishSpan();
  assert.equal(runeCount, 12956);
  assert.equal(spans.length, 175);
  assert.equal(spans.flat().length, 2896);
  return spans;
}

/** @param {number[][]} words @returns {number[]} */
function pack(words) { return words.flatMap((w, i) => i ? [29, ...w] : w); }

/** @returns {number[][]} */
function chapters() {
  const ch = ranges.map(() => []);
  let g = 0, runes = 0;
  for (const span of parseOriginal()) {
    const n = span.flat().length;
    assert.ok(runes + n <= ends[g], 'Punctuation span crosses a chapter');
    ch[g].push(...pack(span));
    runes += n;
    if (runes === ends[g]) g++;
  }
  assert.equal(g, 9);
  assert.equal(ch.flat().length, 15677);
  assert.equal(ch.flat().filter(n => n === 29).length, 2721);
  assert.deepEqual(ch.map(t => t.filter(n => n < 29).length), lengths);
  return ch;
}

/**
 * Original 2014 horizontal 14-column reorder; the last partial row has no
 * padding and therefore only uses the original columns present.
 * @param {number[]} input @param {boolean} inverse @returns {number[]}
 */
function column14(input, inverse) {
  const output = [];
  for (let i = 0; i < input.length; i += 14) {
    const block = input.slice(i, i + 14);
    const indices = order.filter(j => j < block.length);
    if (inverse) {
      const row = Array(block.length);
      indices.forEach((j, k) => { row[j] = block[k]; });
      output.push(...row);
    } else output.push(...indices.map(j => block[j]));
  }
  return output;
}

/** @param {number} count @returns {number[]} */
function totients(count) {
  const composite = new Uint8Array(180000), key = [];
  for (let p = 2; p < composite.length && key.length < count; p++) {
    if (composite[p]) continue;
    key.push((p - 1) % 29);
    if (p * p < composite.length)
      for (let k = p * p; k < composite.length; k += p) composite[k] = 1;
  }
  assert.equal(key.length, count);
  return key;
}
const key = totients(9000);
const mod = n => (n % 29 + 29) % 29;

/**
 * Exact all-F-skip reachability, no plaintext language assumptions.
 * @param {number[]} cipher @param {number} start @returns {number}
 */
function furthest(cipher, start) {
  let states = [0];
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i], seen = new Uint8Array(i + 2), next = [];
    for (const used of states) {
      if (c === 0 && !seen[used]) {
        next.push(used); seen[used] = 1;
      }
      if (mod(c - key[start + used]) !== 0 && !seen[used + 1]) {
        next.push(used + 1); seen[used + 1] = 1;
      }
    }
    if (!next.length) return i;
    states = next;
  }
  return cipher.length;
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const token = gp.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const s = word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = token.find(v => s.startsWith(v.s, i));
    assert.ok(t, 'Invalid GP29 positive-control token');
    out.push(t.i); i += t.s.length;
  }
  return out;
}

/** @param {number[]} plain @param {number} start @returns {number[]} */
function encrypt(plain, start) {
  let used = 0;
  return plain.map(p => p === 0 ? 0 : mod(p + key[start + used++]));
}

const positive = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(positive.length, 85);
assert.deepEqual(encrypt(positive, 0), gp.pages.find(p => p.page === 56).indices);
assert.equal(furthest(encrypt(positive, 0), 0), 85);
assert.equal(furthest(encrypt(positive, 167), 167), 85);
console.log('AUTHENTIC p56 plus shifted prime-clock GP29/F positives: 85/85 PASS');

const source = chapters();
const expectedSurvivors = [
  [[1724], [3832,3833]], [[],[]], [[],[]], [[],[]],
  [[],[]], [[],[]], [[],[]], [[],[]], [[],[1246,1247,3269,3338]]
];
const expectedMax = [
  [729,729], [696,481], [375,636], [585,575], [555,572],
  [572,668], [537,498], [653,563], [304,308]
];
for (let i = 0; i < source.length; i++) {
  assert.deepEqual(column14(column14(source[i], false), true), source[i]);
  for (const [k, inverse] of [false, true].entries()) {
    const shuffled = column14(source[i], inverse);
    const cipher = shuffled.filter(n => n < 29);
    assert.equal(cipher.length, lengths[i]);
    const viable = [];
    let max = 0;
    for (let start = 0; start < 5000; start++) {
      const reached = furthest(cipher, start);
      if (reached > max) max = reached;
      if (reached === cipher.length) viable.push(start);
    }
    assert.deepEqual(viable, expectedSurvivors[i][k]);
    assert.equal(max, expectedMax[i][k]);
    console.log(JSON.stringify({
      chapter: ranges[i].join('-'),
      direction: inverse ? 'inverse' : 'forward',
      originalRunes: cipher.length, sourceTokens: source[i].length,
      candidatePrimeStarts: viable, furthestAmong5000: max
    }));
  }
}
console.log('All 9 original chapters, both source-historical 14-column directions,');
console.log('all prime starts 0..4999, all legal F-skip paths: PASS.');
console.log('7 chapters have zero paths in either direction; p3-7 and p40-53 blind: zero.');
console.log('No authentic unknown-page plaintext or author-selected LP2 14-column rule.');
