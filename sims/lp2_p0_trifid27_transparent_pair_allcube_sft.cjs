'use strict';
/**
 * Exact all-cube original LP2 p0–p2 transparent-GP27 invariant.
 *
 * A classical 3x3x3 (27-glyph) keyed Trifid, with two GP29 symbols
 * passed through literally, MUST conserve the individual counts of both
 * transparent symbols regardless of cube, period, scope or direction.
 *
 * This test uses 729 untouched physical LP2 p0–p2 runes and exhausts all
 * matching-length windows in three independent repository GP-English
 * references, with both GP writer orthographies used in solved manuscripts.
 *
 * Run on Windows 11: node sims/lp2_p0_trifid27_transparent_pair_allcube_sft.cjs
 * Node.js 22, read-only, built-ins only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.slice(0, 3).map(p => p.indices);
assert.deepEqual(pages.map(p => p.length), [262, 266, 201]);
const original = pages.flat();
assert.equal(original.length, 729);
const originalHistogram = new Int32Array(29);
original.forEach(x => originalHistogram[x]++);
assert.equal(originalHistogram[0], 34);  // F, one source-selected bypass
assert.equal(originalHistogram[28], 28); // EA, other proposed bypass

/** @param {string} text @param {boolean} historicOverrides @returns {number[]} */
function gpEncode(text, historicOverrides) {
  const tokens = corpus.translit.map((symbol, i) => [symbol, i]);
  if (historicOverrides) tokens.push(['ING', 21], ['IO', 27]);
  tokens.sort((a, b) => b[0].length - a[0].length);
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/[KQ]/g, 'C')
      .replace(/V/g, 'U').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const token = tokens.find(([label]) => word.startsWith(label, i));
      assert.ok(token, 'Native GP symbol absent: ' + word.slice(i));
      out.push(token[1]);
      i += token[0].length;
    }
  }
  return out;
}

/**
 * Exact keyed 27-cube Trifid with two literal unchanged glyphs.
 * Used only as a native-plaintext positive and original round-trip control.
 * @param {number[]} text GP indices
 * @param {number[]} cube 27 distinct GP symbols 1..27
 * @param {number} period core rune count per Trifid block
 * @param {boolean} inverse
 * @returns {number[]}
 */
function trifid(text, cube, period, inverse) {
  assert.equal(cube.length, 27);
  assert.equal(new Set(cube).size, 27);
  const place = new Int16Array(29).fill(-1);
  cube.forEach((value, i) => { place[value] = i; });
  assert.equal(place[0], -1);
  assert.equal(place[28], -1);
  const positions = [];
  const core = [];
  text.forEach((value, offset) => {
    if (place[value] >= 0) {
      positions.push(offset);
      core.push(place[value]);
    } else {
      assert.ok(value === 0 || value === 28);
    }
  });
  const result = text.slice();
  for (let start = 0; start < core.length; start += period) {
    const block = core.slice(start, start + period);
    const n = block.length;
    let labels;
    if (inverse) {
      const digits = block.flatMap(v => [Math.floor(v / 9), Math.floor(v / 3) % 3, v % 3]);
      labels = Array.from({length: n}, (_, i) => 9 * digits[i] + 3 * digits[n + i] + digits[2 * n + i]);
    } else {
      const digits = [...block.map(v => Math.floor(v / 9)),
        ...block.map(v => Math.floor(v / 3) % 3), ...block.map(v => v % 3)];
      labels = Array.from({length: n}, (_, i) => 9 * digits[3*i] + 3 * digits[3*i + 1] + digits[3*i + 2]);
    }
    labels.forEach((label, j) => { result[positions[start + j]] = cube[label]; });
  }
  return result;
}

/** @param {number[]} stream @returns {Int32Array} */
function histogram(stream) {
  const h = new Int32Array(29);
  stream.forEach(x => h[x]++);
  return h;
}

/**
 * Exhaust every GP-native 729-rune source window, preserving each
 * literal rune identity, and collect transparent-symbol pair frequencies.
 *
 * @param {number[]} stream
 * @returns {object}
 */
