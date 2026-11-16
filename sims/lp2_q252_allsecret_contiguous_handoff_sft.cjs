'use strict';

/**
 * Original LP2: does the independently derived 252-symbol H/G grid quotient
 * occur anywhere in source ciphertext or independently known cleartext under
 * a single unknown GP29 alphabet map?
 *
 * Run from repository root: node sims/lp2_q252_allsecret_contiguous_handoff_sft.cjs
 * No writes, guessed rune keys, fitted punctuation, or external dependencies.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
/** @param {number} n */
const m29 = n => ((n % 29) + 29) % 29;

const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
const unknownPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const C = unknownPages.flatMap(p => p.indices);
const D = unknownPages.flatMap(p => p.indices.slice(1).map((x, i) => m29(x - p.indices[i])));
assert.equal(unknownPages.length, 55);
assert.equal(C.length, 12956);
assert.equal(D.length, 12901);

/* The two source quadratics H2013 and Gp39 multiply to this monic-leading
 * high-to-low polynomial over GF29. The inverse of 12 mod29 is 17. */
const divisor = [12, 17, 11, 21, 23];
const remainder = bytes.map(m29);
const Q = [];
for (let i = 0; i < 252; i++) {
  const coefficient = m29(17 * remainder[i]);
  Q.push(coefficient);
  for (let j = 0; j < divisor.length; j++) {
    remainder[i + j] = m29(remainder[i + j] - coefficient * divisor[j]);
  }
}
assert.deepEqual(remainder.slice(-4), [0, 0, 0, 0]);
assert.deepEqual(Q.slice(0, 20), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21, 7, 21, 18, 7]);

/** @param {number} n */
function isPrime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n >= 2;
}
const primes = [];
for (let n = 2; primes.length < 84; n++) if (isPrime(n)) primes.push(n);
const ciphertext56 = corpus.pages.find(p => p.page === 56).indices;
const clear57 = corpus.pages.find(p => p.page === 57).indices;
let consumed = 0;
const clear56 = ciphertext56.map((v, i) =>
  i === 56 ? (assert.equal(v, 0), 0) : m29(v - (primes[consumed++] - 1))
);
assert.equal(consumed, 84);
assert.equal(clear56.length, 85);
assert.equal(clear57.length, 95);
assert.equal(clear56.slice(0, 20).map(v => corpus.translit[v]).join(''), 'ANENDWITHINTHEDEEPWEB');
assert.equal(clear57.slice(0, 7).map(v => corpus.translit[v]).join(''), 'PARABLE');
const known = clear56.concat(clear57);

/**
 * Every possible pair of contiguous offsets is tested without selecting a
 * secret key. Return the longest exact fixed-map alignment. For "bijection",
 * equality AND inequality of the source symbols must be preserved. For "map",
 * the unknown 29-to-29 function need not be injective. Minimum examined
 * alignment has four symbols; shorter tail fragments cannot change a max>=4.
 *
 * @param {number[]} a Independent table-derived register
 * @param {number[]} b Source original rune register
 * @param {boolean} injective Require a secret bijective alphabet
 * @returns {{length:number,aStart:number,bStart:number}}
 */
function longest(a, b, injective) {
  const seenA = new Int32Array(29);
  const seenB = new Int32Array(29);
  const mapA = new Int32Array(29);
  const mapB = new Int32Array(29);
  let stamp = 0;
  let best = { length: 0, aStart: -1, bStart: -1 };
  for (let i = 0; i + 3 < a.length; i++) {
    for (let j = 0; j + 3 < b.length; j++) {
      stamp++;
      let k = 0;
      while (i + k < a.length && j + k < b.length) {
        const x = a[i + k], y = b[j + k];
        if (
          (seenA[x] === stamp && mapA[x] !== y) ||
          (injective && seenB[y] === stamp && mapB[y] !== x)
        ) break;
        seenA[x] = stamp;
        mapA[x] = y;
        seenB[y] = stamp;
        mapB[y] = x;
        k++;
      }
      if (k > best.length) best = { length: k, aStart: i, bStart: j };
    }
  }
  return best;
}

const observed = {};
for (const [label, target] of [
  ['unknown_ciphertext_12956', C],
  ['within_page_differences_12901', D],
  ['authentic_clear_p56_p57_180', known],
]) {
  for (const [direction, source] of [['forward', Q], ['reverse', Q.slice().reverse()]]) {
    observed[label + '_' + direction] = {
      bijection: longest(source, target, true),
      deterministicMap: longest(source, target, false),
    };
  }
}
const expected = {
  unknown_ciphertext_12956_forward: [17, 22],
  unknown_ciphertext_12956_reverse: [18, 20],
  within_page_differences_12901_forward: [17, 22],
  within_page_differences_12901_reverse: [17, 21],
  authentic_clear_p56_p57_180_forward: [13, 20],
  authentic_clear_p56_p57_180_reverse: [13, 19],
};
for (const [label, values] of Object.entries(expected)) {
  assert.equal(observed[label].bijection.length, values[0], label + ': bijection');
  assert.equal(observed[label].deterministicMap.length, values[1], label + ': map');
}

/* Blind positive: source-native p57 is hidden within a 252-position register
 * under a genuinely bijective but undisclosed-at-search-time alphabet.
 * The algorithm must find the whole 95-symbol interval. */
const plant = Q.slice();
for (let i = 0; i < clear57.length; i++) plant[60 + i] = m29(7 * clear57[i] + 3);
const recovered = longest(plant, clear57, true);
assert.ok(recovered.length >= 95);
assert.equal(recovered.aStart, 60);
assert.equal(recovered.bStart, 0);
for (let i = 0; i < 95; i++) {
  assert.equal(m29(25 * (plant[60 + i] - 3)), clear57[i]);
}
const corrupted = plant.slice();
const position = 50;
const different = clear57.find(v => v !== clear57[position]);
corrupted[60 + position] = m29(7 * different + 3);
assert.ok(longest(corrupted, clear57, true).length < 95);

console.log(JSON.stringify({
  source: { originalCipherRunes: C.length, differences: D.length,
    quotientSlots: Q.length, independentKnownPlaintext: known.length },
  observed, planted: recovered,
  conclusion: 'No direct 19+ rune bijective table-quotient copy occurs in the checked original registers; no LP2 unknown plaintext is recovered.',
}, null, 2));
