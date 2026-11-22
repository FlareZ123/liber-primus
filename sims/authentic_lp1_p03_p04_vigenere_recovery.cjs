'use strict';

// Authentic LP1 pages 03-04: reconstruct the historical Vigenere key from a
// 100-rune known-plaintext crib, then test the remaining 415 original runes.
// Literal ciphertext F may represent plain F without consuming a key rune.
// Sources: resources/transcriptions/lp1_wulfic_canonical.txt (Wulfic)
// and resources/liber-primus/lp1-plaintext-reference.txt (editorial plaintext).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const resource = (file) => fs.readFileSync(path.join(__dirname, '..', 'resources', file), 'utf8');
const corpus = JSON.parse(resource('liber-primus/lp2-corpus.json'));
const pages = resource('transcriptions/lp1_wulfic_canonical.txt').split('%').slice(1, 3).join('%');
const cipher = [...pages].filter((rune) => corpus.runes.includes(rune))
  .map((rune) => corpus.runes.indexOf(rune));

// Documented original spelling, different from editorial-normalized reference:
// ILLUSIANS, WIDSOM, INSTRUCTIAN. The GP register also renders V as U, K as C,
// and ending ING as NG (with the single ᛝ rune).
const english = resource('liber-primus/lp1-plaintext-reference.txt')
  .split('### 3')[1].split('### 4')[0]
  .replaceAll('ILLUSIONS', 'ILLUSIANS')
  .replaceAll('WISDOM', 'WIDSOM')
  .replaceAll('INSTRUCTION', 'INSTRUCTIAN');
const words = english.replace(/[^A-Z]+/g, ' ').trim().split(/\s+/)
  .map((word) => word.replaceAll('V', 'U').replaceAll('K', 'C').replaceAll('ING', 'NG'));
const spellings = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @type {number[]} */
const plaintext = [];
for (const word of words) {
  for (let offset = 0; offset < word.length;) {
    const match = spellings.find(({ token }) => word.startsWith(token, offset));
    assert.ok(match, 'Unrecognized GP sequence: ' + word.slice(offset));
    plaintext.push(match.index);
    offset += match.token.length;
  }
}
assert.equal(cipher.length, 515);
assert.equal(plaintext.length, cipher.length);

const train = 100;
const firstFs = cipher.slice(0, train).map((rune, i) => rune === 0 ? i : -1)
  .filter((i) => i >= 0);
assert.deepEqual(firstFs, [5, 14, 47, 48, 74, 84]);

/**
 * Infer an unknown repeating additive key from the first 100 original runes.
 * Each selected F is plaintext F and does not consume a key position.
 * @param {number} period
 * @returns {Array<{key:number[],literalFs:number[]}>}
 */
function recover(period) {
  /** @type {Array<{key:number[],literalFs:number[]}>} */
  const found = [];
  for (let mask = 0; mask < (1 << firstFs.length); mask++) {
    /** @type {Array<number|null>} */
    const key = new Array(period).fill(null);
    /** @type {number[]} */
    const literalFs = [];
    let phase = 0;
    let valid = true;
    for (let i = 0; i < train; i++) {
      const fIndex = firstFs.indexOf(i);
      if (fIndex !== -1 && (mask & (1 << fIndex))) {
        if (plaintext[i] !== 0) { valid = false; break; }
        literalFs.push(i);
        continue;
      }
      const shift = (cipher[i] - plaintext[i] + 29) % 29;
      if (key[phase] !== null && key[phase] !== shift) {
        valid = false;
        break;
      }
      key[phase] = shift;
      phase = (phase + 1) % period;
    }
    if (valid && key.every((value) => value !== null)) {
      found.push({ key: /** @type {number[]} */ (key), literalFs });
    }
  }
  return found;
}

assert.equal(recover(7).length, 0);
assert.equal(recover(9).length, 0);
const candidates = recover(8);
assert.equal(candidates.length, 1);
const { key, literalFs: firstRecoveredFs } = candidates[0];
assert.deepEqual(key, [23, 10, 1, 10, 9, 10, 16, 26]);
assert.deepEqual(firstRecoveredFs, [48, 74, 84]);
assert.ok(key.every((value) => value !== 0));

/** @type {number[]} */
const allRecoveredFs = [];
let phase = 0;
for (let i = 0; i < cipher.length; i++) {
  if (cipher[i] === 0 && plaintext[i] === 0) {
    allRecoveredFs.push(i);
    continue;
  }
  const decoded = (cipher[i] - key[phase] + 29) % 29;
  assert.equal(decoded, plaintext[i], 'Incorrect rune at original offset ' + i);
  phase = (phase + 1) % key.length;
}
assert.deepEqual(allRecoveredFs, [48, 74, 84, 132, 159, 160, 250, 421, 443, 465, 514]);
if (require.main === module) console.log(JSON.stringify({
  regression: 'LP1 original JPEGs 03-04',
  cipherRunes: cipher.length,
  trainingRunes: train,
  independentHoldoutRunes: cipher.length - train,
  trainingMasksEnumerated: 1 << firstFs.length,
  recoveredKeyIndices: key,
  recoveredKeyGpTransliteration: key.map((index) => corpus.translit[index]).join(''),
  recoveredLiteralFs: allRecoveredFs,
  period7ControlCandidates: 0,
  period9ControlCandidates: 0,
  status: 'PASS'
}, null, 2));

module.exports = { cipher, plaintext, key, allRecoveredFs };
