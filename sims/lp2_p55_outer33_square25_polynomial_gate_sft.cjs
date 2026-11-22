'use strict';

/**
 * Original LP2 p55 word-boundary/circumference polynomial gate.
 *
 * A period-2014 solver has the 3301 and 1033 five-by-five magic squares,
 * and solved p57 says "shed our own circumferences." Test the 33 page-local
 * word-edge GP digits and 43 strict-interior GP digits independently.
 *
 * Node.js 22/CommonJS, read-only: node sims/lp2_p55_outer33_square25_polynomial_gate_sft.cjs
 * This is a conditional original-data identity, NOT a decipherment.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;

/** @param {number[]} coefficients @param {number} x @returns {number} */
function evaluateAscending(coefficients, x) {
  return coefficients.reduceRight((value, digit) => mod29(value * x + digit), 0);
}

/** @param {number} x @returns {number} */
function inv29(x) {
  for (let y = 1; y < 29; y++) if (mod29(x * y) === 1) return y;
  throw Error('Divisor leading coefficient is zero');
}

/**
 * @param {number[]} coefficients
 * @param {number[]} divisor
 * @returns {{quotient: number[], remainder: number[]}}
 */
function divideAscending(coefficients, divisor) {
  const a = coefficients.slice().map(mod29);
  const quotient = Array(a.length - divisor.length + 1).fill(0);
  const leadInverse = inv29(divisor.at(-1));
  for (let i = a.length - 1; i >= divisor.length - 1; i--) {
    const multiplier = mod29(a[i] * leadInverse);
    quotient[i - divisor.length + 1] = multiplier;
    for (let j = 0; j < divisor.length; j++) {
      a[i - divisor.length + 1 + j] = mod29(
        a[i - divisor.length + 1 + j] - multiplier * divisor[j],
      );
    }
  }
  return { quotient, remainder: a.slice(0, divisor.length - 1) };
}

