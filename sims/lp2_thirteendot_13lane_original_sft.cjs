'use strict';
/**
 * Original LP2 thirteen-dot punctuation decimation gate.
 * Test every one of 13 literal rune-sampling phases under the three
 * source-visible clocks (book, page, after each thirteen-dot marker).
 * An invariant GP29 index of coincidence excludes any one lane as ordinary
 * plaintext under fixed alphabet substitution and arbitrary rune reordering.
 *
 * Standalone: node sims/lp2_thirteendot_13lane_original_sft.cjs
 * All inputs read only; no stochastic search, fitted key, or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const sourcePages = corpus.pages.filter(page => page.page <= 55);
const source = sourcePages.flatMap(page => page.indices);
assert.equal(source.length, 12956);
assert.equal(sourcePages.length, 56);
assert.equal(sourcePages.find(page => page.page === 50).indices.length, 0);

/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const h = new Uint16Array(29);
  for (const value of seq) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    h[value]++;
  }
  return h.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}
const starts = new Map();
const local = [];
let pos = 0;
for (const page of sourcePages) {
  starts.set(page.page, pos);
  for (let j = 0; j < page.indices.length; j++) local.push(j);
  pos += page.indices.length;
}
assert.equal(pos, source.length);
const marks = ink.pages.filter(page => page.page <= 55)
  .flatMap(page => (page.large_punctuation || [])
    .filter(entry => entry[1] === 13)
    .map(entry => starts.get(page.page) + entry[0]))
  .sort((a, b) => a - b);
assert.equal(marks.length, 28);
assert.equal(marks[0], 13);

/**
 * A mark at original rune offset k stands between runes k-1 and k.
 * The post-mark rune therefore has dot-local sampling phase zero.
 * @returns {{book:number[],page:number[],dot:number[]}}
 */
function phases() {
  const result = {book: [], page: [], dot: []};
  let next = 0;
  let marker = 0;
  for (let i = 0; i < source.length; i++) {
    while (next < marks.length && marks[next] <= i) {
      marker = marks[next++];
    }
    result.book.push(i % 13);
    result.page.push(local[i] % 13);
    result.dot.push((i - marker) % 13);
  }
  return result;
}
/**
 * Preserve each phase's original physical order and exact rune positions.
 * @param {number[]} original
 * @param {number[]} phases
 * @returns {{positions:number[],values:number[]}[]}
 */
function split(original, phases) {
  const lanes = Array.from({length:13}, () => ({
    positions: [], values: []
  }));
  for (let i = 0; i < original.length; i++) {
    const lane = lanes[phases[i]];
    lane.positions.push(i);
    lane.values.push(original[i]);
  }
  assert.equal(lanes.reduce((sum, lane) => sum + lane.values.length, 0),
    original.length);
  return lanes;
}
const nativeTokens = [
  {s: 'ING', i: 21}, {s: 'IO', i: 27},
  ...corpus.translit.map((s, i) => ({s, i}))
].sort((a, b) => b.s.length - a.s.length);
/** @param {string} sourceText @returns {number[]} */
function encodeGP(sourceText) {
  const out = [];
  for (const chunk of sourceText.match(/[A-Za-z]+/g) || []) {
    const word = chunk.toUpperCase().replace(/QU/g, 'CW')
      .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
    for (let j = 0; j < word.length;) {
      const token = nativeTokens.find(t => word.startsWith(t.s, j));
      assert(token, 'unencodable native text ' + word);
      out.push(token.i);
      j += token.s.length;
    }
  }
  return out;
}
assert.deepEqual(encodeGP('THINGS'), [2, 21, 15]);
assert.deepEqual(encodeGP('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);
const controlPaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const refs = controlPaths.map(file => ({file, seq: encodeGP(read(file))}));
assert.deepEqual(refs.map(r => r.seq.length), [217106, 62492, 321327]);

/** @param {number[]} seq @param {number} length @returns {number} */
function nativeMinimum(seq, length) {
  let minimum = Infinity;
  for (let k = 0; k < 200; k++) {
    const start = Math.floor((seq.length - length) * k / 199);
    minimum = Math.min(minimum, ioc(seq.slice(start, start + length)));
  }
  return minimum;
}
const result = {};
for (const [clock, clockPhases] of Object.entries(phases())) {
  const lanes = split(source, clockPhases);
  const rows = lanes.map((lane, phase) => ({
    phase, length: lane.values.length, ioc: ioc(lane.values)
  }));
  const max = rows.reduce((best, row) => row.ioc > best.ioc ? row : best);
  const nativeMin = refs.map(ref => ({
    source: ref.file,
    ioc: Math.min(...lanes.map(lane =>
      nativeMinimum(ref.seq, lane.values.length)))
  }));
  // The tested model must reproduce native-English source-concentrated
  // letters even if their identities and positions are hidden.
  for (const control of nativeMin) {
    assert(max.ioc < control.ioc,
      'original decimated lane unexpectedly matches a native control');
  }
  // Source-native positive, in a one-of-thirteen carrier. A secret fixed
  // affine GP29 alphabet relabeling leaves its IoC unchanged.
  const synthetic = source.slice();
  const first = lanes[0];
  const plant = refs[0].seq.slice(0, first.values.length);
  for (let j = 0; j < plant.length; j++) {
    synthetic[first.positions[j]] = (11 * plant[j] + 7) % 29;
  }
  const recovered = split(synthetic, clockPhases)[0].values
    .map(c => ((c - 7 + 29) * 8) % 29);
  assert.deepEqual(recovered, plant);
  assert(Math.abs(ioc(recovered) - ioc(plant)) < 1e-15);
  assert(ioc(plant) > max.ioc);
  result[clock] = {maxOriginal: max, minOriginal:
    rows.reduce((worst, row) => row.ioc < worst.ioc ? row : worst),
    nativeMin, plantLength: plant.length, plantIoC: ioc(plant)};
}
assert(result.book.maxOriginal.ioc < 0.036);
assert(result.page.maxOriginal.ioc < 0.036);
assert(result.dot.maxOriginal.ioc < 0.036);
console.log(JSON.stringify({
  inputRunes: source.length, sourceThirteenDotMarkers: marks.length,
  testedCompleteLanes: 39, testedScopes: Object.keys(result),
  ...result,
  verdict: 'No source-visible 13-step lane is native-GP English under a fixed symbol permutation'
}, null, 2));
