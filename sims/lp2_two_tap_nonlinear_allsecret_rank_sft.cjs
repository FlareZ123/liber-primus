'use strict';

/**
 * Source-original GP29 two-tap ciphertext feedback with a completely secret,
 * possibly nonlinear, stationary permutation of the plaintext alphabet.
 *
 * C[i] = a*C[i-1] + b*C[i-2] + h(P[i]) mod29.
 *
 * For any a,b, the residual R[i] = C[i]-a*C[i-1]-b*C[i-2] mod29
 * must have exactly the plaintext GP29 unigram counts up to relabeling by h.
 * Sorting the two 29-bin histograms minimizes total-variation distance over
 * EVERY secret permutation h (29 factorial choices), without fitting h.
 *
 * Tests a single global a,b,h and an independent a,b,h per each of nine
 * original red-heading visual chapters. Always discard the first two
 * ciphertext symbols of each physical page as free initial state.
 *
 * Run: node sims/lp2_two_tap_nonlinear_allsecret_rank_sft.cjs
 * Node.js >=20, built-ins only. Does not modify inputs or write files.
 * The control model is source-native GP29 English from three pinned books.
 * No authorial plaintext/key is assumed or inferred.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
    .replace(/\r\n/g, '\n');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const physicalPages = gp.pages.slice(0, 56);
const pages = physicalPages.map(page => page.indices).filter(p => p.length);
assert.equal(pages.length, 55);
const full = pages.flat();
assert.equal(full.length, 12956);
const transcription = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const runes = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const originalWords = transcription.match(runes) || [];
const wordLengths = originalWords.map(w => [...w].length);
assert.equal(wordLengths.length, 2896);
assert.equal(wordLengths.reduce((sum, length) => sum + length, 0), 12956);

/**
 * Source-native Latin spelling to GP rune labels, including the authentic
 * solved-page IO and ING single-rune spellings.
 * @param {string} word
 * @returns {number[]}
 */
const alphabet = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let at = 0; at < s.length;) {
    if (s.startsWith('ING', at)) {
      output.push(21);
      at += 3;
    } else if (s.startsWith('IO', at)) {
      output.push(27);
      at += 2;
    } else {
      const t = alphabet.find(token => s.startsWith(token.s, at));
      assert(t, 'unmapped spelling ' + s);
      output.push(t.i);
      at += t.s.length;
    }
  }
  return output;
}
assert.deepEqual(encode('FOLLOWING'), [0,3,20,20,3,7,21]);

const referenceFiles = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt',
];
/** @type {Map<number,{count:number[], words:number[][]}>} */
const control = new Map();
let controlWords = 0;
for (const file of referenceFiles) {
  const text = read(file);
  for (const word of text.match(/[A-Za-z]+/g) || []) {
    const plain = encode(word);
    if (!control.has(plain.length))
      control.set(plain.length, {count: Array(29).fill(0), words: []});
    const bin = control.get(plain.length);
    bin.words.push(plain);
    for (const rune of plain) bin.count[rune]++;
    controlWords++;
  }
}
assert.equal(controlWords, 149072);

/**
 * Reference GP unigram spectrum, conditional on ORIGINAL rune-word lengths.
 * @param {number[]} lengths
 * @returns {number[]}
 */
function nativeSpectrum(lengths) {
  const counts = Array(29).fill(0);
  for (const length of lengths) {
    const bin = control.get(length);
    assert(bin && bin.words.length, 'missing control length ' + length);
    for (let i = 0; i < 29; i++)
      counts[i] += bin.count[i] / bin.words.length;
  }
  const total = lengths.reduce((sum, n) => sum + n, 0);
  return counts.sort((a, b) => b - a).map(n => n / total);
}

/**
 * Exact minimum total variation over all 29! alphabet relabelings.
 * Rearrangement theorem pairs the sorted symbol frequencies.
 * @param {number[]} counts
 * @param {number[]} reference
 * @returns {number}
 */
function rankTV(counts, reference) {
  const total = counts.reduce((sum, n) => sum + n, 0);
  const ranked = counts.slice().sort((a, b) => b - a);
  return ranked.reduce((sum, n, i) =>
    sum + Math.abs(n / total - reference[i]), 0) / 2;
}

/**
 * Residual unigram histogram from source, granting arbitrary two-symbol IV
 * per physical page.
 * @param {number[][]} sourcePages
 * @param {number} a
 * @param {number} b
 * @returns {number[]}
 */
function histogram(sourcePages, a, b) {
  const counts = Array(29).fill(0);
  for (const page of sourcePages) {
    for (let i = 2; i < page.length; i++) {
      const v = (page[i] - a * page[i-1] - b * page[i-2]) % 29;
      counts[v < 0 ? v + 29 : v]++;
    }
  }
  return counts;
}

/**
 * Enumerate every field coefficient pair with an unrestricted secret h.
 * @param {number[][]} sourcePages
 * @param {number[]} reference
 * @returns {{a:number,b:number,tv:number}[]}
 */
