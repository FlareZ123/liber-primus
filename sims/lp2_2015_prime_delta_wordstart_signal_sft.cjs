'use strict';

/**
 * Single-file source-exact test of the independently dated 2015 LP2
 * prime-shift/difference operation and printed-word-start repeat events.
 * Node 22/CommonJS; read-only; no learned keys or fitted word boundaries.
 *
 * The original 2015 operation, with a fictitious F before each chapter, is:
 *   S[-1] = -2 mod 29, S[i] = C[i] - prime[i+1] mod 29
 *   D[i] = S[i] - S[i-1] mod 29.
 * We mark a repeat event at i>0 when D[i] === D[i-1].
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const map = new Map(corpus.runes.map((r, i) => [r, i]));
const source = transcript.split('%').slice(0, 55).join('').replace(/\/\s*/gu, '');
const words = (source.match(/[\u16A0-\u16FF]+/gu) || [])
  .map((s) => [...s].map((r) => {
    assert.ok(map.has(r), r);
    return map.get(r);
  }));
const original = words.flat();
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(original, corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices));

const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const chapterWordCounts = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const expectedEvents = [40, 39, 64, 78, 37, 48, 60, 99, 11];
const expectedStarts = [4, 7, 17, 20, 8, 14, 17, 35, 1];
const primes = [];
for (let n = 2; primes.length < 3010; n++) {
  if (primes.every((p) => p * p > n || n % p !== 0)) primes.push(n);
}
const mod29 = (v) => ((v % 29) + 29) % 29;

/**
 * @param {number[]} C Original GP29 indices
 * @param {-1|0|1} sign Sign of published successive prime shifts
 * @param {boolean} usePrime Set false for an affine/unshifted control
 * @returns {{d:number[],hits:Set<number>,positions:number[],clusters:number,maxRun:number}}
 */
function transform(C, sign = -1, usePrime = true) {
  let preceding = 27; // fictitious F shifted by prime(0)=2
  const d = [];
  const hits = new Set();
  const positions = [];
  let clusters = 0;
  let currentRun = 1;
  let maxRun = 1;
  for (let i = 0; i < C.length; i++) {
    const key = usePrime ? primes[i + 1] : i + 1;
    const s = mod29(C[i] + sign * key);
    d.push(mod29(s - preceding));
    preceding = s;
    if (i === 0) continue;
    if (d[i] === d[i - 1]) {
      hits.add(i);
      positions.push(i);
      currentRun++;
      if (currentRun === 2) clusters++;
      if (currentRun > maxRun) maxRun = currentRun;
    } else currentRun = 1;
  }
  return {d, hits, positions, clusters, maxRun};
}

/**
 * @param {number[][]} wholeWords
 * @returns {number[]}
 */
function wordStarts(wholeWords) {
  const positions = [];
  let cursor = 0;
  for (const word of wholeWords) {
    positions.push(cursor);
    cursor += word.length;
  }
  return positions;
}

/**
 * @param {number[]} starts
 * @param {Set<number>} hits
 * @param {number} N
 * @returns {number[]}
 */
function rotatedCounts(starts, hits, N) {
  const counts = [];
  for (let shift = 0; shift < N; shift++) {
    let count = 0;
    for (const start of starts) if (hits.has((start + shift) % N)) count++;
    counts.push(count);
  }
  return counts;
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function convolution(a, b) {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
  }
  return out;
}

const pages = [];
let globalPageStart = 0;
for (const page of corpus.pages.filter((p) => p.page <= 55 && p.runic_count)) {
  pages.push({
    page: page.page, N: page.runic_count,
    start: globalPageStart,
    end: globalPageStart + page.runic_count
  });
  globalPageStart += page.runic_count;
}
assert.equal(pages.length, 55);
assert.equal(globalPageStart, 12956);

/**
 * Exact null: shift the already-detected event tape independently within
 * each original physical page; leave each true printed word start and
 * event count per page unchanged. Convolve page-wise exact distributions.
 * @param {number[]} starts Chapter-relative whole-word start offsets
 * @param {Set<number>} hits Chapter-relative repeat-event offsets
 * @param {number} absoluteStart Global original-rune offset of chapter
 * @param {number} N Number of original chapter runes
 * @returns {{pdf:number[],observed:number,mean:number,sd:number,pGE:number,pLE:number,pageCount:number}}
 */
function pageShiftNull(starts, hits, absoluteStart, N) {
  const chapterPages = pages.filter((p) =>
    p.start >= absoluteStart && p.end <= absoluteStart + N);
  assert.equal(chapterPages.reduce((n, p) => n + p.N, 0), N);
  let pdf = [1];
  for (const page of chapterPages) {
    const local = page.start - absoluteStart;
    const pageStarts = starts.filter((s) => s >= local && s < local + page.N)
      .map((s) => s - local);
    const pageHits = new Set([...hits].filter((h) =>
      h >= local && h < local + page.N).map((h) => h - local));
    const rotated = rotatedCounts(pageStarts, pageHits, page.N);
    const density = new Array(Math.max(...rotated) + 1).fill(0);
    for (const count of rotated) density[count] += 1 / page.N;
    pdf = convolution(pdf, density);
  }
  const observed = starts.filter((s) => hits.has(s)).length;
  const mean = pdf.reduce((v, p, i) => v + i * p, 0);
  const sd = Math.sqrt(pdf.reduce((v, p, i) => v + (i - mean) ** 2 * p, 0));
  const pGE = pdf.slice(observed).reduce((a, b) => a + b, 0);
  const pLE = pdf.slice(0, observed + 1).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(pdf.reduce((a, b) => a + b, 0) - 1) < 1e-10);
  return {pdf, observed, mean, sd, pGE, pLE, pageCount: chapterPages.length};
}

