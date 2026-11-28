'use strict';

/**
 * SFT: original 2014 source numbers as direct addresses in the 256-cell
 * LP2 pp49-51 numeric table. This is a conditional reading, not an
 * established creator instruction or plaintext decryption.
 *
 * Source: unmodified source-derived table and archived Onion7 index.
 * Run: node sims/lp2_source1033_3299_3301_grid_pointer_sft.cjs
 *
 * @returns {void}
 */
function main() {
  const assert = require('node:assert/strict');
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const table = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
  const onion = fs.readFileSync(
    path.join(root, 'resources', 'cicada2014-onion7-index.html'), 'utf8');
  const bytes = table.bytes;
  const symbols = table.alphabet;
  assert.equal(bytes.length, 256);
  assert.equal(symbols.length, 60);
  assert(onion.includes('src="0.jpg"') && onion.includes('src="49.jpg"'));

  /** @param {number} byte @returns {string} */
  function token(byte) {
    return symbols[Math.floor(byte / 60)] + symbols[byte % 60];
  }

  const canonical = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const p57 = canonical.pages.find(p => p.page === 57);
  assert.equal(p57.indices.slice(37, 67)
    .reduce((acc, glyph) => acc + canonical.prime[glyph], 0), 1031);
  const seeds = [
    { source: 'Solved p57 middle body-clause sum 1031 (2013 metadata factor)', n: 1031, expected: '33' },
    { source: 'LP1 original 1033 magic-square sum', n: 1033, expected: '49' },
    { source: 'LP2 p15 unique highlighted red 3299', n: 3299, expected: '49' },
    { source: 'LP1 original 3301 magic-square sum', n: 3301, expected: '00' }
  ];
  for (const seed of seeds) {
    const cell = seed.n % 256;
    const observed = token(bytes[cell]);
    assert.equal(observed, seed.expected, seed.source);
    seed.cell = cell;
    seed.token = observed;
    seed.oneBasedToken = token(bytes[(seed.n - 1) % 256]);
  }
  assert.deepEqual(seeds.map(seed => seed.cell), [7, 9, 227, 229]);
  assert.deepEqual(seeds.map(seed => seed.oneBasedToken), ['26', '1W', '1D', '2O']);

  // Full historical PARABLE fixture: the three body-clause GP-prime sums
  // are exactly the factors of 2013 author-visible 1595277641. This yields
  // one uniform 0-based 256-cell lookup; do not select a different index
  // clock, table orientation or plaintext receiver by the outputs.
  const clauses = [
    { name: 'PARABLE title', lo: 0, hi: 7, sum: 449, cell: 193, literal: '2Z', as60: 155, as59: 153 },
    { name: 'INSTAR/SURFACE', lo: 7, hi: 37, sum: 1259, cell: 235, literal: '21', as60: 121, as59: 119 },
    { name: 'SHED CIRCUMFERENCES', lo: 37, hi: 67, sum: 1031, cell: 7, literal: '33', as60: 183, as59: 180 },
    { name: 'DIVINITY/EMERGE', lo: 67, hi: 95, sum: 1229, cell: 205, literal: '1G', as60: 76, as59: 75 }
  ];
  const radix59Digits = symbols.replace('f', '');
  assert.equal(radix59Digits.length, 59);
  for (const q of clauses) {
    assert.equal(p57.indices.slice(q.lo, q.hi)
      .reduce((acc, glyph) => acc + canonical.prime[glyph], 0), q.sum);
    assert.equal(q.sum % bytes.length, q.cell);
    assert.equal(token(bytes[q.cell]), q.literal);
    assert.equal(bytes[q.cell], q.as60);
    assert.equal(radix59Digits.indexOf(q.literal[0]) * 59 +
      radix59Digits.indexOf(q.literal[1]), q.as59);
  }
  assert.equal(1259 * 1031 * 1229, 1595277641);
  const pageLengths = (n) => canonical.pages
    .filter(page => page.runic_count === n).map(page => page.page);
  assert.deepEqual(pageLengths(121), [32]);
  assert.deepEqual(pageLengths(76), [55]);
  assert.deepEqual(pageLengths(183), []);
  assert.deepEqual(pageLengths(180), []);
  // A uniform positional radix cannot make 33 equal interior180
  // AND 1G equal outer-rim76: the equations force radix 59 and 60.
  assert.equal((180 - 3) / 3, 59);
  assert.equal(76 - 16, 60);


  /** @param {number} value @returns {number[]} */
  function positions(value) {
    return bytes.flatMap((b, index) => b === value ? [index] : []);
  }
  assert.deepEqual(positions(3 * 60 + 3), [7, 14]); // Literal token '33' is radix60 byte183.
  assert.deepEqual(positions(249), [9, 158, 227]);
  assert.deepEqual(positions(0), [192, 229]);
  assert.equal(bytes[249], 158);
  assert.equal(bytes[158], 249);
  assert.equal(bytes[9], 249);
  assert.equal(bytes[227], 249);
  assert.equal(bytes[229], 0);
  const spiral = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
    3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
  assert.deepEqual(spiral.filter(n => token(bytes[n % 256]) === '49'), [3299]);
  assert.deepEqual(spiral.filter(n => token(bytes[n % 256]) === '00'), []);

  // Conditional random-permutation probability with the byte histogram
  // fixed and all three input/target addresses predeclared.
  // The targets were NOT fully predeclared in discovery; this is not a
  // discovery-adjusted probability or a claim of authorial design.
  const denominator = 256 * 255 * 254;
  const numerator = 3 * 2 * 2;
  assert.equal(denominator / numerator, 1381760);

  // The additional 1031->33 output is a finite out-of-family extension
  // of a previously published *conditional* pointer rule, not a historically
  // authenticated opcode or a controlled blinded original prediction.
  assert.equal(token(bytes[7]), '33');
  assert.equal(token(bytes[6]), '26');

  // A planted table must be recognized by the same complete input check.
  const planted = bytes.slice();
  planted[9] = 249;
  planted[227] = 249;
  planted[229] = 0;
  assert.deepEqual([9, 227, 229].map(i => token(planted[i])),
    ['49', '49', '00']);

  console.log(JSON.stringify({
    indexedSourceSeeds: seeds,
    parableClauseSourceLookup: clauses,
    conventionalBase60MatchingCompletePageRunes: [
      { n: 1259, value: 121, physicalPage: 32 },
      { n: 1229, value: 76, physicalPage: 55 }
    ],
    literalPagePointerAndByteLengthMixedSemanticsNotCreatorSelected: true,
    all33Cells: positions(183),
    all49Cells: positions(249),
    all00Cells: positions(0),
    twoCellCycle: [158, 249],
    redSpiralUniqueness: '3299 only among 16 original p15 numerals',
    conditionalFixedTargetShuffleOdds: '1/1381760 (not discovery-adjusted)',
    status: 'Conditional source-navigation lead; no creator-selected opcode, key or plaintext'
  }, null, 2));
}
main();
