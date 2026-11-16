'use strict';

/**
 * Original-input SFT: source-derived H*G table quotient against every secret
 * fixed GP29 alphabet and every positional transposition, using authentic
 * solved-Cicada GP29 prose as an independent reference register.
 *
 * Run on Windows: node sims/lp2_q252_allsecret_native_control_sft.cjs
 * No writes, network requests, adjustable search keys or external packages.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const solved = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'external', 'relikd-solved-gp29-native-v1.json'), 'utf8'));
/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} a @param {number[]} b */
const convolution = (a, b) => {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
};
/** @param {number[]} symbols */
const collisionNumerator = symbols => {
  const counts = Array(29).fill(0);
  for (const x of symbols) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    counts[x]++;
  }
  return counts.reduce((total, n) => total + n * (n - 1), 0);
};
/** @param {number[]} symbols */
const adjacentRepeats = symbols => symbols.slice(1).reduce((n, x, i) => n + Number(x === symbols[i]), 0);

const originalBytes = table.byte_rows.flat();
assert.equal(originalBytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(originalBytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const source = originalBytes.map(x => x % 29);
const h = [3, 26, 24]; // PGP-authenticated 2013 3301 -> BASE29 3QO, ascending powers
const g = [27, 5, 15]; // Physical p39 red119 GP29 glyphs, ascending powers
const divisor = convolution(h, g).reverse(); // Input P has descending powers
assert.deepEqual(divisor, [12, 17, 11, 21, 23]);
const inverseLeading = Array.from({length: 28}, (_, i) => i + 1)
  .find(x => mod(x * divisor[0]) === 1);
assert.equal(inverseLeading, 17);
const remainder = source.slice();
const quotient = [];
for (let i = 0; i < 252; i++) {
  const v = mod(remainder[i] * inverseLeading);
  quotient.push(v);
  for (let j = 0; j < divisor.length; j++) remainder[i + j] = mod(remainder[i + j] - v * divisor[j]);
}
assert.deepEqual(remainder.slice(-4), [0, 0, 0, 0]);
assert.equal(quotient.length, 252);
assert.deepEqual(quotient.slice(0, 12), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17]);
assert.equal(adjacentRepeats(quotient), 8);

const qNumerator = collisionNumerator(quotient);
assert.equal(qNumerator, 2298);
const spanSize = 252;
const denominator = spanSize * (spanSize - 1);
const runeToId = new Map(solved.runes.map((rune, i) => [rune, i]));
let controls = 0;
let minControlNumerator = Infinity;
let maxControlNumerator = -Infinity;
const sections = [];
for (const section of solved.sections) {
  const runes = Array.from(section.source_text).filter(r => runeToId.has(r)).map(r => runeToId.get(r));
  let count = 0;
  let min = Infinity;
  for (let start = 0; start + spanSize <= runes.length; start++) {
    const numerator = collisionNumerator(runes.slice(start, start + spanSize));
    controls++;
    count++;
    min = Math.min(min, numerator);
    minControlNumerator = Math.min(minControlNumerator, numerator);
    maxControlNumerator = Math.max(maxControlNumerator, numerator);
  }
  sections.push({name: section.name, sourceRunes: runes.length, windows: count, minIoC: count ? min / denominator : null});
}
assert.equal(controls, 1365);
assert.equal(minControlNumerator, 3498);
assert(qNumerator < minControlNumerator);

const arbitraryPermutation = Array.from({length: 29}, (_, i) => (7 * i + 3) % 29);
const permutedReordered = quotient.slice().reverse().map(x => arbitraryPermutation[x]);
assert.equal(collisionNumerator(permutedReordered), qNumerator);

console.log(JSON.stringify({
  status: 'PASS',
  sourceTableBytes: 256,
  exactHGQuotientRemainder: [0, 0, 0, 0],
  quotientRunes: 252,
  adjacentEqualPairs: 8,
  quotientIoC: qNumerator / denominator,
  nativeControlWindows: controls,
  nativeControlMinIoC: minControlNumerator / denominator,
  nativeControlMaxIoC: maxControlNumerator / denominator,
  nativeAtOrBelowQuotient: 0,
  allFixed29SymbolRelabelingsAndReorderings: 'IoC invariant, outside native controls',
  sectionControls: sections
}, null, 2));
