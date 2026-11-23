'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const source = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
const side = 27;
assert.deepEqual(corpus.pages.slice(0, 3).map((page) => page.runic_count), [262, 266, 201]);
assert.equal(source.length, side * side);
const mod29 = (value) => ((value % 29) + 29) % 29;

/**
 * Inverts the unique top-left anchored, two-dimensional inclusive prefix
 * integration C[r,c]=sum_{u<=r,v<=c} P[u,v] mod29 on a row-major square.
 * @param {number[]} ciphertext GP29 source, 729 symbols.
 * @returns {number[]} Complete source-coordinate plaintext candidate.
 */
function invertIntegral(ciphertext) {
  assert.equal(ciphertext.length, side * side);
  return ciphertext.map((symbol, index) => {
    const r = Math.floor(index / side);
    const c = index % side;
    return mod29(
      symbol
      - (r ? ciphertext[index - side] : 0)
      - (c ? ciphertext[index - 1] : 0)
      + (r && c ? ciphertext[index - side - 1] : 0),
    );
  });
}

/**
 * @param {number[]} plaintext GP29 source, 729 symbols.
 * @returns {number[]} Forward two-dimensional prefix integral.
 */
function forwardIntegral(plaintext) {
  assert.equal(plaintext.length, side * side);
  const ciphertext = Array(plaintext.length).fill(0);
  for (let r = 0; r < side; r += 1) {
    for (let c = 0; c < side; c += 1) {
      const i = r * side + c;
      ciphertext[i] = mod29(
        plaintext[i]
        + (r ? ciphertext[i - side] : 0)
        + (c ? ciphertext[i - 1] : 0)
        - (r && c ? ciphertext[i - side - 1] : 0),
      );
    }
  }
  return ciphertext;
}

/**
 * @param {number[]} symbols GP29 source text.
 * @returns {number}
 */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  symbols.forEach((value) => { counts[value] += 1; });
  return counts.reduce((total, count) => total + count * (count - 1), 0)
    / (symbols.length * (symbols.length - 1));
}
const direct = invertIntegral(source);
const sourceReversed = source.slice().reverse();
const turned = invertIntegral(sourceReversed).reverse();
assert.deepEqual(forwardIntegral(direct), source);
assert.deepEqual(forwardIntegral(turned.slice().reverse()).reverse(), source);

// A genuinely solved native GP29 source, repeated to fill the 27x27
// carrier, is an independent positive, not a claim about unknown text.
const originalKnown = corpus.pages[57].indices;
assert.equal(originalKnown.length, 95);
const nativePositive = Array.from({ length: 729 }, (_, i) => originalKnown[i % 95]);
const syntheticCipher = forwardIntegral(nativePositive);
assert.deepEqual(invertIntegral(syntheticCipher), nativePositive);
assert.deepEqual(
  forwardIntegral(invertIntegral(syntheticCipher.slice().reverse()).reverse().reverse()),
  syntheticCipher.slice().reverse(),
);
assert.equal(direct.length, 729);
assert.equal(turned.length, 729);
assert.equal(new Set(direct).size, 29);
assert.equal(new Set(turned).size, 29);
const values = {
  originalCounts: [262, 266, 201],
  grid: [27, 27],
  sourceIoc: ioc(source),
  directIoc: ioc(direct),
  halfTurnIoc: ioc(turned),
  nativeControlIoc: ioc(originalKnown),
  directFirst60: direct.slice(0, 60).map((index) => corpus.translit[index]).join('-'),
  halfTurnFirst60: turned.slice(0, 60).map((index) => corpus.translit[index]).join('-'),
  directReverseForwardRestored: 729,
  nativeControlPlantRestored: 729,
};
assert.equal(values.sourceIoc, 0.034082515563997044);
assert.equal(values.directIoc, 0.034029756251978474);
assert.equal(values.halfTurnIoc, 0.03409758965314521);
console.log(JSON.stringify(values, null, 2));
console.log('PASS unchanged first729 and 27x27 mixed-derivative inverse; original remains nonprose.');
