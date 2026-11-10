'use strict';
/**
 * Search all LP2 page pairs for alignment-specific additive-key reuse evidence.
 *
 * For two ciphertext pages encrypted with the same modulo-29 additive key,
 * their aligned residue differences cancel the key: D_i=C^A_i-C^B_i.
 * If both plaintexts share the same rune marginal q and are independent,
 * D has the symmetric circular autocorrelation q * reverse(q).
 *
 * This script scans 1485 unordered page pairs (55 choose 2) at zero rune offset.
 * Independent circular rune shifts per page supply a max-over-pairs null.
 * The observed symmetry statistic is exploratory and cannot itself establish
 * shared keys, a plaintext, or an English language register.
 *
 * Run with Node.js 20+, no network:
 *   node sims/relative_key_reuse_scan.cjs --selftest
 *   node sims/relative_key_reuse_scan.cjs --trials 1000
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');

/**
 * @returns {Array<{page:number,indices:number[]}>}
 */
function loadPages() {
  const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const pageSegments = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8').split('%').slice(0, 55);
  const runeToIndex = new Map(json.runes.map((r, i) => [r, i]));
  const pages = json.pages.filter(p => p.status === 'unsolved' && p.indices.length);
  assert.equal(pages.length, 55);
  assert.equal(pageSegments.length, 55);
  const currentTextRunes = pageSegments.map(s => [...s].filter(r => runeToIndex.has(r)).map(r => runeToIndex.get(r)));
  currentTextRunes.forEach((p, i) => assert.deepEqual(p, pages[i].indices, 'LP2 page ' + pages[i].page + ' mismatch'));
  const plainText = pageSegments.join('%');
  let glyphs = 0;
  let words = 0;
  let active = false;
  for (const c of plainText) {
    if (runeToIndex.has(c)) {
      glyphs++;
      if (!active) {
        words++;
        active = true;
      }
    } else if ('-.$&§'.includes(c)) active = false;
  }
  assert.equal(glyphs, 12956);
  assert.equal(words, 2896);
  return pages;
}

/** @param {number} seed */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Return all 3 statistics for the given pair of page streams.
 * chi = ordinary 28-df Pearson; symmetric chi has 14 independent
 * symmetric degrees of freedom (d and 29-d folded); covariance
 * measures whether first-half and second-half residue profiles agree.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} oa
 * @param {number} ob
 */
function pairStats(a, b, oa = 0, ob = 0) {
  const n = Math.min(a.length, b.length);
  const mid = n >>> 1;
  const hist = new Uint16Array(29);
  const halfA = new Uint16Array(29);
  const halfB = new Uint16Array(29);
  for (let t = 0; t < n; t++) {
    const d = (a[(t + oa) % a.length] - b[(t + ob) % b.length] + 29) % 29;
    hist[d]++;
    (t < mid ? halfA : halfB)[d]++;
  }
  const expectation = n / 29;
  let squareSum = 0;
  let dot = 0;
  for (let d = 0; d < 29; d++) {
    squareSum += hist[d] * hist[d];
    dot += halfA[d] * halfB[d];
  }
  const chi = 29 * squareSum / n - n;
  let symmetric = (hist[0] - expectation) ** 2 / expectation;
  for (let d = 1; d <= 14; d++) {
    symmetric += (hist[d] + hist[29 - d] - 2 * expectation) ** 2 / (2 * expectation);
  }
  const halfCovariance = dot - mid * (n - mid) / 29;
  return {n, chi, symmetric, halfCovariance, same: hist[0], hist: Array.from(hist)};
}

/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {number[]} rotations
 */
function scan(pages, rotations) {
  const maxima = {chi: -Infinity, symmetric: -Infinity, halfCovariance: -Infinity};
  const winners = {};
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const v = pairStats(pages[i].indices, pages[j].indices, rotations[i], rotations[j]);
      for (const statistic of Object.keys(maxima)) {
        if (v[statistic] > maxima[statistic]) {
          maxima[statistic] = v[statistic];
          winners[statistic] = {pair: [pages[i].page, pages[j].page], n: v.n, value: v[statistic]};
        }
      }
    }
  }
  return {maxima, winners};
}

