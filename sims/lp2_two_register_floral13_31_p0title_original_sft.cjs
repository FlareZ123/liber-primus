'use strict';

/**
 * Single reversible source-shaped GP29 two-register candidate, Node 22.
 * p0 red title: sum GP index=181 -> 7, sum GP primes=662 -> 24.
 * Floral discs: 13 and 31 (mod29=2), but source does not specify a cipher.
 * C=P+s, (s',t')=(t,13*s+31*t+C) mod29. One continuous whole-book clock.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const inks = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));

const red = inks.pages.find(p => p.page === 0).red_spans[0];
assert.equal(red.start, 0);
assert.equal(red.length, 13);
const rubric = [...red.runes].map(glyph => corpus.runes.indexOf(glyph));
assert.deepEqual(rubric, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(rubric.reduce((sum, n) => sum + n, 0), 181);
assert.equal(rubric.reduce((sum, n) => sum + corpus.prime[n], 0), 662);
const S0 = 181 % 29;
const T0 = 662 % 29;
assert.deepEqual([S0,T0],[7,24]);

/**
 * @param {number[]} symbols Source GP29 indices.
 * @param {'encrypt'|'decrypt'} mode
 * @returns {number[]}
 */
function cipher(symbols, mode) {
  let s = S0;
  let t = T0;
  const output = [];
  for (const symbol of symbols) {
    const c = mode === 'encrypt' ? (symbol + s) % 29 : symbol;
    output.push(mode === 'encrypt' ? c : (c - s + 29) % 29);
    const next = (13 * s + 31 * t + c) % 29;
    s = t;
    t = next;
  }
  return output;
}
/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  a.forEach(x => counts[x]++);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

const pages = corpus.pages.filter(p => p.page <= 55);
assert.equal(pages.length, 56);
assert.equal(pages.find(p => p.page === 50).indices.length, 0);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.deepEqual(original.slice(0,13),rubric);
const decoded = cipher(original, 'decrypt');
assert.deepEqual(cipher(decoded, 'encrypt'), original);
const byPage = new Map();
let offset = 0;
for (const page of pages) {
  byPage.set(page.page, decoded.slice(offset, offset + page.indices.length));
  offset += page.indices.length;
}
assert.equal(offset, original.length);

const scopes = [
  {name:'p16-p21_train',pages:[16,17,18,19,20,21],n:1613,ioc:0.03446947029332086},
  {name:'p40-p53_holdout',pages:Array.from({length:14},(_,i)=>40+i),n:3008,ioc:0.03444179892308019},
  {name:'p0-p2_holdout',pages:[0,1,2],n:729,ioc:0.035450489154192855},
  {name:'p54-p55_holdout',pages:[54,55],n:308,ioc:0.034836499005880116},
];
for (const scope of scopes) {
  const actual = scope.pages.flatMap(page => byPage.get(page));
  const input = scope.pages.flatMap(n => pages.find(p => p.page === n).indices);
  assert.equal(actual.length, scope.n);
  assert(Math.abs(ioc(actual) - scope.ioc) < 1e-12);
  console.log(scope.name + ': n=' + actual.length +
    ' cipherIoC=' + ioc(input).toFixed(9) +
    ' decodedIoC=' + ioc(actual).toFixed(9) +
    ' opening=' + actual.slice(0,70).map(n => corpus.translit[n]).join(' '));
}
assert(Math.abs(ioc(decoded)-0.03452915898944371)<1e-12);

const native = corpus.pages.find(p => p.page === 57).indices;
assert.equal(native.length, 95);
for (const n of [1613,3008]) {
  const plain = Array.from({length:n}, (_,i) => native[i % native.length]);
  const plantedCipher = cipher(plain, 'encrypt');
  assert.deepEqual(cipher(plantedCipher, 'decrypt'), plain);
  console.log('Clear original solved p57 GP29 plant ' + n + '/' + n +
    '; clear IoC=' + ioc(plain).toFixed(9) +
    '; encrypted IoC=' + ioc(plantedCipher).toFixed(9));
}
console.log('Original whole-book 12956/12956 bijective replay; ' +
  'decoded IoC=' + ioc(decoded).toFixed(9));
console.log('DECISION: no original plaintext or source-authenticated update. ' +
  'Reject this exact two-register model without extra key tuning.');
