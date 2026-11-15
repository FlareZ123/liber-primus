'use strict';

/**
 * Source-original 255-rune terminal Reed–Solomon erasure decoder gate.
 * Tests the direct GP29-index and GP29-prime GF(256) symbol embeddings.
 * Node.js 22 CommonJS. All erasure matrices solved exactly.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} filename @returns {any} */
function source(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', filename), 'utf8'));
}

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;

/**
 * 8-bit polynomial multiplication in GF(256).
 * @param {number} a
 * @param {number} b
 * @param {number} polynomial
 * @returns {number}
 */
function gfMultiply(a, b, polynomial) {
  let result = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) result ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 256) a ^= polynomial;
  }
  return result;
}

/** @param {number} x @param {number} power @param {number} polynomial @returns {number} */
function gfPower(x, power, polynomial) {
  let out = 1;
  while (power > 0) {
    if (power & 1) out = gfMultiply(out, x, polynomial);
    x = gfMultiply(x, x, polynomial);
    power >>>= 1;
  }
  return out;
}

/** @param {number} x @param {number} polynomial @returns {number[]} */
function allRootPowers(x, polynomial) {
  const powers = Array(255).fill(0);
  powers[0] = 1;
  for (let i = 1; i < 255; i++) powers[i] = gfMultiply(powers[i - 1], x, polynomial);
  return powers;
}

/**
 * Recover all 75 leading unknown bytes of a length-255 evaluation-zero codeword
 * from the 180 known suffix bytes. The codeword T(x) is specified by its
 * high-to-low coefficients. Roots are alpha^(start+0..74), modulo255.
 * @param {number[]} known
 * @param {number} polynomial
 * @param {number} alpha
 * @param {number} start
 * @returns {number[]}
 */
function reconstructPrefix(known, polynomial, alpha, start) {
  assert.equal(known.length, 180);
  const count = 75;
  /** @type {number[][]} */
  const matrix = [];
  for (let k = 0; k < count; k++) {
    const root = gfPower(alpha, (start + k) % 255, polynomial);
    const powers = allRootPowers(root, polynomial);
    let rhs = 0;
    for (let j = 0; j < known.length; j++) {
      rhs ^= gfMultiply(known[j], powers[179 - j], polynomial);
    }
    const row = Array.from({ length: count }, (_, i) => powers[254 - i]);
    row.push(rhs);
    matrix.push(row);
  }
  for (let col = 0; col < count; col++) {
    let pivot = col;
    while (pivot < count && matrix[pivot][col] === 0) pivot++;
    assert(pivot < count, 'Original-root Vandermonde matrix must be nonsingular');
    [matrix[pivot], matrix[col]] = [matrix[col], matrix[pivot]];
    const scalar = gfPower(matrix[col][col], 254, polynomial);
    for (let j = col; j <= count; j++) {
      matrix[col][j] = gfMultiply(matrix[col][j], scalar, polynomial);
    }
    for (let r = 0; r < count; r++) {
      if (r === col || matrix[r][col] === 0) continue;
      const factor = matrix[r][col];
      for (let j = col; j <= count; j++) {
        matrix[r][j] ^= gfMultiply(factor, matrix[col][j], polynomial);
      }
    }
  }
  const prefix = matrix.map(row => row[count]);
  assert.equal(prefix.length, 75);
  // Independent field-arithmetic parity check on every generator root.
  for (let k = 0; k < count; k++) {
    const root = gfPower(alpha, (start + k) % 255, polynomial);
    const powers = allRootPowers(root, polynomial);
    let syndrome = 0;
    for (let i = 0; i < count; i++) {
      syndrome ^= gfMultiply(prefix[i], powers[254 - i], polynomial);
    }
    for (let j = 0; j < known.length; j++) {
      syndrome ^= gfMultiply(known[j], powers[179 - j], polynomial);
    }
    assert.equal(syndrome, 0, 'The reconstructed complete 255-byte word must pass all 75 syndromes');
  }
  return prefix;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) out.push(n);
  }
  return out;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const frequencies = Array(29).fill(0);
  for (const symbol of symbols) frequencies[symbol]++;
  return frequencies.reduce((n, v) => n + v * (v - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

const corpus = source('lp2-corpus.json');
const [p55, p56, p57] = [55,56,57].map(i => corpus.pages[i].indices);
assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
const bodyCipher = p55.slice(1);
assert.equal(bodyCipher.length,75); // p55 index0 finishes a p54 word.
const primeKeys = firstPrimes(85);
let keyCursor = 0;
const plain56 = p56.map((cipher, i) => {
  if (i === 56) { assert.equal(cipher, 0); return 0; }
  const shift = primeKeys[keyCursor++] - 1;
  const plain = mod29(cipher - shift);
  assert.equal(mod29(plain + shift), cipher);
  return plain;
});
assert.equal(keyCursor,84);
assert.deepEqual(plain56.slice(0,5),[24,9,18,9,23]); // AN END.

const fields = [
  {name:'RS-11d',polynomial:0x11d,alpha:2},
  {name:'AES-11b',polynomial:0x11b,alpha:3}
];
for(const {polynomial,alpha} of fields) {
  const nonzero = Array.from({length:255},(_,i) => gfPower(alpha,i,polynomial));
  assert.equal(new Set(nonzero).size,255);
  assert.equal(gfPower(alpha,255,polynomial),1);
}

const rootStarts = [0,1,180,181];
const outcomes = [];
for (const [middleName, middle] of [['cipher',p56], ['plain',plain56]]) {
  for (const [encodingName, encode] of [['index',x=>x], ['prime',x=>corpus.prime[x]]]) {
    const accepted = new Set(Array.from({length:29},(_,i) => encode(i)));
    const known = [...middle,...p57].map(encode);
    const originalCipher = bodyCipher.map(encode);
    assert.equal(known.length,180);
    for (const {name,polynomial,alpha} of fields) {
      for (const start of rootStarts) {
        const reconstructed = reconstructPrefix(known,polynomial,alpha,start);
        const legal = reconstructed.filter(byte=>accepted.has(byte)).length;
        const matchesOriginal = reconstructed.filter((byte,i)=>byte===originalCipher[i]).length;
        const plus = bodyCipher.map((cipher,i) => mod29(cipher + reconstructed[i]%29));
        const minus = bodyCipher.map((cipher,i) => mod29(cipher - reconstructed[i]%29));
        outcomes.push({
          p56:middleName,embedding:encodingName,field:name,rootStart:start,
          allowableGP:legal,identicalCipher:matchesOriginal,
          additivePlusIoC:Number(ioc(plus).toFixed(5)),
          additiveMinusIoC:Number(ioc(minus).toFixed(5))
        });
      }
    }
  }
}
assert.equal(outcomes.length,32);
assert.equal(Math.min(...outcomes.map(row=>row.allowableGP)),3);
assert.equal(Math.max(...outcomes.map(row=>row.allowableGP)),13);
assert.equal(Math.max(...outcomes.map(row=>row.identicalCipher)),1);
assert(outcomes.every(row=>row.allowableGP<75));
assert(outcomes.every(row=>row.identicalCipher<75));

// Independent source-register controls: exact known p56 forward inverse above,
// and every reconstructed complete RS word satisfies all 75 independent roots.
for (const row of outcomes) console.log(JSON.stringify(row));
console.log('PASS: 32 source-fixed RS(255,180) byte-field erasure inverses; 3..13/75 GP-legal parity symbols, 0..1/75 original ciphertext matches');