/** @returns {void} */
function main() {
  const root = path.join(__dirname, '..');
  const corpus = JSON.parse(fs.readFileSync(
    path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const page = corpus.pages.find(p => p.page === 55);
  assert.equal(page.indices.length, 76);
  const lengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
  assert.equal(lengths.reduce((a, b) => a + b, 0), 76);

  const edge = [];
  const inner = [];
  let offset = 0;
  for (const length of lengths) {
    const word = page.indices.slice(offset, offset + length);
    offset += length;
    edge.push(word[0]);
    if (length > 1) edge.push(word.at(-1));
    inner.push(...word.slice(1, -1));
  }
  assert.equal(offset, 76);
  assert.equal(edge.length, 33);
  assert.equal(inner.length, 43);
  assert.deepEqual(inner.slice(0, 15),
    [19, 10, 12, 6, 23, 2, 27, 24, 17, 5, 28, 0, 14, 10, 19]);
  assert.deepEqual(edge.slice(0, 15),
    [21, 25, 7, 15, 17, 14, 19, 15, 25, 0, 1, 7, 4, 17, 12]);

  // The original source has a single word *continued across* the p54/p55
  // physical page turn. Its ten earlier runes are on p54. A genuine
  // whole-word circumference extraction must retain the prior first rune.
  const previous = corpus.pages.find(p => p.page === 54).indices;
  assert.deepEqual(previous.slice(-10), [6, 3, 16, 2, 14, 18, 28, 4, 6, 26]);
  assert.equal(page.indices[0], 21);
  const completeWordEdges = [previous.at(-10), ...edge];
  const completeWordInterior = [...previous.slice(-9), ...inner];
  const page55CompleteOnlyEdges = edge.slice(1);
  assert.equal(completeWordEdges.length, 34);
  assert.equal(completeWordInterior.length, 52);
  assert.equal(page55CompleteOnlyEdges.length, 32);
  assert.deepEqual([
    evaluateAscending(completeWordEdges, 24),
    evaluateAscending(completeWordEdges, 18)
  ], [26, 21]);
  assert.deepEqual([
    evaluateAscending(completeWordInterior, 24),
    evaluateAscending(completeWordInterior, 18)
  ], [24, 10]);
  assert.deepEqual([
    evaluateAscending(page55CompleteOnlyEdges, 24),
    evaluateAscending(page55CompleteOnlyEdges, 18)
  ], [5, 26]);

  // Values from the two historically preserved 3301/1033 magic-square sums.
  const first = 3301 % 29; // 24
  const second = 1033 % 29; // 18
  assert.equal(first, 24);
  assert.equal(second, 18);
  assert.equal(evaluateAscending(inner, first), 18);
  assert.equal(evaluateAscending(inner, second), 23);
  assert.equal(evaluateAscending(edge, first), 25);
  assert.equal(evaluateAscending(edge, second), 25);

  // If two field evaluations equal 25, O(X)-25 must be divisible by
  // (X-24)(X-18) = 26 + 16X + X^2 mod 29. This is mathematically
  // equivalent evidence, not a separate empirical confirmation.
  const translated = edge.slice();
  translated[0] = mod29(translated[0] - 25);
  const divisor = [26, 16, 1];
  const division = divideAscending(translated, divisor);
  assert.deepEqual(division.remainder, [0, 0]);
  assert.equal(division.quotient.length, 31);

  // Source-independent challenge point, chosen from the signed 2013
  // Diffie-Hellman modulus and the p57 terminal red23-dot mark.
  // The 25-output hypothesis does NOT continue at this point.
  assert.equal(evaluateAscending(edge, 23), 1);
  const outputs = Array.from({ length: 29 }, (_, x) => evaluateAscending(edge, x));
  assert.deepEqual(outputs.flatMap((value, x) => value === 25 ? [x] : []), [18, 24]);
  const pairs = Array.from({ length: 29 }, (_, value) =>
    outputs.filter(x => x === value).length)
    .reduce((sum, count) => sum + count * (count - 1) / 2, 0);
  assert.equal(pairs, 17);

  const text = fs.readFileSync(path.join(
    root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');
  const squareRows = text.trim().split(/\r?\n/).slice(-5)
    .map(line => line.trim().split(/\s+/).map(Number));
  assert.deepEqual(squareRows.map(row => row.length), [5, 5, 5, 5, 5]);
  for (const row of squareRows) assert.equal(row.reduce((a, b) => a + b, 0), 1033);
  assert.equal(squareRows.flat().length, 25);

  // A direct, source-positioned cipher consumer: evaluate the exterior
  // polynomial at zero-based successive interior positions and subtract it
  // as a GP29 additive keystream. No fitted shift, key, phase or dictionary.
  const evaluations = inner.map((_, i) => evaluateAscending(edge, i));
  const decode = inner.map((value, i) => mod29(value - evaluations[i]));
  const frequencies = Array(29).fill(0);
  for (const value of decode) frequencies[value]++;
  const decodedIoc = frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (inner.length * (inner.length - 1));
  assert.ok(Math.abs(decodedIoc - 0.03322259136212625) < 1e-14);
  const nativePlain = corpus.pages.find(p => p.page === 57).indices.slice(0, 43);
  const nativeEncrypted = nativePlain.map((value, i) => mod29(value + evaluations[i]));
  assert.deepEqual(
    nativeEncrypted.map((value, i) => mod29(value - evaluations[i])),
    nativePlain,
    'Source-native solved GP29 positive plant must round-trip',
  );
  const decodedRuneTokens = decode.map(index => corpus.translit[index]);
  assert.deepEqual(decodedRuneTokens.slice(0, 10),
    ['IA', 'C', 'S', 'S', 'EA', 'TH', 'T', 'O', 'B', 'G']);

  console.log(JSON.stringify({
    source: 'p55 source GP29, 2014 magic squares, solved p57 instruction',
    edgeRunes: edge.length,
    correctFullWordEdgeRunes: completeWordEdges.length,
    correctFullWordInteriorRunes: completeWordInterior.length,
    completeWordEdgeOutputs: [evaluateAscending(completeWordEdges, first), evaluateAscending(completeWordEdges, second)],
    completeWordInteriorOutputs: [evaluateAscending(completeWordInterior, first), evaluateAscending(completeWordInterior, second)],
    page55CompleteOnlyEdgeOutputs: [evaluateAscending(page55CompleteOnlyEdges, first), evaluateAscending(page55CompleteOnlyEdges, second)],
    innerRunes: inner.length,
    historicalInputs: [first, second],
    edgeOutputs: [evaluateAscending(edge, first), evaluateAscending(edge, second)],
    interiorOutputs: [evaluateAscending(inner, first), evaluateAscending(inner, second)],
    edgeOutput25InputPreimages: [18, 24],
    edgeThirdPoint23: evaluateAscending(edge, 23),
    all29InputEqualOutputPairs: pairs,
    exactFactor: divisor,
    quotientLength: division.quotient.length,
    quotientFirst12: division.quotient.slice(0, 12),
    directExteriorKeyInteriorOriginalIoC: decodedIoc,
    directExteriorKeyDecodedFirst10: decodedRuneTokens.slice(0, 10),
    sourceNativeSolvedPositivePlant: 43,
    warning: 'Equal-25 relation depends on physical-page split; complete words break it. No source-authenticated plaintext.',
  }, null, 2));
}

if (require.main === module) main();
module.exports = { evaluateAscending, divideAscending, main };
