'use strict';
/**
 * The original physical LP2 p51 scan (68.jpg) prints nine 8-token
 * numeric rows above a 20-word, 92-rune cipher passage.
 *
 * Source-led question: removing one edge rune from every printed word
 * leaves 72 runes, the size of the numeric panel printed on that page.
 * Is the same-page panel an exact symbol substitution or a directly
 * usable GP29 additive key for the 72 retained runes?
 *
 * This is a bounded cipher hypothesis, not a demonstrated Cicada instruction.
 * One-edge removal and the byte-to-GP29 projection remain conditional.
 * Windows Node.js 22 single-file test:
 *   node sims/lp2_p51_samepage72_wordedge_numeric_receiver_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const ids = new Map(corpus.runes.map((r, i) => [r, i]));
const sourceP51 = source.split('%')[50];
const words = sourceP51.replace(/[\r\n/]/g, '').split(/[-.&$§]/)
  .map(token => [...token].filter(r => ids.has(r)).map(r => ids.get(r)))
  .filter(word => word.length);
const original = corpus.pages.find(page => page.page === 51).indices;
assert.deepEqual(words.flat(), original);
assert.deepEqual(grid.pages.map(page => page.bytes.length), [80, 104, 72]);
assert.equal(original.length, 92);
assert.equal(words.length, 20);
assert.deepEqual(words.map(word => word.length),
  [3,6,5,5,3,4,3,3,8,3,8,1,3,7,4,8,3,8,4,3]);
const panel = grid.pages[2].bytes;
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const hist = Array(29).fill(0);
  for (const x of xs) hist[x]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}
/**
 * The exact best stationary unknown lookup byte -> rune, allowing any
 * non-injective mapping. Equal input bytes must give equal output runes.
 * @param {number[]} values
 * @param {number[]} output
 */
function byteLookupCapacity(values, output) {
  const groups = new Map();
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!groups.has(value)) groups.set(value, new Map());
    const h = groups.get(value);
    h.set(output[i], (h.get(output[i]) || 0) + 1);
  }
  let best = 0, repeatedPairs = 0, identicalOutputPairs = 0;
  for (const h of groups.values()) {
    best += Math.max(...h.values());
    const size = [...h.values()].reduce((s, n) => s + n, 0);
    repeatedPairs += size * (size - 1) / 2;
    identicalOutputPairs += [...h.values()]
      .reduce((s, n) => s + n * (n - 1) / 2, 0);
  }
  return {
    tableValueClasses: groups.size,
    bestPossibleExact: best,
    forcedErrors: values.length - best,
    repeatedInputPairs: repeatedPairs,
    matchingOutputPairs: identicalOutputPairs
  };
}

const native = corpus.pages.find(page => page.page === 57).indices;
assert.equal(native.length, 95);
assert.ok(ioc(native) > 0.06);
const report = {
  originalSource: {
    page: 51, printedNumericCells: panel.length,
    rowLength: 8, printedWords: words.length, ciphertextRunes: original.length,
    retainedAfterOneEdgePerWord: original.length - words.length,
    clearP57IoC: ioc(native)
  },
  tested: []
};

for (const cut of ['first', 'last']) {
  // The 1-rune word contributes no retained rune.
  const retained = words.flatMap(word =>
    cut === 'first' ? word.slice(1) : word.slice(0, -1));
  assert.equal(retained.length, 72);
  for (const orientation of ['printed', 'reverse']) {
    const bytes = orientation === 'printed' ? panel : panel.slice().reverse();
    const lookup = byteLookupCapacity(bytes, retained);
    assert.equal(lookup.repeatedInputPairs, 6);
    assert.equal(lookup.matchingOutputPairs, 0);
    assert.equal(lookup.bestPossibleExact, 66);
    const candidates = [];
    for (const sign of [-1, 1]) {
      const key = bytes.map(value => value % 29);
      const plain = retained.map((value, i) =>
        mod(value + sign * key[i]));
      // A source-native known 72-rune plaintext plant must roundtrip exactly.
      const plant = native.slice(0, 72).map((value, i) =>
        mod(value - sign * key[i]));
      assert.deepEqual(plant.map((value, i) =>
        mod(value + sign * key[i])), native.slice(0, 72));
      assert.deepEqual(plain.map((value, i) =>
        mod(value - sign * key[i])), retained);
      const fTransparentViolations = plain.filter((value, i) =>
        value === 0 && retained[i] !== 0).length;
      candidates.push({
        sign, ioc: ioc(plain),
        ECount: plain.filter(value => value === 18).length,
        fTransparentViolations,
        transliteration: plain.map(value => corpus.translit[value]).join('')
      });
    }
    report.tested.push({cut, orientation, byteLookup: lookup, candidates});
  }
}
assert(report.tested.every(x =>
  x.candidates.every(y => y.ioc < report.originalSource.clearP57IoC)));

