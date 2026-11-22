'use strict';

// Source-native, read-only SFT for the shared cubic ciphertext-feedback family.
// Run: node sims/lp2_shared_cubic_feedback_chapters_sft.cjs
// JSDoc data structures and native Node 22/CommonJS only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const gp = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const lp1 = source('resources/transcriptions/lp1_wulfic_canonical.txt')
  .split(/^\s*%\s*$/m)
  .map((page) => [...page].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch)));
const expectedClear = new Map([[3, 157], [8, 187], [9, 207], [10, 192], [11, 169], [14, 89]]);
for (const [id, n] of expectedClear) assert.equal(lp1[id].length, n, 'actual printed clear GP LP1 p' + id);

const pageById = new Map(gp.pages.map((p) => [p.page, p]));
function chapter(lo, hi) {
  const runes = [], pageOffsets = new Map();
  for (let p = lo; p <= hi; p++) {
    pageOffsets.set(p, runes.length);
    runes.push(...pageById.get(p).indices);
  }
  return { lo, hi, runes, pageOffsets };
}
const U = chapter(16, 21);
const F = chapter(40, 53);
assert.equal(U.runes.length, 1613);
assert.equal(F.runes.length, 3008);

function parseWords() {
  const pages = source('resources/liber-primus/lp2-transcription.txt').split(/^\s*%\s*$/m);
  assert.equal(pages.length, 57, 'runeless p50 omitted');
  const words = [];
  let word = [];
  const flush = () => { if (word.length) words.push(word); word = []; };
  for (let i = 0; i < pages.length; i++) {
    const page = i <= 49 ? i : i + 1;
    let offset = 0;
    for (const ch of pages[i]) {
      if (runeIndex.has(ch)) { word.push({ page, offset }); offset++; }
      else if ('-.$&§'.includes(ch)) flush();
    }
    assert.equal(offset, pageById.get(page).indices.length, 'transcription rune count page ' + page);
  }
  flush();
  const unsolved = words.filter((w) => w.some((r) => r.page <= 55));
  assert.equal(unsolved.length, 2896);
  assert.equal(unsolved.reduce((n, w) => n + w.filter((r) => r.page <= 55).length, 0), 12956);
  assert.equal(unsolved.filter((w) => new Set(w.map((r) => r.page)).size > 1).length, 32);
  return words;
}
const words = parseWords();
function singles(ch) {
  return words.filter((w) => w.length === 1 && ch.pageOffsets.has(w[0].page))
    .map((w) => ch.pageOffsets.get(w[0].page) + w[0].offset);
}
const eU = singles(U), eF = singles(F);
assert.equal(eU.length, 17);
assert.equal(eF.length, 13);

/**
 * @param {number[]} input GP29 ordinals
 * @param {number} b Fixed multiplier shared between independent chapters
 * @param {number} seed Initial chapter state (0..28)
 * @param {boolean} encrypt
 * @returns {number[]} GP29 ordinals
 */
function transduce(input, b, seed, encrypt) {
  let state = seed;
  const output = [];
  for (const v of input) {
    const c = encrypt ? (v + state) % 29 : v;
    const p = encrypt ? v : (c - state + 29) % 29;
    output.push(encrypt ? c : p);
    state = (state * state * state + b * c) % 29;
  }
  return output;
}
const encrypt = (plain, b, seed) => transduce(plain, b, seed, true);
const decrypt = (cipher, b, seed) => transduce(cipher, b, seed, false);

// Native-GP first-order language model; excludes both planted LP1 pages.
const uni = new Uint16Array(29);
const pairs = Array.from({ length: 29 }, () => new Uint16Array(29));
for (const id of [9, 10, 11, 14]) {
  const v = lp1[id];
  for (let i = 0; i < v.length; i++) {
    uni[v[i]]++;
    if (i > 0) pairs[v[i - 1]][v[i]]++;
  }
}
const N = uni.reduce((n, x) => n + x, 0);
const totals = pairs.map((a) => a.reduce((n, x) => n + x, 0));
const logUni = Array.from(uni, (v) => Math.log((v + 1) / (N + 29)));
const logBi = pairs.map((row, i) => Array.from(row,
  (v) => Math.log((v + 0.8) / (totals[i] + 29 * 0.8))));
/** @param {number[]} runes */
function score(runes) {
  let total = 0;
  for (let i = 0; i < runes.length; i++) {
    const v = runes[i];
    total += 0.25 * logUni[v] + 0.75 * (i ? logBi[runes[i - 1]][v] : logUni[v]);
  }
  return total / runes.length;
}
function bestSeed(cipher, b, trainLen) {
  let best = { seed: -1, score: -Infinity };
  for (let seed = 0; seed < 29; seed++) {
    const value = score(decrypt(cipher.slice(0, trainLen), b, seed));
    if (value > best.score) best = { seed, score: value };
  }
  return best;
}
function fitChapter(cipher, trainLen) {
  const fits = [];
  for (let b = 0; b < 29; b++) fits.push({ b, ...bestSeed(cipher, b, trainLen) });
  return fits.sort((a, b) => b.score - a.score);
}
function heldout(cipher, fit, trainLen) {
  const decoded = decrypt(cipher, fit.b, fit.seed);
  const held = decoded.slice(trainLen);
  const counts = new Uint16Array(29);
  for (const v of held) counts[v]++;
  const ioc = 29 * counts.reduce((n, x) => n + x * (x - 1), 0) / (held.length * (held.length - 1));
  return {
    seed: fit.seed,
    trainScore: fit.score,
    heldoutLength: held.length,
    heldoutScore: score(held),
    heldoutNormalizedIoC: ioc,
    heldoutGP29Prefix: held.slice(0, 40).map((i) => gp.translit[i]).join(' ')
  };
}
function evaluateOther(cipher, b, trainLen) {
  const seed = bestSeed(cipher, b, trainLen);
  return heldout(cipher, { b, ...seed }, trainLen);
}

