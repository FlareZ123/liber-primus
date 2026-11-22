'use strict';
/**
 * Key-independent p55/p56/p57 terminal-256 cipher alphabet/position gate.
 * Single-file Node.js 22 test for Windows 11. Requires no packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const [p55, p56, p57] = [55, 56, 57].map(p => corpus.pages[p].indices);
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);

const primes = [];
for (let n = 2; primes.length < 85; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
  if (prime) primes.push(n);
}
let clock = 0;
const plain56 = p56.map((c, i) => {
  if (i === 56) { assert.equal(c, 0); return 0; }
  return (c - ((primes[clock++] - 1) % 29) + 29) % 29;
});
assert.equal(clock, 84);
assert.equal(plain56.slice(0, 10).map(v => corpus.translit[v]).join(''), 'ANENDWITHIN');
assert.deepEqual(plain56.flatMap((v, i) => v === 0 ? [i] : []), [56]);

const source = p55.concat(p56, p57);
const known = plain56.concat(p57);
/** @param {number[]} input @returns {number[]} */
const histogram = input => Array.from({ length: 29 }, (_, v) => input.filter(x => x === v).length);
const inputCounts = histogram(source);
const neededCounts = histogram(known);
const maxInput = Math.max(...inputCounts);
const maxNeeded = Math.max(...neededCounts);
const deficits = neededCounts.map((n, i) => ({ name: corpus.translit[i], missing: Math.max(0, n - inputCounts[i]) })).filter(x => x.missing);
const minimumReletterings = deficits.reduce((sum, v) => sum + v.missing, 0);
assert.equal(source.length, 256);
assert.equal(known.length, 180);
assert.equal(inputCounts[18], 22);
assert.equal(neededCounts[18], 31);
assert.equal(maxInput, 22);
assert.equal(maxNeeded, 31);
assert.deepEqual(deficits, [
  { name: 'I', missing: 2 }, { name: 'T', missing: 6 },
  { name: 'E', missing: 9 }, { name: 'A', missing: 3 }
]);
assert.equal(minimumReletterings, 20);

// Plant a real secret permutation of all 256 positions and 29 rune identities.
// A candidate is detectable because even an unknown permutation preserves
// the largest symbol count; the true reverse restores the known 180-rune suffix.
const plaintext = p55.concat(known);
const plantedCipher = Array(256);
for (let i = 0; i < 256; i++) plantedCipher[(17 * i + 13) % 256] = (7 * plaintext[i] + 3) % 29;
const inverted = Array(256);
for (let i = 0; i < 256; i++) inverted[i] = (25 * ((plantedCipher[(17 * i + 13) % 256] - 3 + 29) % 29)) % 29;
assert.deepEqual(inverted, plaintext);
assert.equal(Math.max(...histogram(plantedCipher)), Math.max(...histogram(plaintext)));
assert.ok(Math.max(...histogram(plantedCipher)) >= maxNeeded);

console.log(JSON.stringify({
  originalTerminalRunes: source.length, knownSolvedRunes: known.length,
  sourceMaxSymbolCount: maxInput, knownTargetECount: neededCounts[18],
  sameAlphabetDeficits: deficits,
  minimumRuneChangesBeyondPositionPermutation: minimumReletterings,
  allSecretSymbolAndPositionPermutationPossible: false,
  plantedBijectionRoundtrip: true
}));
