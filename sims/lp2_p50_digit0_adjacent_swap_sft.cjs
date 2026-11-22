'use strict';

/**
 * p50 literal-leading-zero / low60 adjacent-swap gate.
 *
 * Frozen reversible rule:
 * - global row-major p50 phase0 clock continues across physical pages;
 * - within each physical page, scan left to right;
 * - if the current p50 cell begins with literal 0, leave the rune and step 1;
 * - otherwise swap the current rune with its right neighbor and step 2;
 * - never swap across a physical page boundary.
 *
 * The position-only schedule makes the transform an involution. No phase,
 * sign, key, threshold, plaintext feedback or language-guided branch exists.
 *
 * Windows Node.js 22, CommonJS, standard library only.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const tokens = grid.pages.flatMap((page) => page.tokens);
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const pageLengths = pages.map((page) => page.indices.length);
const N = pageLengths.reduce((sum, length) => sum + length, 0);

assert.equal(tokens.length, 256);
assert.equal(tokens.filter((token) => token[0] === '0').length, 60);
assert.equal(N, 12956);

/**
 * @param {{page:number,indices:number[]}[]} input
 * @returns {{page:number,indices:number[]}[]}
 */
function transform(input) {
  let global = 0;
  const output = [];
  for (const page of input) {
    const values = page.indices.slice();
    for (let i = 0; i + 1 < values.length;) {
      if (tokens[(global + i) & 255][0] === '0') {
        i++;
      } else {
        [values[i], values[i + 1]] = [values[i + 1], values[i]];
        i += 2;
      }
    }
    output.push({page: page.page, indices: values});
    global += page.indices.length;
  }
  return output;
}

/**
 * @param {number[]} flat
 * @returns {{page:number,indices:number[]}[]}
 */
function overlay(flat) {
  assert.equal(flat.length, N);
  let offset = 0;
  return pageLengths.map((length, page) => {
    const result = {page, indices: flat.slice(offset, offset + length)};
    offset += length;
    return result;
  });
}

/**
 * @param {{page:number,indices:number[]}[]} input
 */
function pairStats(input) {
  let global = 0;
  let opportunities = 0;
  let selectedOpportunities = 0;
  let repeats = 0;
  let selectedRepeats = 0;

  for (const page of input) {
    for (let i = 0; i + 1 < page.indices.length; i++) {
      const selected = tokens[(global + i) & 255][0] === '0';
      opportunities++;
      selectedOpportunities += Number(selected);
      if (page.indices[i] === page.indices[i + 1]) {
        repeats++;
        selectedRepeats += Number(selected);
      }
    }
    global += page.indices.length;
  }

  const selectedRate = selectedRepeats / selectedOpportunities;
  const outsideRate = (repeats - selectedRepeats) /
    (opportunities - selectedOpportunities);
  return {
    opportunities,
    selectedOpportunities,
    repeats,
    selectedRepeats,
    rateRatio: selectedRate / outsideRate
  };
}

const originalFlat = pages.flatMap((page) => page.indices);
const decoded = transform(pages);
assert.deepEqual(transform(decoded).map((page) => ({page: page.page, indices: page.indices})),
  pages.map((page) => ({page: page.page, indices: page.indices})));
assert.deepEqual(pairStats(pages), {
  opportunities: 12901,
  selectedOpportunities: 3025,
  repeats: 86,
  selectedRepeats: 33,
  rateRatio: 2.032795883361921
});
assert.deepEqual(pairStats(decoded), {
  opportunities: 12901,
  selectedOpportunities: 3025,
  repeats: 243,
  selectedRepeats: 81,
  rateRatio: 1.632396694214876
});
assert.equal(
  decoded.flatMap((page) => page.indices)
    .reduce((sum, value, index) => sum + Number(value !== originalFlat[index]), 0),
  11168
);

const translit = corpus.translit.map((symbol, index) => ({symbol, index}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text @returns {number[]} */
function encodeNative(text) {
  const clean = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        out.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        out.push(27);
        i += 2;
      } else {
        const token = translit.find((entry) => word.startsWith(entry.symbol, i));
        assert(token, 'unmapped native spelling');
        out.push(token.index);
        i += token.symbol.length;
      }
    }
  }
  return out;
}

const controls = [];
for (const [name, file] of [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
]) {
  const stream = encodeNative(read(file));
  const starts = [0, Math.floor(stream.length / 3), Math.floor(2 * stream.length / 3)]
    .filter((start) => start + N <= stream.length);
  assert.equal(starts.length, 3);
  for (const start of starts) {
    const native = overlay(stream.slice(start, start + N));
    const cipher = transform(native);
    assert.deepEqual(transform(cipher), native);
    controls.push({name, start, native: pairStats(native), cipher: pairStats(cipher)});
  }
}

assert.deepEqual(
  controls.map((entry) => [entry.native.repeats, entry.cipher.repeats]),
  [
    [412,580],[394,544],[412,549],
    [394,584],[376,521],[379,535],
    [358,538],[383,560],[351,525]
  ]
);
assert.ok(controls.every((entry) => entry.cipher.repeats > entry.native.repeats));
assert.ok(controls.every((entry) => entry.cipher.rateRatio < 1.35));

console.log(JSON.stringify({
  model: 'phase0 low60 hold / other-cell adjacent swap, page-bounded scan',
  original: pairStats(pages),
  inverse: pairStats(decoded),
  changedPositions: 11168,
  nativeControls: controls,
  decision:
    'FAIL: inverse does not recover direct language, while the same involution systematically increases rather than suppresses adjacent repeats on nine native-GP controls and never approaches the original 2.033 zero-class rate ratio.'
}, null, 2));
