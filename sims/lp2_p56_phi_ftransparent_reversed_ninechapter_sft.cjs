'use strict';

/**
 * Source-exact backward traversal of the *known* LP2 p56 prime-totient/F-skip
 * cipher. This tests a directional transfer hypothesis, not a discovered cipher.
 * Run as one CommonJS file on Node.js 22 on a repository checkout.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const NSTART = 5000;
const mod29 = n => ((n % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function totientKeys(count) {
  const bound = 180000;
  const sieve = new Uint8Array(bound);
  const keys = [];
  for (let p = 2; p < bound && keys.length < count; p++) {
    if (sieve[p]) continue;
    keys.push((p - 1) % 29);
    if (p * p < bound) {
      for (let n = p * p; n < bound; n += p) sieve[n] = 1;
    }
  }
  assert.equal(keys.length, count);
  return keys;
}
const key = totientKeys(9000);

/**
 * Backward reading is defined in physical rune order reversed. Only plaintext
 * F is a zero-cost clock bypass, and it must have ciphertext F.
 * @param {number[]} reverseCipher
 * @param {number} start
 * @param {1|-1} sign
 * @returns {{reached:number, ends:number[]}}
 */
function reach(reverseCipher, start, sign) {
  let states = [0];
  const seen = new Uint8Array(reverseCipher.length + 1);
  for (let i = 0; i < reverseCipher.length; i++) {
    const c = reverseCipher[i];
    seen.fill(0);
    const next = [];
    for (const consumed of states) {
      const p = mod29(c - sign * key[start + consumed]);
      if (p !== 0 && !seen[consumed + 1]) {
        next.push(consumed + 1);
        seen[consumed + 1] = 1;
      }
      if (c === 0 && !seen[consumed]) {
        next.push(consumed);
        seen[consumed] = 1;
      }
    }
    if (!next.length) return {reached: i, ends: []};
    states = next;
  }
  return {reached: reverseCipher.length, ends: states};
}

/** @param {number[]} plaintext @param {number} start @param {1|-1} sign */
function encryptBackward(plaintext, start, sign) {
  const ciphertext = new Array(plaintext.length);
  let consumed = 0;
  for (let i = plaintext.length - 1; i >= 0; i--) {
    const p = plaintext[i];
    ciphertext[i] = p === 0 ? 0 : mod29(p + sign * key[start + consumed++]);
  }
  return ciphertext;
}

/** @param {number[]} cipher @param {number[]} knownPlain @param {number} start @param {1|-1} sign */
function decodeBackwardWithKnownFMask(cipher, knownPlain, start, sign) {
  let consumed = 0;
  const decoded = cipher.slice();
  for (let i = cipher.length - 1; i >= 0; i--) {
    const c = cipher[i];
    if (knownPlain[i] === 0) {
      assert.equal(c, 0);
      decoded[i] = 0;
    } else {
      decoded[i] = mod29(c - sign * key[start + consumed++]);
      assert.notEqual(decoded[i], 0);
    }
  }
  return decoded;
}

/** @param {number[]} a */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const x of a) count[x]++;
  return count.reduce((n, x) => n + x * (x - 1), 0) / (a.length * (a.length - 1));
}

/** @param {string} word */
function gpWord(word) {
  const tokens = source.translit.map((text, i) => ({text, i}))
    .sort((a, b) => b.text.length - a.text.length);
  const text = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < text.length;) {
    const token = tokens.find(t => text.startsWith(t.text, i));
    assert.ok(token);
    result.push(token.i);
    i += token.text.length;
  }
  return result;
}

// Real solved LP2 p56 positive in its authenticated *forward* orientation.
const p56Known = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(p56Known.length, 85);
let used = 0;
const p56Encrypted = p56Known.map(p => p === 0 ? 0 : mod29(p + key[used++]));
assert.equal(used, 84);
assert.deepEqual(p56Encrypted, source.pages.find(p => p.page === 56).indices);

