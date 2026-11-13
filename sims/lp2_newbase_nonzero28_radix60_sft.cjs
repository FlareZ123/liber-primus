'use strict';

/**
 * One-shot source-motivated positional-base decoder gate.
 *
 * Native LP2 ciphertext has 29 GP rune values. For pages with no adjacent
 * identical rune, successive modular differences live in 1..28 and thus
 * form exactly invertible base-28 digits after subtracting one. The signed
 * 2016 image and p0 NEWBAS prefix motivate considering the printed grid's
 * conventional base-60 alphabet, with its documented base-59 ambiguity.
 *
 * This script neither guesses missing zero-transition states nor discards
 * any original ciphertext rune. It tests the exact 13 all-nonzero pages.
 * Requires only the repository's canonical JSON and Node.js.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ALPHABET60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const ALPHABET59 = ALPHABET60.replace('f', '');
assert.equal(ALPHABET60.length, 60);
assert.equal(ALPHABET59.length, 59);

/**
 * @param {readonly number[]} digits
 * @param {number} base
 * @returns {bigint}
 */
function asInteger(digits, base) {
  let n = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < base);
    n = n * BigInt(base) + BigInt(digit);
  }
  return n;
}

/**
 * @param {bigint} value
 * @param {number} base
 * @returns {number[]}
 */
function asDigits(value, base) {
  assert(value >= 0n);
  if (value === 0n) return [0];
  const result = [];
  while (value !== 0n) {
    result.push(Number(value % BigInt(base)));
    value /= BigInt(base);
  }
  return result.reverse();
}

/**
 * @param {readonly number[]} digits
 * @param {number} originalBase
 * @param {number} targetBase
 * @returns {number[]}
 */
function changeBase(digits, originalBase, targetBase) {
  return asDigits(asInteger(digits, originalBase), targetBase);
}

/**
 * @param {readonly number[]} digits
 * @param {string} alphabet
 * @returns {string}
 */
function render(digits, alphabet) {
  return digits.map((n) => alphabet[n]).join('');
}

/**
 * @param {string} source
 * @param {string} alphabet
 * @returns {number[]}
 */
function parse(source, alphabet) {
  return [...source].map((c) => {
    const digit = alphabet.indexOf(c);
    assert(digit >= 0);
    return digit;
  });
}

/**
 * Decode predecessor-excluding GP29 transitions. Null means this page
 * contains a zero transition and therefore cannot be represented losslessly
 * in the fixed 28-digit family without an additional escape convention.
 *
 * @param {readonly number[]} cipher
 * @returns {number[] | null}
 */
function differenceDigits(cipher) {
  const out = [];
  for (let i = 1; i < cipher.length; i += 1) {
    const delta = (cipher[i] - cipher[i - 1] + 29) % 29;
    if (delta === 0) return null;
    out.push(delta - 1);
  }
  return out;
}

/**
 * @param {number} initial
 * @param {readonly number[]} digits
 * @returns {number[]}
 */
function accumulate(initial, digits) {
  const result = [initial];
  for (const digit of digits) {
    result.push((result[result.length - 1] + digit + 1) % 29);
  }
  return result;
}

/**
 * Numeral conversion discards leading zero digits. The declared source
 * register length restores them without inserting unknown information.
 *
 * @param {number[]} digits
 * @param {number} width
 * @returns {number[]}
 */
function restoreWidth(digits, width) {
  assert(digits.length <= width);
  return Array(width - digits.length).fill(0).concat(digits);
}

/**
 * @param {string} name
 * @param {readonly number[]} sourceDigits
 * @param {number} sourceBase
 * @param {string} targetAlphabet
 * @returns {{name: string, sourceLength: number, output: string}}
 */
function reportConversion(name, sourceDigits, sourceBase, targetAlphabet) {
  const converted = changeBase(sourceDigits, sourceBase, targetAlphabet.length);
  const recovered = restoreWidth(
    changeBase(converted, targetAlphabet.length, sourceBase),
    sourceDigits.length
  );
  assert.deepEqual(recovered, sourceDigits);
  return {
    name: name,
    sourceLength: sourceDigits.length,
    output: render(converted, targetAlphabet)
  };
}

