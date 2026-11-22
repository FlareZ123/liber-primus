'use strict';

/**
 * SFT: original LP2 pp40–53 8×376 DIVINITY and 32×8 table-address gate.
 * Run: node sims/lp2_floral_divinity_376_address_sft.cjs
 * Canonical inputs are read from resources/; no external packages or network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const sourceEnglish = read('resources/liber-primus/lp1-plaintext-reference.txt');

const alphabet = ['F', 'U', 'TH', 'O', 'R', 'C', 'G', 'W', 'H', 'N',
  'I', 'J', 'EO', 'P', 'X', 'S', 'T', 'B', 'E', 'M', 'L', 'NG', 'OE', 'D',
  'A', 'AE', 'Y', 'IA', 'EA'];
const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37,
  41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109];
const index = new Map(alphabet.map((name, i) => [name, i]));
const page = n => corpus.pages.find(p => p.page === n);
const floral = corpus.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
const solved = page(57).indices;
const divinity = solved.slice(73, 81);
const heading = page(40).indices.slice(0, 8);
assert.equal(floral.length, 3008);
assert.deepEqual(divinity, [23, 10, 1, 10, 9, 10, 16, 26]);
assert.equal(divinity.reduce((total, rune) => total + primes[rune], 0), 376);
assert.deepEqual(heading, [0, 9, 19, 26, 6, 23, 25, 8]);
assert.equal(table.bytes.length, 256);
assert.equal(Math.min(...table.bytes), 0);
assert.equal(Math.max(...table.bytes), 255);

/** @param {number[]} symbols @param {number} period */
function samePhasePairs(symbols, period) {
  let matches = 0;
  let possible = 0;
  for (let phase = 0; phase < period; phase++) {
    const counts = new Array(29).fill(0);
    for (let i = phase; i < symbols.length; i += period) counts[symbols[i]]++;
    const n = counts.reduce((a, b) => a + b, 0);
    matches += counts.reduce((a, b) => a + b * (b - 1) / 2, 0);
    possible += n * (n - 1) / 2;
  }
  return { matches, possible };
}

/**
 * Approximate original GP spelling from the editor-normalized solved LP1 text.
 * V=>U, K=>C, and ING=>one ᛝ reproduce attested source conventions.
 * The finite reference register is a calibration only, not every possible text.
 * @param {string} source
 * @returns {number[]}
 */
function encodeNativeApprox(source) {
  const result = [];
  const words = source.replace(/^#.*$/gm, '').toUpperCase()
    .replace(/[^A-Z\s]/g, ' ').split(/\s+/);
  for (let word of words) {
    word = word.replace(/K/g, 'C').replace(/V/g, 'U')
      .replace(/Q/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const token = ['ING', 'TH', 'NG', 'EO', 'OE', 'IA', 'EA', 'AE']
        .find(name => word.startsWith(name, i));
      if (token === 'ING') result.push(21);
      else if (token !== undefined) result.push(index.get(token));
      else if (index.has(word[i])) result.push(index.get(word[i]));
      i += token?.length || 1;
    }
  }
  return result;
}

const english = encodeNativeApprox(sourceEnglish);
assert.equal(english.length, 3536);
const original = samePhasePairs(floral, 376);
assert.deepEqual(original, { matches: 369, possible: 10528 });
const controls = [];
for (let offset = 0; offset <= english.length - 3008; offset++) {
  controls.push(samePhasePairs(english.slice(offset, offset + 3008), 376).matches);
}
const sorted = controls.slice().sort((a, b) => a - b);
assert.equal(controls.length, 529);
assert.equal(sorted[0], 645);
assert.equal(sorted[264], 656);
assert.equal(sorted[528], 671);
assert.equal(controls.filter(value => value <= original.matches).length, 0);

// An independently keyed, reversible affine map at each of 376 positions
// preserves equalities between the eight visits to any one position.
const plaintext = english.slice(0, 3008);
const slope = Array.from({ length: 376 }, (_, i) => (i * 13 % 28) + 1);
const shift = Array.from({ length: 376 }, (_, i) => (i * 17 + 3) % 29);
const encrypted = plaintext.map((rune, i) =>
  (rune * slope[i % 376] + shift[i % 376]) % 29);
const inverses = slope.map(m => {
  for (let n = 1; n < 29; n++) if (m * n % 29 === 1) return n;
  throw Error('Unexpected noninvertible GP29 multiplier');
});
const decrypted = encrypted.map((rune, i) => {
  const pos = i % 376;
  return ((rune - shift[pos] + 29) * inverses[pos]) % 29;
});
assert.deepEqual(decrypted, plaintext);
assert.deepEqual(samePhasePairs(encrypted, 376),
  samePhasePairs(plaintext, 376));

/** @param {number[]} runes */
function ioc(runes) {
  const histogram = new Array(29).fill(0);
  for (const rune of runes) histogram[rune]++;
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0)
    / (runes.length * (runes.length - 1));
}

