'use strict';
/**
 * Single-file test: original LP2 p0 signed-phrase title inference through
 * thirteen-column transposition and GP29 additive substitution.
 *
 * Run on Node.js 22: node sims/lp2_p0_signed13_columnar_joint_sft.cjs
 * The conjectural title is the authenticated 2016 phrase EPIPHANY SEEKS.
 * No candidate here is an authenticated decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'),
  'utf8'
));
const mod29 = n => ((n % 29) + 29) % 29;
const titleCipher = corpus.pages[0].indices.slice(0, 13);
const titlePlain = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const chapter = corpus.pages.slice(0, 3).flatMap(p => p.indices);
const body = chapter.slice(13);
const holdout = corpus.pages.slice(3, 8).flatMap(p => p.indices);
const nativePositive = corpus.pages[57].indices;
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.deepEqual(titleCipher, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.equal(body.length, 716);
assert.equal(holdout.length, 1145);
assert.equal(nativePositive.length, 95);

/** @param {number[]} key @returns {number[]} Stable ascending GP29 ranks. */
function colOrder(key) {
  return key.map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v || a.i - b.i)
    .map(entry => entry.i);
}
/** @param {number[]} plain @param {number[]} order */
function transpose(plain, order) {
  const result = [];
  for (const col of order) {
    for (let p = col; p < plain.length; p += 13) result.push(plain[p]);
  }
  return result;
}
/** @param {number[]} cipher @param {number[]} order */
function untranspose(cipher, order) {
  const result = new Array(cipher.length);
  let cursor = 0;
  for (const col of order) {
    for (let p = col; p < cipher.length; p += 13) result[p] = cipher[cursor++];
  }
  assert.equal(cursor, cipher.length);
  return result;
}
/** @param {number[]} tape */
function ioc(tape) {
  const counts = new Array(29).fill(0);
  for (const v of tape) counts[v]++;
  return counts.reduce((sum, c) => sum + c * (c - 1), 0)
    / (tape.length * (tape.length - 1));
}
/**
 * Derive the 13-digit key from the full title under the SAME transformation
 * that will be applied to the body. This is a by-construction title fit.
 * @param {number[]} order
 * @param {'transposed-shifts'|'shifted-transposition'} architecture
 */
function model(order, architecture) {
  const key = architecture === 'transposed-shifts'
    ? untranspose(titleCipher, order).map((v, i) => mod29(v - titlePlain[i]))
    : titleCipher.map((v, i) => mod29(v - transpose(titlePlain, order)[i]));
  /** @param {number[]} cipher */
  function decode(cipher) {
    if (architecture === 'transposed-shifts') {
      return untranspose(cipher, order).map((v, i) => mod29(v - key[i % 13]));
    }
    return untranspose(cipher.map((v, i) => mod29(v - key[i % 13])), order);
  }
  /** @param {number[]} plain */
  function encode(plain) {
    if (architecture === 'transposed-shifts') {
      return transpose(plain.map((v, i) => mod29(v + key[i % 13])), order);
    }
    return transpose(plain, order).map((v, i) => mod29(v + key[i % 13]));
  }
  return { key, decode, encode };
}
const cases = [];
const expected = [
  [0.034312614760, 0.034506977738],
  [0.034312614760, 0.034303905701],
  [0.034187600109, 0.034604696613],
  [0.034941594718, 0.034555837176],
  [0.035781536899, 0.034526826885],
  [0.034390748916, 0.034452010871],
  [0.034054772044, 0.035033743549],
  [0.034078212291, 0.034293217699]
];
for (const origin of ['red', 'crib']) {
  for (const reverse of [false, true]) {
    const order = colOrder(origin === 'red' ? titleCipher : titlePlain);
    if (reverse) order.reverse();
    for (const architecture of ['transposed-shifts', 'shifted-transposition']) {
      const cipher = model(order, architecture);
      assert.deepEqual(cipher.decode(titleCipher), titlePlain);
      assert.deepEqual(cipher.encode(titlePlain), titleCipher);
      const inverse = cipher.decode(body);
      const held = cipher.decode(holdout);
      assert.deepEqual(cipher.encode(inverse), body);
      assert.deepEqual(cipher.encode(held), holdout);
      const plant = Array.from({ length: 716 }, (_, i) =>
        nativePositive[i % nativePositive.length]);
      const encryptedPlant = cipher.encode(plant);
      assert.deepEqual(cipher.decode(encryptedPlant), plant);
      const output = {
        origin, reverse, architecture, order, derivedKey: cipher.key,
        bodyIoC: ioc(inverse), holdoutIoC: ioc(held),
        bodyFirst22: inverse.slice(0, 22).map(i => corpus.translit[i]).join(' '),
        authenticPlaintext: false, exactReencryption: true,
        plantedPositive: true
      };
      const want = expected[cases.length];
      assert(Math.abs(output.bodyIoC - want[0]) < 1e-10);
      assert(Math.abs(output.holdoutIoC - want[1]) < 1e-10);
      cases.push(output);
    }
  }
}
assert.equal(cases.length, 8);
const maxBodyIoC = Math.max(...cases.map(c => c.bodyIoC));
const maxHoldoutIoC = Math.max(...cases.map(c => c.holdoutIoC));
assert(maxBodyIoC < 0.036);
assert(maxHoldoutIoC < 0.036);
console.log(JSON.stringify({
  status: 'Eight source-frozen full-title-derived 13-column composites negative',
  originalBodyIoC: ioc(body), originalHoldoutIoC: ioc(holdout),
  clearP57IoC: ioc(nativePositive),
  maxBodyIoC, maxHoldoutIoC, cases
}, null, 2));
