'use strict';

/**
 * Original LP2 p15 prime spiral and 2013 Cicada MOBIUS:
 * an exact, previously unindexed squarefree selector plus a finite reversible
 * Dirichlet/Mobius-inversion original-cipher gate.
 *
 * Windows 11 / Node 22: node sims/lp2_p15_mobius_squarefree_dirichlet_original_sft.cjs
 * Read-only, no third-party modules, no network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = gp.pages.filter(p => p.page <= 55);
assert.equal(source.flatMap(p => p.indices).length, 12956);
const runemap = new Map(gp.runes.map((r, i) => [r, i]));

/** @param {number} value */
const mod29 = value => (value % 29 + 29) % 29;

/** Exact integer Moebius function for all 0 <= x <= limit. */
function mobiusSieve(limit) {
  const mu = new Int8Array(limit + 1);
  mu[1] = 1;
  for (let d = 1; d <= limit; d++) {
    if (mu[d] === 0) continue;
    for (let n = d + d; n <= limit; n += d) mu[n] -= mu[d];
  }
  return mu;
}

const firstPartyWisdom = read('resources/external/2013-0-wisdom.txt');
assert(firstPartyWisdom.includes('ᛗᚩᛒᛁᚢᛋ'),
  '2013 signed MAGIC SQUARE source actually contains MOBIUS');

// The literal p15 visual square, read across rows, 2400x3600 original 32.jpg.
const grid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
// Established source-visible one-based Fibonacci-indexed prime sequence.
const primeInputs = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463,
  829, 1481, 2593, 4507, 7817];
// Physical grid's 16 original items, reordered by the visible spiral.
const gridPrimeIndex = [
  [6, 7, 8, 9],
  [5, 0, 1, 10],
  [4, 3, 2, 11],
  [15, 14, 13, 12]
];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 4; col++) {
    assert.equal(grid[row][col],
      Math.abs(3301 - primeInputs[gridPrimeIndex[row][col]]));
  }
}

const mu = mobiusSieve(7817);
const mask = grid.map(row => row.map(value => mu[value]));
assert.deepEqual(mask, [
  [0, 0, 0, 0],
  [-1, -1, -1, +1],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]);

// Descriptive counterfactual for the fixed Fibonacci-prime construction.
// This is NOT a calibrated p-value: the function and observable condition
// were selected after inspecting the page. Source anchor remains 3301.
const matchingOtherAnchors = [];
for (let anchor = 2001; anchor < 4600; anchor += 2) {
  const hypothetical = gridPrimeIndex.map(row => row.map(index =>
    mu[Math.abs(anchor - primeInputs[index])]));
  if (hypothetical.every((row, r) =>
    row.every((value, c) => (r === 1 ? value !== 0 : value === 0)))) {
    matchingOtherAnchors.push(anchor);
  }
}
assert.deepEqual(matchingOtherAnchors, [2185, 3301, 3409, 3625, 4309]);

/**
 * Divisor zeta transform, the canonical inverse of Mobius inversion:
 * C[n] = sum_{d divides n} P[d] modulo 29, indexed from n=1.
 * @param {number[]} values
 * @returns {number[]}
 */
function zeta(values) {
  const result = new Int32Array(values.length);
  for (let d = 1; d <= values.length; d++) {
    for (let n = d; n <= values.length; n += d) {
      result[n - 1] += values[d - 1];
    }
  }
  return Array.from(result, mod29);
}

/**
 * Mobius divisor inverse:
 * P[n] = sum_{d divides n} mu(d)*C[n/d] modulo 29.
 * @param {number[]} values
 * @returns {number[]}
 */
function inverseZeta(values) {
  const result = new Int32Array(values.length);
  for (let d = 1; d <= values.length; d++) {
    if (mu[d] === 0) continue;
    for (let n = d; n <= values.length; n += d) {
      result[n - 1] += mu[d] * values[n / d - 1];
    }
  }
  return Array.from(result, mod29);
}

/** @param {number[]} values */
function ioc(values) {
  const histogram = Array(29).fill(0);
  for (const value of values) histogram[value]++;
  const n = values.length;
  return histogram.reduce((sum, count) => sum + count * (count - 1), 0)
    / (n * (n - 1));
}

