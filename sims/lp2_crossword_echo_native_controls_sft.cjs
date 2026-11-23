'use strict';

/**
 * Original LP2 word-edge: native GP text controls vs a simple source-shaped
 * continuous 29-state constrained emitter with exactly 86 repeat exceptions.
 * This isolates a concrete causal path for the real word-edge anomaly.
 *
 * Windows 11 Node22 / CommonJS. Read-only; no external packages.
 * Source corpus is verified page-by-page before any statistics are calculated.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const BASE = path.join(__dirname, '..', 'resources');
const read = name => fs.readFileSync(path.join(BASE, name), 'utf8');
const original = JSON.parse(read('liber-primus/lp2-corpus.json'));
const sourceParts = read('liber-primus/lp2-transcription.txt').split('%');
const alphabet = original.runes;
const runeSet = new Set(alphabet);
/** @type {number[][][]} */
const pages = [];
for (let p = 0; p < 56; p++) {
  if (p === 50) continue; // original numeric-only physical page
  const source = sourceParts[p < 50 ? p : p - 1];
  const words = source.replace(/[\s/0-9&$]/g, '')
    .split(/[-.]/)
    .map(piece => [...piece].filter(ch => runeSet.has(ch))
      .map(ch => alphabet.indexOf(ch)))
    .filter(word => word.length);
  assert.deepEqual(words.flat(), original.pages[p].indices,
    'canonical original-source equality physical p' + p);
  pages.push(words);
}
assert.equal(pages.length, 55);
const lengths = pages.map(page => page.map(word => word.length));
const pageSize = lengths.map(page => page.length);
const unitCount = pageSize.reduce((s, v) => s + v, 0);
const totalRunes = pages.reduce((s, page) =>
  s + page.reduce((x, word) => x + word.length, 0), 0);
const adjacencyCount = totalRunes - pages.length;
assert.equal(unitCount, 2928);
assert.equal(totalRunes, 12956);
assert.equal(adjacencyCount, 12901);

/**
 * Freeze all original page, word-length and initial-rune positions.
 * Expected boundary echoes are exact under independent word permutations
 * within each (page,length,first rune) group. No simulation here.
 *
 * @param {number[][][]} groups
 */
function boundaryStatistics(groups) {
  let observed = 0;
  let expectation = 0;
  let classes = 0;
  let boundaries = 0;
  for (const words of groups) {
    /** @type {Map<string,number[]>} */
    const byType = new Map();
    boundaries += words.length - 1;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const type = word.length + ':' + word[0];
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type).push(i);
      if (i > 0) observed += Number(words[i - 1].at(-1) === word[0]);
    }
    classes += byType.size;
    for (const slots of byType.values()) {
      /** @type {Map<number,number>} */
      const ends = new Map();
      /** @type {Map<number,number>} */
      const targetStarts = new Map();
      for (const i of slots) {
        const last = words[i].at(-1);
        ends.set(last, (ends.get(last) || 0) + 1);
        if (i + 1 < words.length) {
          const start = words[i + 1][0];
          targetStarts.set(start, (targetStarts.get(start) || 0) + 1);
        }
      }
      for (const [start, n] of targetStarts) {
        expectation += n * (ends.get(start) || 0) / slots.length;
      }
    }
  }
  return { observed, expectation, ratio: observed / expectation,
    classes, boundaries };
}
const actual = boundaryStatistics(pages);
assert.equal(actual.observed, 23);
assert.equal(actual.boundaries, 2873);
assert.equal(actual.classes, 2567);
assert(Math.abs(actual.expectation - 35.66666666666667) < 1e-10);