function main() {
  const root = path.join(__dirname, '..');
  const corpus = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'),
    'utf8'
  ));
  const pages = corpus.pages.filter((page) => page.page <= 55 && page.runic_count > 0);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((total, page) => total + page.runic_count, 0), 12956);
  const p0 = pages.find((page) => page.page === 0);
  const p1 = pages.find((page) => page.page === 1);
  assert.equal(p0.runic_count, 262);
  assert.equal(p1.runic_count, 266);

  // Native uppercase-plaintext positive controls: positional radix alone,
  // then positional radix followed by exactly invertible nonzero GP29 steps.
  const native = 'SHEDOUROWNCIRCUMFERENCESFINDTHEDIVINITYWITHINANDEMERGE';
  for (const alphabet of [ALPHABET60, ALPHABET59]) {
    const initial = parse(native, alphabet);
    assert.equal(render(changeBase(changeBase(initial, alphabet.length, 29), 29, alphabet.length), alphabet), native);
    const keyless28 = changeBase(initial, alphabet.length, 28);
    const encrypted = accumulate(15, keyless28);
    assert.deepEqual(differenceDigits(encrypted), keyless28);
    const decoded = changeBase(differenceDigits(encrypted), 28, alphabet.length);
    assert.equal(render(restoreWidth(decoded, native.length), alphabet), native);
    console.log('PASS planted native uppercase', 'base=' + alphabet.length, 'cipher-runes=' + encrypted.length);
  }

  // First-two-original-page and combined-page boundaries are fixed from
  // source-address evidence, not chosen by language scoring.
  const pair = [
    {name: 'p0', data: p0.indices},
    {name: 'p1', data: p1.indices},
    {name: 'p0+p1', data: p0.indices.concat(p1.indices)}
  ];
  for (const alphabet of [ALPHABET60, ALPHABET59]) {
    for (const item of pair) {
      const row = reportConversion(item.name, item.data, 29, alphabet);
      const uppercase = (row.output.match(/[A-Z]/g) || []).length;
      console.log('DIRECT',
        'base=' + alphabet.length,
        row.name,
        'runes=' + row.sourceLength,
        'digits=' + row.output.length,
        'uppercase=' + uppercase,
        'preview=' + row.output.slice(0, 90));
      assert(/[0-9a-z]/.test(row.output));
    }
  }

  // The source-linked 2016 image-axis words are read at their original
  // printed boundaries. These whole-word numeral casts were already studied
  // for GP29; the new question here is the distinct nonzero-delta GP28
  // register with its first word rune preserved as a local IV.
  const selectedWords = [
    { name: 'p0#w6', page: p0, source: [9, 18, 7, 17, 24, 15, 22, 12, 10, 21, 1] },
    { name: 'p1#w33', page: p1, source: [11, 0, 10, 9, 27, 5, 26, 28, 10, 27] }
  ];
  for (const item of selectedWords) {
    const wordOffsets = [];
    for (let i = 0; i + item.source.length <= item.page.indices.length; i += 1) {
      if (item.source.every((value, k) => item.page.indices[i + k] === value)) wordOffsets.push(i);
    }
    assert.equal(wordOffsets.length, 1);
    const actualPrimeSum = item.source.reduce((sum, digit) => sum + corpus.prime[digit], 0);
    assert.equal(actualPrimeSum, item.name === 'p0#w6' ? 563 : 569);
    const deltas = differenceDigits(item.source);
    assert(deltas !== null);
    assert.deepEqual(accumulate(item.source[0], deltas), item.source);
    for (const alphabet of [ALPHABET60, ALPHABET59]) {
      const row = reportConversion(item.name, deltas, 28, alphabet);
      console.log('SELECTED-WORD',
        'base=' + alphabet.length,
        item.name,
        'original-offset=' + wordOffsets[0],
        'runes=' + item.source.length,
        'digits=' + row.output.length,
        'readout=' + row.output);
    }
  }

  // Tests only true, zero-free complete original pages. No deletion or
  // synthetic escape mapping is permitted at the 86 repeated-rune sites.
  const plainDifferencePages = pages.map((page) => ({
    page: page.page,
    cipher: page.indices,
    digits: differenceDigits(page.indices)
  })).filter((page) => page.digits !== null);
  assert.deepEqual(
    plainDifferencePages.map((page) => page.page),
    [5, 7, 13, 14, 15, 17, 28, 31, 37, 38, 40, 49, 53]
  );

  for (const alphabet of [ALPHABET60, ALPHABET59]) {
    let uppercaseTotal = 0;
    let outputTotal = 0;
    for (const page of plainDifferencePages) {
      assert.deepEqual(accumulate(page.cipher[0], page.digits), page.cipher);
      const row = reportConversion('p' + page.page, page.digits, 28, alphabet);
      const uppercase = (row.output.match(/[A-Z]/g) || []).length;
      uppercaseTotal += uppercase;
      outputTotal += row.output.length;
      assert(/[0-9a-z]/.test(row.output));
      console.log('DELTA28',
        'base=' + alphabet.length,
        row.name,
        'runes=' + page.cipher.length,
        'digits=' + row.output.length,
        'uppercase=' + uppercase,
        'preview=' + row.output.slice(0, 70));
    }
    console.log('TOTAL',
      'base=' + alphabet.length,
      'pages=' + plainDifferencePages.length,
      'uppercase=' + uppercaseTotal,
      'digits=' + outputTotal,
      'uppercase-fraction=' + (uppercaseTotal / outputTotal).toFixed(6));
  }
  console.log('PASS original complete-page round trips and positive controls');
}

main();
