'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const get = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const mod = (n) => (n % 29 + 29) % 29;
const poly = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1];
const reciprocal = poly.slice().reverse().map((x) => mod(8 * x));
assert.equal(reciprocal[9], 1);

/** @param {number[]} coefficients @param {number[]} divisor @returns {number[]} */
function remainder(coefficients, divisor) {
  const p = coefficients.slice();
  for (let i = p.length - 1; i >= divisor.length - 1; i--) {
    const a = mod(p[i]);
    for (let j = 0; j < divisor.length; j++) p[i - divisor.length + 1 + j] = mod(p[i - divisor.length + 1 + j] - a * divisor[j]);
  }
  return p.slice(0, divisor.length - 1);
}

/** @param {number[]} seed @param {number[]} factor @param {number} length @returns {number[]} */
function stream(seed, factor, length) {
  const s = seed.slice();
  for (let i = 9; i < length; i++) {
    let next = 0;
    for (let j = 0; j < 9; j++) next -= factor[j] * s[i - 9 + j];
    s.push(mod(next));
  }
  return s;
}

/** @param {number[]} ciphertext @param {number[]} key @param {number} sign @param {number} clock @returns {number[]} */
function subtractStream(ciphertext, key, sign, clock) {
  return ciphertext.map((c, i) => mod(c + sign * key[i + clock]));
}

/** @param {number[]} seed @param {number[]} body @param {number[]} factor @param {number} sign @returns {number[]} */
function feedbackDecrypt(seed, body, factor, sign) {
  const observed = seed.concat(body);
  return body.map((c, i) => {
    let prediction = 0;
    for (let j = 0; j < 9; j++) prediction -= factor[j] * observed[i + j];
    return mod(sign * (c - mod(prediction)));
  });
}

/** @param {number[]} seed @param {number[]} plain @param {number[]} factor @param {number} sign @returns {number[]} */
function feedbackEncrypt(seed, plain, factor, sign) {
  const observed = seed.slice();
  for (const p of plain) {
    let prediction = 0;
    for (let j = 0; j < 9; j++) prediction -= factor[j] * observed[observed.length - 9 + j];
    observed.push(mod(prediction + sign * p));
  }
  return observed.slice(9);
}

function ioc(s) {
  const counts = Array(29).fill(0);
  for (const x of s) counts[x]++;
  return counts.reduce((v, n) => v + n * (n - 1), 0) / (s.length * (s.length - 1));
}

function main() {
  const corpus = get('resources/liber-primus/lp2-corpus.json');
  const ink = get('resources/liber-primus/lp2-ink-annotations.json');
  const bytes = get('resources/liber-primus/base60-grid.json').byte_rows.flat();
  const digest = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
  assert.equal(digest, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  assert.deepEqual(remainder(bytes.slice().reverse().map(mod), poly), Array(9).fill(0));

  const p54 = corpus.pages.find((p) => p.page === 54).indices;
  const seed = p54.slice(0, 9);
  const body = corpus.pages.find((p) => p.page === 55).indices;
  const p57 = corpus.pages.find((p) => p.page === 57).indices;
  assert.deepEqual([p54.length, body.length, p57.length], [232, 76, 95]);
  assert.deepEqual(seed, [24, 19, 21, 23, 27, 2, 14, 10, 19]);
  const red54 = ink.pages.find((p) => p.page === 54).red_spans;
  assert.deepEqual(red54.map((x) => [x.start, x.length]), [[0, 9]]);
  assert.deepEqual([...red54[0].runes].map((x) => corpus.runes.indexOf(x)), seed);

  const joint = seed.concat(body);
  const syndromes = [
    { order: 'red-p55', degree: 'first-high', residual: remainder(joint.slice().reverse(), poly) },
    { order: 'red-p55', degree: 'first-low', residual: remainder(joint, poly) },
    { order: 'p55-red', degree: 'first-high', residual: remainder(body.concat(seed).reverse(), poly) },
    { order: 'p55-red', degree: 'first-low', residual: remainder(body.concat(seed), poly) },
  ];
  assert.ok(syndromes.every((x) => x.residual.some((z) => z !== 0)));

  const planted = p57.slice(0, body.length);
  const candidates = [];
  for (const [orientation, factor] of [['source', poly], ['reciprocal', reciprocal]]) {
    const key = stream(seed, factor, body.length + 9);
    for (const phase of [0, 9]) {
      for (const sign of [-1, 1]) {
        const readout = subtractStream(body, key, sign, phase);
        const encryptedPlant = subtractStream(planted, key, -sign, phase);
        assert.deepEqual(subtractStream(encryptedPlant, key, sign, phase), planted);
        assert.deepEqual(subtractStream(readout, key, -sign, phase), body);
        candidates.push({
          operation: 'additive-key', orientation, phase, sign,
          ioc: ioc(readout), transliteration: readout.map((x) => corpus.translit[x]).join(''),
        });
      }
    }
    for (const sign of [-1, 1]) {
      const readout = feedbackDecrypt(seed, body, factor, sign);
      const ciphertextPlant = feedbackEncrypt(seed, planted, factor, sign);
      assert.deepEqual(feedbackDecrypt(seed, ciphertextPlant, factor, sign), planted);
      assert.deepEqual(feedbackEncrypt(seed, readout, factor, sign), body);
      candidates.push({
        operation: 'ciphertext-feedback', orientation, sign,
        ioc: ioc(readout), transliteration: readout.map((x) => corpus.translit[x]).join(''),
      });
    }
  }
  assert.equal(candidates.length, 12);
  assert.ok(candidates.every((x) => x.ioc < 0.043));
  console.log(JSON.stringify({
    source: { gridDigest: digest, smallFactorDegree: 9, p54RedSeed: seed, p55Body: body.length },
    syndromes, naturalReadoutCount: candidates.length, knownNativeP57_76IoC: ioc(planted),
    originalP55IoC: ioc(body), candidates, status: 'No GP English recovered',
  }, null, 2));
}

main();
