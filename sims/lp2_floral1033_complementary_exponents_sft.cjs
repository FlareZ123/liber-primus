'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const marks = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const squares = fs.readFileSync(path.join(root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');

/**
 * @param {number} a
 * @param {number} n
 * @param {number} modulus
 * @returns {number}
 */
function powMod(a, n, modulus) {
  let v = 1;
  let base = a % modulus;
  for (let exponent = n; exponent > 0; exponent = Math.floor(exponent / 2)) {
    if (exponent % 2) v = v * base % modulus;
    base = base * base % modulus;
  }
  return v;
}

/**
 * @param {number[]} xs
 * @returns {number}
 */
function ioc(xs) {
  const freq = new Array(29).fill(0);
  for (const x of xs) freq[x] += 1;
  return freq.reduce((total, n) => total + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

const squareRows = squares.trim().split(/\r?\n/).filter((line) => line.trim());
assert.deepEqual(squareRows.slice(5, 12).map((row) => row.trim().split(/\s+/).map(Number).reduce((a, b) => a + b)), new Array(7).fill(1033));
assert.deepEqual(squareRows.slice(12).map((row) => row.trim().split(/\s+/).map(Number).reduce((a, b) => a + b)), new Array(5).fill(1033));

/** @type {{page:number, exponent:number, length:number, mult:number, minus:number, plus:number}[]} */
const outcomes = [];
for (const { start, end, prefix, expected, mul, expectedRaw, expectedMinus, expectedPlus } of [
  { start: 40, end: 53, prefix: 8, expected: 435, mul: 680,
    expectedRaw: 0.03454440369011893, expectedMinus: 0.034486384350339, expectedPlus: 0.034468822940980325 },
  { start: 54, end: 55, prefix: 9, expected: 597, mul: 278,
    expectedRaw: 0.033489708424053334, expectedMinus: 0.033646831720949025, expectedPlus: 0.034791587169760496 }
]) {
  const sourcePage = marks.pages.find((p) => p.page === start);
  const heading = sourcePage.red_spans.find((s) => s.start === 0 && s.length === prefix);
  const indices = Array.from(heading.runes).map((rune) => corpus.runes.indexOf(rune));
  assert(indices.every((v) => v >= 0));
  const sum = indices.reduce((a, v) => a + corpus.prime[v], 0);
  assert.equal(sum, expected);
  const c = corpus.pages.filter((p) => p.page >= start && p.page <= end).flatMap((p) => p.indices).slice(prefix);
  assert.equal(c.length, start === 40 ? 3000 : 299);
  const multiplier = powMod(29, sum, 1033);
  assert.equal(multiplier, mul);
  const k = [];
  let state = 1;
  for (let i = 0; i < c.length; i += 1) {
    k.push(state % 29);
    state = state * multiplier % 1033;
  }
  const pMinus = c.map((v, i) => (v - k[i] + 29) % 29);
  const pPlus = c.map((v, i) => (v + k[i]) % 29);
  for (let i = 0; i < c.length; i += 1) {
    assert.equal((pMinus[i] + k[i]) % 29, c[i]);
    assert.equal((pPlus[i] - k[i] + 29) % 29, c[i]);
  }
  for (const [actual, expectedIoc] of [[ioc(c), expectedRaw], [ioc(pMinus), expectedMinus], [ioc(pPlus), expectedPlus]]) {
    assert(Math.abs(actual - expectedIoc) < 1e-13);
  }
  const plant = Array.from({ length: c.length }, (_, i) => corpus.pages.find((p) => p.page === 57).indices[i % 95]);
  const encrypted = plant.map((v, i) => (v + k[i]) % 29);
  assert.deepEqual(encrypted.map((v, i) => (v - k[i] + 29) % 29), plant);
  outcomes.push({ page: start, exponent: sum, length: c.length, mult: multiplier,
    raw: ioc(c), minus: ioc(pMinus), plus: ioc(pPlus),
    first32Minus: pMinus.slice(0, 32).map((v) => corpus.translit[v]).join('') });
}

assert.equal(435 + 597, 1032);
assert.equal(powMod(29, 1032, 1033), 1);
assert.equal((powMod(29, 435, 1033) * powMod(29, 597, 1033)) % 1033, 1);

assert.equal(powMod(29, 435 * 597, 1033), 155);
assert.equal(powMod(powMod(29, 435, 1033), 597, 1033), 155);
assert.equal(powMod(powMod(29, 597, 1033), 435, 1033), 155);

const primeList = [];
for (let n = 2; primeList.length < 3500; n += 1) {
  if (primeList.every((p) => p * p > n || n % p !== 0)) primeList.push(n);
}
assert.equal(primeList[154], 907);

/**
 * Original p56 F-transparent totient inverse, leaving both legal branches at ciphertext F.
 * @param {number[]} ciphertext
 * @returns {{offset:number,cipher:number,states:number[]} | null}
 */
function firstStrictFContradiction(ciphertext) {
  let states = new Set([0]);
  for (let offset = 0; offset < ciphertext.length; offset += 1) {
    const next = new Set();
    for (const used of states) {
      const shift = (primeList[154 + used] - 1) % 29;
      const native = (ciphertext[offset] - shift + 29) % 29;
      if (native !== 0) next.add(used + 1);
      if (ciphertext[offset] === 0) next.add(used);
    }
    if (next.size === 0) return { offset, cipher: ciphertext[offset], states: [...states] };
    states = next;
  }
  return null;
}

const black40 = corpus.pages.filter((p) => p.page >= 40 && p.page <= 53)
  .flatMap((p) => p.indices).slice(8);
const black54 = corpus.pages.filter((p) => p.page >= 54 && p.page <= 55)
  .flatMap((p) => p.indices).slice(9);
assert.deepEqual(firstStrictFContradiction(black40), { offset: 4, cipher: 8, states: [4] });
assert.deepEqual(firstStrictFContradiction(black54), { offset: 22, cipher: 6, states: [22] });

const solved57 = corpus.pages.find((p) => p.page === 57).indices;
const plantedCipher = [];
let usedPrimes = 0;
for (const native of solved57) {
  if (native === 0) plantedCipher.push(0);
  else {
    plantedCipher.push((native + primeList[154 + usedPrimes] - 1) % 29);
    usedPrimes += 1;
  }
}
assert.equal(firstStrictFContradiction(plantedCipher), null);
console.log('DH candidate p=1033, base=29, exponent435/597 => shared secret 155; GP-prime rank155=907.');
console.log('Exact native p56 strict-F consumer fails at black-body original p40 offset4 (H, phi937=8), p54 offset22 (G, phi1051=6).');
console.log('Independently planted solved p57 fully accepted by same strict-F inverse.');

console.log('GP-prime heading sums = [435, 597]; their sum = 1032 = phi(1033).');
console.log('29^435 mod1033 = 680; 29^597 mod1033 = 278; product mod1033 = 1.');
console.log('Source-pinned inverse trials (no offset/phase/key fit):');
console.log(JSON.stringify(outcomes, null, 2));
console.log('Both full original sections reconstruct exactly; source-native positive plants recover exactly.');