// Source-native GP29 Latin script, with its whole printed words preserved.
// Nothing is translated with an approximate English->rune adapter.
const latin = read('control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/)
  .filter(word => /^[0-9A-S]+$/.test(word))
  .map(word => [...word].map(ch => parseInt(ch, 29)));
assert.equal(latin.length, 39835);
const stride = Math.floor((latin.length - unitCount) / 12);
const nativeControls = [];
for (let offset = 0; offset + unitCount <= latin.length;
  offset += stride) {
  let position = offset;
  const nativePages = pageSize.map(n => {
    const words = latin.slice(position, position + n);
    position += n;
    return words;
  });
  nativeControls.push({ startWord: offset, ...boundaryStatistics(nativePages) });
  if (nativeControls.length >= 13) break;
}
assert.equal(nativeControls.length, 13);
assert(nativeControls.every(test => test.ratio > actual.ratio),
  'native GP reader-text control now resembles the unknown cipher');

// Secondary English-language controls are deliberately labelled approximate:
// derive native-GP rune *spelling* from Latin letters by the already used
// repository policy V=>U K/Q=>C Z=>S J=>I and greedy GP digraphs. This retains
// every original whole English word and its adjacent-word ordering but is
// not an image-authenticated English->GP transcription.
const romanValues = new Map(original.translit.map((label, i) => [label, i]));
const digraphs = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
/**
 * @param {string} english
 * @returns {number[]}
 */
function approximateEnglishGP(english) {
  const word = english.replace(/[KQ]/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/J/g, 'I');
  const out = [];
  for (let i = 0; i < word.length;) {
    const token = digraphs.find(seq => word.startsWith(seq, i)) || word[i];
    const label = token === 'ING' ? 'NG' : token;
    const rune = romanValues.get(label);
    assert(rune !== undefined, 'unrepresented native GP letter: ' + label);
    out.push(rune);
    i += token.length;
  }
  return out;
}

const gibranFull = read('control/gibran_prophet_58585.txt');
const gibran = gibranFull.slice(gibranFull.indexOf('Almustafa'),
  gibranFull.indexOf('*** END OF THIS PROJECT GUTENBERG EBOOK'));
const englishSource = [
  ['Gibran / The Prophet', gibran],
  ['Shakespeare / first 300k', read('control/shakespeare_first300k.txt')],
  ['Emerson / Essays', read('control/emerson_essays_2944.txt')]
];
const englishControls = [];
for (const [name, text] of englishSource) {
  const words = (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(approximateEnglishGP);
  const numberOfNonoverlappingWindows = Math.floor(words.length / unitCount);
  assert(numberOfNonoverlappingWindows >= 2);
  const spacing = Math.floor((words.length - unitCount) /
    (numberOfNonoverlappingWindows - 1));
  const controls = [];
  for (let offset = 0; offset + unitCount <= words.length;
    offset += spacing) {
    let position = offset;
    const shaped = pageSize.map(count => {
      const part = words.slice(position, position + count);
      position += count;
      return part;
    });
    controls.push({ startWord: offset, ...boundaryStatistics(shaped) });
    if (controls.length >= 10) break;
  }
  englishControls.push({
    text: name,
    sourceWordCount: words.length,
    comparisonWindows: controls,
    minimumRatio: Math.min(...controls.map(x => x.ratio)),
    maximumRatio: Math.max(...controls.map(x => x.ratio))
  });
}
assert(englishControls.every(text => text.minimumRatio > actual.ratio),
  'an English-source word-order control matched the LP2 edge constraint');

// Independent concrete source-shaped constrained generator:
// 55 physical page lengths and the complete authentic *word-length slots*
// are fixed, exactly 86 of the 12,901 eligible same-page rune transitions are
// chosen as repeats, and every other transition is a uniform nonzero
// increment mod 29. This is an explicit possible encoder *architecture*,
// NOT an authentic plaintext encoder / source-selected Cicada algorithm.
// Seed is frozen and each model output independently recomputes word-class
// expectation from its own authentic-layout first runes.
let seed = 0x6c1433ac;
function rnd(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}
const TRIALS = 1000;
let nAtMostOriginal = 0;
let nObservedGE = 0;
let sumEchoes = 0;
let sumExpectation = 0;
let sumRatio = 0;
let sumSqRatio = 0;
let minRatio = Infinity;
let maxRatio = -Infinity;
for (let trial = 0; trial < TRIALS; trial++) {
  // Floyd's algorithm samples 86 distinct transition slots without
  // replacement, using only a size-86 set.
  const exceptional = new Set();
  for (let k = adjacencyCount - 86; k < adjacencyCount; k++) {
    const choice = rnd(k + 1);
    exceptional.add(exceptional.has(choice) ? k : choice);
  }
  assert.equal(exceptional.size, 86);
  /** @type {number[][][]} */
  const emitted = [];
  let position = 0;
  let seenEchoes = 0;
  for (const sourcePage of lengths) {
    let prior = rnd(29);
    const emittedPage = [];
    for (const size of sourcePage) {
      const word = [];
      for (let index = 0; index < size; index++) {
        if (emittedPage.length === 0 && index === 0) {
          word.push(prior);
          continue;
        }
        if (exceptional.has(position)) {
          seenEchoes++;
        } else {
          prior = (prior + 1 + rnd(28)) % 29;
        }
        word.push(prior);
        position++;
      }
      emittedPage.push(word);
    }
    emitted.push(emittedPage);
  }
  assert.equal(position, adjacencyCount);
  assert.equal(seenEchoes, 86);
  const estimate = boundaryStatistics(emitted);
  if (estimate.ratio <= actual.ratio) nAtMostOriginal++;
  if (estimate.observed >= actual.observed) nObservedGE++;
  sumEchoes += estimate.observed;
  sumExpectation += estimate.expectation;
  sumRatio += estimate.ratio;
  sumSqRatio += estimate.ratio ** 2;
  minRatio = Math.min(minRatio, estimate.ratio);
  maxRatio = Math.max(maxRatio, estimate.ratio);
}
const mean = sumRatio / TRIALS;
const model = {
  trials: TRIALS,
  exactExceptionalTransitionsPerTrial: 86,
  meanBoundaryEchoes: sumEchoes / TRIALS,
  meanClassConditionalExpectation: sumExpectation / TRIALS,
  meanObservedOverExpected: mean,
  sdObservedOverExpected:
    Math.sqrt(sumSqRatio / TRIALS - mean ** 2),
  ratioRange: [minRatio, maxRatio],
  trialsWithRatioAtMostOriginal: nAtMostOriginal,
  trialsWithBoundaryEchoesAtLeastOriginal: nObservedGE
};
assert.equal(nAtMostOriginal, 424);
assert(Math.abs(mean - 0.6607370156746467) < 1e-10);
console.log(JSON.stringify({
  status: 'PASS',
  scope: '55 authentic rune-bearing LP2 original physical pages, 2928 page units, 12956 runes',
  sourceOriginal: actual,
  nativeGPLatinControls: nativeControls,
  approximateGPTextControls: englishControls,
  nativeGPControlRatios: {
    minimum: Math.min(...nativeControls.map(x => x.ratio)),
    maximum: Math.max(...nativeControls.map(x => x.ratio))
  },
  constrainedEmitterModel: model,
  classification: 'source-conditioned mechanism comparison; NO plaintext, external key, confirmed author encoder or cipher inverse'
}, null, 2));
