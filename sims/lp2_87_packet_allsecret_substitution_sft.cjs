'use strict';

/**
 * One-file source-original test of the p57-ordinal/87-packet static-substitution
 * route. Reads canonical LP2 and real reference prose. Node 22 CommonJS.
 * No network, nondeterminism, or file writes.
 *
 * The conditional hypothesis is one arbitrary independent GP29 alphabet
 * permutation per nonrepeat packet, or its special case of a constant Caesar
 * shift per packet. Any such permutation exactly preserves the per-packet
 * pair-collision statistic used below.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const values = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(values.length, 12956);
assert.equal(corpus.translit.length, 29);

/**
 * The next packet starts at the second glyph of each equal neighboring pair.
 * @param {number[]} list
 * @returns {number[][]}
 */
function packets(list) {
  const result = [];
  let start = 0;
  for (let i = 1; i < list.length; i++) {
    if (list[i] === list[i - 1]) {
      result.push(list.slice(start, i));
      start = i;
    }
  }
  result.push(list.slice(start));
  return result;
}
const originalPackets = packets(values);
assert.equal(originalPackets.length, 87);
assert.equal(originalPackets.reduce((s, v) => s + v.length, 0), 12956);
assert.equal(Math.min(...originalPackets.map(x => x.length)), 6);
assert.equal(Math.max(...originalPackets.map(x => x.length)), 712);
assert(originalPackets.every(a => a.every((v, i) => !i || v !== a[i - 1])));

/**
 * Collision probability conditional on packet identity. Per-packet
 * arbitrary one-to-one rune substitution leaves numerator and denominator
 * unchanged, independently of how the 87 alphabets were chosen.
 * @param {number[][]} blocks
 * @returns {{pairs:number, collisions:number, ioc:number}}
 */
function pooled(blocks) {
  let pairs = 0, collisions = 0;
  for (const block of blocks) {
    const bins = Array(29).fill(0);
    for (const value of block) {
      assert(Number.isInteger(value) && value >= 0 && value < 29);
      bins[value]++;
    }
    collisions += bins.reduce((sum, count) => sum + count * (count - 1), 0);
    pairs += block.length * (block.length - 1);
  }
  return { pairs, collisions, ioc: collisions / pairs };
}
const original = pooled(originalPackets);
assert.deepEqual(original, {
  pairs: 3659606,
  collisions: 125022,
  ioc: 125022 / 3659606
});

/** @type {{v:string,i:number}[]} */
const alphabet = corpus.translit.map((v,i) => ({v,i})).sort((a,b) => b.v.length - a.v.length);
/** @param {string} text @returns {number[]} */
function gp29(text) {
  const clean = text.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/[VKZQ]/g, ch => ({V:'U',K:'C',Z:'S',Q:'C'})[ch])
    .replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < clean.length;) {
    const token = alphabet.find(entry => clean.startsWith(entry.v, i));
    if (token) { out.push(token.i); i += token.v.length; }
    else i++;
  }
  return out;
}
/** @param {number[]} source @param {number} offset @returns {number[][]} */
function windowPackets(source, offset) {
  const result = [];
  let start = offset;
  for (const originalBlock of originalPackets) {
    result.push(source.slice(start, start + originalBlock.length));
    start += originalBlock.length;
  }
  assert.equal(start, offset + values.length);
  return result;
}

const texts = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const references = [];
let totalControls = 0;
for (const file of texts) {
  const native = gp29(read(file));
  const scores = [];
  for (let offset = 0; offset + values.length <= native.length; offset += values.length) {
    scores.push(pooled(windowPackets(native, offset)).ioc);
  }
  assert(scores.length > 0);
  assert(scores.every(score => score > 0.055));
  totalControls += scores.length;
  references.push({
    file, nativeRunes: native.length, disjointWindows: scores.length,
    minIoC: Math.min(...scores), maxIoC: Math.max(...scores)
  });
}
assert.equal(totalControls, 44);

// Correct independent synthetic plant: 87 different unknown Caesar keys
// retain the exact authentic-native within-packet collision probability.
const shakespeare = gp29(read(texts[0]));
const planted = windowPackets(shakespeare, 0);
const shifted = planted.map((block, i) => block.map(v => (v + 7 * i + 3) % 29));
assert.deepEqual(pooled(shifted), pooled(planted));

console.log(JSON.stringify({
  original: {runes: values.length, packets: originalPackets.length, ...original},
  originalPacketLengths: {
    min: Math.min(...originalPackets.map(x => x.length)),
    max: Math.max(...originalPackets.map(x => x.length))
  },
  nativeControls: references, independentDisjointWindows: totalControls,
  sourceNative87SecretAlphabetPlant: 'exact pooled-IoC invariance',
  decision: 'No independent fixed GP29 bijection per nonrepeat packet, including any static packet-wise rotation, recovers direct ordinary GP-native prose on the original; evolving state and non-GP intermediary remain outside this gate.'
}, null, 2));