/** @returns {{offset:number,cipher:number}[]} */
function allOriginalSingletons() {
  const raw = read('resources/lp2-transcription.txt').split('%').slice(0, 55).join('%');
  const singletons = [];
  let word = [], runeOffset = 0, words = 0;
  const finish = () => {
    if (!word.length) return;
    words++;
    if (word.length === 1) singletons.push(word[0]);
    word = [];
  };
  for (const char of raw) {
    if (runemap.has(char)) {
      word.push({offset: runeOffset, cipher: runemap.get(char)});
      runeOffset++;
    } else if (char === '%' || char === '/' || /\s/u.test(char)) {
      // Preserve original carried words across physical line/page boundaries.
    } else finish();
  }
  finish();
  assert.deepEqual([runeOffset, words, singletons.length], [12956, 2896, 83]);
  assert.deepEqual(source.flatMap(p => p.indices).length, runeOffset);
  return singletons;
}

const p15Start = source.filter(p => p.page < 15)
  .reduce((sum, p) => sum + p.indices.length, 0);
const p22End = source.filter(p => p.page < 23)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.deepEqual([p15Start, p22End], [3603, 5506]);
// A human page reader can begin at the first main text after p15's two
// consecutive red headings (9-rune prime square label + 11-rune title).
const original = source.filter(p => p.page >= 15 && p.page <= 22)
  .flatMap(p => p.page === 15 ? p.indices.slice(20) : p.indices);
assert.equal(original.length, 1883);

const singletonSites = allOriginalSingletons().filter(s =>
  s.offset >= p15Start + 20 && s.offset < p22End)
  .map(s => s.offset - p15Start - 20);
assert.deepEqual(singletonSites,
  [115, 160, 258, 383, 519, 525, 553, 594, 610, 735,
   851, 1010, 1076, 1128, 1171, 1630, 1696, 1713]);

const directInverses = [
  {readout: 'mobius', decoded: inverseZeta(original), reencrypt: zeta},
  {readout: 'divisor-zeta', decoded: zeta(original), reencrypt: inverseZeta}
];
const direct = [];
for (const model of directInverses) {
  assert.deepEqual(model.reencrypt(model.decoded), original,
    model.readout + ': exact forward reconstruction of all original ciphertext');
  const accepted = singletonSites.filter(site =>
    [24, 10, 3].includes(model.decoded[site])).length;
  const name = model.readout;
  direct.push({
    name,
    sourceRunes: original.length,
    originalForwardReplay: original.length,
    decodedIoC: ioc(model.decoded),
    singletonEnglishAIO: accepted,
    singletonTotal: singletonSites.length,
    initial32Runes: model.decoded.slice(0, 32)
      .map(x => gp.translit[x]).join('')
  });
}
assert.ok(Math.abs(ioc(original) - 0.0345092253921349) < 1e-14);
assert.ok(Math.abs(direct[0].decodedIoC - 0.034546473480771805) < 1e-14);
assert.ok(Math.abs(direct[1].decodedIoC - 0.03423437964719288) < 1e-14);
assert.deepEqual(direct.map(a => a.singletonEnglishAIO), [4, 2]);

// Plant the genuine solved clear-p57 original runes under BOTH directions,
// preserving the same original p15-22 length and singleton slot coordinates.
const solved = gp.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const native = Array.from({length: 1883}, (_, i) => solved[i % solved.length]);
singletonSites.forEach((i, j) => { native[i] = [24, 10, 3][j % 3]; });
for (const [name, encode, decode] of [
  ['zeta-encipher', zeta, inverseZeta],
  ['mobius-encipher', inverseZeta, zeta]
]) {
  const synthetic = encode(native);
  assert.deepEqual(decode(synthetic), native, name + ' positive plaintext recovery');
  assert.equal(synthetic.length, original.length);
}
console.log(JSON.stringify({
  source: 'p15 original 16-cell prime/Fibonacci diagram and 2013 MOBIUS source',
  exactOriginalP15Grid: grid,
  originalMobiUSignMask: mask,
  originalSquarefreeRow: 2,
  oddAnchorCounterfactualRange: '2001..4599 inclusive',
  oddAnchorsTested: 1300,
  anchoredPatternCounterfactuals: matchingOtherAnchors,
  descriptiveNotAPvalue: true,
  chapterPhysical: 'p15 after both red headings, then uninterrupted p16..p22',
  originalCipherRunes: original.length,
  sourceOriginalSingletons: singletonSites.length,
  sourceCiphertextIoC: ioc(original),
  directInverses: direct,
  nativeGPPositiveRecovered: 1883,
  result: 'No coherent original plaintext under either canonical Dirichlet direction; source math mask does not specify a creator key.'
}, null, 2));
console.log('PASS original p15 squarefree-Mobius Dirichlet cipher gate');
