'use strict';

/**
 * Exact all-parameter low-two-bit obstruction for an LCG used directly as a
 * 28-way LP2 ciphertext step generator. Read-only, dependency-free SFT.
 *
 * Run: node sims/lp2_lcg28_low2_exact_invariant_sft.cjs
 *
 * This does NOT test a generator used as an additive mask over unknown
 * plaintext or implementations that output high bits of the LCG state.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const power = [];
const exponent = Array(29).fill(-1);
let value = 1;
for (let i = 0; i < 28; i += 1) {
  assert.equal(exponent[value], -1);
  power.push(value);
  exponent[value] = i;
  value = (value * 15) % 29;
}
assert.equal(value, 1);
assert.equal(power.length, 28);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

/**
 * Parse original complete printed words. The manuscript's '/' and '%'
 * glyphs are layout-only line/page wraps and never terminate a word;
 * punctuation and original hyphens terminate it.
 * @returns {number[][]}
 */
function parsePrintedWords() {
  const unknownSource = transcription.split('%').slice(0, 55).join('%');
  const words = [];
  let current = [];
  for (const glyph of unknownSource) {
    if (runeIndex.has(glyph)) {
      current.push(runeIndex.get(glyph));
    } else if ("-.,;:!?'&$§".includes(glyph) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  const observed = words.flat();
  const reference = pages.flatMap((p) => p.indices);
  assert.deepEqual(observed, reference);
  assert.equal(words.length, 2896);
  return words;
}

const words = parsePrintedWords();

/**
 * Collect adjacent nonzero GP29 difference pairs wholly within a source
 * segmentation. A zero step may represent a source marker with arbitrary
 * generator consumption: pairs touching it are deliberately excluded.
 * @param {number[][]} sequences
 * @returns {{ pairs: Array<[number, number]>, zeros: number }}
 */
function collectPairs(sequences) {
  const pairs = [];
  let zeros = 0;
  for (const sequence of sequences) {
    let previous = 0;
    for (let i = 1; i < sequence.length; i += 1) {
      const delta = (sequence[i] - sequence[i - 1] + 29) % 29;
      if (delta === 0) zeros += 1;
      if (i > 1 && previous !== 0 && delta !== 0) {
        pairs.push([previous, delta]);
      }
      previous = delta;
    }
  }
  return { pairs, zeros };
}

/**
 * Exact scan over every possible pair of LCG coefficients mod 4.
 * An actual LCG state reduced modulo 28 MUST satisfy this recurrence,
 * independently of the full seed, modulus width, and large coefficients.
 * @param {Array<[number,number]>} pairs
 * @param {'ordinal'|'exponent'} encoding
 * @returns {{a: number,b: number, matched: number,total: number}}
 */
function bestCoefficients(pairs, encoding) {
  const digit = (step) => (
    encoding === 'ordinal' ? step - 1 : exponent[step]
  ) & 3;
  let best = { a: -1, b: -1, matched: -1, total: pairs.length };
  for (let a = 0; a < 4; a += 1) {
    for (let b = 0; b < 4; b += 1) {
      let matched = 0;
      for (const [left, right] of pairs) {
        if (((a * digit(left) + b) & 3) === digit(right)) matched += 1;
      }
      if (matched > best.matched) best = { a, b, matched, total: pairs.length };
    }
  }
  return best;
}

/**
 * Plant a genuine arbitrary-seed 32-bit LCG into the exact original 55-page
 * or 2,896-word shapes, preserving visible zero-delta locations.
 * No secret coefficient or seed is given to the inference routine.
 * @param {number[][]} sequences
 * @param {'ordinal'|'exponent'} encoding
 * @returns {number[][]}
 */
function plantLCG(sequences, encoding) {
  let state = 0x76543301;
  return sequences.map((source) => {
    const output = [source[0]];
    for (let i = 1; i < source.length; i += 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const oldDelta = (source[i] - source[i - 1] + 29) % 29;
      const digit = state % 28;
      const delta = oldDelta === 0 ? 0 : (
        encoding === 'ordinal' ? digit + 1 : power[digit]
      );
      output.push((output[i - 1] + delta) % 29);
    }
    return output;
  });
}

const sourceSets = [
  { name: 'physical-page', sequences: pages.map((p) => p.indices), expected: 12676, zero: 86 },
  { name: 'complete-word', sequences: words, expected: 7152, zero: 63 }
];
const expectedOriginal = {
  'physical-page': { ordinal: [2, 0, 3256], exponent: [3, 3, 3313] },
  'complete-word': { ordinal: [2, 0, 1862], exponent: [3, 3, 1862] }
};

for (const { name, sequences, expected, zero } of sourceSets) {
  const original = collectPairs(sequences);
  assert.equal(original.pairs.length, expected);
  assert.equal(original.zeros, zero);

  for (const encoding of ['ordinal', 'exponent']) {
    const match = bestCoefficients(original.pairs, encoding);
    assert.deepEqual(
      [match.a, match.b, match.matched],
      expectedOriginal[name][encoding]
    );
    // For the proposed exact LCG step model, even ONE mismatch rules it out.
    assert.ok(match.matched < match.total);
    process.stdout.write(
      'ORIGINAL ' + name + ' ' + encoding + ': best low2 LCG (a,b)=' +
      '(' + match.a + ',' + match.b + '), ' +
      match.matched + '/' + match.total + ' exact steps\n'
    );

    const plant = collectPairs(plantLCG(sequences, encoding));
    assert.equal(plant.pairs.length, original.pairs.length);
    assert.equal(plant.zeros, original.zeros);
    const recovered = bestCoefficients(plant.pairs, encoding);
    assert.deepEqual(
      [recovered.a, recovered.b, recovered.matched, recovered.total],
      [1, 3, original.pairs.length, original.pairs.length]
    );
    process.stdout.write(
      'POSITIVE ' + name + ' ' + encoding + ': true low2 LCG ' +
      '(a,b)=(1,3), exact ' + recovered.matched + '/' +
      recovered.total + '\n'
    );
  }
}

process.stdout.write(
  'PASS: exact source-corpus, all 16 modulo-4 parameter cases for each ' +
  'encoding, four genuine full-width 32-bit LCG positive plants.\n'
);