// Source-native backward-cipher synthetic positives at both arithmetic signs.
// They test the true F-skip clock and exact plaintext recovery on a known mask.
const p57 = source.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
for (const sign of [1, -1]) {
  const plain = Array.from({length: 308}, (_, i) => p57[i % p57.length]);
  plain[0] = 24; // Native English one-rune word A at the p54 first-word slot
  const cipher = encryptBackward(plain, 167, sign);
  assert.equal(reach(cipher.slice().reverse(), 167, sign).reached, 308);
  assert.deepEqual(decodeBackwardWithKnownFMask(cipher, plain, 167, sign), plain);
  assert.deepEqual(encryptBackward(
    decodeBackwardWithKnownFMask(cipher, plain, 167, sign), 167, sign
  ), cipher);
}

/**
 * Enumerate every possible F bypass at the six original terminal chapter Fs.
 * @param {number[]} reversed
 * @param {number} start
 * @param {1|-1} sign
 */
function terminalPaths(reversed, start, sign) {
  const nf = reversed.filter(c => c === 0).length;
  assert.equal(nf, 6);
  const result = [];
  for (let mask = 0; mask < (1 << nf); mask++) {
    const decodedReversed = [];
    let used = 0;
    let f = 0;
    let valid = true;
    for (const c of reversed) {
      if (c === 0 && (mask & (1 << f))) {
        decodedReversed.push(0);
      } else {
        const p = mod29(c - sign * key[start + used++]);
        if (p === 0) {valid = false; break;}
        decodedReversed.push(p);
      }
      if (c === 0) f++;
    }
    if (!valid) continue;
    const plain = decodedReversed.reverse();
    assert.deepEqual(encryptBackward(plain, start, sign), reversed.slice().reverse());
    result.push({mask, ioc: ioc(plain), firstRune: source.translit[plain[0]]});
  }
  return result;
}

const expectedPlus = [[3072], [], [], [], [], [], [], [], [224,481,1043,1429,1431]];
const expectedMinus = [[], [], [], [], [], [], [], [], [516,1551,1552,3017]];
const expectedMaxPlus = [729,499,517,411,965,469,328,744,308];
const expectedMaxMinus = [723,292,682,448,481,421,380,458,308];
const rows = chapters.map(([first, last], i) => {
  const reversed = source.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices).reverse();
  const row = {pages: 'p' + first + '-' + last, nRunes: reversed.length};
  for (const sign of [1, -1]) {
    const survivors = [];
    let furthest = 0;
    for (let start = 0; start < NSTART; start++) {
      const r = reach(reversed, start, sign);
      furthest = Math.max(furthest, r.reached);
      if (r.reached === reversed.length) survivors.push(start);
    }
    const expected = sign === 1 ? expectedPlus : expectedMinus;
    const expectedMax = sign === 1 ? expectedMaxPlus : expectedMaxMinus;
    assert.deepEqual(survivors, expected[i]);
    assert.equal(furthest, expectedMax[i]);
    row[sign === 1 ? 'plus' : 'minus'] = {furthest, survivors};
  }
  return row;
});
assert.equal(rows.reduce((sum, row) => sum + row.nRunes, 0), 12956);

const reversedTerminal = source.pages.filter(p => p.page >= 54 && p.page <= 55)
  .flatMap(p => p.indices).reverse();
const terminal = [];
for (const sign of [1, -1]) {
  const viable = sign === 1 ? expectedPlus[8] : expectedMinus[8];
  for (const start of viable) {
    const paths = terminalPaths(reversedTerminal, start, sign);
    assert.ok(paths.length >= 1);
    terminal.push({sign, start, paths});
  }
}
assert.equal(terminal.reduce((sum, row) => sum + row.paths.length, 0), 14);
assert.ok(terminal.every(x => x.paths.every(y => y.ioc < 0.04)));
assert.ok(terminal.every(x => x.paths.every(y => !['A', 'I'].includes(y.firstRune))));

console.log(JSON.stringify({
  originalCipher: '12956 unchanged GP29 runes, 9 reversed printed chapters',
  historicalP56Positive: '85/85 exactly including 1 transparent plaintext F',
  syntheticReversePositive: '308/308 each sign with original-F-correct key clock',
  startIndices: '0..4999',
  rows,
  p54to55ArithmeticPaths: terminal,
  firstP54PrintedWord: 'one GP rune; no surviving candidate begins A or I',
  decision: 'Reverse p56-family transfer fails 7/9 chapters algebraically; surviving 2 chapters lack recovered plaintext, and all 14 terminal paths violate ordinary English single-letter-word opening. No original key.'
}, null, 2));
