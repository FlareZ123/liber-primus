'use strict';

/**
 * Source-original word-local affine-feedback family, with every stationary
 * secret GP29 permutation and all 29 feedback slopes handled without
 * enumerating 29! secret keys.
 *
 * Run directly: node sims/lp2_wordlocal_affine_allsecret_sft.cjs
 * Node.js 20+; offline, deterministic, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const runeRx = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const words = [...source.matchAll(runeRx)]
  .map(m => [...m[0]].map(r => runeToIndex.get(r)));
const nRune = words.reduce((n, w) => n + w.length, 0);
assert.equal(words.length, 2896);
assert.equal(nRune, 12956);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Reproduces solved-LP1 and p57 source spelling of ING and IO.
 * @param {string} value @returns {number[]}
 */
function native(value) {
  const s = value.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      output.push(21);
      i += 3;
    } else if (s.startsWith('IO', i)) {
      output.push(27);
      i += 2;
    } else {
      const t = tokens.find(x => s.startsWith(x.s, i));
      assert(t, 'unmapped source-native spelling: ' + s);
      output.push(t.i);
      i += t.s.length;
    }
  }
  return output;
}
const controls = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
].flatMap(name => (read(name).match(/[A-Za-z]+/g) || []).map(native));
assert.equal(controls.length, 149072);

const bins = new Map();
for (const w of controls) {
  if (!bins.has(w.length)) bins.set(w.length, []);
  bins.get(w.length).push(w);
}

/**
 * For each word length L and j=1..L-1, expected GP29 plaintext
 * probabilities at position j, conditional on the printed word length.
 * @type {Map<number, number[][]>}
 */
const prior = new Map();
for (const [length, group] of bins) {
  const positions = Array.from({length}, () => Array(29).fill(0));
  for (const w of group)
    for (let j = 1; j < length; j++) positions[j][w[j]]++;
  for (let j = 1; j < length; j++)
    for (let x = 0; x < 29; x++) positions[j][x] /= group.length;
  prior.set(length, positions);
}

/** @param {number[]} x @param {number[]} y @returns {number} */
function rankTV(x, y) {
  const sx = x.reduce((a, b) => a + b, 0);
  const sy = y.reduce((a, b) => a + b, 0);
  const a = x.map(v => v / sx).sort((p, q) => q - p);
  const b = y.map(v => v / sy).sort((p, q) => q - p);
  return a.reduce((n, v, i) => n + Math.abs(v - b[i]), 0) / 2;
}

const cuts = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
/** @param {number} x @returns {number} */
const chapterAt = x => cuts.findIndex(end => x < end);
const expected = Array(29).fill(0);
const observed = Array.from({length: 29}, () => Array(29).fill(0));
const chapterExpected = Array.from({length: 9}, () => Array(29).fill(0));
const chapterObserved = Array.from({length: 9}, () =>
  Array.from({length: 29}, () => Array(29).fill(0)));
const chapterPairs = Array(9).fill(0);
let index = 0;
let internalPairs = 0;
for (const w of words) {
  const positionModel = prior.get(w.length);
  assert(positionModel, 'control has no matched word length');
  for (let j = 1; j < w.length; j++) {
    const chapter = chapterAt(index + j);
    assert.equal(chapterAt(index + j - 1), chapter,
      'visual chapter cut inside printed word');
    internalPairs++;
    chapterPairs[chapter]++;
    for (let k = 0; k < 29; k++) {
      const p = positionModel[j][k];
      expected[k] += p;
      chapterExpected[chapter][k] += p;
    }
    for (let a = 0; a < 29; a++) {
      const delta = (w[j] - a * w[j - 1] + 29 * 30) % 29;
      observed[a][delta]++;
      chapterObserved[chapter][a][delta]++;
    }
  }
  index += w.length;
}
assert.equal(index, 12956);
assert.equal(internalPairs, 10060);
const rank = observed.map((hist, a) => ({a, tv: rankTV(expected, hist)}))
  .sort((p, q) => p.tv - q.tv);
assert.equal(rank[0].a, 1);
assert(Math.abs(rank[0].tv - 0.3925475698705316) < 1e-9);

const chapterRank = chapterExpected.map((model, chapter) =>
  chapterObserved[chapter]
    .map((counts, a) => ({a, tv: rankTV(model, counts)}))
    .sort((p, q) => p.tv - q.tv)[0]);
assert(chapterRank.every(item => item.tv > 0.23));

// Nonlinear, bijective alphabet h, with freely secret first-cipher rune
// in each printed word and slope a=1. Check the full secret decoder on
// every within-word native-English position, not just frequency scores.
const h = Array.from({length: 29}, (_, p) => ((p ** 5) + 7) % 29);
assert.equal(new Set(h).size, 29);
const inverse = Array(29);
h.forEach((value, p) => { inverse[value] = p; });
let recovered = 0;
const expectedPlant = Array(29).fill(0);
const observedPlant = Array(29).fill(0);
for (let i = 0; i < words.length; i++) {
  const length = words[i].length;
  const group = bins.get(length);
  const plain = group[(i * 17 + length * 13) % group.length];
  let previous = (i * 17 + length * 13) % 29;
  for (let j = 1; j < length; j++) {
    const cipher = (previous + h[plain[j]]) % 29;
    const delta = (cipher - previous + 29) % 29;
    assert.equal(inverse[delta], plain[j]);
    expectedPlant[plain[j]]++;
    observedPlant[delta]++;
    recovered++;
    previous = cipher;
  }
}
assert.equal(recovered, 10060);
assert.equal(rankTV(expectedPlant, observedPlant), 0);
assert(rankTV(expected, expectedPlant) < 0.05);

console.log(JSON.stringify({
  status: 'PASS',
  sourceRunes: nRune,
  sourceWords: words.length,
  testedWithinWordPairs: internalPairs,
  fullBookBest: rank[0],
  fullBookSecond: rank[1],
  visualChapterPairs: chapterPairs,
  bestIndependentChapterSlope: chapterRank,
  nonlinearSecretPlantRecovered: recovered,
  nonlinearSecretPlantRankTV: rankTV(expectedPlant, observedPlant)
}, null, 2));