// Any 9x8 -> 8x9 columnar transposition preserves the same GP histogram.
// So does every arbitrary one-to-one relabeling of the GP29 alphabet.
// The language comparison below is a control-based exclusion of those
// complete families, including arbitrary row/column readout orders.
const firstBody = words.flatMap(word => word.slice(1));
const lastBody = words.flatMap(word => word.slice(0, -1));
assert.equal(firstBody.length, 72);
assert.equal(lastBody.length, 72);
/** @param {number[]} values */
function columnRead(values) {
  assert.equal(values.length, 72);
  const result = [];
  for (let column = 0; column < 8; column++)
    for (let row = 0; row < 9; row++)
      result.push(values[row * 8 + column]);
  return result;
}
/** @param {number[]} values */
function undoColumnRead(values) {
  assert.equal(values.length, 72);
  const result = Array(72);
  let cursor = 0;
  for (let column = 0; column < 8; column++)
    for (let row = 0; row < 9; row++)
      result[row * 8 + column] = values[cursor++];
  return result;
}
const solvedPlant = native.slice(0, 72);
assert.deepEqual(undoColumnRead(columnRead(solvedPlant)), solvedPlant);
assert.deepEqual(undoColumnRead(columnRead(firstBody)), firstBody);
assert.equal(ioc(columnRead(firstBody)), ioc(firstBody));
assert.equal(ioc(columnRead(lastBody)), ioc(lastBody));

const lp1Lines = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split(/\r?\n/).filter(line =>
    line && !/^\s*(#|\[|\d)/.test(line));
const sourceNativeTokens = corpus.translit.map((token, i) =>
  ({token, i})).sort((a, b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function encodeEditorialGP(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[VKZQ]/g, char =>
      ({V: 'U', K: 'C', Z: 'S', Q: 'C'})[char]);
  const result = [];
  for (let offset = 0; offset < normalized.length;) {
    const hit = sourceNativeTokens.find(({token}) =>
      normalized.startsWith(token, offset));
    if (hit) { result.push(hit.i); offset += hit.token.length; }
    else offset++;
  }
  return result;
}
const lp1Control = encodeEditorialGP(lp1Lines.join(' '));
assert.equal(lp1Control.length, 3107);
const windowLength = 72;
let controls = 0, controlMin = 1, controlAtOrBelowFirst = 0,
  controlAtOrBelowLast = 0;
const firstIoC = ioc(firstBody), lastIoC = ioc(lastBody);
for (let start = 0; start + windowLength <= lp1Control.length; start++) {
  const value = ioc(lp1Control.slice(start, start + windowLength));
  controlMin = Math.min(controlMin, value);
  controls++;
  controlAtOrBelowFirst += Number(value <= firstIoC);
  controlAtOrBelowLast += Number(value <= lastIoC);
}
assert.equal(controls, 3036);
assert.equal(controlAtOrBelowFirst, 0);
assert.equal(controlAtOrBelowLast, 0);
assert.ok(Math.abs(controlMin - 0.045774647887323945) < 1e-14);
const solvedP57WindowMin = Math.min(...Array.from({length: 24}, (_, i) =>
  ioc(native.slice(i, i + 72))));
assert.ok(solvedP57WindowMin > firstIoC);
report.transpositionAndMonoalphabetInvariant = {
  retainedFirst72: {ioc: firstIoC, equalPairNumerator: firstIoC * 72 * 71},
  retainedLast72: {ioc: lastIoC, equalPairNumerator: lastIoC * 72 * 71},
  editorialGPSourceTokens: lp1Control.length,
  solvedControlWindows72: controls,
  solvedMinimumIoC: controlMin,
  solvedWindowAtOrBelowFirst: controlAtOrBelowFirst,
  solvedWindowAtOrBelowLast: controlAtOrBelowLast,
  solvedP57MinimumAcross24Windows: solvedP57WindowMin,
  conclusion: 'pure 9x8 transposition and arbitrary bijective GP29 renaming preserve too-flat original frequency profiles; this is a control-based rather than a universal English proof'
};
console.log(JSON.stringify(report, null, 2));
console.log('PASS: 72-cell same-page source gate, complete plant inverses; no unknown plaintext recovered.');
