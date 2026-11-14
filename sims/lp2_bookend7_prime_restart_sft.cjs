'use strict';

/**
 * Source-locked p27/p55/p56 bookend prime-totient restart gate.
 * A complete single-file test: node sims/lp2_bookend7_prime_restart_sft.cjs
 * Only immutable original LP2 rune indices are read; no fitted key or phase.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));

/** @param {number} p @returns {number[]} */
function page(p) {
  const record = corpus.pages.find(item => item.page === p);
  assert.ok(record && Array.isArray(record.indices), 'missing source page ' + p);
  return record.indices;
}

/** @param {number} count @returns {number[]} */
function totientPrimeShifts(count) {
  /** @type {number[]} */
  const shifts = [];
  for (let p = 2; shifts.length < count; p++) {
    let prime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) { prime = false; break; }
    }
    if (prime) shifts.push((p - 1) % 29);
  }
  return shifts;
}
const shift = totientPrimeShifts(512);

/**
 * Exhaust every legal ciphertext-F branch of the p56 rule:
 * plaintext F (GP index 0) is copied as F, consuming no key;
 * an encrypted non-F may also produce ciphertext F.
 * A non-F ciphertext cannot decode to plaintext F.
 *
 * @param {number[]} ciphertext
 * @returns {{ firstImpossibleOffset: number | null, endKeyIndices: number[] }}
 */
function admissibleKeyClocks(ciphertext) {
  let current = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const k of current) {
      if (ciphertext[i] === 0) {
        next.add(k); // the literal plaintext-F bypass
        if (shift[k] !== 0) next.add(k + 1); // encrypted non-F becomes F
      } else if ((ciphertext[i] - shift[k] + 29) % 29 !== 0) {
        next.add(k + 1); // legal encrypted non-F
      }
    }
    if (next.size === 0) {
      return { firstImpossibleOffset: i, endKeyIndices: [] };
    }
    current = next;
  }
  return { firstImpossibleOffset: null, endKeyIndices: [...current].sort((a, b) => a - b) };
}

/** @param {number[]} plaintext @returns {{ciphertext:number[],consumed:number}} */
function sourceNativePlant(plaintext) {
  /** @type {number[]} */
  const ciphertext = [];
  let k = 0;
  for (const p of plaintext) {
    if (p === 0) ciphertext.push(0);
    else { ciphertext.push((p + shift[k]) % 29); k++; }
  }
  return { ciphertext, consumed: k };
}

const p27 = page(27), p55 = page(55), p56 = page(56), p57 = page(57);
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
const repeated = [...p55.slice(70), p56[0]];
assert.deepEqual(repeated, p27.slice(28, 35));
assert.deepEqual(repeated, [23, 11, 1, 17, 18, 10, 25]); // DJU BEI AE
assert.equal((p56[0] - shift[0] + 29) % 29, 24); // authentic AN END initial A
const solved = admissibleKeyClocks(p56);
assert.equal(solved.firstImpossibleOffset, null);
assert.equal(solved.endKeyIndices.length, 5);

const planted = sourceNativePlant(p57);
const plantedInverse = admissibleKeyClocks(planted.ciphertext);
assert.equal(plantedInverse.firstImpossibleOffset, null);
assert.ok(plantedInverse.endKeyIndices.includes(planted.consumed));

const firstOfSeven = admissibleKeyClocks(p27.slice(28));
const matchingAE = admissibleKeyClocks(p27.slice(34));
assert.equal(firstOfSeven.firstImpossibleOffset, 129);
assert.equal(matchingAE.firstImpossibleOffset, 56);
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  sourceMatch: 'p27:28-34 = p55:70-75 + p56:0 = DJU BEI AE',
  solvedP56KeyStates: solved.endKeyIndices,
  nativeP57Plant: { runes: p57.length, consumed: planted.consumed, feasible: true },
  proposedRestarts: [
    { anchor: 'p27:28', n: p27.length - 28, impossibleAtRelative: firstOfSeven.firstImpossibleOffset, impossibleAtPage: 28 + firstOfSeven.firstImpossibleOffset },
    { anchor: 'p27:34 (same AE as solved p56:0)', n: p27.length - 34, impossibleAtRelative: matchingAE.firstImpossibleOffset, impossibleAtPage: 34 + matchingAE.firstImpossibleOffset }
  ],
  recoveredUnknownPlaintext: false
}, null, 2));
