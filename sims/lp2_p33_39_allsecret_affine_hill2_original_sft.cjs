'use strict';

/**
 * Exact original-input necessary bound for every stationary invertible
 * affine 2x2 GF(29) block cipher on LP2 physical pp33..39.
 * The natural 1,680-rune chapter supplies 840 complete consecutive pairs.
 * JSDoc + CommonJS; Node 22; no network or third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalPages = corpus.pages.slice(33, 40);
assert.deepEqual(originalPages.map(p => p.indices.length), [214, 261, 271, 238, 228, 228, 240]);
const original = originalPages.flatMap(p => p.indices);
assert.equal(original.length, 1680);
const modulo = n => ((n % 29) + 29) % 29;

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const f = Array(29).fill(0);
  for (const v of symbols) f[v]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (symbols.length * (symbols.length - 1));
}

/**
 * For any affine Hill2 output, its first rune is a nonzero GF29 linear
 * projection of each input pair plus a constant, and so is its second rune.
 * Individual projection-histogram squared norms are invariant under shifts.
 *
 * By Cauchy-Schwarz, the squared norm of their combined 29-bin histogram
 * is at most 4 * max(normSquared(any nonzero projection)).
 *
 * The resulting IoC upper bound covers ALL invertible 2x2 matrices
 * (more than 680,000) and ALL 29x29 additive offsets without enumerating
 * their keys. It even covers singular matrices with both nonzero rows.
 *
 * @param {number[]} symbols even-length GP29 stream
 * @returns {{maxQ:number,minQ:number,maxRow:[number,number],maxColumnOccupancy:number,bound:number,rows:number}}
 */
function allSecretHill2UpperBound(symbols) {
  assert.equal(symbols.length % 2, 0);
  let maxQ = -1;
  let minQ = Infinity;
  let maxRow = null;
  let maxColumnOccupancy = 0;
  let rows = 0;
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    if (a === 0 && b === 0) continue;
    const freq = new Int32Array(29);
    for (let i = 0; i < symbols.length; i += 2) {
      freq[(a * symbols[i] + b * symbols[i + 1]) % 29]++;
    }
    const q = freq.reduce((s, n) => s + n * n, 0);
    if (q > maxQ) {
      maxQ = q;
      maxRow = [a, b];
      maxColumnOccupancy = Math.max(...freq);
    }
    minQ = Math.min(minQ, q);
    rows++;
  }
  assert.equal(rows, 840);
  return {
    maxQ, minQ, maxRow, maxColumnOccupancy, rows,
    bound: (4 * maxQ - symbols.length) / (symbols.length * (symbols.length - 1))
  };
}

/**
 * p3 red-polynomial field representation: u^2=3u+8 over GF29.
 * The 840 nonzero field coefficients are a proper subgroup of general
 * invertible Hill2 matrices. Search exactly all 840 multipliers and
 * all 29 inequivalent relative output shifts (translations have
 * a redundant global shift for IoC).
 *
 * @param {number[]} symbols
 * @returns {{numerator:number,a:number,b:number,delta:number,ioc:number}}
 */
function bestFieldAffine(symbols) {
  const n = symbols.length;
  let best = {numerator: -1, a: -1, b: -1, delta: -1, ioc: -1};
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    if (a === 0 && b === 0) continue;
    const even = new Int32Array(29), odd = new Int32Array(29);
    for (let i = 0; i < n; i += 2) {
      const x = symbols[i], y = symbols[i + 1];
      even[modulo(a * x + 8 * b * y)]++;
      odd[modulo(b * x + (a + 3 * b) * y)]++;
    }
    let self = 0;
    for (let i = 0; i < 29; i++) {
      self += even[i] * (even[i] - 1) + odd[i] * (odd[i] - 1);
    }
    for (let delta = 0; delta < 29; delta++) {
      let numerator = self;
      for (let i = 0; i < 29; i++) numerator += 2 * even[i] * odd[(i + delta) % 29];
      if (numerator > best.numerator) {
        best = {numerator, a, b, delta, ioc: numerator / (n * (n - 1))};
      }
    }
  }
  return best;
}

