'use strict';

/**
 * Original p55 75-rune body as 25 absolute BASE29 character addresses
 * into the historically selected 2013 Liber AL text. Source-only gate.
 * Execute as a single file from the repository root: node sims/lp2_p55_liberal_triplet_bookcode_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

/** @param {number[]} values */
function fromTriplets(values) {
  assert.equal(values.length % 3, 0);
  const addresses = [];
  for (let i = 0; i < values.length; i += 3) {
    for (const v of values.slice(i, i + 3)) {
      assert.ok(Number.isInteger(v) && v >= 0 && v < 29);
    }
    addresses.push(841 * values[i] + 29 * values[i + 1] + values[i + 2]);
  }
  return addresses;
}

/** @param {number[]} addresses */
function toTriplets(addresses) {
  return addresses.flatMap((v) => {
    assert.ok(Number.isInteger(v) && v >= 0 && v < 24389);
    return [Math.floor(v / 841), Math.floor(v / 29) % 29, v % 29];
  });
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const page = corpus.pages.find((entry) => entry.page === 55);
assert.ok(page);
assert.equal(page.indices.length, 76);
const body = page.indices.slice(1);
assert.equal(body.length, 75);
const addresses = fromTriplets(body);
assert.deepEqual(toTriplets(addresses), body);
assert.deepEqual(addresses, [
  21586, 6339, 12340, 10289, 2407, 23420, 4241, 3885, 416,
  16013, 11186, 17187, 13309, 10950, 7081, 10642, 15434, 11963,
  15585, 1758, 12695, 5027, 16138, 19663, 14829,
]);

const books = ['I', 'II', 'III'].map((chapter) =>
  read('resources/external/2013-book-of-law-' + chapter + '.txt'));
const raw = books.join('');
const letters = (raw.match(/[A-Za-z]/g) || []).join('').toUpperCase();
assert.equal(raw.length, 31059);
assert.equal(letters.length, 23056);

/** @param {string} text */
function decode(text) {
  return addresses.map((position) => text[position] ?? '?').join('');
}

// An independently source-grounded second numeral register uses the GP
// prime values modulo 29, as on solved Cicada pages, in place of ordinals.
const primeDigits = body.map((value) => corpus.prime[value] % 29);
const primeAddresses = fromTriplets(primeDigits);
assert.deepEqual(toTriplets(primeAddresses), primeDigits);
assert.deepEqual(primeAddresses, [
  12153, 16678, 15539, 10587, 4613, 17113, 11039, 9360, 2206,
  11033, 12462, 12976, 20262, 11835, 19704, 10375, 7644, 15655,
  8277, 4359, 20354, 11573, 11328, 1917, 2786,
]);
const primeRawOutput = primeAddresses.map((position) => raw[position] ?? '?').join('');
const primeLettersOutput = primeAddresses.map((position) => letters[position] ?? '?').join('');
assert.equal(primeRawOutput, 'ia owgred0vnne vennepr to');
assert.equal(primeLettersOutput, 'TSNLEETNOFRARSTEROUTMOACR');

const rawOutput = decode(raw);
const lettersOutput = decode(letters);
assert.equal(rawOutput, 'e   rrd K.n\n oed gomS,sA ');
assert.equal(lettersOutput, 'ESLIS?NHSIFTHOWMTTLTEMSHI');

// Explicit positive control: a 25-character native excerpt selected from
// the same authentic source produces precisely the same recovered excerpt.
const plantedAddresses = Array.from({length: 25}, (_, index) => 500 + index);
assert.deepEqual(fromTriplets(toTriplets(plantedAddresses)), plantedAddresses);
assert.equal(plantedAddresses.map((address) => raw[address]).join(''), raw.slice(500, 525));

const validChapters = body.filter((_, position) => position % 3 === 0 && body[position] < 3).length;
console.log(JSON.stringify({
  original_page: 55,
  original_body_runes: 75,
  original_addresses: addresses,
  literal_chapter_digit_in_0_2: validChapters,
  literal_chapter_digit_total: 25,
  raw_book_length: raw.length,
  raw_book_out_of_range: addresses.filter((position) => position >= raw.length).length,
  raw_character_readout: rawOutput,
  letters_book_length: letters.length,
  letters_book_out_of_range: addresses.filter((position) => position >= letters.length).length,
  letters_character_readout: lettersOutput,
  gp_prime_mod29_addresses: primeAddresses,
  gp_prime_raw_character_readout: primeRawOutput,
  gp_prime_letters_character_readout: primeLettersOutput,
  native_positive_control: '25/25',
}, null, 2));
