'use strict';
/**
 * Exact original-input gate for the p36 Q238 derivative + solved-p56
 * prime-totient literal-F cipher composition. Node.js 22, no dependencies.
 * Requires the existing repository's two canonical JSON resources.
 *
 * Outputs a scoped negative. It does not recover unknown LP2 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
/** @param {string} file @returns {any} */
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
/** @param {number} v @returns {number} */
const mod = v => (v % 29 + 29) % 29;
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function divMonic(a, b) {
  assert.equal(b.at(-1), 1);
  const rem = a.slice();
  const q = Array(a.length - b.length + 1).fill(0);
  for (let i = rem.length - 1; i >= b.length - 1; i--) {
    const s = i - b.length + 1;
    const k = rem[i];
    q[s] = k;
    for (let j = 0; j < b.length; j++) rem[s + j] = mod(rem[s + j] - k * b[j]);
  }
  assert(rem.every(x => x === 0));
  assert.deepEqual(mul(q, b), a);
  return q;
}
/** @param {number} count @returns {number[]} */
function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let k = 2; k * k <= n; k++) if (n % k === 0) { prime = false; break; }
    if (prime) out.push(n);
  }
  return out;
}
/**
 * Exact dynamic reachability of every prime-clock state under the
 * authentic p56 transport: plaintext F is emitted as literal cipher F,
 * consumes no prime; ordinary emissions cannot encode plaintext F.
 * @param {number[]} source @param {number[]} shifts @param {number} sign
 * @returns {{possible:boolean, firstImpossible:number|null, clocks:number[], maxStates:number}}
 */
function admissible(source, shifts, sign) {
  let states = new Set([0]);
  let maxStates = 1;
  for (let i = 0; i < source.length; i++) {
    const next = new Set();
    for (const clock of states) {
      if (source[i] === 0) next.add(clock);
      if (mod(source[i] + sign * shifts[clock]) !== 0) next.add(clock + 1);
    }
    if (next.size === 0)
      return {possible: false, firstImpossible: i, clocks: [...states], maxStates};
    maxStates = Math.max(maxStates, next.size);
    states = next;
  }
  return {possible: true, firstImpossible: null, clocks: [...states], maxStates};
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const x of values) count[x]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const grid = read('resources/liber-primus/base60-grid.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(grid.rows.flat().map(s =>
  60 * grid.alphabet.indexOf(s[0]) + grid.alphabet.indexOf(s[1])), bytes);

// Formal derivative of the unique monic degree-238 factor.
const source = bytes.map(v => mod(-v)).reverse();
while (source.at(-1) === 0) source.pop();
assert.equal(source.length, 255);
const divisor = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
].reduce(mul, [1]);
const q238 = divMonic(source, divisor);
assert.equal(q238.length, 239);
const derivative = q238.slice(1).map((v, i) => mod((i + 1) * v));
const p36 = corpus.pages.find(p => p.page === 36).indices;
assert.equal(p36.length, 238);
const phi = primes(238).map(p => mod(p - 1));

// Verify historical prime shift against solved physical p56; the
// source's sole known literal-F bypass is at local index56.
const p56 = corpus.pages.find(p => p.page === 56).indices;
let ordinal = 0;
const solved56 = p56.map((c, i) => i === 56 ? c : mod(c - phi[ordinal++]));
assert.equal(p56[56], 0);
assert.equal(ordinal, 84);
assert(solved56.map(i => corpus.translit[i]).join('')
  .startsWith('ANENDWITHINTHEDEEPWEBTHEREEXISTSA'));

// Include both algebraic signs to ensure the failure is not
// the result of choosing the opposite cipher direction.
const expected = [
  [0, -1, 56], [0, +1, 103],
  [-1, -1, 1], [-1, +1, 84],
  [+1, -1, 65], [+1, +1, 24]
];
const results = expected.map(([derivativeSign, primeDecodeSign, expectedAt]) => {
  const afterDerivative = p36.map((c, i) => mod(c + derivativeSign * derivative[i]));
  const outcome = admissible(afterDerivative, phi, primeDecodeSign);
  assert.equal(outcome.possible, false);
  assert.equal(outcome.firstImpossible, expectedAt);
  return {derivativeSign, primeDecodeSign, firstImpossibleZeroBased: expectedAt,
    intermediateFCount: afterDerivative.filter(x => x === 0).length};
});

// Full 238-symbol positive plant from genuine solved p57 GP text,
// including source-native F bypasses, and exact inverse+clock recovery.
const p57 = corpus.pages.find(p => p.page === 57).indices;
const planted = Array.from({length: 238}, (_, i) => p57[i % p57.length]);
let consume = 0;
const intermediate = planted.map(p => p === 0 ? 0 : mod(p + phi[consume++]));
const synthetic = intermediate.map((value, i) => mod(value + derivative[i]));
const replay = synthetic.map((value, i) => mod(value - derivative[i]));
assert.deepEqual(replay, intermediate);
let recoveredClock = 0;
const recovered = replay.map((c, i) =>
  planted[i] === 0 ? 0 : mod(c - phi[recoveredClock++]));
assert.deepEqual(recovered, planted);
assert.equal(consume, recoveredClock);
const validPlant = admissible(intermediate, phi, -1);
assert(validPlant.possible);
assert(validPlant.clocks.includes(consume));

const direct = p36.map((c, i) => mod(c - derivative[i] - phi[i]));
assert.equal(ioc(direct), 0.0356345069673439);
console.log(JSON.stringify({
  status: 'Bounded exact negative: p36 derivative plus solved-p56 selective-F prime-totient',
  originalRuneCount: p36.length, sourceByteCount: bytes.length,
  configurations: results, directNoSkipIoC: ioc(direct),
  plantedGP238Recovered: recovered.length, plantedClock: consume
}, null, 2));