function selftest() {
  // Plant shared random key with two independent, strongly biased plaintexts.
  // The additive key itself is arbitrary and independent of both plaintexts.
  const random = rng(3301);
  const key = Array.from({length: 269}, () => Math.floor(random() * 29));
  const glyphChoices = [0, 0, 0, 2, 2, 5, 5, 11, 19, 19, 19, 19];
  const p = key.map(() => glyphChoices[Math.floor(random() * glyphChoices.length)]);
  const q = key.map(() => glyphChoices[Math.floor(random() * glyphChoices.length)]);
  const sharedA = p.map((v, i) => (v + key[i]) % 29);
  const sharedB = q.map((v, i) => (v + key[i]) % 29);
  const independentKey = key.map(() => Math.floor(random() * 29));
  const independentB = q.map((v, i) => (v + independentKey[i]) % 29);
  const positive = pairStats(sharedA, sharedB);
  const control = pairStats(sharedA, independentB);
  assert.ok(positive.symmetric > control.symmetric + 30);
  assert.equal(positive.n, 269);
  return {
    keyReusePlantSymmetric: positive.symmetric,
    independentKeySymmetric: control.symmetric,
    positiveControlPassed: true
  };
}

/** @param {number} trials @param {number} seed */
function study(trials = 1000, seed = 404) {
  const pages = loadPages();
  const observed = scan(pages, pages.map(() => 0));
  const random = rng(seed);
  const nulls = {chi: [], symmetric: [], halfCovariance: []};
  for (let k = 0; k < trials; k++) {
    const offsets = pages.map(page => Math.floor(random() * page.indices.length));
    const result = scan(pages, offsets);
    for (const metric of Object.keys(nulls)) nulls[metric].push(result.maxima[metric]);
  }
  const results = {};
  for (const metric of Object.keys(nulls)) {
    const nullMax = nulls[metric].sort((a, b) => a - b);
    const top = observed.maxima[metric];
    results[metric] = {
      observed: observed.winners[metric],
      exceedances: nullMax.filter(n => n >= top).length,
      familywiseP: (1 + nullMax.filter(n => n >= top).length) / (trials + 1),
      median: nullMax[Math.floor((trials - 1) * .5)],
      null95: nullMax[Math.ceil(trials * .95) - 1],
      null99: nullMax[Math.ceil(trials * .99) - 1],
      nullMax: nullMax[trials - 1]
    };
  }
  const ia = pages.find(p => p.page === 28);
  const ib = pages.find(p => p.page === 42);
  return {
    hypothesis: 'Same-offset page pair additive-keystream sharing would leave symmetric nonuniform differences',
    numberOfPagePairs: pages.length * (pages.length - 1) / 2,
    runePages: pages.length, runes: 12956, words: 2896,
    samplePair: {pageNumbers: [28, 42], ...pairStats(ia.indices, ib.indices)},
    controls: 'Maxima of all 1485 page pairs after independent whole-page cyclic rune shifts; original page glyphs preserved',
    seed, trials, results,
    caveat: 'Exploratory model; symmetric deviations are not evidence of language, plaintext, or a specific shared key without independent cryptanalytic confirmation'
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) process.stdout.write(JSON.stringify(selftest(), null, 2) + '\n');
  else {
    const i = args.indexOf('--trials');
    const trials = i < 0 ? 1000 : Number(args[i + 1]);
    assert.ok(Number.isInteger(trials) && trials > 0 && trials <= 10000);
    process.stdout.write(JSON.stringify(study(trials), null, 2) + '\n');
  }
}
module.exports = {loadPages, pairStats, scan, study, selftest, rng};
