'use strict';

/**
 * All-secret necessary-condition gate on the Fibonacci-page lag-eight
 * context-dependent differential rank29 cipher family.
 *
 * The decoder has two privileged step outcomes (0 and lag-eight echo,
 * with source-zero fallback to 1) plus the 27 remaining step values.
 * A fresh arbitrary permutation of all 29 labels is allowed on EACH page.
 * Any fixed plaintext rune's frequency is bounded by the sum of each
 * page's largest label histogram bin, regardless of the secret keys.
 *
 * Execute from repository root with Node.js 22:
 * node sims/lp2_fibonacci_lag8_allsecret_pagewise_capacity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const GP = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const FIB = Object.freeze([0, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
const WINDOW = 2256;
const tokens = GP.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Encode with the historically solved LP1 spelling contract:
 * ING and IO use single source-attested GP runes. No word punctuation is
 * treated as a rune. This mirrors the separately passing full 181-word
 * native-source test in sims/lp2_native_gp_source_orthography_sft.cjs.
 * @param {string} text
 * @returns {number[]}
 */
function encodeSourceGP(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      if (word.startsWith('ING', at)) {
        result.push(21);
        at += 3;
      } else if (word.startsWith('IO', at)) {
        result.push(27);
        at += 2;
      } else {
        const match = tokens.find(t => word.startsWith(t.s, at));
        assert.ok(match, 'Every native source letter maps to GP29');
        result.push(match.i);
        at += match.s.length;
      }
    }
  }
  return result;
}

/**
 * A source-step label in the exhaustive 29-category conditional alphabet.
 * @param {number[]} cipher Original ciphertext or a planted cipher.
 * @param {number} i Page-local cipher position, at least nine.
 * @returns {number} Category 0..28.
 */
function rank29(cipher, i) {
  assert.ok(i >= 9);
  const current = (cipher[i] - cipher[i - 1] + 29) % 29;
  const previous8 = (cipher[i - 8] - cipher[i - 9] + 29) % 29;
  const forbidden = previous8 || 1;
  if (current === 0) return 0;
  if (current === forbidden) return 1;
  let label = 2;
  for (let value = 1; value < current; value += 1) {
    if (value !== forbidden) label += 1;
  }
  assert.ok(label >= 2 && label <= 28);
  return label;
}

/** @param {number[]} cipher */
function labels(cipher) {
  const output = [];
  for (let i = 9; i < cipher.length; i += 1) {
    output.push(rank29(cipher, i));
  }
  return output;
}

/**
 * @param {number[][]} perPageLists Lists of 29-category symbols.
 * @returns {{n:number,one:number,two:number,perPage:number[][]}}
 */
function capacities(perPageLists) {
  let one = 0;
  let two = 0;
  let n = 0;
  const perPage = [];
  for (const page of perPageLists) {
    const counts = Array(29).fill(0);
    page.forEach(symbol => { counts[symbol] += 1; });
    const sorted = counts.slice().sort((a, b) => b - a);
    const top1 = sorted[0];
    const top2 = top1 + sorted[1];
    one += top1;
    two += top2;
    n += page.length;
    perPage.push([page.length, top1, top2, counts[0], counts[1]]);
  }
  return {n, one, two, perPage};
}

/**
 * Exact exhaustive window sliding, no sampling of positions or author text.
 * @param {number[]} text
 * @param {number} windowLength
 */
function scanEnglish(text, windowLength) {
  assert.ok(text.length >= windowLength);
  const counts = Array(29).fill(0);
  for (let i = 0; i < windowLength; i += 1) counts[text[i]] += 1;
  let minOne = Infinity;
  let minTwo = Infinity;
  let atOrBelowOne = 0;
  let atOrBelowTwo = 0;
  const oneBound = 148;
  const twoBound = 279;
  for (let start = 0; start + windowLength <= text.length; start += 1) {
    if (start > 0) {
      counts[text[start - 1]] -= 1;
      counts[text[start + windowLength - 1]] += 1;
    }
    let a = 0;
    let b = 0;
    for (const c of counts) {
      if (c >= a) {
        b = a;
        a = c;
      } else if (c > b) b = c;
    }
    minOne = Math.min(minOne, a);
    minTwo = Math.min(minTwo, a + b);
    if (a <= oneBound) atOrBelowOne += 1;
    if (a + b <= twoBound) atOrBelowTwo += 1;
  }
  return {
    sourceRunes: text.length,
    windows: text.length - windowLength + 1,
    minLargestSymbol: minOne,
    minTwoLargestSymbols: minTwo,
    windowsWithinOneBound: atOrBelowOne,
    windowsWithinTwoBound: atOrBelowTwo
  };
}

