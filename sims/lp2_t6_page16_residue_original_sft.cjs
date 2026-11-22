'use strict';

/**
 * Original LP2 page-local, period-16 affine lag-six phase test.
 *
 * This is a bounded ciphertext-pattern test, not a decryption or a claim of
 * Cicada-authored 16-phase feedback. Read-only; Node.js 22; no dependencies.
 *
 * Original inputs:
 *   resources/liber-primus/lp2-corpus.json
 *   resources/lp2-transcription.txt
 *
 * The map T(x) = 24 - 2x (mod 29) and p15's 16-cell spiral predate this test.
 * The phase offset (14) was selected by viewing the original ciphertext.
 *
 * @typedef {{h:number[],n:number[]}} Histogram
 * @typedef {{page:number,all:Histogram,cross:Histogram,within:Histogram}} PageData
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map([...corpus.runes].map((r, i) => [r, i]));
const byPage = new Map(corpus.pages.map(p => [p.page, p.indices]));
const chunks = transcription.split('%');
assert.equal(chunks.length, 57); // physical p50 is the number-only page

/** @returns {Histogram} */
function histogram() {
  return {h: Array(16).fill(0), n: Array(16).fill(0)};
}

/** @param {number} value @returns {number} */
function transform(value) {
  return ((24 - 2 * value) % 29 + 29) % 29;
}

/** @type {PageData[]} */
const pages = [];
for (let chunkNo = 0; chunkNo < chunks.length; chunkNo++) {
  const page = chunkNo < 50 ? chunkNo : chunkNo + 1;
  const indices = [];
  const wordIds = [];
  let wordId = 0;
  for (const ch of chunks[chunkNo]) {
    if (runeIndex.has(ch)) {
      indices.push(runeIndex.get(ch));
      wordIds.push(wordId);
    } else if (ch === '-' || ch === '.' || ch === '&') {
      wordId++;
    }
  }
  assert.deepEqual(indices, byPage.get(page), 'exact original rune alignment p' + page);
  if (page > 55) continue;
  const record = {page, all: histogram(), cross: histogram(), within: histogram()};
  for (let i = 6; i < indices.length; i++) {
    const residue = i % 16;
    const hit = Number(indices[i] === transform(indices[i - 6]));
    const className = wordIds[i] === wordIds[i - 6] ? 'within' : 'cross';
    for (const cls of ['all', className]) {
      record[cls].n[residue]++;
      record[cls].h[residue] += hit;
    }
  }
  pages.push(record);
}
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + byPage.get(p.page).length, 0), 12956);

/** @param {'all'|'cross'|'within'} cls @returns {Histogram} */
function pooled(cls) {
  const out = histogram();
  for (const page of pages) for (let k = 0; k < 16; k++) {
    out.h[k] += page[cls].h[k];
    out.n[k] += page[cls].n[k];
  }
  return out;
}

/** @param {Histogram} x @returns {{hits:number,observations:number,rate:number,phase14:number,opportunities14:number}} */
function summary(x) {
  const hits = x.h.reduce((a,b) => a+b, 0);
  const observations = x.n.reduce((a,b) => a+b, 0);
  return {hits, observations, rate: hits/observations,
    phase14: x.h[14], opportunities14: x.n[14]};
}

const all = pooled('all');
const cross = pooled('cross');
const within = pooled('within');
assert.deepEqual([summary(all).hits, summary(all).observations, all.h[14], all.n[14]], [466,12626,47,790]);
assert.deepEqual([summary(cross).hits, summary(cross).observations, cross.h[14], cross.n[14]], [389,11359,41,716]);
assert.deepEqual([summary(within).hits, summary(within).observations, within.h[14], within.n[14]], [77,1267,6,74]);

/** @param {Histogram} x @param {number} r @returns {number} */
function zscore(x, r) {
  const s = summary(x);
  return (x.h[r] - s.rate * x.n[r]) / Math.sqrt(x.n[r] * s.rate * (1-s.rate));
}

