'use strict';

/**
 * Source-only census for the two frozen p50 numeral alphabets.
 *
 * Run:
 *   node sims/lp2_p50_digit_alphabet_census_sft.cjs
 */
const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/base60-grid.json');

const BASE60 = grid.alphabet;
const BASE59 = BASE60.replace('f', '');
const TOKENS = grid.rows.flat();

assert.equal(BASE60, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.equal(BASE60.length, 60);
assert.equal(BASE59.length, 59);
assert.equal(TOKENS.length, 256);

/**
 * @param {string} alphabet
 * @param {string} token
 * @returns {number}
 */
function decodeToken(alphabet, token) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

/**
 * @param {string} alphabet
 * @returns {Set<string>}
 */
function canonicalByteCodewords(alphabet) {
  const out = new Set();
  for (let value = 0; value < 256; value++) {
    const hi = Math.floor(value / alphabet.length);
    const lo = value % alphabet.length;
    out.add(alphabet[hi] + alphabet[lo]);
  }
  return out;
}

const chars = [...TOKENS.join('')];
const charCounts = new Map();
for (const ch of chars) {
  charCounts.set(ch, (charCounts.get(ch) || 0) + 1);
}

const missing60 = [...BASE60].filter((ch) => !charCounts.has(ch));
const missing59 = [...BASE59].filter((ch) => !charCounts.has(ch));
assert.deepEqual(missing60, ['f']);
assert.deepEqual(missing59, []);
assert.equal(new Set(chars).size, 59);
assert.equal(new Set(TOKENS.map((token) => token[1])).size, 59);

const values60 = TOKENS.map((token) => decodeToken(BASE60, token));
const values59 = TOKENS.map((token) => decodeToken(BASE59, token));
assert.equal(Math.min(...values60), 0);
assert.equal(Math.max(...values60), 255);
assert.equal(Math.min(...values59), 0);
assert.equal(Math.max(...values59), 251);

const codewords60 = canonicalByteCodewords(BASE60);
const codewords59 = canonicalByteCodewords(BASE59);
const common = [...codewords60].filter((token) => codewords59.has(token));
const only60 = [...codewords60].filter((token) => !codewords59.has(token));
const only59 = [...codewords59].filter((token) => !codewords60.has(token));
assert.equal(codewords60.size, 256);
assert.equal(codewords59.size, 256);
assert.equal(common.length, 252);
assert.deepEqual(only60, ['0f', '1f', '2f', '3f']);
assert.deepEqual(only59, ['4G', '4H', '4I', '4J']);
assert.equal(TOKENS.filter((token) => only60.includes(token)).length, 0);
assert.equal(TOKENS.filter((token) => only59.includes(token)).length, 0);
assert.ok(TOKENS.every((token) => codewords60.has(token)));
assert.ok(TOKENS.every((token) => codewords59.has(token)));

const byteDisagreements = TOKENS.filter(
  (token) => decodeToken(BASE60, token) !== decodeToken(BASE59, token)
);
assert.equal(byteDisagreements.length, 220);

const low60 = TOKENS.map((token, index) => ({token, index}))
  .filter(({token}) => decodeToken(BASE60, token) < 60);
const low59 = TOKENS.map((token, index) => ({token, index}))
  .filter(({token}) => decodeToken(BASE59, token) < 60);
assert.equal(low60.length, 60);
assert.equal(low59.length, 60);
assert.deepEqual(
  low60.map(({index}) => index),
  low59.map(({index}) => index)
);

const parityDisagreements = TOKENS.map((token, index) => ({
  index,
  token,
  base60: BASE60.indexOf(token[1]) & 1,
  base59: BASE59.indexOf(token[1]) & 1
})).filter((row) => row.base60 !== row.base59);
assert.equal(parityDisagreements.length, 83);

const lowParityDisagreements = parityDisagreements.filter((row) =>
  decodeToken(BASE60, row.token) < 60
);
assert.equal(lowParityDisagreements.length, 24);

const evenLow60 = low60.filter(({token}) => (BASE60.indexOf(token[1]) & 1) === 0);
const evenLow59 = low59.filter(({token}) => (BASE59.indexOf(token[1]) & 1) === 0);
assert.equal(evenLow60.length, 36);
assert.equal(evenLow59.length, 30);

const commonSupportProbability = (252 / 256) ** 256;
const uniformByteSequenceLogLikelihoodNats = -256 * Math.log(256);
assert.ok(Math.abs(commonSupportProbability - 0.017746279621051256) < 1e-15);

console.log(JSON.stringify({
  classification: 'source-only alphabet census; no repeat positions used',
  alphabets: {base60: BASE60, dropFBase59: BASE59},
  printedCharacterInventory: {
    distinct: new Set(chars).size,
    missingFromBase60: missing60,
    missingFromBase59: missing59,
    distinctSecondCharacters: new Set(TOKENS.map((token) => token[1])).size
  },
  canonicalByteCodewords: {
    intersection: common.length,
    base60Only: only60,
    base59Only: only59,
    observedBase60Only: 0,
    observedBase59Only: 0,
    commonSupportProbabilityUnderUniformBytes: commonSupportProbability,
    sequenceLogLikelihoodNatsUnderEitherUniformByteModel:
      uniformByteSequenceLogLikelihoodNats
  },
  decodedValues: {
    base60Range: [Math.min(...values60), Math.max(...values60)],
    base59Range: [Math.min(...values59), Math.max(...values59)],
    differingCells: byteDisagreements.length
  },
  repeatIndependentBit0Impact: {
    lowValueClassCellsUnderEitherMap: low60.length,
    lowClassMembershipDisagreements: 0,
    secondDigitParityDisagreementsAllCells: parityDisagreements.length,
    secondDigitParityDisagreementsWithinLowClass: lowParityDisagreements.length,
    conventionalBase60EvenLowCells: evenLow60.length,
    dropFBase59EvenLowCells: evenLow59.length
  },
  decision:
    'the original tokens are canonical byte codewords under both frozen alphabets; token syntax and inventory alone do not authenticate either mapping'
}, null, 2));