/**
 * Positive control: encode a known English passage through the exact
 * 29-category lag-eight state machine, with one independent page IV.
 * Identity per-page secret bijections are valid members of the all-secret
 * tested family, and source-native English must pass the capacity bound.
 * @param {number[]} native
 * @param {number[][]} ivPages
 */
function plantCipher(native, ivPages) {
  let next = 0;
  const ciphertext = [];
  for (const original of ivPages) {
    const out = original.slice(0, 9);
    const count = original.length - 9;
    for (let j = 0; j < count; j += 1) {
      const i = out.length;
      const label = native[next + j];
      const prior = (out[i - 8] - out[i - 9] + 29) % 29;
      const forbidden = prior || 1;
      const step = label === 0 ? 0 : label === 1 ? forbidden
        : Array.from({length: 28}, (_, x) => x + 1)
          .filter(x => x !== forbidden)[label - 2];
      assert.ok(Number.isInteger(step) && step >= 0 && step <= 28);
      out.push((out[i - 1] + step) % 29);
      assert.equal(rank29(out, i), label);
    }
    assert.deepEqual(labels(out), native.slice(next, next + count));
    ciphertext.push(out);
    next += count;
  }
  assert.equal(next, native.length);
  return ciphertext;
}

/** Run the key-independent original-cipher decision gate. */
function run() {
  assert.equal(GP.pages.length, 58);
  assert.equal(GP.pages.slice(0, 56).reduce(
    (sum, p) => sum + p.indices.length, 0), 12956);
  const pages = FIB.map(p => GP.pages[p].indices);
  const original = capacities(pages.map(labels));
  assert.deepEqual(
    [original.n, original.one, original.two],
    [2256, 148, 279]);
  assert.deepEqual(
    original.perPage.map(p => p[0]),
    [253, 257, 192, 208, 254, 246, 263, 264, 252, 67]);
  assert.deepEqual(
    original.perPage.reduce((s, p) => [s[0] + p[3], s[1] + p[4]], [0, 0]),
    [15, 46]);

  const English = [
    ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 214851, 195, 386],
    ['Gibran', 'resources/control/gibran_prophet_58585.txt', 60237, 224, 405],
    ['Emerson', 'resources/control/emerson_essays_2944.txt', 319072, 214, 407]
  ];
  const references = [];
  let planted = null;
  for (const [name, file, windows, min1, min2] of English) {
    const native = encodeSourceGP(read(file));
    const score = scanEnglish(native, WINDOW);
    assert.deepEqual(
      [score.windows, score.minLargestSymbol, score.minTwoLargestSymbols],
      [windows, min1, min2]);
    assert.equal(score.windowsWithinOneBound, 0);
    assert.equal(score.windowsWithinTwoBound, 0);
    references.push({name, ...score});
    if (!planted) {
      const known = native.slice(0, WINDOW);
      const ciphertext = plantCipher(known, pages);
      const inverse = ciphertext.flatMap(labels);
      assert.deepEqual(inverse, known);
      const plantedCapacity = capacities(ciphertext.map(labels));
      assert.ok(plantedCapacity.one >= 195);
      assert.ok(plantedCapacity.two >= 386);
      planted = {runes: inverse.length, exactInverse: true,
        oneCapacity: plantedCapacity.one, twoCapacity: plantedCapacity.two};
    }
  }
  const response = {
    cipherFamily: 'lag8 GP29 differences: reserve D=0, reserve D=D(i-8) or fallback1, sort remaining 27; allow fully secret independent 29-symbol alphabet per page',
    originalFibonacciPages: FIB,
    original, knownLanguagePositivePlant: planted,
    languageControls: references,
    totalExhaustiveLanguageWindows: references.reduce((n, x) => n + x.windows, 0),
    decision: 'For these independent native-GP English references, every original 2256-rune Fibonacci-page candidate exceeds the mathematical upper bound for any page-fixed bijections. An intra-page changing key, different plaintext representation or architecture would be necessary.'
  };
  console.log(JSON.stringify(response, null, 2));
  return response;
}

if (require.main === module) run();
module.exports = {encodeSourceGP, rank29, labels, capacities,
  scanEnglish, plantCipher, run};
