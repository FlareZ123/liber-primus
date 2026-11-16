/**
 * A single frozen, reversible p55 circumference/interior transform.
 * Original inputs: resources/liber-primus/lp2-corpus.json, physical p55 72.jpg.
 * Run: node sims/lp2_p55_circumference_two_stream_feistel_sft.cjs
 *
 * @typedef {{exterior:number[], interior:number[], tags:string[]}} Partition
 */
'use strict';
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const MOD = 29;
const segments = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const originalSHA = '9a991437b541673c35cca0ba877eddee719c6fad7ec68c495100d2e27c61529f';
/** @param {number} x @returns {number} */
const mod = x => ((x % MOD) + MOD) % MOD;
/** @param {number[]} xs @returns {string} */
const roman = xs => xs.map(x => corpus.translit[x]).join('');
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const n = Array(MOD).fill(0);
  for (const x of xs) n[x]++;
  return n.reduce((s, v) => s + v * (v - 1), 0) / (xs.length * (xs.length - 1));
}
/** @param {number[]} runes @returns {Partition} */
function split(runes) {
  assert.equal(runes.length, 76);
  const exterior = [], interior = [], tags = [];
  let pos = 0;
  segments.forEach((length, w) => {
    for (let j = 0; j < length; j++) {
      const edge = w === 0 || j === 0 || j === length - 1;
      (edge ? exterior : interior).push(runes[pos + j]);
      tags.push(edge ? 'E' : 'I');
    }
    pos += length;
  });
  assert.equal(pos, 76);
  assert.equal(exterior.length, 33);
  assert.equal(interior.length, 43);
  return { exterior, interior, tags };
}
/** @param {Partition} x @returns {number[]} */
function join(x) {
  let a = 0, b = 0;
  const output = x.tags.map(tag => tag === 'E' ? x.exterior[a++] : x.interior[b++]);
  assert.equal(a, 33); assert.equal(b, 43);
  return output;
}
/**
 * Frozen two-register GP29 inverse, with both clocks starting at zero.
 * Exterior ciphertext consumes the first 33 raw interior symbols.
 * Decoded exterior then cycles as the interior key (33 + 10 positions).
 * No fitted key, sign, phase, resegmentation, or loss of any original rune.
 * @param {Partition} c @returns {Partition}
 */
function decrypt(c) {
  const exterior = c.exterior.map((x, i) => mod(x - c.interior[i]));
  const interior = c.interior.map((x, i) => mod(x - exterior[i % 33]));
  return { exterior, interior, tags: c.tags };
}
/** @param {Partition} p @returns {Partition} */
function encrypt(p) {
  const interior = p.interior.map((x, i) => mod(x + p.exterior[i % 33]));
  const exterior = p.exterior.map((x, i) => mod(x + interior[i]));
  return { exterior, interior, tags: p.tags };
}
/** @param {number[]} runes @returns {string} */
function printed(runes) {
  let pos = 0;
  return segments.map(n => {
    const s = roman(runes.slice(pos, pos + n));
    pos += n;
    return s;
  }).join(' ');
}
function main() {
  const original = corpus.pages[55].indices;
  assert.equal(createHash('sha256').update(Buffer.from(original)).digest('hex'), originalSHA);
  const c = split(original);
  assert.deepEqual(c.exterior, [21,25,7,15,17,14,19,15,25,0,1,7,4,17,12,19,0,17,5,12,18,28,15,18,15,2,22,5,14,23,1,17,10]);
  assert.deepEqual(c.interior, [19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]);
  assert.deepEqual(join(c), original);
  const p = decrypt(c);
  assert.deepEqual(join(encrypt(p)), original);
  const native = corpus.pages[57].indices.slice(0, 76);
  assert.deepEqual(join(decrypt(encrypt(split(native)))), native);
  console.log('Original p55 76:', printed(original));
  console.log('Recovered exterior 33:', roman(p.exterior));
  console.log('Recovered interior 43:', roman(p.interior));
  console.log('Recovered complete 76:', printed(join(p)));
  console.log('Cipher IoC:', ioc(original).toFixed(9));
  console.log('Inverse IoC:', ioc(join(p)).toFixed(9));
  console.log('Original clear p57 76 IoC:', ioc(native).toFixed(9));
  console.log('PASS: 76/76 original forward re-encryption');
  console.log('PASS: 76/76 independent native p57 planted round trip');
}
if (require.main === module) main();
module.exports = { split, join, decrypt, encrypt, printed };
