'use strict';

/**
 * A source-geometric numerical-table fold with an exploratory four-rune
 * readout, followed by a complete exact F-transparent GP29 inversion gate.
 *
 * Node.js 22, CommonJS; read-only reference inputs.
 * The observed WITH substring is post-selected, not an authenticated key.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const MOD = 29;
const counts = (values) => values.reduce((sum, n) => sum + n, 0);
const mod = (x) => (x % MOD + MOD) % MOD;
const ascii = table.alphabet;
const radix59 = ascii.replace('f', '');
const tokens = table.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(ascii.length, 60);
assert.equal(radix59.length, 59);
assert.deepEqual(table.pages.map((page) => page.rows), [10, 13, 9]);
assert.equal(table.bytes.length, 256);
assert.equal(counts(table.bytes), 33006);
assert.equal(crypto.createHash('sha256').update(Buffer.from(table.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/**
 * @param {string} alphabet
 * @param {number} radix
 * @returns {number[]}
 */
function decode(alphabet, radix) {
  return tokens.map((token) => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0);
    return hi * radix + lo;
  });
}

/**
 * Eight sums, each over exactly four consecutive 8-cell printed source rows.
 * @param {number[]} bytes
 * @returns {number[]}
 */
function fourRowSums(bytes) {
  assert.equal(bytes.length, 256);
  return Array.from({ length: 8 }, (_, i) =>
    mod(counts(bytes.slice(i * 32, (i + 1) * 32))));
}

/**
 * For a fixed repeating key, determine the first ciphertext rune at which
 * all possible exact F-transparent plaintext histories become impossible.
 * If the plaintext symbol is F=0, forward encryption MUST output F=0
 * without consuming key; any other plaintext consumes one key symbol.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} initialPhase
 * @param {number} sign  Forward law C=P+sign*K (mod29), +1 or -1.
 * @returns {number|null} First impossible zero-based position, or null.
 */
function firstFailure(cipher, key, initialPhase, sign) {
  let state = 1 << initialPhase;
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    let next = 0;
    for (let phase = 0; phase < key.length; phase++) {
      if (!(state & (1 << phase))) continue;
      if (c === 0) next |= 1 << phase; // Literal plaintext-F bypass.
      const p = mod(c - sign * key[phase]);
      if (p !== 0) next |= 1 << ((phase + 1) % key.length);
    }
    if (next === 0) return i;
    state = next;
  }
  return null;
}

/**
 * Exact forward plant, independent of the original unknown ciphertext.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} initialPhase
 * @param {number} sign
 * @returns {number[]}
 */
function encrypt(plaintext, key, initialPhase, sign) {
  let phase = initialPhase;
  return plaintext.map((p) => {
    if (p === 0) return 0;
    const c = mod(p + sign * key[phase]);
    phase = (phase + 1) % key.length;
    return c;
  });
}

/** @param {number[]} values */
function indexOfCoincidence(values) {
  const freq = Array(MOD).fill(0);
  for (const p of values) freq[p]++;
  return counts(freq.map((n) => n * (n - 1))) / (values.length * (values.length - 1));
}

const b60 = decode(ascii, 60);
const b59 = decode(radix59, 59);
assert.deepEqual(b60, table.bytes);
const a = fourRowSums(b60);
const a59 = fourRowSums(b59);
assert.deepEqual(a, [22, 8, 9, 7, 10, 16, 8, 11]);
assert.deepEqual(a59, [10, 12, 2, 9, 24, 4, 14, 2]);
const output = a.map((i) => book.translit[i]).join('');
const alternative = a59.map((i) => book.translit[i]).join('');
assert.equal(output, 'OEHNWITHJ');
assert.equal(alternative, 'IEOTHNARXTH');
const key = a.slice(3, 7);
assert.deepEqual(key, [7, 10, 16, 8]);

const unknownPages = book.pages.filter((page) => page.page < 56);
assert.equal(unknownPages.length, 56);
const unknown = unknownPages.flatMap((page) => page.indices);
assert.equal(unknown.length, 12956);
assert.equal(unknownPages[0].indices.length, 262);
const known = book.pages.find((page) => page.page === 57).indices;
assert.equal(known.length, 95);

const trials = [];
for (const sign of [1, -1]) {
  const impossible = Array.from({ length: key.length }, (_, phase) =>
    firstFailure(unknown, key, phase, sign));
  for (const [phase, first] of impossible.entries()) {
    assert.ok(first !== null && first < 262, 'Direct F-transparent model must fail in p0');
    const planted = encrypt(known, key, phase, sign);
    assert.equal(firstFailure(planted, key, phase, sign), null,
      'The same inverse must admit a source-native solved-p57 plant');
  }
  assert.deepEqual(impossible, sign === 1 ? [37, 134, 1, 134] : [5, 88, 88, 88]);
  const direct = unknown.map((c, i) => mod(c - sign * key[i % key.length]));
  const ioc = indexOfCoincidence(direct);
  assert.ok(ioc < 0.035);
  trials.push({ sign, firstImpossibleRuneForPhases0to3: impossible,
    noBypassPlaintextIndexOfCoincidence: ioc });
}

console.log(JSON.stringify({
  verdict: 'exploratory checksum word, direct key rejected; no LP2 plaintext',
  base60FourRowGroups: a,
  sourceRomanization: output,
  alternateBase59Romanization: alternative,
  candidateKey: key,
  tests: trials,
  plaintextControlsPerSign: 4,
  totalUnsolvedRunes: unknown.length,
  caution: 'WITH was noticed after folding the source; neither source nor signed message selects this operation.'
}, null, 2));
