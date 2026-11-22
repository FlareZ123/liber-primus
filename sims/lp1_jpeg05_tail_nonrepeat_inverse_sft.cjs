'use strict';

/**
 * Source-fixed GP28 predecessor-exclusion inverse using the physically
 * appended reversed-prefix bytes of original LP1 05.jpg. Read-only.
 * Node.js 22: node sims/lp1_jpeg05_tail_nonrepeat_inverse_sft.cjs
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
const cipher = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.deepEqual([cipher.length, solved.length], [12956, 95]);

/** @param {number[]} x */
function ioc(x) {
  const counts = Array(29).fill(0);
  for (const v of x) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (x.length * (x.length - 1));
}
/** @param {number} b @param {'mod28'|'scale28'} projection */
function project(b, projection) {
  return projection === 'mod28' ? b % 28 : Math.floor(28 * b / 256);
}
/**
 * The repeat symbol maps to plaintext GP index 28 (EA), while all
 * other original transitions map bijectively to the 28 remaining runes.
 * @param {number[]} ciphertext
 * @param {Buffer} key
 * @param {'mod28'|'scale28'} projection
 * @param {-1|1} sign
 */
function decrypt(ciphertext, key, projection, sign) {
  const plain = [];
  for (let i = 0; i < ciphertext.length; i++) {
    const k = project(key[i], projection);
    if (!i) plain.push((ciphertext[i] + 29 + sign * (k % 29)) % 29);
    else if (ciphertext[i] === ciphertext[i - 1]) plain.push(28);
    else {
      const step = (ciphertext[i] - ciphertext[i - 1] + 29) % 29;
      plain.push((step - 1 + 28 + sign * k) % 28);
    }
  }
  return plain;
}
/**
 * Independent authentic-GP implementation control; not evidence for a key.
 * @param {number[]} plain
 * @param {Buffer} key
 * @param {'mod28'|'scale28'} projection
 * @param {-1|1} sign
 */
function encrypt(plain, key, projection, sign) {
  const ciphertext = [];
  for (let i = 0; i < plain.length; i++) {
    const k = project(key[i], projection);
    if (!i) ciphertext.push((plain[i] + 29 - sign * (k % 29)) % 29);
    else if (plain[i] === 28) ciphertext.push(ciphertext[i - 1]);
    else {
      const step = 1 + ((plain[i] - sign * k + 28) % 28);
      ciphertext.push((ciphertext[i - 1] + step) % 29);
    }
  }
  return ciphertext;
}

const rows = [];
for (const [source, key] of [
  ['physical-tail', tail], ['reversed-tail', Buffer.from(tail).reverse()],
]) for (const projection of ['mod28', 'scale28']) for (const sign of [-1, 1]) {
  const p = decrypt(cipher, key, projection, sign);
  const plant = encrypt(solved, key, projection, sign);
  assert.deepEqual(decrypt(plant, key, projection, sign), solved);
  rows.push({source, projection, sign, wholeIoC: ioc(p), p0IoC: ioc(p.slice(0, 262))});
}
assert.deepEqual(rows.map(r => Number(r.wholeIoC.toFixed(12))), [
  0.035303480628, 0.035298344937, 0.035276443776, 0.035254113647,
  0.035327741110, 0.035342397491, 0.035327038080, 0.035331494573,
]);
assert.ok(rows.every(r => r.wholeIoC < 0.0354));
console.log(JSON.stringify({
  sourceTailBytes: 72700, originalRunes: cipher.length, originalIoC: ioc(cipher),
  models: rows, result: 'No native-GP plaintext under the eight source-fixed GP28 state inverses',
}, null, 2));
