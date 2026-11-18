'use strict';

/**
 * Source-motivated original LP2 doublet reset attack on the authenticated
 * p56 consecutive-prime-totient GP29 cipher.
 *
 * Original rare adjacent-equal ciphertext pairs are candidate clock markers.
 * Four literal marker placements x two fixed cipher signs are evaluated.
 * All *legal* plaintext-F (index zero) skip branches are retained; a
 * failure is exact DP state extinction, independent of language scoring.
 *
 * Node.js 22, repository-only inputs:
 *   node sims/lp2_doublet_prime_totient_reset_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');

/** @param {string} rel @returns {string} */
function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page >= 0 && p.page < 56);
assert.equal(pages.length, 56);
assert.equal(pages[50].runic_count, 0);
const book = pages.flatMap(p => p.indices);
assert.equal(book.length, 12956);

/** @param {number} count @returns {number[]} */
function primes(count) {
  const found = [];
  for (let n = 2; found.length < count; n++) {
    if (found.every(p => p * p > n || n % p !== 0)) found.push(n);
  }
  return found;
}
const prime = primes(1500);
const phi = prime.map(p => (p - 1) % 29);
const labels = new Map(corpus.translit.map((rune, i) => [rune, i]));

/** @param {string} word @returns {number[]} */
function encodeWord(word) {
  const source = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < source.length;) {
    if (source.startsWith('ING', i)) {
      out.push(21); i += 3; continue;
    }
    if (source.startsWith('IO', i)) {
      out.push(27); i += 2; continue;
    }
    const pair = source.slice(i, i + 2);
    const token = labels.has(pair) ? pair : source[i];
    assert.ok(labels.has(token), 'Unmapped plaintext symbol: ' + token);
    out.push(labels.get(token));
    i += token.length;
  }
  return out;
}

/** @returns {number[]} */
function knownP56Plaintext() {
  const source = read('resources/liber-primus/lp1-plaintext-reference.txt');
  const section = source.split('### 56')[1].split('### 57')[0];
  assert.ok(section.startsWith('\nAN END'), 'Known p56 source not found');
  const noDigest = section.replace(/\b[0-9a-f]{20,}\b/gi, ' ');
  const words = noDigest.toUpperCase().match(/[A-Z]+/g) || [];
  return words.flatMap(encodeWord);
}

/** @param {number[]} plain @returns {number[]} */
function authenticForward(plain) {
  let consumed = 0;
  return plain.map(symbol => {
    if (symbol === 0) return 0;
    const output = (symbol + phi[consumed]) % 29;
    consumed++;
    return output;
  });
}

const p56Clear = knownP56Plaintext();
assert.equal(p56Clear.length, 85);
assert.deepEqual(authenticForward(p56Clear), corpus.pages[56].indices);
assert.equal(p56Clear.filter(x => x === 0).length, 1);

// The repeated second rune is the unambiguously local doublet event.
// The original has 86 such events; none straddles a physical page break.
const sites = [];
let global = 0;
for (const page of pages) {
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) sites.push(global + i);
  }
  global += page.indices.length;
}
assert.equal(sites.length, 86);
assert.deepEqual(sites.slice(0, 6), [122, 207, 456, 653, 782, 909]);
assert.equal(sites.slice(1).length, corpus.pages[56].runic_count);

/**
 * No fitted clocks, shifts, word dictionary, or secret skips. Reset prime
 * index to zero for each resulting interval; decode under the real p56
 * rule that literal plaintext F emits F without advancing the key, but
 * ciphertext F can also come from encrypted non-F and advance the key.
 *
 * Four physically direct marker conventions:
 * before:  reset immediately before second equal rune, retaining both.
 * after:   reset after second equal rune, retaining both.
 * second:  discard second equal rune as marker, reset after it.
 * both:    discard both equal runes as marker, reset after the pair.
 *
 * @param {'before'|'after'|'second'|'both'} mode
 * @returns {number[][]}
 */
function makeSegments(mode) {
  const segments = [];
  let previous = 0;
  for (const site of sites) {
    const end = mode === 'before' || mode === 'second'
      ? site : mode === 'both' ? site - 1 : site + 1;
    segments.push(book.slice(previous, end));
    previous = mode === 'before' ? site : site + 1;
  }
  segments.push(book.slice(previous));
  assert.equal(segments.length, 87);
  return segments;
}

/**
 * Returns first local offset at which EVERY possible inverse branch dies.
 * Returns -1 only if at least one complete inverse path remains.
 *
 * @param {number[]} text
 * @param {1|-1} sign  +1: historical additive p56, -1: reverse arithmetic
 * @returns {number}
 */
function firstImpossible(text, sign) {
  let reachable = new Set([0]); // Number of consumed prime/totient steps.
  for (let i = 0; i < text.length; i++) {
    const next = new Set();
    const symbol = text[i];
    for (const cursor of reachable) {
      assert.ok(cursor < phi.length);
      const step = phi[cursor];
      if (symbol === 0) {
        // Literal F: unchanged ciphertext, prime index untouched.
        next.add(cursor);
        // Encrypted non-F: ciphertext F, prime step consumed.
        if (step !== 0) next.add(cursor + 1);
      } else {
        const plain = (symbol - sign * step + 58) % 29;
        // A literal plaintext F may never encrypt to nonzero.
        if (plain !== 0) next.add(cursor + 1);
      }
    }
    if (!next.size) return i;
    reachable = next;
  }
  return -1;
}

assert.equal(firstImpossible(corpus.pages[56].indices, 1), -1);
const expectedFailures = {
  before: [66, 65],
  after: [54, 66],
  second: [53, 66],
  both: [51, 66]
};
const evaluations = [];
for (const mode of /** @type {const} */ (['before', 'after', 'second', 'both'])) {
  const segments = makeSegments(mode);
  for (const sign of /** @type {const} */ ([1, -1])) {
    const impossible = segments.map((segment, id) => ({
      id, length: segment.length, firstImpossible: firstImpossible(segment, sign)
    })).filter(x => x.firstImpossible >= 0);
    const expected = expectedFailures[mode][sign === 1 ? 0 : 1];
    assert.equal(impossible.length, expected);
    assert.ok(impossible.length > 0);
    evaluations.push({
      mode, sign,
      segments: segments.length,
      retainedRunes: segments.reduce((n, x) => n + x.length, 0),
      unreachableSegments: impossible.length,
      survivingSegments: segments.length - impossible.length,
      firstFailures: impossible.slice(0, 5)
    });
  }
}
console.log(JSON.stringify({
  input: 'original LP2 p0-55',
  runeCount: book.length,
  doubletEvents: sites.length,
  sourceCipherPositive: '85/85 p56 original ciphertext reconstructed',
  rule: 'complete F-transparent inverse states, prime2 reset at source-doublet markers',
  evaluations,
  decision: 'all eight original source-fixed models impossible on complete p0-55'
}, null, 2));
