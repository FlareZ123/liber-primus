/**
 * A frozen source-Q Hénon-style, two-history GP29 inverse on original LP2.
 * A bounded candidate under director issue #1422; no author-selected cipher claim.
 * Run: node sims/lp2_sourceQ_henon2_original_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;

/** Original p39 triad [27,5,15] as a candidate polynomial over GF29. @param {number} x @returns {number} */
const Q = (x) => mod(27 + 5 * x + 15 * x * x);

/**
 * Hénon-style online reversible emitter: C[i] = P[i] + Q(C[i-1]) - C[i-2].
 * The two unencrypted source-visible seed glyphs are transmitted literally.
 * @param {number[]} seed
 * @param {number[]} plaintext
 * @returns {number[]}
 */
function encode(seed, plaintext) {
  assert.equal(seed.length, 2);
  const c = seed.slice();
  for (const p of plaintext) {
    const n = c.length;
    c.push(mod(p + Q(c[n - 1]) - c[n - 2]));
  }
  return c;
}

/**
 * Exact unique inverse: P[i] = C[i] + C[i-2] - Q(C[i-1]).
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function decode(ciphertext) {
  const p = [];
  for (let i = 2; i < ciphertext.length; i++) {
    p.push(mod(ciphertext[i] + ciphertext[i - 2] - Q(ciphertext[i - 1])));
  }
  return p;
}

/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const f = Array(29).fill(0);
  for (const x of seq) f[x]++;
  return f.reduce((a,n) => a + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}

/** @param {number[]} seq @param {number} max @returns {string} */
function glyphs(seq, max) {
  return seq.slice(0,max).map((n) => data.translit[n]).join(' ');
}

/** @param {number} first @param {number} last @returns {number[]} */
function pages(first,last) {
  return data.pages.slice(first,last+1).flatMap((p) => p.indices);
}

assert.deepEqual(data.pages[39].indices.slice(119,122), [27,5,15]);
assert.equal(ink.pages.find((p) => p.page === 40).red_spans[0].length,8);
assert.equal(ink.pages.find((p) => p.page === 54).red_spans[0].length,9);
assert.equal(data.pages[50].indices.length,0);
assert.equal(data.pages[55].indices.length,76);
assert.equal(data.pages[57].indices.length,95);
for (let x=0;x<29;x++) assert.equal(Q(x), mod(15*(x+5)*(x+5)));

const known = data.pages[57].indices;
const seed = data.pages[40].indices.slice(0,2);
const planted = encode(seed, known);
assert.deepEqual(decode(planted), known);
assert.deepEqual(encode(planted.slice(0,2),decode(planted)), planted);
const wrong = planted.slice();
wrong[32] = (wrong[32]+1)%29;
assert.notDeepEqual(decode(wrong), known);

const cases = [
  {name:'opening-p0to2-black', input:pages(0,2), first:13, end:pages(0,2).length},
  {name:'floral-p40to53-black', input:pages(40,53), first:8, end:pages(40,53).length-51},
  {name:'terminal-p54to55-black', input:pages(54,55), first:9, end:pages(54,55).length},
];
for (const test of cases) {
  const recovered = decode(test.input);
  const rebuilt = encode(test.input.slice(0,2),recovered);
  assert.deepEqual(rebuilt,test.input);
  const body = recovered.slice(test.first-2,test.end-2);
  const originalBody = test.input.slice(test.first,test.end);
  assert.equal(body.length,originalBody.length);
  const score = ioc(body), sourceScore = ioc(originalBody);
  console.log(JSON.stringify({case:test.name,runes:body.length,original_ioc:sourceScore,decoded_ioc:score,decoded_start:glyphs(body,70)}));
  assert.ok(score>0 && score<1);
}
console.log(JSON.stringify({control:'source-native-p57-Henon-plant',runes:known.length,exact:known.length,clear_ioc:ioc(known)}));
console.log('PASS: exact all-GF29 Hénon inverse, original page integrity, three chapter-scale source replays, and known-native GP plant');
