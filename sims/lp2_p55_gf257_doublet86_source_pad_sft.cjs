'use strict';
/**
 * Original LP2 p55 GF257 root / sparse doublet-event count,
 * plus one source-shaped 5+5 trimmed GP29 key, no key search.
 *
 * Run with Node.js 22:
 *   node sims/lp2_p55_gf257_doublet86_source_pad_sft.cjs
 *
 * All source inputs are unmodified checked-in original LP2 corpus/table.
 * This is a bounded negative and a retrospective exact numerical link;
 * it is NOT a recovered original-plaintext cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const unsolved = corpus.pages.filter(page => page.page <= 55);
const first = corpus.pages.find(page => page.page === 0);
const last = corpus.pages.find(page => page.page === 55);
const solved = corpus.pages.find(page => page.page === 57);
const table = grid.pages.flatMap(page => page.bytes);
assert.equal(unsolved.length, 56);
assert.equal(table.length, 256);
assert.equal(unsolved.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(last.indices.length, 76);

const events = [];
let originalOffset = 0;
for (const page of unsolved) {
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) {
      events.push({
        page: page.page,
        localIndex: i,
        globalIndex: originalOffset + i,
        glyph: page.indices[i]
      });
    }
  }
  originalOffset += page.indices.length;
}
assert.equal(events.length, 86);
assert.equal(events.filter(event => event.page < 55).length, 85);
assert.deepEqual(events.filter(event => event.page === 55).map(event => event.localIndex), [59]);

const fieldPrime = first.indices.slice(177, 183).reduce((s, x) => s + corpus.prime[x], 0);
const sourceG = first.indices.slice(183, 189).reduce((s, x) => s + corpus.prime[x], 0);
const privateX = first.indices.slice(189, 192).reduce((s, x) => s + corpus.prime[x], 0);
assert.deepEqual([fieldPrime, sourceG, privateX], [257, 295, 48]);
const g = sourceG % fieldPrime;
/** @param {number} n @param {number} exponent @returns {number} */
function power(n, exponent) {
  let value = 1;
  while (exponent > 0) {
    if (exponent % 2) value = value * n % fieldPrime;
    n = n * n % fieldPrime;
    exponent = Math.floor(exponent / 2);
  }
  return value;
}
/** High-first polynomial; @param {number[]} symbols @param {number} x @returns {number} */
function evaluate(symbols, x) {
  return symbols.reduce((v, symbol) => (v * x + symbol) % fieldPrime, 0);
}
assert.equal(power(g, 256), 1);
assert.equal(power(g, 128), 256);
assert.equal(power(g, 180), 213);
assert.equal(power(g, 76), 146);
const p50Root = Array.from({length: fieldPrime}, (_, x) => x).filter(x => evaluate(table, x) === 0);
assert.deepEqual(p50Root, [213]);

const p55Exponent = events.filter(event => event.page < 55).length + 1;
assert.equal(p55Exponent, 86);
assert.equal(p55Exponent, events.length);
const p55X = power(g, p55Exponent);
assert.equal(p55X, 207);
const p55Roots = Array.from({length: fieldPrime}, (_, x) => x).filter(x => evaluate(last.indices, x) === 0);
assert.deepEqual(p55Roots, [207]);
// The last p55 source rune I is exactly forced by the other 75 symbols
// under the AFTER-DISCOVERY choice of root 207. It is not a blind forecast.
const p55LastSymbolPredicted = (fieldPrime -
  evaluate(last.indices.slice(0, -1), p55X) * p55X % fieldPrime) % fieldPrime;
assert.equal(p55LastSymbolPredicted, last.indices.at(-1));
assert.equal(corpus.translit[p55LastSymbolPredicted], 'I');

// A source-shaped but explicitly retrospective key proposal.
// The visible page40–55 shared vine template prints five dots per side,
// so try one frozen physical reading: drop five event glyphs from each
// end of the 86 chronological same-rune event register, leave 76.
// The margin ornament is repeated on ALL these pages, and its artwork
// does not independently select this cipher use.
const droppedEachEnd = 5;
const key = events.slice(droppedEachEnd, -droppedEachEnd).map(event => event.glyph);
assert.equal(key.length, last.indices.length);
assert.equal(events[droppedEachEnd].page, 3);
assert.equal(events[events.length - droppedEachEnd - 1].page, 48);
/** @param {number[]} glyphs @returns {number[]} */
function decipher(glyphs) {
  return glyphs.map((value, i) => (value - key[i] + 29) % 29);
}
/** @param {number[]} glyphs @returns {number[]} */
function encipher(glyphs) {
  return glyphs.map((value, i) => (value + key[i]) % 29);
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const freq = Array.from({length: 29}, (_, v) => values.filter(x => x === v).length);
  return freq.reduce((s, count) => s + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
const originalP55PlainCandidate = decipher(last.indices);
assert.equal(originalP55PlainCandidate.length, 76);
assert.deepEqual(encipher(originalP55PlainCandidate), last.indices);
assert(Math.abs(ioc(originalP55PlainCandidate) - 0.037894736842105266) < 1e-13);
const plantedSolvedNative = solved.indices.slice(0, 76);
assert.equal(plantedSolvedNative.length, 76);
assert.deepEqual(decipher(encipher(plantedSolvedNative)), plantedSolvedNative);
const origDistinct = new Set(last.indices).size;
const keyDistinct = new Set(key).size;
assert.deepEqual([origDistinct, keyDistinct], [25, 28]);
// Any one-to-one substitution and any positional rearrangement preserve
// distinct symbol count, so the key and p55 cannot be the same transposed
// plaintext under a secret static rune alphabet.
assert.notEqual(origDistinct, keyDistinct);
const translit = chars => chars.map(v => corpus.translit[v]).join(' ');
console.log(JSON.stringify({
  status: 'PASS: exact root/event-count correspondence, no original p55 plaintext',
  source: {unsolvedRunes: originalOffset, equalAdjacentEvents: events.length,
    beforeP55Events: p55Exponent - 1, p55EventLocalIndices: [59]},
  gf257: {modulus: fieldPrime, generator: g, exponent: p55Exponent, x: p55X,
    p50OnlyRoot: p50Root, p55OnlyRoot: p55Roots,
    lastP55RunePredictedRetrospectively: corpus.translit[p55LastSymbolPredicted]},
  sourceOnlyTrim: {trimEachEnd: droppedEachEnd, gpKeyLength: key.length,
    sourceKeyFirstLastPage: [3, 48], p55OriginalRuneLength: last.indices.length,
    p55CipherIoC: ioc(last.indices),
    decodedOriginalIoC: ioc(originalP55PlainCandidate),
    first20OriginalDecodedRunes: translit(originalP55PlainCandidate.slice(0,20)),
    last20OriginalDecodedRunes: translit(originalP55PlainCandidate.slice(-20)),
    originalDecodedFull: translit(originalP55PlainCandidate),
    exactReencryption: true, nativePositiveRestored: plantedSolvedNative.length,
    keyDistinct, p55Distinct: origDistinct,
    staticAlphabetAndPermutationEqualTextImpossible: true},
  caveat: 'The 86 event count, 5+5 trim, GF257 root, and cipher sign were compared retrospectively; no Cicada source selects their combination.'
}, null, 2));