/** @param {Histogram} x @returns {number} */
function maximumZ(x) {
  return Math.max(...x.h.map((_n, i) => zscore(x, i)));
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Permute one intact page's phase origin independently, retaining its exact
 * per-phase hits, source word-boundary relationships and observations.
 * Same rotation applies to both classifications; no ciphertext is shuffled.
 *
 * @param {('all'|'cross'|'within')[]} classes
 * @param {number} seed
 * @param {number} repetitions
 */
function randomize(classes, seed, repetitions) {
  const original = classes.map(cls => pooled(cls));
  const observed = original.map(maximumZ);
  const observedPhase14 = original.map(x => zscore(x, 14));
  const rnd = xorshift32(seed);
  const maxCount = Array(classes.length).fill(0);
  const phaseCount = Array(classes.length).fill(0);
  let familyCount = 0;
  for (let t = 0; t < repetitions; t++) {
    const pooledRotated = classes.map(histogram);
    for (const page of pages) {
      const shift = rnd() & 15;
      for (let r = 0; r < 16; r++) {
        const shifted = (r + shift) & 15;
        for (let k = 0; k < classes.length; k++) {
          pooledRotated[k].h[shifted] += page[classes[k]].h[r];
          pooledRotated[k].n[shifted] += page[classes[k]].n[r];
        }
      }
    }
    const peaks = pooledRotated.map(maximumZ);
    for (let k = 0; k < classes.length; k++) {
      maxCount[k] += Number(peaks[k] >= observed[k]);
      phaseCount[k] += Number(zscore(pooledRotated[k], 14) >= observedPhase14[k]);
    }
    familyCount += Number(Math.max(...peaks) >= Math.max(...observed));
  }
  return {seed:'0x'+seed.toString(16),repetitions,classes,
    observedMaximumZ:observed,observedPhase14Z,
    maximumExceedances:maxCount,phase14Exceedances:phaseCount,
    familyMaximumExceedances:familyCount,
    maximumP:maxCount.map(n => (n+1)/(repetitions+1)),
    familyMaximumP:(familyCount+1)/(repetitions+1)};
}

const allNull = randomize(['all'], 0x16053301, 100000);
const boundaryNull = randomize(['cross','within'], 0x16c03301, 100000);
assert.deepEqual(allNull.maximumExceedances, [786]);
assert.deepEqual(allNull.phase14Exceedances, [38]);
assert.deepEqual(boundaryNull.maximumExceedances, [624, 61293]);
assert.deepEqual(boundaryNull.phase14Exceedances, [35, 22538]);
assert.equal(boundaryNull.familyMaximumExceedances, 2382);

// Synthetic detection positive: source-shaped GP29 pages with explicit
// at-residue-14 T6 copy, but no similar rule at other phases.
const rng = xorshift32(0x33011614);
const planted = histogram();
for (let p = 0; p < 55; p++) {
  const seq = Array.from({length:256}, () => rng()%29);
  for (let i = 6; i < seq.length; i++) {
    if (i%16 === 14) seq[i] = transform(seq[i-6]);
    const k = i%16;
    planted.n[k]++;
    planted.h[k] += Number(seq[i] === transform(seq[i-6]));
  }
}
assert.equal(planted.h[14], planted.n[14]);
assert.equal(planted.h.map((n,i) => n / planted.n[i]).indexOf(1), 14);

console.log(JSON.stringify({
  source:'original LP2 physical p0–55, no glyphs or separators altered',
  original:{all:summary(all), cross:summary(cross), within:summary(within)},
  allNull,boundaryNull,
  planted:{phase14:planted.h[14], opportunities:planted.n[14],winner:14},
  interpretation:'Exploratory, selected-phase ciphertext signal; not a decoder, plaintext, authenticated key or after-search-adjusted discovery.',
},null,2));