function census(stream) {
  const width = original.length;
  assert.ok(stream.length >= width);
  const h = histogram(stream.slice(0, width));
  const pairs = new Set();
  let maxF = 0, maxEA = 0, sameF = 0, sameEA = 0, sameBoth = 0;
  let bestMatchedSymbols = 0;
  for (let start = 0; start + width <= stream.length; start++) {
    maxF = Math.max(maxF, h[0]);
    maxEA = Math.max(maxEA, h[28]);
    if (h[0] === originalHistogram[0]) sameF++;
    if (h[28] === originalHistogram[28]) sameEA++;
    if (h[0] === originalHistogram[0] && h[28] === originalHistogram[28]) sameBoth++;
    const equal = [];
    for (let j = 0; j < 29; j++) {
      if (h[j] === originalHistogram[j]) equal.push(j);
    }
    bestMatchedSymbols = Math.max(bestMatchedSymbols, equal.length);
    for (let i = 0; i < equal.length; i++) {
      for (let j = i + 1; j < equal.length; j++) {
        pairs.add(equal[i] + ',' + equal[j]);
      }
    }
    if (start + width < stream.length) {
      h[stream[start]]--;
      h[stream[start + width]]++;
    }
  }
  assert.ok(maxEA < 28);
  assert.equal(sameEA, 0);
  assert.equal(sameBoth, 0);
  return {
    GP29Runes: stream.length,
    complete729RuneWindows: stream.length - width + 1,
    maxF, maxEA, exactFCountWindows: sameF,
    exactEACountWindows: sameEA, exactFAndEACountWindows: sameBoth,
    possibleAnyTwoUnchangedRunePairs: pairs.size,
    bestMatchedSymbols,
    pairs
  };
}

const controls = [
  ['Gibran', (() => {
    const text = read('resources/control/gibran_prophet_58585.txt');
    const from = text.indexOf('THE PROPHET', 500);
    const to = text.lastIndexOf('*** END OF');
    assert.ok(from > 500 && to > from);
    return text.slice(from + 11, to);
  })()],
  ['Shakespeare', read('resources/control/shakespeare_first300k.txt')],
  ['Emerson', read('resources/control/emerson_essays_2944.txt')]
];

// Native plant tests a real reversible keyed transform; every unchanged
// bypass rune survives both encryption and decryption, not just a count.
const cube = Array.from({length: 27}, (_, i) => ((i * 11) % 27) + 1);
const plant = gpEncode(controls[0][1], false).slice(1000, 1729);
const encrypted = trifid(plant, cube, 27, false);
assert.equal(encrypted.length, 729);
assert.deepEqual(trifid(encrypted, cube, 27, true), plant);
assert.deepEqual([histogram(plant)[0], histogram(plant)[28]],
  [histogram(encrypted)[0], histogram(encrypted)[28]]);
assert.deepEqual(trifid(trifid(original, cube, 27, false), cube, 27, true), original);

const reports = [];
const unions = [];
for (const historicOverrides of [false, true]) {
  const allPairs = new Set();
  let windows = 0;
  for (const [name, source] of controls) {
    const score = census(gpEncode(source, historicOverrides));
    const {pairs, ...printed} = score;
    for (const pair of pairs) allPairs.add(pair);
    windows += score.complete729RuneWindows;
    reports.push({spelling: historicOverrides ? 'ING-IO writer' : 'canonical translit',
      source: name, ...printed});
  }
  unions.push({spelling: historicOverrides ? 'ING-IO writer' : 'canonical translit',
    totalWindows: windows, survivingAnyTwoUnchangedPairs: allPairs.size,
    rejectedAnyTwoUnchangedPairs: 406 - allPairs.size,
    containsFAndEA: allPairs.has('0,28')});
}
assert.deepEqual(reports.map(x => x.maxEA), [20,19,16,21,19,16]);
assert.deepEqual(unions.map(x => [x.totalWindows,x.survivingAnyTwoUnchangedPairs,x.containsFAndEA]),
  [[589280,81,false],[583878,93,false]]);
console.log(JSON.stringify({
  original: {physicalPages: [0,1,2], runeCount: original.length,
    sourceF: originalHistogram[0], sourceEA: originalHistogram[28]},
  nativePositive: {runesRestored: 729, literalControlsConserved: true},
  perRegister: reports, acrossRegisters: unions,
  conclusion: 'Original p0-p2 does not match the two literal control-rune counts of any 729-rune reference passage. Every keyed GP27 Trifid that leaves F and EA literally unchanged is ruled out against the stated native-English corpus windows, all keys/periods/directions. No unknown LP2 plaintext recovered.'
}, null, 2));