function allCoefficients(sourcePages, reference) {
  const scored = [];
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      scored.push({a, b, tv: rankTV(
        histogram(sourcePages, a, b), reference)});
    }
  }
  scored.sort((x, y) => x.tv - y.tv || x.a - y.a || x.b - y.b);
  assert.equal(scored.length, 841);
  return scored;
}
const globalReference = nativeSpectrum(wordLengths);
const global = allCoefficients(pages, globalReference);
const pair = (rows, a, b) => rows.find(x => x.a === a && x.b === b);
const near = (got, expected) => assert(Math.abs(got - expected) < 1e-10,
  'unexpected original source value: ' + got + ' versus ' + expected);
assert.deepEqual([global[0].a, global[0].b], [1,0]);
near(global[0].tv, 0.32774042008028553);
near(pair(global, 1, 1).tv, 0.3417525639382957);
near(pair(global, 0, 0).tv, 0.3459562070956988);
const actualRetained = pages.reduce((sum, p) => sum + p.length - 2, 0);
assert.equal(actualRetained, 12846);

/** Red-header section rune counts, independently fixed by original scans. */
const sectionEnd = [729,1874,3603,5506,6527,7960,9640,12648,12956];
const chapterOf = offset => sectionEnd.findIndex(end => offset < end);
const chapterPages = Array.from({length:9}, () => []);
const chapterLengths = Array.from({length:9}, () => []);
let offset = 0;
for (const physicalPage of physicalPages) {
  if (physicalPage.indices.length)
    chapterPages[chapterOf(offset)].push(physicalPage.indices);
  offset += physicalPage.indices.length;
}
assert.equal(offset, 12956);
offset = 0;
for (const len of wordLengths) {
  chapterLengths[chapterOf(offset)].push(len);
  offset += len;
}
const chapter = [];
for (let i = 0; i < 9; i++) {
  const ranked = allCoefficients(chapterPages[i],
    nativeSpectrum(chapterLengths[i]));
  chapter.push({
    chapter: i,
    runeCount: chapterLengths[i].reduce((s,n) => s+n,0),
    pageCount: chapterPages[i].length,
    residualCount: chapterPages[i].reduce((s,p) => s+p.length-2,0),
    best: ranked[0],
    fibonacciTV: pair(ranked,1,1).tv,
  });
}
assert.deepEqual(chapter.map(x => x.runeCount),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.deepEqual(chapter.map(x => x.pageCount),
  [3,5,7,8,4,6,7,13,2]);
for (const [i, expected] of
  [0.2442528951126366,0.2707355879112372,0.29196688139079047,
    0.28853069359198424,0.26222638572916207,0.2743845528059568,
    0.2812904642029524,0.3047309788286785,0.19478470577796295].entries())
  near(chapter[i].best.tv, expected);

/**
 * Independent full-length nonlinear planted GP source. The invertible
 * power-5 permutation is deliberately unlike additive/affine ciphers.
 */
let seed = 0x90331;
function nextInt() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const plain = wordLengths.flatMap(length => {
  const bin = control.get(length).words;
  return bin[nextInt() % bin.length];
});
assert.equal(plain.length, 12956);
const h = Array.from({length:29}, (_, x) => {
  let y = 1;
  for (let j = 0; j < 5; j++) y = y*x%29;
  return (y+7)%29;
});
assert.equal(new Set(h).size,29);
const inv = Array(29).fill(-1);
h.forEach((value, i) => {inv[value]=i;});
const planted = [];
let pos = 0;
let recovered = 0;
for (const page of pages) {
  const cipher = Array(page.length).fill(0);
  cipher[0] = 7;
  cipher[1] = 11;
  for (let i = 2; i < cipher.length; i++) {
    cipher[i] = (17*cipher[i-1]+9*cipher[i-2]+h[plain[pos+i]])%29;
    const residual = (cipher[i]-17*cipher[i-1]-9*cipher[i-2]+29*26)%29;
    assert.equal(inv[residual],plain[pos+i]);
    recovered++;
  }
  planted.push(cipher);
  pos += page.length;
}
assert.equal(recovered,12846);
const plantRank = rankTV(histogram(planted,17,9),globalReference);
assert(plantRank < 0.06, 'authentic nonlinear control not recovered');
const report = {
  outcome: 'NO UNKNOWN LP2 PLAINTEXT OR AUTHENTIC KEY',
  model: 'C[i] = a C[i-1] + b C[i-2] + h(P[i]) mod29, all a,b and all bijections h',
  original: {
    sourcePages:55,runicSymbols:12956,originalWords:2896,
    usableResidualSymbols:actualRetained,secretCoefficientPairs:841,
    bestGlobalTen:global.slice(0,10),
    fibonacci:pair(global,1,1),
    direct:pair(global,0,0),
    originalOneTapBest:global[0],
    chapterLocalAllSecret:chapter,
  },
  control:{
    nativeWords:controlWords,
    independentNonlinearPlaintextRecovered:recovered,
    plantedA:17,plantedB:9,plantedPower:5,plantedRankTV:plantRank,
  },
  limitation:'Conditional GP-native English unigram reference; dynamic or per-word h, altered register and additional transforms remain open',
};
console.log(JSON.stringify(report,null,2));