// Source-native planted solved-LP1 controls, independent chapter seeds.
const plantedU = encrypt(lp1[3], 5, 6);
const plantedF = encrypt(lp1[8], 5, 15);
assert.deepEqual(decrypt(plantedU, 5, 6), lp1[3]);
assert.deepEqual(decrypt(plantedF, 5, 15), lp1[8]);
assert.deepEqual(encrypt(decrypt(plantedU, 5, 6), 5, 6), plantedU);
assert.deepEqual(encrypt(decrypt(plantedF, 5, 15), 5, 15), plantedF);
assert.deepEqual(decrypt(encrypt([...Array(29).keys()], 5, 6), 5, 6), [...Array(29).keys()]);
const uPlantFit = fitChapter(plantedU, 120)[0];
const fPlantFit = fitChapter(plantedF, 120)[0];
assert.deepEqual([uPlantFit.b, uPlantFit.seed, fPlantFit.b, fPlantFit.seed], [5, 6, 5, 15]);
// Distinct-law control: the second plant has multiplier7, not multiplier5.
const diffF = encrypt(lp1[8], 7, 15);
let jointDiff = null;
for (let b = 0; b < 29; b++) {
  const x = bestSeed(plantedU, b, 120);
  const y = bestSeed(diffF, b, 120);
  const candidate = { b, seedU: x.seed, seedF: y.seed, jointScore: x.score + y.score,
    uScore: x.score, fScore: y.score };
  if (jointDiff === null || candidate.jointScore > jointDiff.jointScore) jointDiff = candidate;
}
// Held-out original corridor and floral chapter; fixed shared b, own source-specific IVs.
const fromU = fitChapter(U.runes, 150);
const fromF = fitChapter(F.runes, 150);
const probeU = {
  trained: fromU[0],
  secondChapter: evaluateOther(F.runes, fromU[0].b, 150),
  sameChapter: heldout(U.runes, fromU[0], 150)
};
const probeF = {
  trained: fromF[0],
  secondChapter: evaluateOther(U.runes, fromF[0].b, 150),
  sameChapter: heldout(F.runes, fromF[0], 150)
};
// All-secret singleton obstruction, with chapter-specific seeds allowed at every b.
const permitted = new Set([gp.translit.indexOf('A'), gp.translit.indexOf('I'), gp.translit.indexOf('O')]);
function hits(cipher, events, b, seed) {
  const eventSet = new Set(events);
  let k = seed, hit = 0;
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i], p = (c - k + 29) % 29;
    if (eventSet.has(i) && permitted.has(p)) hit++;
    k = (k * k * k + b * c) % 29;
  }
  return hit;
}
let bestSingleton = { total: -1 }, allBoth = 0;
for (let b = 0; b < 29; b++) {
  let maxU = { hits: -1 }, maxF = { hits: -1 };
  for (let seed = 0; seed < 29; seed++) {
    const u = hits(U.runes, eU, b, seed), f = hits(F.runes, eF, b, seed);
    if (u > maxU.hits) maxU = { hits: u, seed };
    if (f > maxF.hits) maxF = { hits: f, seed };
  }
  if (maxU.hits === eU.length && maxF.hits === eF.length) allBoth++;
  if (maxU.hits + maxF.hits > bestSingleton.total)
    bestSingleton = { b, u: maxU, f: maxF, total: maxU.hits + maxF.hits };
}
assert.equal(allBoth, 0);
assert.equal(bestSingleton.total, 11);
assert.equal(probeU.trained.b, 15);
assert.equal(probeF.trained.b, 14);
assert.ok(probeU.secondChapter.heldoutScore < -3.5);
assert.ok(probeF.secondChapter.heldoutScore < -3.5);
for (const ch of [U, F]) {
  // Full original decoder is a bijection for every fixed b/seed; this is a code invariant only.
  for (let b = 0; b < 29; b++) for (let seed = 0; seed < 29; seed++)
    assert.deepEqual(encrypt(decrypt(ch.runes, b, seed), b, seed), ch.runes);
}
console.log(JSON.stringify({
  fixedModel: 'C=P+k mod29; kNext=k^3+b*C mod29; e=3; full-runic continuous chapter clock',
  original: { corpusWords: 2896, runeCount: 12956, U: { pages: '16..21', n: U.runes.length, singletons: eU.length },
    F: { pages: '40..53 excluding numeric p50', n: F.runes.length, singletons: eF.length } },
  truePrintedNative: { trainLP1: [9, 10, 11, 14], heldoutLP1: [3, 8],
    scoreLP1p3: score(lp1[3]), scoreLP1p8: score(lp1[8]),
    scoreLP2p57: score(pageById.get(57).indices) },
  nativePositive: { b: 5, ivU: 6, ivF: 15, exactPlainU: lp1[3].length,
    exactPlainF: lp1[8].length, recoveredU: uPlantFit, recoveredF: fPlantFit },
  differentLawNegative: jointDiff,
  allSecretSingleton: { allBoth, bestSingleton, totalOriginalSingletons: eU.length + eF.length },
  originalFitFromU: probeU,
  originalFitFromF: probeF
}, null, 2));
