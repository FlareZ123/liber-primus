'use strict';

/**
 * Independent shared-pad diagnostic for source-selected 308-rune strips.
 * Run: node sims/lp2_flank308_terminal308_sharedpad_delta_sft.cjs
 * Read-only, no external dependencies, no secret-key search.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p */
const load = p => fs.readFileSync(path.join(root, p), 'utf8');
const corp = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const page = n => corp.pages.find(p => p.page === n).indices;
const m = n => ((n % 29) + 29) % 29;
const pre = page(48).slice(199).concat(page(49).slice(0, 66));
const post = page(51).slice(0, 92).concat(page(52).slice(0, 78));
const A = pre.concat(post);
const B = page(54).concat(page(55));
assert.deepEqual([pre.length, post.length, A.length, B.length], [138, 170, 308, 308]);
assert.equal(corp.pages.filter(p => p.page <= 55).reduce((n, p) => n + p.indices.length, 0), 12956);
const difference = A.map((a, i) => m(a - B[i]));

const alphabet = new Map(corp.translit.map((s, i) => [s, i]));
const multi = new Set(['TH', 'NG', 'EO', 'OE', 'AE', 'EA', 'IA']);
/** @param {string} source English word or plain letters */
function encode(source) {
  const w = source.toUpperCase().replace(/QU/g, 'CW').replace(/ING/g, 'NG')
    .replace(/K/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < w.length;) {
    const pair = w.slice(i, i + 2);
    if (multi.has(pair)) {
      out.push(alphabet.get(pair));
      i += 2;
    } else {
      const rune = alphabet.get(w[i]);
      if (rune === undefined) return null;
      out.push(rune);
      i++;
    }
  }
  return out;
}

const histogram = Array(29).fill(0);
let dictionaryTypes = 0;
for (const line of load('resources/control/english_wordfreq_textblob.txt').split('\n')) {
  const fields = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!fields) continue;
  const code = encode(fields[1]);
  if (!code) continue;
  const weight = Number(fields[2]);
  for (const letter of code) histogram[letter] += weight;
  dictionaryTypes++;
}
const total = histogram.reduce((a, b) => a + b, 0);
const p = histogram.map(x => x / total);
/* If the two plaintext registers independently resemble native-GP English,
 * a shared additive GP29 pad cancels and their difference has distribution q. */
const q = Array.from({ length: 29 }, (_, d) =>
  p.reduce((s, v, x) => s + v * p[m(x - d)], 0)
);
/** @param {number[]} d */
const llr = d => d.reduce((s, v) => s + Math.log(29 * q[v]), 0);
const actual = llr(difference);
assert.equal(dictionaryTypes, 29154);
assert.equal(total, 4809810);
assert.ok(Math.abs(actual - (-9.404449199555213)) < 1e-8);

const reference = encode(load('resources/control/shakespeare_first300k.txt').replace(/[^a-zA-Z]/g, ''));
assert.equal(reference.length, 215695);
const controls = [];
for (let x = 0; x < 150; x++) {
  const i = (x * 797) % (reference.length - 320);
  const j = (x * 1049 + 40000) % (reference.length - 320);
  const a = reference.slice(i, i + 308);
  const b = reference.slice(j, j + 308);
  controls.push(llr(a.map((v, k) => m(v - b[k]))));
}
controls.sort((a, b) => a - b);
assert.ok(Math.abs(controls[0] - (-4.516777305591676)) < 1e-8);
assert.equal(controls.filter(x => x <= actual).length, 0);

/* Two independently authored GP-native source controls. These retain the
 * same frozen TextBlob q and the same 308-long candidate register. */
const otherControls = {};
for (const [name, file, expectedLength, expectedMin] of [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 62126, -3.936878253681968],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 319372, -4.663701753643794],
]) {
  const runes = encode(load(file).replace(/[^a-zA-Z]/g, ''));
  assert.equal(runes.length, expectedLength);
  const scores = [];
  for (let i = 0; i < 120; i++) {
    const a = (i * 293) % (runes.length - 320);
    const b = (i * 557 + 10000) % (runes.length - 320);
    scores.push(llr(runes.slice(a, a + 308).map(
      (v, j) => m(v - runes[b + j])
    )));
  }
  scores.sort((a, b) => a - b);
  assert.ok(Math.abs(scores[0] - expectedMin) < 1e-8);
  assert.equal(scores.filter(v => v <= actual).length, 0);
  otherControls[name] = {
    sourceRunes: runes.length,
    min: scores[0],
    median: scores[60],
    atOrBelowActual: 0,
  };
}

/* Real-source English plant under the same arbitrary 308-position additive pad:
 * pad cancellation and full inverse both work, regardless of a secret pad. */
const PA = reference.slice(2500, 2808);
const PB = reference.slice(5000, 5308);
const K = PA.map((_, i) => m(i * i + 19 * i + 7));
const CA = PA.map((v, i) => m(v + K[i]));
const CB = PB.map((v, i) => m(v + K[i]));
assert.deepEqual(CA.map((v, i) => m(v - CB[i])), PA.map((v, i) => m(v - PB[i])));
assert.deepEqual(CA.map((v, i) => m(v - K[i])), PA);
assert.deepEqual(CB.map((v, i) => m(v - K[i])), PB);

console.log(JSON.stringify({
  input: { tableFlank: A.length, terminal: B.length, before: pre.length,
    after: post.length, vocabularyTypes: dictionaryTypes },
  actualLogLikelihoodRatio: actual,
  genuineEnglishControlMin: controls[0],
  genuineEnglishControlMedian: controls[75],
  controlReplicatesAtOrBelowActual: 0,
  independentAuthorControls: otherControls,
  sourceNativeSharedPadPlantRoundtrip: '308/308 in each stream',
  status: 'No native-GP plaintext or key recovered; ordinary shared-pad interpretation disfavored.'
}, null, 2));
