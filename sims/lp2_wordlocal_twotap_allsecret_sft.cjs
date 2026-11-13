'use strict';

/**
 * Source-exact LP2 word-local second-order affine feedback gate.
 *
 * For j>=2 in each printed word, C[j] = a*C[j-1] + b*C[j-2] + h(P[j])
 * (mod 29), with completely free two-symbol starting state per word.
 * Exhaust all 29^2 coefficients, eliminate all 29! possible stationary
 * secret rune substitutions h via optimally sorted histograms.
 * Repeat with independently secret a, b and h in each visible chapter.
 *
 * Node.js 20+, CommonJS, read-only offline SFT:
 * node sims/lp2_wordlocal_twotap_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8')
    .replace(/\r\n/g, '\n');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const toIndex = new Map(gp.runes.map((r, i) => [r, i]));
const runic = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const words = [...source.matchAll(runic)]
  .map(m => [...m[0]].map(r => toIndex.get(r)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} value @returns {number[]} */
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
      const t = tokens.find(v => s.startsWith(v.s, i));
      assert(t, 'Unmapped GP word spelling ' + s);
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
].flatMap(file => (read(file).match(/[A-Za-z]+/g) || []).map(native));
assert.equal(controls.length, 149072);

const bins = new Map();
for (const w of controls) {
  if (!bins.has(w.length)) bins.set(w.length, []);
  bins.get(w.length).push(w);
}
const positionPrior = new Map();
for (const [length, group] of bins) {
  const positions = Array.from({length}, () => new Float64Array(29));
  for (const w of group)
    for (let j = 2; j < length; j++) positions[j][w[j]]++;
  for (const hist of positions)
    for (let k = 0; k < 29; k++) hist[k] /= group.length;
  positionPrior.set(length, positions);
}

/**
 * The rearrangement inequality gives the optimal relabelling of both
 * 29-symbol frequency spectra under an entirely unrestricted h.
 * @param {ArrayLike<number>} x
 * @param {ArrayLike<number>} y
 */
function rankTV(x, y) {
  const totalX = Array.from(x).reduce((s, v) => s + v, 0);
  const totalY = Array.from(y).reduce((s, v) => s + v, 0);
  const sortedX = Array.from(x, v => v / totalX).sort((a, b) => b - a);
  const sortedY = Array.from(y, v => v / totalY).sort((a, b) => b - a);
  return sortedX.reduce((sum, v, i) =>
    sum + Math.abs(v - sortedY[i]), 0) / 2;
}

const ends = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
/** @param {number} offset @returns {number} */
const chapterFor = offset => ends.findIndex(end => offset < end);
const chapterExpected = Array.from({length: 9}, () =>
  new Float64Array(29));
const chapterHistograms = Array.from({length: 9}, () =>
  Array.from({length: 841}, () => new Uint16Array(29)));
const chapterPairs = Array(9).fill(0);
let offset = 0;
for (const w of words) {
  const prior = positionPrior.get(w.length);
  assert(prior, 'No native English control of original word length');
  for (let j = 2; j < w.length; j++) {
    const chapter = chapterFor(offset + j);
    assert.equal(chapterFor(offset + j - 1), chapter);
    chapterPairs[chapter]++;
    for (let k = 0; k < 29; k++)
      chapterExpected[chapter][k] += prior[j][k];
    for (let a = 0; a < 29; a++) {
      for (let b = 0; b < 29; b++) {
        const delta = (w[j] - a * w[j - 1] -
          b * w[j - 2] + 29 * 900) % 29;
        chapterHistograms[chapter][a * 29 + b][delta]++;
      }
    }
  }
  offset += w.length;
}
assert.equal(offset, 12956);
assert.deepEqual(chapterPairs, [418,643,974,1047,578,793,933,1683,178]);
assert.equal(chapterPairs.reduce((s,n) => s+n, 0), 7247);

const expected = new Float64Array(29);
for (const e of chapterExpected)
  for (let i = 0; i < 29; i++) expected[i] += e[i];
const rank = [];
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
  const counts = new Uint16Array(29);
  for (const chapter of chapterHistograms)
    for (let j = 0; j < 29; j++)
      counts[j] += chapter[a * 29 + b][j];
  rank.push({a,b,TV:rankTV(expected, counts)});
}
rank.sort((x, y) => x.TV - y.TV);
assert.deepEqual([rank[0].a, rank[0].b], [1, 0]);
assert(Math.abs(rank[0].TV - 0.38452814248344547) < 1e-9);
assert.deepEqual([rank[1].a, rank[1].b], [23, 25]);
assert(Math.abs(rank[1].TV - 0.3865979644787537) < 1e-9);

const chapterResults = chapterExpected.map((e, chapter) => {
  const sorted = chapterHistograms[chapter]
    .map((hist, index) => ({a: Math.floor(index / 29),
      b: index % 29, TV: rankTV(e, hist)}))
    .sort((x, y) => x.TV - y.TV);
  return {chapter, pairCount: chapterPairs[chapter], best: sorted[0]};
});
const expectedChapterTV = [
  0.27158995427064764, 0.3010979442439434,
  0.31813301097283464, 0.3287256883905733,
  0.2982934377988077, 0.3148295863269483,
  0.32005213303301067, 0.34148533979204865,
  0.1972788209498623
];
for (let ch = 0; ch < 9; ch++)
  assert(Math.abs(chapterResults[ch].best.TV -
    expectedChapterTV[ch]) < 1e-9);

// Nonlinear secret alphabet positive control; coefficients (23,13) lie
// within the complete 841-member scan. Two first cipher symbols of
// every printed word are independently chosen and are not tested.
const h = Array.from({length: 29}, (_, p) => (p ** 5 + 7) % 29);
assert.equal(new Set(h).size, 29);
const invH = new Map(h.map((value, index) => [value, index]));
const plantedPlain = new Uint16Array(29);
const plantedResidual = new Uint16Array(29);
let recovered = 0;
for (let i = 0; i < words.length; i++) {
  const length = words[i].length;
  const group = bins.get(length);
  const p = group[(i * 17 + length * 13) % group.length];
  const c = [(i * 17 + length * 13) % 29, (i * 11 + 7) % 29];
  for (let j = 2; j < length; j++) {
    const cipher = (23 * c[j - 1] + 13 * c[j - 2] + h[p[j]]) % 29;
    c.push(cipher);
    const d = (cipher - 23 * c[j - 1] -
      13 * c[j - 2] + 29 * 900) % 29;
    assert.equal(invH.get(d), p[j]);
    plantedPlain[p[j]]++;
    plantedResidual[d]++;
    recovered++;
  }
}
assert.equal(recovered, 7247);
assert.equal(rankTV(plantedPlain, plantedResidual), 0);
assert(rankTV(plantedPlain, expected) < 0.05);

console.log(JSON.stringify({
  status: 'PASS',
  originalRunes: 12956, originalWords: words.length,
  withinWordSecondOrderPairs: 7247,
  hiddenSlopesTested: 841, arbitrarySecretAlphabets: 'all 29!',
  allBookBest: rank[0], allBookRunner: rank[1],
  visualChapterResults: chapterResults,
  positive: {sourceNativeRunesRecovered: recovered,
    exactRankTV: rankTV(plantedPlain, plantedResidual),
    finiteEnglishControlTV: rankTV(plantedPlain, expected)}
}, null, 2));
