'use strict';

/**
 * Original-LP2 test of the only key stream physically present after the EOI
 * of earlier LP1 archive 05.jpg. No key-phase or alphabet search.
 * Node.js 22: node sims/lp1_jpeg05_trailer_original_key_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const image = fs.readFileSync(path.join(root, '05.jpg'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const tail = image.subarray(image.lastIndexOf(Buffer.from([0xff, 0xd9])) + 2);
assert.equal(tail.length, 72700);
assert.ok(tail.equals(Buffer.from(image.subarray(0, 72700)).reverse()));

const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
/**
 * @param {number[]} values
 * @param {Buffer} key
 * @param {-1|1} sign
 */
function apply(values, key, sign) {
  return values.map((value, i) => (value + 29 + sign * (key[i] % 29)) % 29);
}

const keyReadings = [
  ['physical-tail', tail],
  ['tail-reversed', Buffer.from(tail).reverse()],
];
const results = [];
for (const [name, key] of keyReadings) {
  for (const sign of [-1, 1]) {
    const decoded = apply(ciphertext, key, sign);
    const score = ioc(decoded);
    const p0Ioc = ioc(decoded.slice(0, corpus.pages[0].indices.length));
    results.push({name, sign, fullIoC: score, page0IoC: p0Ioc});
    // A positive code control tests implementation only: the authentic
    // solved p57 GP words remain invariant under encode then decode.
    const solved = corpus.pages.find(p => p.page === 57).indices;
    assert.equal(solved.length, 95);
    const plant = apply(solved, key, -sign);
    assert.deepEqual(apply(plant, key, sign), solved);
  }
}
assert.deepEqual(results.map(r => Number(r.fullIoC.toFixed(12))), [
  0.034481293393, 0.034495020346, 0.034469401468, 0.034483199915,
]);
assert.deepEqual(results.map(r => Number(r.page0IoC.toFixed(12))), [
  0.033254365184, 0.033137375333, 0.034658243397, 0.035389429967,
]);
assert.ok(results.every(r => r.fullIoC < 0.035));
console.log(JSON.stringify({
  originalRuneCount: ciphertext.length,
  originalIoC: ioc(ciphertext),
  sourceJpegTailBytes: tail.length,
  decoded: results,
  decision: 'These four source-fixed byte%29 GP29 additions leave original LP2 random-like; no English recovery',
}, null, 2));
