'use strict';

/**
 * Original LP2: blind complete-key test of a stationary affine GF(29) Hill
 * matrix for each printed word length L=2,3,4. Windows 11 / Node.js 22 SFT.
 *
 * No unknown original plaintext is claimed. The full unknown matrix and
 * constant bias are eliminated algebraically by the projective row spectrum.
 *
 * Run from repository root: node sims/lp2_wordlength_hill_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const parser = parseSharedCorpus();
const runeIndex = new Map(corpus.runes.map((s, i) => [s, i]));
const sourceWords = parser.words.map(w =>
  Array.from(w.runes, r => {
    assert.ok(runeIndex.has(r), 'Unexpected source glyph');
    return runeIndex.get(r);
  }));
assert.equal(parser.runeCount, 12956);
assert.equal(sourceWords.length, 2896);
assert.deepEqual([2, 3, 4].map(n => sourceWords.filter(w => w.length === n).length),
  [448, 720, 513]);

const gpTokens = corpus.translit.map((s, i) => [s, i])
  .sort((a, b) => b[0].length - a[0].length);
/**
 * Encode an independent reference word into the original 29 GP identities.
 * @param {string} word
 * @returns {number[] | null}
 */
function toGP(word) {
  const latin = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < latin.length;) {
    const entry = gpTokens.find(([s]) => latin.startsWith(s, i));
    if (!entry) return null;
    out.push(entry[1]);
    i += entry[0].length;
  }
  return out;
}
const shakespeare = (read('resources/control/shakespeare_first300k.txt')
  .match(/[A-Za-z]+/g) || []).map(toGP).filter(Boolean);

/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;

/**
 * Directional, scalar- and additive-shift-invariant histogram contrast.
 * D=0 for exact uniform counts, and D=28 for a single-valued projection.
 * @param {number[][]} blockWords
 * @param {number[]} row
 * @returns {number}
 */
function contrast(blockWords, row) {
  const hist = new Int32Array(29);
  for (const word of blockWords) {
    let value = 0;
    for (let i = 0; i < row.length; i++) value += row[i] * word[i];
    hist[mod(value)]++;
  }
  let square = 0;
  for (const count of hist) square += count * count;
  return 29 * square / (blockWords.length * blockWords.length) - 1;
}

/**
 * Enumerate every one-dimensional subspace in GF29^L exactly once.
 * The first nonzero coefficient is normalized to 1.
 * @param {number} width
 * @param {(v:number[])=>void} consumer
 */
function eachDirection(width, consumer) {
  const row = Array(width).fill(0);
  function suffix(i) {
    if (i === width) {
      consumer([...row]);
      return;
    }
    for (let v = 0; v < 29; v++) {
      row[i] = v;
      suffix(i + 1);
    }
  }
  for (let first = 0; first < width; first++) {
    row.fill(0);
    row[first] = 1;
    suffix(first + 1);
  }
}

/**
 * A source-independent invertible triangular Hill plant.
 * C[j]=P[j]+(j+2)P[j+1], last coordinate unchanged.
 * @param {number[][]} native
 * @returns {number[][]}
 */
function encryptPlant(native) {
  return native.map(word => word.map((p, i) =>
    mod(p + (i + 1 < word.length ? (i + 2) * word[i + 1] : 0))));
}

/** @param {number[][]} crypt @returns {number[][]} */
function decryptPlant(crypt) {
  return crypt.map(word => {
    const out = word.slice();
    for (let i = out.length - 2; i >= 0; i--)
      out[i] = mod(out[i] - (i + 2) * out[i + 1]);
    return out;
  });
}

const results = [];
for (const L of [2, 3, 4]) {
  const words = sourceWords.filter(w => w.length === L);
  const independent = shakespeare.filter(w => w.length === L);
  assert.ok(independent.length >= words.length * 2);
  const controls = [
    independent.slice(0, words.length),
    independent.slice(words.length, words.length * 2)
  ];
  const train = words.slice(0, Math.floor(words.length / 2));
  const heldout = words.slice(train.length);

  let fullBest = -Infinity;
  let fullBestRow = null;
  let trainBest = -Infinity;
  let trainBestRow = null;
  let directions = 0;
  eachDirection(L, row => {
    directions++;
    const full = contrast(words, row);
    if (full > fullBest) {
      fullBest = full;
      fullBestRow = row;
    }
    const fit = contrast(train, row);
    if (fit > trainBest) {
      trainBest = fit;
      trainBestRow = row;
    }
  });
  assert.equal(directions, (Math.pow(29, L) - 1) / 28);
  const heldoutScore = contrast(heldout, trainBestRow);
  const controlMin = Math.min(...controls.flatMap(native =>
    Array.from({length: L}, (_, k) =>
      contrast(native, Array.from({length: L}, (_, j) => Number(j === k))))));
  assert.ok(fullBest < controlMin,
    'Unexpected native-control-compatible original linear direction');

  const native = controls[0];
  const planted = encryptPlant(native);
  assert.deepEqual(decryptPlant(planted), native);
  let plantPeak = -Infinity;
  eachDirection(L, row => {
    plantPeak = Math.max(plantPeak, contrast(planted, row));
  });
  assert.ok(plantPeak + 1e-11 >= controlMin);

  results.push({
    wordLength: L, originalWords: words.length,
    completeSecretProjectiveDirections: directions,
    originalFullMaxD: fullBest, originalFullMaxDirection: fullBestRow,
    originalTrainSelectedD: trainBest, originalTrainSelectedDirection: trainBestRow,
    unchangedHeldoutD: heldoutScore, heldoutUniformMeanD: 28 / heldout.length,
    sourceNativeMinimumCoordinateD: controlMin,
    sourceShakespeareWordsAvailable: independent.length,
    syntheticHillPlantMaxD: plantPeak,
    plantFullyReencryptedAndRecovered: true
  });
}
assert.ok(Math.abs(results[0].originalFullMaxD - 0.09379982461734704) < 1e-10);
assert.ok(Math.abs(results[1].originalFullMaxD - 0.09991898148148137) < 1e-10);
assert.ok(Math.abs(results[2].originalFullMaxD - 0.13049409314926907) < 1e-10);
console.log(JSON.stringify({
  question: 'Any static unknown full-rank affine Hill map for each complete printed LP2 word length?',
  source: 'Original pp0-55, preserved cross-page word joins, native GP29',
  naturalControls: 'Two nonoverlapping same-length source-word batches per L from pinned Shakespeare',
  scope: 'Stationary length-dependent affine GF29 word-block mixing, not dynamic keys',
  results,
  authenticatedUnknownPlaintextRecovered: false
}, null, 2));
