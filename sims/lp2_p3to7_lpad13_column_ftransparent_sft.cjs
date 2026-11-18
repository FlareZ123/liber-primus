'use strict';

/**
 * Source-locked test of a column-read 13-wide LPAD transport followed by
 * one of three already sourced GP29 key streams. The historical native
 * plaintext-F-transparent cipher is tested as an exact, all-branch
 * feasibility problem; neither English guesses nor ciphertext fitting are
 * used to select a legal clock.
 *
 * No plaintext/key is claimed. Source operands:
 * original p3-p7 red initials LPAD, thirteen-dot stencils, original 255
 * printed words, p50's 256 printed base60 bytes, genuine p56 prime-totient.
 *
 * Run: node sims/lp2_p3to7_lpad13_column_ftransparent_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const annotations = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const original = read('resources/liber-primus/lp2-transcription.txt');
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @param {string} c @returns {number} */
function gp(c) {
  const i = index.get(c);
  assert.notEqual(i, undefined, 'invalid original GP glyph');
  return i;
}

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;

/* Original, fully connected printed-word tape; % is a page seam, not a word
 * boundary. / is a line wrap, and - / . terminate printed words. */
const printed = original.split('%').slice(3, 8).join('').replace(/\/\s*/gu, '');
const words = (printed.match(/[\u16A0-\u16FF]+/gu) || [])
  .map((s) => [...s].map(gp));
const cipher = words.flat();
const canonical = [3, 4, 5, 6, 7]
  .flatMap((n) => corpus.pages.find((p) => p.page === n).indices);
assert.deepEqual(cipher, canonical);
assert.equal(words.length, 255);
assert.equal(cipher.length, 1145);

const red = annotations.pages.flatMap((p) =>
  (p.page >= 3 && p.page <= 7 ? (p.red_spans || []) : [])
    .map((s) => ({ page: p.page, at: s.start, first: gp([...s.runes][0]) })));
assert.deepEqual(red, [
  { page: 3, at: 0, first: 20 },
  { page: 3, at: 119, first: 13 },
  { page: 6, at: 71, first: 24 },
  { page: 7, at: 194, first: 23 }
]);
const literalLPAD = red.map((s) => s.first);
assert.deepEqual(literalLPAD, [20, 13, 24, 23]);

/* Left-pad each of 255 authentic words to width 13 using synthetic F=0.
 * A column-major read discards only the synthetic cells, retaining all
 * 1,145 authentic symbols. 'order[k]' is the old row-major rune position
 * emitted at new column-major position k. */
const width = 13;
const starts = [];
let size = 0;
for (const word of words) {
  assert.ok(word.length <= width);
  starts.push(size);
  size += word.length;
}
const order = [];
for (let col = 0; col < width; col++) {
  for (let row = 0; row < words.length; row++) {
    const local = col - (width - words[row].length);
    if (local >= 0) order.push(starts[row] + local);
  }
}
assert.equal(order.length, cipher.length);
assert.equal(new Set(order).size, cipher.length);
assert.equal(width * words.length - cipher.length, 2170);

/** @param {number[]} positions @returns {number[]} */
function inverseColumn(positions) {
  const restored = Array(positions.length);
  for (let i = 0; i < positions.length; i++) restored[order[i]] = positions[i];
  return restored;
}
const aligned = inverseColumn(cipher);

/** @param {number} count @returns {number[]} */
function primes(count) {
  const found = [];
  for (let n = 2; found.length < count; n++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= n; divisor++) {
      if (n % divisor === 0) { prime = false; break; }
    }
    if (prime) found.push(n);
  }
  return found;
}
assert.equal(grid.bytes.length, 256);
const streams = [
  { name: 'p56-prime-totient', key: primes(cipher.length).map((p) => p - 1) },
  { name: 'p50-base60-byte', key: Array.from({ length: cipher.length },
    (_, i) => grid.bytes[i % 256]) },
  { name: 'literal-LPAD', key: Array.from({ length: cipher.length },
    (_, i) => literalLPAD[i % 4]) }
];

/**
 * Exact feasibility of a complete historical plaintext-F inverse.
 * The state is precisely the count of consumed key symbols. For C=F, either
 * keep plaintext F with no key advance, or consume a key symbol for non-F.
 * Any consuming branch which yields plaintext F is strictly invalid.
 *
 * @param {number[]} text
 * @param {number[]} key
 * @param {number} sign
 * @returns {{firstImpossible:number, survivingStates:number, peakStates:number}}
 */
function reachable(text, key, sign) {
  let states = new Set([0]);
  let peakStates = 1;
  for (let i = 0; i < text.length; i++) {
    const next = new Set();
    for (const consumed of states) {
      if (text[i] === 0) next.add(consumed);
      if (mod29(text[i] - sign * key[consumed]) !== 0) {
        next.add(consumed + 1);
      }
    }
    states = next;
    peakStates = Math.max(peakStates, states.size);
    if (!states.size) return {
      firstImpossible: i, survivingStates: 0, peakStates
    };
  }
  return { firstImpossible: -1, survivingStates: states.size, peakStates };
}

/**
 * Strict historical forward operation for independently planted plaintext.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function encrypt(plain, key, sign) {
  let consumed = 0;
  return plain.map((p) => p === 0 ? 0 :
    mod29(p + sign * key[consumed++]));
}

/* A planted 1,145-rune stream based on genuinely clear original p57.
 * Both original word geometry and the same inverse permutation are kept.
 * This is a test of detection, never an unknown-page decryption claim. */
const clear = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear.length, 95);
const plant = Array.from({ length: cipher.length }, (_, i) => clear[i % clear.length]);
const expectedFails = [
  ['p56-prime-totient', -1, 93],
  ['p56-prime-totient', 1, 69],
  ['p50-base60-byte', -1, 97],
  ['p50-base60-byte', 1, 17],
  ['literal-LPAD', -1, 1],
  ['literal-LPAD', 1, 5]
];
const outcomes = [];
for (const { name, key } of streams) {
  for (const sign of [-1, 1]) {
    const generated = encrypt(plant, key, sign);
    const carried = order.map((oldIndex) => generated[oldIndex]);
    assert.deepEqual(inverseColumn(carried), generated);
    assert.equal(reachable(inverseColumn(carried), key, sign).firstImpossible, -1,
      'valid historical F-skip plant was rejected');
    const outcome = reachable(aligned, key, sign);
    const expected = expectedFails.find((x) => x[0] === name && x[1] === sign);
    assert.equal(outcome.firstImpossible, expected[2],
      'original-source outcome changed; inspect corpus/transcription');
    outcomes.push({ name, sign, ...outcome });
  }
}
console.log(JSON.stringify({
  title: 'Source LPAD13 column-major + historical plaintext-F inverse',
  originalPages: 'p3-p7', runes: cipher.length, originalWords: words.length,
  sourceRedInitials: 'LPAD', paddedWidth: width, syntheticFCells: 2170,
  uniquePermutedPositions: order.length,
  plantedForwardInverses: 'six of six complete legal F-clock paths',
  outcomes,
  conclusion: 'All six specified original-cipher inverses become mathematically impossible by local original rune offset 97; not a general exclusion of LPAD or other keys.'
}, null, 2));
