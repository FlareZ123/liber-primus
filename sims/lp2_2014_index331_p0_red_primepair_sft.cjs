'use strict';

/**
 * Cross-artifact source clue and falsifiable direct-consumer check.
 *
 * Original 2014 onion index metadata (pinned archival source):
 * https://github.com/micheloosterhof/cicada-2014/blob/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion/index.html
 *
 * It literally prints <title>133</title> and <div id="331">. The exact
 * source-original p0 red title is S... / S... in 8+5 GP29 runes.
 * Do not construe postselected arithmetic as original cipher proof.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-transcription.txt'), 'utf8');

const htmlTitle = 133;
const htmlDivId = 331;
const page0 = corpus.pages.find(p => p.page === 0);
const red = ink.pages.find(p => p.page === 0).red_spans;
assert.equal(red.length, 1);
assert.equal(red[0].start, 0);
assert.equal(red[0].length, 13);
const title = page0.indices.slice(0, 13);
assert.equal(title[0], 15);
assert.equal(title[8], 15);
assert.equal(title.length, 13);
assert.equal(page0.indices.length, page0.runic_count);

const gpSum = xs => xs.reduce((a, x) => a + corpus.prime[x], 0);
const left = gpSum(title.slice(0, 8));
const right = gpSum(title.slice(8, 13));
assert.equal(left, 347);
assert.equal(right, 315);
assert.equal(left + right, 2 * htmlDivId);
assert.equal(left - htmlDivId, title[0] + 1);
assert.equal(htmlDivId - right, title[8] + 1);
assert.equal(Number(String(htmlDivId).split('').reverse().join('')), htmlTitle);

const text = transcription.split('%').slice(0, 55).join('\n');
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
/** @type {{a:number[],pos:number}[]} */
const words = [];
let w = [];
let n = 0;
function flush() {
  if (!w.length) return;
  words.push({a:w, pos:n-w.length});
  w = [];
}
for (const ch of text) {
  if (alphabet.has(ch)) {
    w.push(alphabet.get(ch));
    n++;
  } else if ('-.$&'.includes(ch)) flush();
}
flush();
assert.equal(n, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flatMap(x => x.a),
  corpus.pages.filter(x => x.page < 56).flatMap(x => x.indices));
assert.deepEqual(words[0].a, title.slice(0,8));
assert.deepEqual(words[1].a, title.slice(8));
let pairs85 = 0;
let sumMatch = 0;
let fullMatch = 0;
let fullMatchOtherLengths = 0;
for (let i = 0; i + 1 < words.length; i++) {
  const a = words[i].a;
  const b = words[i+1].a;
  const equalFirst = a[0] === b[0];
  const arithmetic = gpSum(a) + gpSum(b) === 2 * htmlDivId &&
    Math.abs(gpSum(a) - gpSum(b)) === 2 * (a[0] + 1);
  if (a.length === 8 && b.length === 5) {
    pairs85++;
    if (gpSum(a) + gpSum(b) === 662) sumMatch++;
    if (equalFirst && arithmetic) {
      fullMatch++;
      assert.equal(i, 0);
    }
  }
  if (equalFirst && arithmetic) {
    fullMatchOtherLengths++;
    assert.equal(i, 0);
  }
}
assert.equal(pairs85, 19);
assert.equal(sumMatch, 1);
assert.equal(fullMatch, 1);
assert.equal(fullMatchOtherLengths, 1);

/**
 * Permutation null conditional on the exact thirteen-rune title multiset.
 * Given first runes both S (index15, one-based16), all 330 seven-of-eleven
 * allocations of remaining individually labelled runes are equally likely.
 * Four yield original first word's 347 GP-prime total.
 * P(two initial Ss) = (2/13)*(1/12), hence P(joint exact condition) = 1/6435.
 * This is conditional specificity, not a pre-registered authorship p-value.
 */
const other = title.slice();
other.splice(other.indexOf(15), 1);
other.splice(other.indexOf(15), 1);
assert.equal(other.length, 11);
let allocations = 0;
let selected = 0;
for (let mask = 0; mask < (1 << 11); mask++) {
  let count = 0;
  let s = 0;
  for (let i = 0; i < 11; i++) {
    if ((mask >>> i) & 1) {
      count++;
      s += corpus.prime[other[i]];
    }
  }
  if (count !== 7) continue;
  allocations++;
  if (s + corpus.prime[15] === 347) selected++;
}
assert.equal(allocations, 330);
assert.equal(selected, 4);
assert.equal(25740 / selected, 6435);

/** @param {number} count @returns {{p:number[],k:number[]}} */
function phiPrimes(count) {
  const sieve = new Uint8Array(140000);
  const p = [];
  const k = [];
  for (let x = 2; x < sieve.length && p.length < count; x++) {
    if (sieve[x]) continue;
    p.push(x);
    k.push((x - 1) % 29);
    if (x * x < sieve.length) {
      for (let z = x * x; z < sieve.length; z += x) sieve[z] = 1;
    }
  }
  assert.equal(p.length, count);
  return {p,k};
}
const {p,k} = phiPrimes(2000);
const mod29 = x => (x % 29 + 29) % 29;

/**
 * Exact forward-feasible prefix under the authentic p56 literal-F bypass.
 * @param {number[]} cipher
 * @param {number} start
 */
function furthest(cipher,start) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const used of states) {
      if (cipher[i] === 0) next.add(used);
      const candidate = mod29(cipher[i] - k[start + used]);
      if (candidate !== 0) next.add(used + 1);
    }
    if (!next.size) return i;
    states = next;
  }
  return cipher.length;
}
/** @param {number[]} plain @param {number} start */
function encrypt(plain,start) {
  let used = 0;
  return plain.map(x => x === 0 ? 0 : mod29(x + k[start + used++]));
}

const black = page0.indices.slice(13);
assert.equal(black.length, 249);
const starts = [
  {label:'331st prime ordinal',index:330,expected:24},
  {label:'prime whose value is 331',index:p.indexOf(331),expected:25},
  {label:'133rd prime ordinal',index:132,expected:2}
];
for (const start of starts) {
  assert.ok(start.index >= 0);
  const reach = furthest(black, start.index);
  assert.equal(reach, start.expected);
  const positive = corpus.pages.find(x => x.page === 57).indices;
  const plant = Array.from({length:black.length},(_,i)=>positive[i % positive.length]);
  const cPlant = encrypt(plant,start.index);
  assert.equal(furthest(cPlant,start.index),plant.length);
  console.log('direct p56 source-number transfer', start.label,
    'keyStart=' + start.index,
    'realOriginalReach=' + reach + '/' + black.length,
    'nativePlant=' + plant.length + '/' + plant.length);
}
console.log('HTML source metadata title=' + htmlTitle, 'divId=' + htmlDivId);
console.log('p0 red title GP sums', left, right,
  'shared initial rune ordinal=' + (title[0] + 1));
console.log('whole original adjacent8|5 pairs=' + pairs85,
  'sum662 pairs=' + sumMatch, 'exact sameS plus/minus16 pairs=' + fullMatch);
console.log('conditional labelled-title permutation specificity=' +
  selected + '/' + (allocations * 78));
console.log('PASS: original-first-page cross-artifact numeric relation' +
  ' and negative direct historical first-prime consumers.');
