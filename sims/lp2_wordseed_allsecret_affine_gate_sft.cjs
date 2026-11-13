'use strict';
/**
 * Word-first-cipher-rune keyed GP29 affine-feedback and all-secret alphabet
 * exclusion. Source-visible word first rune s selects independent, wholly
 * unknown slope a_s and alphabet permutation h_s:
 * C[w,j] = a_s*C[w,j-1] + h_s(P[w,j]) (mod 29), j>=1.
 *
 * All 29^29 slope combinations and (29!)^29 alphabet combinations are covered
 * analytically by sorted histograms, with real word lengths and rune positions.
 * Run: node sims/lp2_wordseed_allsecret_affine_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')
  .replace(/\r\n/g, '\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const runeIndex = new Map(gp.runes.map((x, i) => [x, i]));
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const original = [...source.matchAll(runePattern)]
  .map(m => [...m[0]].map(x => runeIndex.get(x)));
assert.equal(original.length, 2896);
assert.equal(original.reduce((n, x) => n + x.length, 0), 12956);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} value @returns {number[]} */
function native(value) {
  const s = value.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const t = tokens.find(x => s.startsWith(x.s, i));
      assert(t, 'unknown native spelling: ' + s);
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
const references = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
].flatMap(file => (read(file).match(/[A-Za-z]+/g) || []).map(native));
assert.equal(references.length, 149072);
const bins = new Map();
for (const w of references) {
  if (!bins.has(w.length)) bins.set(w.length, []);
  bins.get(w.length).push(w);
}
const positionPrior = new Map();
for (const [length, bin] of bins) {
  const pos = Array.from({length}, () => Array(29).fill(0));
  for (const word of bin)
    for (let j = 1; j < length; j++) pos[j][word[j]]++;
  for (let j = 1; j < length; j++)
    for (let k = 0; k < 29; k++) pos[j][k] /= bin.length;
  positionPrior.set(length, pos);
}
/** @returns {number[][]} */
const histogram = () => Array.from({length: 29}, () => Array(29).fill(0));
/** @param {number[]} a @param {number[]} b @returns {number} */
function rankTV(a, b) {
  const na = a.reduce((s, x) => s + x, 0);
  const nb = b.reduce((s, x) => s + x, 0);
  assert(na > 0 && nb > 0);
  const x = a.map(v => v / na).sort((p, q) => q - p);
  const y = b.map(v => v / nb).sort((p, q) => q - p);
  return x.reduce((n, v, i) => n + Math.abs(v - y[i]), 0) / 2;
}
const expected = histogram();
const candidates = Array.from({length: 29}, () => histogram());
const planted = histogram();
const assignment = new Map();
let pairs = 0;
let recovered = 0;

for (const w of original) {
  const seed = w[0];
  const length = w.length;
  const model = positionPrior.get(length);
  assert(model, 'missing reference length: ' + length);
  for (let j = 1; j < length; j++) {
    const prev = w[j - 1], now = w[j];
    for (let a = 0; a < 29; a++) {
      const delta = (now - a * prev + 29 * 29) % 29;
      candidates[seed][a][delta]++;
    }
    for (let k = 0; k < 29; k++) expected[seed][k] += model[j][k];
    pairs++;
  }

  // Plant original-length native English with independent hidden settings
  // for every printed first-cipher rune, including arbitrary word initials.
  const counterKey = seed + ':' + length;
  const occurrence = assignment.get(counterKey) || 0;
  assignment.set(counterKey, occurrence + 1);
  const bin = bins.get(length);
  const nativeWord = bin[(occurrence * 17 + seed * 11 + length * 13) % bin.length];
  const slope = (seed * 7 + 3) % 29;
  const permutation = Array.from({length: 29}, (_, p) => (p ** 5 + 7 * seed + 3) % 29);
  assert.equal(new Set(permutation).size, 29);
  const inverse = Array(29);
  permutation.forEach((x, p) => { inverse[x] = p; });
  let previous = seed;
  for (let j = 1; j < length; j++) {
    const next = (slope * previous + permutation[nativeWord[j]]) % 29;
    const delta = (next - slope * previous + 29 * 29) % 29;
    assert.equal(inverse[delta], nativeWord[j]);
    planted[seed][delta]++;
    previous = next;
    recovered++;
  }
}
assert.equal(pairs, 10060);
assert.equal(recovered, 10060);
const best = candidates.map((models, seed) => models
  .map((h, slope) => ({slope, rankTV: rankTV(expected[seed], h)}))
  .sort((x, y) => x.rankTV - y.rankTV)[0]);
const plantTV = planted.map((h, seed) => rankTV(expected[seed], h));
const lowest = Math.min(...best.map(x => x.rankTV));
const highest = Math.max(...best.map(x => x.rankTV));
const mean = best.reduce((n, x) => n + x.rankTV, 0) / 29;
const maxPlant = Math.max(...plantTV);
assert(lowest > 0.2531 && lowest < 0.2533);
assert(mean > 0.282 && mean < 0.283);
assert(highest < 0.305);
assert(maxPlant < 0.085);
console.log(JSON.stringify({
  status: 'PASS',
  originalRunes: 12956, originalWords: 2896, nativeReferenceWords: references.length,
  testedWithinWordPairs: pairs,
  alphabetChoicesPerSeed: '29! (permutation invariant, no enumeration)',
  slopeChoicesPerSeed: 29, seedGroups: 29,
  trueNativeEnglishPlantRecovered: recovered,
  originalBestRankTV: {minimum: lowest, mean, maximum: highest},
  plantRankTV: {minimum: Math.min(...plantTV), maximum: maxPlant},
  groupBestSlopes: best.map((x, s) => ({
    seed: gp.translit[s], slope: x.slope, rankTV: +x.rankTV.toFixed(6)
  })),
  verdict: 'original-source fixed-seed per-word affine-feedback family incompatible with length- and position-matched English'
}, null, 2));
