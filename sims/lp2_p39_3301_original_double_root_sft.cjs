'use strict';

/**
 * Source-selected p33-p39 sexagesimal numeral, red-p39 GP29 factor and the
 * original p29 / p50 polynomial values. Windows 11 / Node.js 22 SFT.
 *
 * This is a precise original-artifact relationship, NOT a decryption.
 * The square-root / polynomial reading is analyst-proposed rather than an
 * authenticated author instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const gpRune = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = n => ((n % 29) + 29) % 29;

/**
 * Evaluate a high-first original polynomial and its formal derivative
 * over GF29 using the exact Horner recurrence.
 * @param {number[]} digits
 * @param {number} abscissa
 * @returns {{value: number, derivative: number}}
 */
function valueDerivative(digits, abscissa) {
  const x = mod(abscissa);
  let value = 0, derivative = 0;
  for (const digit of digits) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + digit);
  }
  return {value, derivative};
}

/** @param {string} str @returns {number[]} */
function nativeRuneIndices(str) {
  return Array.from(str).map(rune => {
    const index = gpRune.get(rune);
    assert(Number.isInteger(index), 'an unmapped original red rune');
    return index;
  });
}

function main() {
  assert.equal(corpus.pages[29].indices.length, 277);
  assert.equal(grid.bytes.length, 256);
  const p39 = ink.pages.find(page => page.page === 39);
  const isolated = p39.red_spans.find(span =>
    span.start === 119 && span.length === 3);
  assert(isolated, 'missing the physically isolated p39 red triad');
  const lowFirst = nativeRuneIndices(isolated.runes);
  assert.deepEqual(lowFirst, [27, 5, 15]);
  const G = [...lowFirst].reverse(); // literal polynomial coefficients
  assert.deepEqual(G, [15, 5, 27]);

  const printed3301 = 55 * 60 + 1; // cuneiform (55,1)
  const printed1033 = 17 * 60 + 13; // cuneiform (17,13)
  assert.equal(printed3301, 3301);
  assert.equal(printed1033, 1033);
  assert.equal(mod(printed3301), 24);
  assert.equal(mod(printed1033), 18);

  // Original root identity: G = 15*(X-3301)^2 in GF29.
  for (let x = 0; x < 29; x++) {
    assert.equal(valueDerivative(G, x).value,
      mod(15 * (x - printed3301) ** 2));
  }
  assert.deepEqual(valueDerivative(G, printed3301),
    {value: 0, derivative: 0});
  assert.deepEqual(valueDerivative(G, printed1033),
    {value: 18, derivative: 23});
  const p29 = corpus.pages[29].indices;
  const p50 = grid.bytes.map(mod);
  assert.deepEqual(valueDerivative(p29, printed3301),
    {value: 0, derivative: 0});
  assert.deepEqual(valueDerivative(p50, printed3301),
    {value: 0, derivative: 0});
  assert.deepEqual(valueDerivative(p29, printed1033),
    {value: 28, derivative: 9});
  assert.deepEqual(valueDerivative(p50, printed1033),
    {value: 10, derivative: 12});
  // Values and derivatives zero certify a double root, so no quotient
  // calculation, cipher-model fit, key search or external data is needed.
  const powers = [1];
  for (let i = 1; i <= 7; i++) powers.push(mod(powers[i - 1] * 24));
  assert.deepEqual(powers, [1, 24, 25, 20, 16, 7, 23, 1]);
  assert(powers.slice(1, -1).every(v => v !== 1));

  // Rival: the other isolated 3-red-rune span at p3 is NOT this root.
  const windows = [];
  for (const page of ink.pages) {
    for (const span of page.red_spans || []) {
      const arr = nativeRuneIndices(span.runes);
      for (let i = 0; i + 3 <= arr.length; i++) {
        const coeff = arr.slice(i, i + 3).reverse();
        const d = valueDerivative(coeff, printed3301);
        windows.push({
          page: page.page,
          offset: span.start + i,
          spanLength: arr.length,
          value: d.value,
          derivative: d.derivative,
        });
      }
    }
  }
  assert.equal(windows.length, 189);
  const doubleRoots = windows.filter(w =>
    w.value === 0 && w.derivative === 0);
  assert.deepEqual(doubleRoots.map(w => [w.page, w.offset]),
    [[39, 119]]);
  const isolatedWindows = windows.filter(w => w.spanLength === 3);
  assert.deepEqual(isolatedWindows.map(w => [w.page, w.offset]),
    [[3, 119], [39, 119]]);
  assert.notEqual(isolatedWindows[0].value, 0);

  const intactGValue = 15 * printed3301 ** 2 + 5 * printed3301 + 27;
  assert.equal(intactGValue % (29 * 29), 29 * 13);
  console.log(JSON.stringify({
    originalClue: 'p33-p39 cuneiform header 1033 / 3301',
    redTriad: {page: 39, runeStart: 119, lowFirst, polynomial: G},
    headerResiduesGP29: {cuneiform1033: 18, cuneiform3301: 24},
    p39GAt3301: valueDerivative(G, 3301),
    p29Original277At3301: valueDerivative(p29, 3301),
    p50Original256At3301: valueDerivative(p50, 3301),
    independentNegative1033: {
      p39: valueDerivative(G, 1033),
      p29: valueDerivative(p29, 1033),
      p50: valueDerivative(p50, 1033),
    },
    matchedRedTriple: doubleRoots,
    totalOriginalRedTripleWindows: windows.length,
    originalIsolatedRedTripleWindows: isolatedWindows.length,
    modulo29Root24MultiplicativeOrder: 7,
    g3301IntegerValueMod29Squared: 377,
    classification: 'Exact source-number/red-triad/genuine-p29/conditional-p50 '
      + 'double root; no cipher operation or unknown plaintext',
  }, null, 2));
  console.log('PASS: source-chosen 3301 root24 is a repeated zero of '
    + 'both original p29 GP and p50 table polynomials; only p39 red '
    + 'trigram has that double root; 1033 is an exact negative control.');
}

if (require.main === module) main();
module.exports = {valueDerivative, nativeRuneIndices};
