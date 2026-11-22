'use strict';
/**
 * Exhaustive mod-29 first-order plaintext-feedback affine inversion.
 * C[i] = A*P[i] + B*P[i-1] + D; A is invertible modulo 29.
 * Equivalent U[i] = C[i] + b*U[i-1] + a, where U[i] = A*P[i].
 * All 813 unique IoC profiles are checked at each reset policy.
 * Node 22, built-ins only. Run from any current working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const M = 29;

/** @param {number} n */
function mod(n) { return ((n % M) + M) % M; }
/** @param {string} text @returns {number[][]} */
function words(text) {
  const output = [];
  let current = [];
  for (const ch of text) {
    const v = alphabet.get(ch);
    if (v !== undefined) current.push(v);
    else if (ch !== '/' && !/[\s%]/u.test(ch)) {
      if (current.length) output.push(current);
      current = [];
    }
  }
  if (current.length) output.push(current);
  return output;
}
/** @param {number[]} input */
function ioc(input) {
  const count = new Uint32Array(M);
  for (const x of input) count[x]++;
  let hits = 0;
  for (const x of count) hits += x * (x - 1);
  return hits / (input.length * (input.length - 1));
}
/**
 * Enumerate all IoC-distinct first-order recurrence profiles.
 * For b!=1, unknown intercept/initial state produce one constant
 * and a single free amplitude k on b^(i+1); constant does not change IoC.
 * For b=1, the free term is k*(i+1).
 *
 * @param {number[][]} units
 * @returns {{b:number,k:number,ioc:number,n:number,min:number,max:number,keys:number}}
 */
function scan(units) {
  const n = units.reduce((sum, unit) => sum + unit.length, 0);
  let best = {b: 0, k: 0, ioc: -1, n, min: 0, max: 0, keys: 813};
  let tested = 0;
  for (let b = 0; b < M; b++) {
    const base = new Uint8Array(n);
    const amplitude = new Uint8Array(n);
    let offset = 0;
    for (const unit of units) {
      let previous = 0, power = 1, j = 0;
      for (const c of unit) {
        previous = (c + b * previous) % M;
        power = b * power % M;
        base[offset] = previous;
        amplitude[offset] = b === 1 ? (++j % M) : power;
        offset++;
      }
    }
    assert.equal(offset, n);
    for (let k = 0; k < (b === 0 ? 1 : M); k++) {
      tested++;
      const cnt = new Uint32Array(M);
      for (let i = 0; i < n; i++)
        cnt[(base[i] + k * amplitude[i]) % M]++;
      let match = 0;
      for (const num of cnt) match += num * (num - 1);
      const value = match / (n * (n - 1));
      if (value > best.ioc) {
        best = {b, k, ioc: value, n, min: Math.min(...cnt),
          max: Math.max(...cnt), keys: 813};
      }
    }
  }
  assert.equal(tested, 813);
  return best;
}
/** @param {number[][]} units @param {number} b @param {number} a */
function encrypt(units, b, a) {
  return units.map(unit => {
    let previous = 0;
    return unit.map(p => {
      const c = mod(p - b * previous - a);
      previous = p;
      return c;
    });
  });
}
/** @param {number[][]} units @param {number} b @param {number} a */
function decrypt(units, b, a) {
  return units.map(unit => {
    let previous = 0;
    return unit.map(c => {
      previous = mod(c + b * previous + a);
      return previous;
    });
  });
}
function main() {
  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
    .map(p => p.indices);
  assert.equal(pages.length, 55);
  assert.equal(pages.flat().length, 12956);
  const manuscript = source.split('%').slice(0, 55).join('%');
  const runeWords = words(manuscript);
  assert.equal(runeWords.length, 2896);
  assert.deepEqual(runeWords.flat(), pages.flat());

  const controlText = lp1.split('$')
    .filter((_, i) => [2, 4, 6].includes(i)).join('$');
  const controlPages = controlText.split('$').map(s =>
    [...s].filter(r => alphabet.has(r)).map(r => alphabet.get(r)));
  assert.deepEqual(controlPages.map(p => p.length), [157, 755, 89]);
  const controlWords = words(controlText);
  assert.deepEqual(controlWords.flat(), controlPages.flat());

  const output = {model: 'first-order-affine-plaintext-feedback',
    candidatesPerMode: 813, uniformIoC: 1 / M, modes: {}};
  for (const mode of ['global', 'page', 'word']) {
    const units = mode === 'global' ? [pages.flat()] :
      mode === 'page' ? pages : runeWords;
    const plain = mode === 'global' ? [controlPages.flat()] :
      mode === 'page' ? controlPages : controlWords;
    const plant = encrypt(plain, 17, 5);
    assert.deepEqual(decrypt(plant, 17, 5), plain);
    const positive = scan(plant);
    const expected = ioc(plain.flat());
    assert.equal(positive.b, 17);
    assert.equal(positive.k, 13);
    assert.ok(Math.abs(positive.ioc - expected) < 1e-12);
    output.modes[mode] = {
      observed: scan(units),
      plant: {...positive, knownPlaintextIoC: expected,
        plantedB: 17, plantedA: 5, exactRecovery: true}
    };
  }
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}
if (require.main === module) main();
module.exports = {mod, words, ioc, scan, encrypt, decrypt, main};