const chapters = [];
let nextWord = 0;
let globalChapterStart = 0;
for (let i = 0; i < chapterLengths.length; i++) {
  const ww = [];
  let n = 0;
  while (n < chapterLengths[i]) {
    const w = words[nextWord++];
    assert.ok(w);
    ww.push(w);
    n += w.length;
  }
  assert.equal(n, chapterLengths[i]);
  assert.equal(ww.length, chapterWordCounts[i]);
  const C = ww.flat();
  const starts = wordStarts(ww);
  const observed = transform(C);
  assert.equal(observed.positions.length, expectedEvents[i]);
  const page = pageShiftNull(starts, observed.hits, globalChapterStart, n);
  assert.equal(page.observed, expectedStarts[i]);
  chapters.push({number: i + 1, C, words: ww, starts,
    globalStart: globalChapterStart, transformed: observed, page});
  globalChapterStart += n;
}
assert.equal(nextWord, 2896);
assert.equal(globalChapterStart, 12956);

const first = chapters[0];
assert.equal(first.transformed.clusters, 36);
assert.equal(first.transformed.maxRun, 4);
const rotations = [];
for (let r = 0; r < first.C.length; r++) {
  const C = first.C.map((_, i) => first.C[(i + r) % first.C.length]);
  const t = transform(C);
  rotations.push({r, events: t.positions.length, clusters: t.clusters,
    maxRun: t.maxRun});
}
assert.equal(rotations.filter((r) => r.events >= 40).length, 1);
assert.equal(rotations.filter((r) => r.clusters >= 36).length, 7);
assert.equal(rotations.filter((r) => r.maxRun >= 4).length, 43);

const floral = chapters[7];
const compare = [];
for (const variant of [
  {name: 'primeMinus', sign: -1, usePrime: true},
  {name: 'primePlus', sign: 1, usePrime: true},
  {name: 'unshifted', sign: 0, usePrime: false}
]) {
  const t = transform(floral.C, variant.sign, variant.usePrime);
  const p = pageShiftNull(floral.starts, t.hits,
    floral.globalStart, floral.C.length);
  compare.push({name: variant.name, events: t.hits.size, wordStartHits: p.observed,
    expected: p.mean, oneSidedP: p.pGE});
}
assert.deepEqual(compare.map((x) => [x.events, x.wordStartHits]),
  [[99, 35], [114, 19], [107, 22]]);

const sums = floral.words.filter((w, i) =>
  floral.transformed.hits.has(floral.starts[i]))
  .map((w) => w.reduce((sum, i) => sum + corpus.prime[i], 0) % 29);
const primeSumReadout = sums.map((i) => corpus.translit[i]).join('.');
assert.equal(sums.length, 35);
assert.equal(primeSumReadout.replaceAll('.', ''),
  'DNPABUNIGYIUHPCPULOEGNGEOOERBIAEDITWBYEEA');

const observedMaxZ = Math.max(...chapters.map((x) =>
  Math.abs((x.page.observed - x.page.mean) / x.page.sd)));
const familywiseTwoSided = 1 - chapters.reduce((product, x) =>
  product * x.page.pdf.reduce((total, probability, i) =>
    total + (Math.abs((i - x.page.mean) / x.page.sd) < observedMaxZ - 1e-12
      ? probability : 0), 0), 1);
const observedMaxPositive = Math.max(...chapters.map((x) =>
  (x.page.observed - x.page.mean) / x.page.sd));
const familywisePositive = 1 - chapters.reduce((product, x) =>
  product * x.page.pdf.reduce((total, probability, i) =>
    total + ((i - x.page.mean) / x.page.sd < observedMaxPositive - 1e-12
      ? probability : 0), 0), 1);
assert.ok(Math.abs(floral.page.pGE - 0.001989559505892691) < 1e-12);
assert.ok(Math.abs(familywiseTwoSided - 0.018650661006597624) < 1e-10);

const report = {
  originalRunes: original.length,
  originalWords: words.length,
  chapters: chapters.map((x) => ({
    chapter: x.number, events: x.transformed.hits.size,
    wordStartHits: x.page.observed, pageShiftExpected: x.page.mean,
    exactPageShiftUpperTail: x.page.pGE,
    exactPageShiftLowerTail: x.page.pLE,
    z: (x.page.observed - x.page.mean) / x.page.sd
  })),
  firstChapter2015: {
    rawEvents: first.transformed.positions.length,
    eventClusters: first.transformed.clusters,
    longestConsecutiveRun: first.transformed.maxRun,
    rawPhaseRank: rotations.filter((x) => x.events >= 40).length + '/729',
    clusterPhaseRank: rotations.filter((x) => x.clusters >= 36).length + '/729',
    fourRunPhaseRank: rotations.filter((x) => x.maxRun >= 4).length + '/729'
  },
  chapter8Comparators: compare,
  exactPagePreservingFamilywise: {
    maxAbsZ: observedMaxZ, twoSidedP: familywiseTwoSided,
    positiveP: familywisePositive
  },
  chapter8PrimeSumMod29: primeSumReadout,
  conclusion: 'Original-source word-start correlation only; no genuine LP2 plaintext or key recovered'
};
console.log(JSON.stringify(report, null, 2));
