'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

const chapter = corpus.pages
  .filter(page => page.page <= 2)
  .flatMap(page => page.indices);

assert.equal(chapter.length, 729);

const mod = value => ((value % 29) + 29) % 29;

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

/** @returns {number[]} */
function recurrenceKey() {
  const terms = [15, 42];
  while (terms.length < 16) {
    terms.push(terms.at(-1) + terms.at(-2));
  }
  const residues = terms.map(mod);
  assert.deepEqual(residues.slice(0, 5), [15, 13, 28, 12, 11]);
  assert.deepEqual(residues.slice(14, 16), residues.slice(0, 2));
  return residues.slice(0, 14);
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} phase
 * @param {number} sign
 * @returns {number[]}
 */
function direct(ciphertext, key, phase, sign) {
  return ciphertext.map((value, index) =>
    mod(value + sign * key[(phase + index) % key.length])
  );
}

/**
 * Solved-p56-style transparent plaintext-F inverse. Ciphertext F is copied
 * without consuming the key; any non-F ciphertext that would decrypt to F
 * makes the path impossible.
 *
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} phase
 * @param {number} sign
 * @returns {number[] | null}
 */
function transparentF(ciphertext, key, phase, sign) {
  const plaintext = [];
  let keyIndex = phase;

  for (const value of ciphertext) {
    if (value === 0) {
      plaintext.push(0);
      continue;
    }

    const plain = mod(value + sign * key[keyIndex % key.length]);
    if (plain === 0) return null;
    plaintext.push(plain);
    keyIndex += 1;
  }

  return plaintext;
}

const key = recurrenceKey();
assert.deepEqual(
  key.map(value => corpus.translit[value]),
  ['S', 'P', 'EA', 'EO', 'J', 'D', 'C', 'EA', 'R', 'O', 'W', 'I', 'B', 'IA']
);

const targets = [
  { name: 'full729', ciphertext: chapter },
  { name: 'body716', ciphertext: chapter.slice(13) },
];

const directRows = [];
let transparentFLegal = 0;

for (const target of targets) {
  for (const sign of [-1, 1]) {
    for (let phase = 0; phase < key.length; phase += 1) {
      const plaintext = direct(target.ciphertext, key, phase, sign);
      assert.deepEqual(
        direct(plaintext, key, phase, -sign),
        target.ciphertext
      );
      directRows.push({
        target: target.name,
        sign,
        phase,
        ioc: ioc(plaintext),
      });

      const withF = transparentF(target.ciphertext, key, phase, sign);
      if (withF !== null) transparentFLegal += 1;
    }
  }
}

directRows.sort((first, second) => second.ioc - first.ioc);
assert.equal(directRows.length, 56);
assert.equal(transparentFLegal, 0);
assert.equal(directRows[0].target, 'body716');
assert.equal(directRows[0].sign, 1);
assert.equal(directRows[0].phase, 12);
assert.ok(Math.abs(directRows[0].ioc - 0.0356526155408837) < 1e-15);

// Source-natural continuation after the five observed checksum terms starts
// with recurrence term 5, residue 23, which is phase 5 of the 14-cycle.
const continuation = direct(chapter.slice(13), key, 5, -1);
const continuationForward = direct(chapter.slice(13), key, 5, 1);

console.log(JSON.stringify({
  source: 'original LP2 p0-p2 729-rune chapter and red-title checksum chain',
  observedChecksumTerms: [15, 42, 57, 99, 156],
  recurrenceKeyIndices: key,
  recurrenceKeyRunes: key.map(value => corpus.translit[value]),
  periodModulo29: 14,
  testedDirectVariants: directRows.length,
  bestDirect: directRows[0],
  uniformIoC: 1 / 29,
  sourceNaturalContinuation: {
    phase: 5,
    subtractIoC: ioc(continuation),
    addIoC: ioc(continuationForward),
  },
  transparentFVariantsTested: 56,
  transparentFLegal,
  decision: 'The additive checksum continuation does not directly unlock p0-p2 as a periodic GP29 additive key; every transparent-F variant is impossible and all direct variants remain near uniform.',
}, null, 2));