const gpTokens = corpus.translit.map((s, i) => ({s, i})).sort((x, y) => y.s.length - x.s.length);

/** @param {string} originalText @returns {number[]} */
function sourceNativeGP(originalText) {
  const input = originalText.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of input.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        result.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        result.push(27);
        i += 2;
      } else {
        const token = gpTokens.find(t => word.startsWith(t.s, i));
        assert(token, 'unmapped source-native word ' + word);
        result.push(token.i);
        i += token.s.length;
      }
    }
  }
  return result;
}

/**
 * Fully secret invertible positive-control transport.
 * @param {number[]} plain
 * @returns {number[]}
 */
function encryptNative(plain) {
  assert.equal(plain.length % 2, 0);
  const result = [];
  for (let i = 0; i < plain.length; i += 2) {
    const x = plain[i], y = plain[i + 1];
    result.push(modulo(7 * x + 9 * y + 17), modulo(11 * x + 13 * y + 24));
  }
  return result;
}

/** @param {number[]} encrypted @returns {number[]} */
function decryptNative(encrypted) {
  const result = [];
  for (let i = 0; i < encrypted.length; i += 2) {
    const x = modulo(encrypted[i] - 17), y = modulo(encrypted[i + 1] - 24);
    // det([7,9;11,13])=-8 mod29=21, inverse(det)=18 mod29
    result.push(modulo(18 * (13 * x - 9 * y)), modulo(18 * (-11 * x + 7 * y)));
  }
  return result;
}

assert.equal(modulo(21 * 18), 1);
const phase0 = allSecretHill2UpperBound(original);
const phase1 = allSecretHill2UpperBound([...original.slice(1), original[0]]);
const exactField = bestFieldAffine(original);

assert.deepEqual([phase0.maxQ, phase0.minQ, ...phase0.maxRow], [25732, 24852, 1, 28]);
assert.equal(phase1.maxQ, 25860);
assert.equal(exactField.numerator, 98842);
assert.deepEqual([exactField.a, exactField.b, exactField.delta], [1, 18, 16]);
assert(exactField.ioc <= phase0.bound);

const nativeControls = [
  ['Shakespeare', sourceNativeGP(read('resources/control/shakespeare_first300k.txt')).slice(0, 1680)],
  ['Gibran', sourceNativeGP(read('resources/control/gibran_prophet_58585.txt')).slice(0, 1680)]
];
for (const [name, originalPlain] of nativeControls) {
  assert.equal(originalPlain.length, original.length);
  const encoded = encryptNative(originalPlain);
  const recovered = decryptNative(encoded);
  assert.deepEqual(recovered, originalPlain, 'planted all-secret Hill2 original-language recovery');
  const controlBound = allSecretHill2UpperBound(encoded);
  assert(controlBound.bound >= ioc(originalPlain) - 1e-12,
    'all-secret Hill2 upper bound must admit the actual unknown-key plaintext');
  console.log(JSON.stringify({
    kind: 'source-native-planted-control', name,
    nativeIoC: ioc(originalPlain), encryptedIoC: ioc(encoded),
    exactRecovered: recovered.length,
    allSecretUpperBound: controlBound.bound
  }));
}

console.log(JSON.stringify({
  kind: 'original-LP2-p33-to-p39',
  pageLengths: originalPages.map(p => p.indices.length),
  runeCount: original.length, pairCount: original.length / 2,
  originalIoC: ioc(original),
  exactGF841AffineBest: exactField,
  allSecretHill2Original: phase0,
  cycleShiftOneRneSensitivity: phase1,
  conclusion: 'No stationary affine Hill2 decoder can yield a GP29 IoC above the stated 0.03589438 necessary upper bound on original p33-39.'
}));
