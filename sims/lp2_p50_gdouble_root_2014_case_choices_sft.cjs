'use strict';

/**
 * Source-original p50 numeral-table checksum test.
 * Run: node sims/lp2_p50_gdouble_root_2014_case_choices_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.join(__dirname, '..');
const original = JSON.parse(fs.readFileSync(path.join(repo, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const witness = JSON.parse(fs.readFileSync(path.join(repo, 'resources', 'cicada2014-sexagesimal-source.json'), 'utf8'));
const currentBytes = original.bytes;
const oldBytes = witness.decimal_values;

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;

/**
 * Evaluate big-endian polynomial and its formal derivative over GF(29) at x=24.
 * @param {number[]} coefficients
 * @returns {[number, number]}
 */
function rootSyndrome(coefficients) {
  let value = 0;
  let derivative = 0;
  for (const coefficient of coefficients) {
    derivative = mod29(24 * derivative + value);
    value = mod29(24 * value + coefficient);
  }
  return [value, derivative];
}

/**
 * Decode the original printed two-character digits by the specified alphabet.
 * @param {string[]} tokens
 * @param {string} digits
 * @returns {number[]}
 */
function decodeTokens(tokens, digits) {
  return tokens.map((token) => {
    assert.equal(token.length, 2);
    const hi = digits.indexOf(token[0]);
    const lo = digits.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    const byte = digits.length * hi + lo;
    assert(byte <= 255);
    return byte;
  });
}

assert.equal(currentBytes.length, 256);
assert.equal(oldBytes.length, 256);
for (const byte of [...currentBytes, ...oldBytes]) {
  assert(Number.isInteger(byte) && byte >= 0 && byte <= 255);
}
const allTokens = original.pages.flatMap((page) => page.tokens);
assert.equal(allTokens.length, 256);
assert.deepEqual(decodeTokens(allTokens, original.alphabet), currentBytes);
assert(!allTokens.some((token) => token.includes('f')));
const base59 = decodeTokens(allTokens, original.alphabet.replace('f', ''));

// The p39 red triad is the low-first polynomial G(x)=27+5x+15x^2
// = 15(x-24)^2 in GF(29), so a full-table multiple must have both zeros.
assert.equal(mod29(27 + 5 * 24 + 15 * 24 * 24), 0);
assert.equal(mod29(5 + 30 * 24), 0);
assert.deepEqual(rootSyndrome(currentBytes), [0, 0]);
assert.deepEqual(rootSyndrome(oldBytes), [23, 26]);
assert.deepEqual(rootSyndrome(base59), [20, 12]);

const discrepancyIndices = currentBytes.flatMap((byte, index) => byte === oldBytes[index] ? [] : [index]);
assert.deepEqual(discrepancyIndices, [25, 45, 50, 165, 170, 172, 175, 182, 199, 246]);
const fixed = [165, 170, 172];
const uncertain = [25, 45, 50, 175, 182, 199, 246];
const fixedWitness = oldBytes.slice();
for (const index of fixed) fixedWitness[index] = currentBytes[index];
assert.deepEqual(rootSyndrome(fixedWitness), [24, 25]);

/**
 * Enumerate the whole binary correction space without optimizing any cipher or key.
 * @param {number[]} source
 * @param {number[]} alternatives
 * @returns {{mask: number, changed: number[]}[]}
 */
function testChoices(source, alternatives) {
  const passing = [];
  for (let mask = 0; mask < 2 ** alternatives.length; mask++) {
    const candidate = source.slice();
    const changed = [];
    for (let bit = 0; bit < alternatives.length; bit++) {
      if (mask & (2 ** bit)) {
        const index = alternatives[bit];
        candidate[index] = currentBytes[index];
        changed.push(index);
      }
    }
    if (rootSyndrome(candidate).every((residue) => residue === 0)) {
      passing.push({mask, changed});
    }
  }
  return passing;
}

const sevenChoices = testChoices(fixedWitness, uncertain);
assert.deepEqual(sevenChoices, [{mask: 127, changed: uncertain}]);
const tenChoices = testChoices(oldBytes, discrepancyIndices);
assert.deepEqual(tenChoices.map((candidate) => candidate.mask), [131, 139, 1015, 1023]);
assert.equal(mod29(currentBytes[165] - oldBytes[165]), 0);

console.log(JSON.stringify({
  original: rootSyndrome(currentBytes),
  radix59: rootSyndrome(base59),
  archived2014: rootSyndrome(oldBytes),
  archivedAfterThreeHistoricalCorrections: rootSyndrome(fixedWitness),
  sevenCaseAmbiguities: 2 ** uncertain.length,
  sevenCasePassing: sevenChoices,
  unrestrictedTenAmbiguities: 2 ** discrepancyIndices.length,
  unrestrictedTenPassing: tenChoices,
  classification: 'Conditional transcription consistency only; no unknown LP2 plaintext or authenticated key'
}, null, 2));
