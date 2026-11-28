'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const MOD = 29;
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(MOD).fill(0);
  for (const value of values) counts[value] += 1;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

/** @param {number[]} cipher @param {number[]} key @param {number} sign @returns {number[]} */
function transform(cipher, key, sign) {
  return cipher.map((value, i) => mod(value + sign * key[i % key.length]));
}

/** @param {number[]} plain @param {number[]} key @param {number} sign @returns {number[]} */
function reencrypt(plain, key, sign) {
  return plain.map((value, i) => mod(value - sign * key[i % key.length]));
}

const p40 = corpus.pages.find((page) => page.page === 40);
assert(p40);
assert.strictEqual(p40.runic_count, 231);

// Frozen precommit: p40's complete red opener is the first eight runes;
// the receiver is the 223-rune black body beginning immediately after it.
const body = p40.indices.slice(8);
assert.strictEqual(body.length, 223);

const charged = [
  { name: 'endpoints-subtract', key: [5, 8], sign: -1 },
  { name: 'endpoints-add', key: [5, 8], sign: 1 },
  { name: 'interval-subtract', key: [5, 6, 7, 8], sign: -1 },
  { name: 'interval-add', key: [5, 6, 7, 8], sign: 1 },
];

const outputs = charged.map((item) => {
  const plain = transform(body, item.key, item.sign);
  assert.deepStrictEqual(reencrypt(plain, item.key, item.sign), body);
  return {
    ...item,
    ioc: ioc(plain),
    prefix_indices: plain.slice(0, 64),
    prefix_translit: plain.slice(0, 64).map((value) => corpus.translit[value]).join(''),
  };
});

const rounded = outputs.map((item) => Number(item.ioc.toFixed(12)));
assert.deepStrictEqual(rounded, [
  0.034016078859,
  0.03482406173,
  0.03425847372,
  0.034096877146,
]);

const cipherIoc = Number(ioc(body).toFixed(12));
assert.strictEqual(cipherIoc, 0.033612087424);
assert(outputs.every((item) => item.ioc < 0.035));

console.log(JSON.stringify({
  receiver: 'p40 black body after red8 opener',
  body_length: body.length,
  cipher_ioc: cipherIoc,
  charged_family: 'keys [5,8] and [5,6,7,8], both additive signs, phase0 only',
  outputs,
  decision: 'negative: no frozen candidate reaches IoC 0.035; no phase/key rescue licensed',
}, null, 2));
