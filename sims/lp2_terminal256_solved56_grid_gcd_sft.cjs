'use strict';

/**
 * SFT: original LP2 numeric table versus its 256-runic terminal sequence,
 * with the independently solved p56 substitution applied to p56 alone.
 * Node.js 22, CommonJS, Windows 11; read-only, standard-library only.
 *
 * This is arithmetic evidence, not a solved p55 cipher or decryption key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const bytes = Buffer.from(table.byte_rows.flat());

assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual([55, 56, 57].map(p => corpus.pages[p].indices.length), [76, 85, 95]);
assert.equal(corpus.pages[56].indices[56], 0);

/** @param {number[]} xs @param {number} base */
function integer(xs, base) {
  return xs.reduce((v, x) => v * BigInt(base) + BigInt(x), 0n);
}

/** @param {bigint} a @param {bigint} b */
function gcd(a, b) {
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

/** @param {number} count */
function firstPrimes(count) {
  /** @type {number[]} */
  const primes = [];
  for (let n = 2; primes.length < count; n += 1) {
    if (primes.every(p => n % p !== 0)) primes.push(n);
  }
  return primes;
}

/**
 * Apply the independently established p56 prime-totient reading.
 * Physical p56 local rune 56 is the literal unencrypted F, does not
 * consume a prime, and stays 0 in all candidate shifts.
 *
 * @param {number[]} ciphertext
 * @param {number[]} primes
 * @param {number} startIndex
 * @param {1 | -1} sign
 * @returns {number[]}
 */
function decodeP56(ciphertext, primes, startIndex, sign) {
  let primeIndex = startIndex;
  return ciphertext.map((c, pos) => {
    if (pos === 56) return c;
    const shift = (primes[primeIndex++] - 1) % 29;
    return (c + sign * shift + 29) % 29;
  });
}

const N = integer([...bytes], 256);
const G = 36528277968n;
assert.equal(N.toString(2).length, 2048);
assert.equal(N % G, 0n);
const prefix = corpus.pages[55].indices;
const suffix = corpus.pages[57].indices;
const ciphertext56 = corpus.pages[56].indices;
const primes = firstPrimes(1100);
const solved56 = decodeP56(ciphertext56, primes, 0, -1);
assert.ok(solved56.map(i => corpus.translit[i]).join('')
  .startsWith('ANENDWITHINTHEDEEPWEBTHEREEXISTS'));

const concatenation = p56 => integer([...prefix, ...p56, ...suffix], 29);
const originalTerminal = concatenation(ciphertext56);
const solvedTerminal = concatenation(solved56);
assert.equal(gcd(N, originalTerminal), 4n);
assert.equal(gcd(N, solvedTerminal), 3024n);
assert.equal(gcd(G, solvedTerminal), 3024n);
assert.equal(solvedTerminal % 3024n, 0n);
assert.notEqual(originalTerminal % 3024n, 0n);
assert.equal(gcd(3024n, G), 3024n);

const modulus = 3024n;
const p55Integer = integer(prefix, 29);
const knownSuffixInteger = integer([...solved56, ...suffix], 29);
assert.equal(29n ** 180n % modulus, 1n);
assert.equal(p55Integer % modulus, 64n);
assert.equal(knownSuffixInteger % modulus, 2960n);
let residue = 1n;
let multiplicativeOrder = 0;
do {
  residue = residue * 29n % modulus;
  multiplicativeOrder += 1;
} while (residue !== 1n);
assert.equal(multiplicativeOrder, 36);
assert.equal((p55Integer + knownSuffixInteger) % modulus, 0n);

/** @type {{ startIndex: number; sign: number; gcd: bigint; mod3024: bigint; opening: string }[]} */
const trials = [];
for (let startIndex = 0; startIndex < 1016; startIndex += 1) {
  for (const sign of [-1, 1]) {
    const decoded = decodeP56(ciphertext56, primes, startIndex, /** @type {1 | -1} */ (sign));
    const asInteger = concatenation(decoded);
    const d = gcd(N, asInteger);
    trials.push({
      startIndex,
      sign,
      gcd: d,
      mod3024: asInteger % 3024n,
      opening: decoded.slice(0, 12).map(i => corpus.translit[i]).join(''),
    });
  }
}
assert.equal(trials.length, 2032);
const authentic = trials.find(t => t.startIndex === 0 && t.sign === -1);
assert.ok(authentic);
assert.equal(authentic.gcd, 3024n);
const rank = 1 + trials.filter(t => t.gcd > authentic.gcd).length;
assert.equal(rank, 8);
const congruent = trials.filter(t => t.mod3024 === 0n);
assert.deepEqual(congruent.map(t => [t.startIndex, t.sign]), [[0, -1], [621, -1]]);
const best = trials.reduce((a, b) => a.gcd >= b.gcd ? a : b);
assert.equal(best.gcd, 8592n);
assert.equal(best.startIndex, 531);
assert.equal(best.sign, -1);

console.log('Original 256-byte table SHA-256:', crypto.createHash('sha256').update(bytes).digest('hex'));
console.log('Table integer bits:', N.toString(2).length);
console.log('Original p55(cipher)+p56(cipher)+p57(clear) gcd:', gcd(N, originalTerminal).toString());
console.log('Authentic p56 decoded, other pages unchanged gcd:', gcd(N, solvedTerminal).toString());
console.log('Authentic prime phase/sign rank among 2032 candidates:', rank);
console.log('Conditional p55 integer residue mod 3024: 64; solved p56+p57 residue: 2960; order of base29: 36');
console.log('Candidate phases exactly divisible by 3024:', congruent.map(t => [t.startIndex, t.sign]));
console.log('Best arbitrary phase:', { startIndex: best.startIndex, sign: best.sign, gcd: best.gcd.toString() });
console.log('DECISION: exact cross-artifact conditional congruence; no recovered p55 plaintext or authentic new decoding rule.');
