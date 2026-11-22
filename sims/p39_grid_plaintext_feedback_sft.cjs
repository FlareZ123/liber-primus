'use strict';

/**
 * Source-fixed p39 polynomial plaintext-feedback inverse.
 * Run with: node sims/p39_grid_plaintext_feedback_sft.cjs
 *
 * The 256 printed base-60 cells are descending coefficients of P over GF(29).
 * The original p39 red triple [27,5,15] agrees with [P(15),P'(15),15].
 * Hypothesis only: C_i = P_i - sign * J(P_{i-1}) (mod29), J=P or P'.
 * This does not assert that the original manuscript instructs plaintext feedback.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'base60-grid.json'), 'utf8'));
const originalBytes = grid.byte_rows.flat();
assert.equal(originalBytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(originalBytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
const coefficients = originalBytes.map((x) => x % 29);
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} x @returns {[number,number]} */
function jet(x) {
  let y = 0;
  let derivative = 0;
  for (const a of coefficients) {
    derivative = mod(derivative * x + y);
    y = mod(y * x + a);
  }
  return [y, derivative];
}

/**
 * @param {number[]} ciphertext
 * @param {(x:number)=>number} key
 * @param {number} sign
 * @param {number} start
 */
function decode(ciphertext, key, sign, start) {
  let previousPlain = start;
  return ciphertext.map((c) => {
    const p = mod(c + sign * key(previousPlain));
    previousPlain = p;
    return p;
  });
}

/**
 * @param {number[]} plaintext
 * @param {(x:number)=>number} key
 * @param {number} sign
 * @param {number} start
 */
function encode(plaintext, key, sign, start) {
  let previousPlain = start;
  return plaintext.map((p) => {
    const c = mod(p - sign * key(previousPlain));
    previousPlain = p;
    return c;
  });
}

/** @param {number[]} symbols */
function coincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const n of symbols) counts[n]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

assert.deepEqual(jet(15), [27, 5]);
const selected = corpus.pages.filter((p) => p.page >= 40 && p.page <= 53);
assert.equal(selected.length, 14);
const ciphertext = selected.flatMap((p) => p.indices);
assert.equal(ciphertext.length, 3008);
const authenticSolved = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(authenticSolved.length, 95);
assert.ok(Math.abs(coincidence(authenticSolved) - 0.06270996640537514) < 1e-12);
assert.ok(Math.abs(coincidence(ciphertext) - 0.0345426274862201) < 1e-12);

const expected = [
  ['P', -1, 0.03447319729142639],
  ['P', 1, 0.03450304785288228],
  ['Pprime', -1, 0.03439226910259041],
  ['Pprime', 1, 0.034431185390118094]
];

const results = [];
for (const [name, sign, expectedIoc] of expected) {
  const key = name === 'P' ? (x) => jet(x)[0] : (x) => jet(x)[1];
  const plaintext = decode(ciphertext, key, sign, 15);
  const observed = coincidence(plaintext);
  assert.ok(Math.abs(observed - expectedIoc) < 1e-12);
  assert.deepEqual(encode(plaintext, key, sign, 15), ciphertext);

  // A positive control with authentic solved LP2 prose, preserving the same
  // source-selected 3008-symbol input length.
  const nativePlant = Array.from(
    { length: ciphertext.length },
    (_, i) => authenticSolved[i % authenticSolved.length]
  );
  const encodedPlant = encode(nativePlant, key, sign, 15);
  assert.deepEqual(decode(encodedPlant, key, sign, 15), nativePlant);
  assert.ok(coincidence(nativePlant) > 0.05);
  results.push({
    key: name,
    sign,
    decodedIoc: observed,
    initialRuneIndices: plaintext.slice(0, 24),
    roundTrip: '3008/3008',
    sourcePlant: '3008/3008'
  });
}

process.stdout.write(JSON.stringify({
  mode: 'hypothetical source-jet plaintext feedback',
  printedPages: '40-53',
  p39RedTriad: [27, 5, 15],
  originalIoc: coincidence(ciphertext),
  solvedP57Ioc: coincidence(authenticSolved),
  results,
  status: 'No language-like IoC; no authentic LP2 key or plaintext'
}, null, 2) + '\n');
