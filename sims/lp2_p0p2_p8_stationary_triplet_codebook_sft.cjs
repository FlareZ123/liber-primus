/**
 * Complete original-source test: can each of the 243 black p8 runes
 * expand, identically at every occurrence, into three LP2 p0-p2 runes?
 *
 * This is a bounded direct-codebook gate, not a cryptanalytic solve.
 * Inputs: resources/liber-primus/lp2-corpus.json (unmodified canonical GP29).
 * Run on Windows 11 with Node.js 22.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

const openingPages = gp.pages.slice(0, 3);
assert.deepEqual(openingPages.map(p => p.indices.length), [262, 266, 201]);
const opening = openingPages.flatMap(p => p.indices);
const selector = gp.pages[8].indices.slice(12);
assert.equal(opening.length, 729);
assert.equal(selector.length, 243);
assert.equal(gp.pages[8].indices.length, 255);
assert.equal(new Set(selector).size, 29);

const codebook = new Map();
const firstOccurrence = new Map();
const contradictoryPositions = [];
const openingTriples = new Set();
for (let i = 0; i < selector.length; i++) {
  const word = opening.slice(i * 3, i * 3 + 3);
  assert.equal(word.length, 3);
  const packed = word.join(',');
  openingTriples.add(packed);
  const symbol = selector[i];
  if (!codebook.has(symbol)) {
    codebook.set(symbol, packed);
    firstOccurrence.set(symbol, i);
  } else if (codebook.get(symbol) !== packed) {
    contradictoryPositions.push({
      at: i,
      sourceRune: gp.translit[symbol],
      firstAt: firstOccurrence.get(symbol),
      firstTarget: codebook.get(symbol).split(',').map(Number)
        .map(x => gp.translit[x]).join(' '),
      currentTarget: word.map(x => gp.translit[x]).join(' ')
    });
  }
}
assert.equal(openingTriples.size, 240);
assert.equal(contradictoryPositions.length, 213);
const witness = contradictoryPositions.find(x => x.at === 10);
assert.deepEqual(witness, {
  at: 10, sourceRune: 'EA', firstAt: 3,
  firstTarget: 'Y E NG', currentTarget: 'EO I NG'
});

console.log(JSON.stringify({
  source: 'LP2 p8 black body aligned with LP2 p0-p2 729-rune opening',
  originalPageLengths: openingPages.map(p => p.indices.length),
  inputSymbols: selector.length,
  outputTriples: opening.length / 3,
  distinctInputRuneTypes: codebook.size,
  distinctOutputTriples: openingTriples.size,
  contradictions: contradictoryPositions.length,
  firstExplicitWitness: witness,
  result: 'UNSAT for a deterministic stationary one-rune-to-three-rune codebook',
  scope: 'Does not exclude changing-state expansion, transposition, 243-place keying, or any actual ciphertext inverse'
}, null, 2));