const reads = [];
for (const layout of ['contiguous', 'interleaved']) {
  for (const order of ['row-major', 'column-major']) {
    const positions = [];
    for (let i = 0; i < 256; i++) {
      const cell = order === 'row-major' ? i
        : (i % 32) * 8 + Math.floor(i / 32);
      const lane = cell % 8;
      const address = table.bytes[cell];
      positions.push(layout === 'contiguous'
        ? lane * 376 + address : address * 8 + lane);
    }
    assert(positions.every(pos => pos >= 0 && pos < floral.length));
    const unique = new Set(positions);
    const extracted = positions.map(pos => floral[pos]);
    let repeatedPairs = 0;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i] === positions[j]) repeatedPairs++;
      }
    }
    assert.equal(unique.size, 244);
    assert.equal(repeatedPairs, 12);

    // Positive extraction control, constrained to the 244 unique addresses.
    const payload = new Array(floral.length).fill(0);
    let ordinal = 0;
    for (const pos of unique) payload[pos] = solved[ordinal++ % solved.length];
    const predicted = positions.map(pos => payload[pos]);
    assert.equal(predicted.length, 256);
    assert(predicted.every((value, i) => value === payload[positions[i]]));

    reads.push({
      layout, order, unique: unique.size, repeatedPairs,
      ioc: ioc(extracted),
      prefix: extracted.slice(0, 24).map(n => alphabet[n]).join('-')
    });
  }
}


// The p40 red eight-rune heading and the exactly 3,000-rune post-heading
// body supply a stronger, wholly source-visible eight-column key geometry.
// The historical seven-column Cicada precedent motivates one fixed classic
// sorted-column receiver. Neither raw-table address read is a full inverse.
const headingSort = Array.from({ length: 8 }, (_, i) => i)
  .sort((a, b) => heading[a] - heading[b]);
assert.deepEqual(headingSort, [0, 4, 7, 1, 2, 5, 6, 3]);
const headingRank = Array.from({ length: 8 }, (_, i) =>
  headingSort.indexOf(i));
const postHeadingBody = floral.slice(8);
assert.equal(postHeadingBody.length, 3000);
for (const layout of ['red8-classic-columnar', 'literal-row-major']) {
  const addresses = table.bytes.map((byte, cell) => {
    const col = cell % 8;
    return layout === 'red8-classic-columnar'
      ? headingRank[col] * 375 + byte : byte * 8 + col;
  });
  assert(addresses.every(addr => addr < 3000));
  assert.equal(new Set(addresses).size, 244);
  const extracted = addresses.map(addr => postHeadingBody[addr]);
  reads.push({
    layout, order: 'table-row-major', unique: 244, repeatedPairs: 12,
    ioc: ioc(extracted),
    prefix: extracted.slice(0, 24).map(n => alphabet[n]).join('-')
  });
}

console.log(JSON.stringify({
  inputs: { floralRunes: floral.length, tableCells: table.bytes.length,
    divinityPrimeSum: 376, headingRunes: heading.length,
    englishReferenceRunes: english.length },
  period376: { original, referenceWindows: controls.length,
    referenceMin: sorted[0], referenceMedian: sorted[264],
    referenceMax: sorted[528], controlsAtOrBelowOriginal: 0,
    plantedAffineMatches: samePhasePairs(encrypted, 376).matches },
  addressReads: reads,
  solvedP57Ioc: ioc(solved)
}, null, 2));
