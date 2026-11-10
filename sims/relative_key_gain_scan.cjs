"use strict";

/**
 * Affine-gain, arbitrary-center two-time-pad scan over original LP2 page pairs.
 *
 * A shared pad with page-specific nonzero affine gain satisfies
 * C_A = P_A + K + d, C_B = inv(m)*(P_B+K), so
 * C_A - m*C_B = P_A-P_B+d (mod 29).
 *
 * A difference of two same-register plaintext marginals is symmetric around
 * some center d. This test does not fit a plaintext string or a secret key.
 * Preserve each page's original rune order under independent cyclic rotations
 * and rescan ALL page pairs, gains, and centers for a familywise null.
 *
 * Node.js 22, no dependencies. Run with:
 * node sims/relative_key_gain_scan.cjs --trials 600
 *
 * A performance optimization with an exact mathematical guarantee:
 * the centered-symmetric chi-square is an orthogonal projection of the full
 * 28-df chi-square, hence cannot exceed it. Null scans can skip every
 * gain-specific histogram whose ordinary chi-square is below the
 * observed family maximum, without changing the exceedance count.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const M = 29;
const MIN_RUNES = 200;
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const pages = corpus.pages
  .filter(p => p.page <= 55 && p.indices.length >= MIN_RUNES)
  .map(p => ({ page: p.page, seq: Uint8Array.from(p.indices) }));
assert.equal(pages.length, 46);
const pairCount = pages.length * (pages.length - 1) / 2;
assert.equal(pairCount, 1035);

const mul = Uint8Array.from({ length: M*M },
  (_, i) => ((i / M) | 0) * (i % M) % M);

/** @param {number} x */
function mod(x) { return ((x % M) + M) % M; }

/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * @param {Int32Array} h Residue histogram with sum n.
 * @param {number} n
 * @param {number} sumSquares
 * @param {number} [minimum=-Infinity]
 * @returns {{score:number, center:number}}
 */
function bestCentered(h, n, sumSquares, minimum = -Infinity) {
  let best = minimum;
  let bestCenter = -1;
  const scale = 29 / (2 * n);
  for (let center = 0; center < M; center++) {
    let oppositeProducts = 0;
    for (let delta = 1; delta <= 14; delta++)
      oppositeProducts += h[(center + delta) % M]
        * h[(center + M - delta) % M];
    const score = (sumSquares + h[center]**2 +
      2*oppositeProducts) * scale - n;
    if (score > best + 1e-10) {
      best = score;
      bestCenter = center;
    }
  }
  return {score: best, center: bestCenter};
}

/**
 * @param {Array<{page:number,seq:Uint8Array}>} source
 * @param {number[]} shifts Cyclic offsets for each physical page.
 * @param {number} [threshold=-Infinity] If finite, stop at first exceedance.
 * @returns {{score:number,pair:[number,number],gain:number,center:number,
 *   pairs:number,histograms:number,expensive:number}}
 */
function scan(source, shifts, threshold = -Infinity) {
  const h = new Int32Array(M);
  let best = {score: -Infinity, pair: [-1, -1], gain: 0, center: -1};
  let histograms = 0;
  let expensive = 0;
  for (let a = 0; a < source.length; a++) {
    const x = source[a].seq;
    for (let b = a + 1; b < source.length; b++) {
      const y = source[b].seq;
      const n = Math.min(x.length, y.length);
      const expected = n / M;
      const baseline = n*n / M;
      for (let gain = 1; gain < M; gain++) {
        h.fill(0);
        const t = gain*M;
        let xi = shifts[a], yi = shifts[b];
        for (let k = 0; k < n; k++) {
          const value = x[xi] - mul[t+y[yi]];
          h[value < 0 ? value + M : value]++;
          if (++xi === x.length) xi = 0;
          if (++yi === y.length) yi = 0;
        }
        histograms++;
        let sumSquares = 0;
        for (let k = 0; k < M; k++)
          sumSquares += h[k]*h[k];
        // This is the exact chi-square projection bound.
        const upperBound = (sumSquares - baseline)/expected;
        if (upperBound < Math.max(best.score, threshold) - 1e-10)
          continue;
        expensive++;
        const candidate = bestCentered(h, n, sumSquares,
          Math.max(best.score, threshold) - 1e-9);
        if (candidate.center >= 0 && candidate.score > best.score) {
          best = {
            score: candidate.score,
            pair: [source[a].page, source[b].page],
            gain,
            center: candidate.center
          };
          if (best.score >= threshold - 1e-9 && Number.isFinite(threshold))
            return {...best, pairs: source.length*(source.length-1)/2,
              histograms, expensive};
        }
      }
    }
  }
  return {...best, pairs: source.length*(source.length-1)/2,
    histograms, expensive};
}

/**
 * Strong synthetic high-contrast positive control. This uses a 50%-E
 * plaintext bias solely to verify that the scan can find a real affine
 * cancellation relation; it does not establish power for normal English
 * over 269 runes.
 */
function positive() {
  const random = rng(0xa1c53301);
  const seqA = new Uint8Array(269);
  const seqB = new Uint8Array(269);
  const gain = 13, inverse = 9, center = 7;
  assert.equal(mod(gain*inverse), 1);
  for (let t = 0; t < 269; t++) {
    const p = random()%100 < 50 ? 18 : random()%M;
    const q = random()%100 < 50 ? 18 : random()%M;
    const k = random()%M;
    seqA[t] = mod(p + k + center);
    seqB[t] = mod(inverse*(q + k));
    assert.equal(mod(seqA[t] - gain*seqB[t] - center), mod(p-q));
  }
  const found = scan([
    {page:100,seq:seqA},{page:101,seq:seqB}
  ],[0,0]);
  assert.deepEqual(found.pair,[100,101]);
  assert.equal(found.gain,gain);
  assert.equal(found.center,center);
  assert(found.score>100);
  return {source:"50% E-index18 plus uniform runes, 269 positions",
    plantedGain:gain,plantedCenter:center,found};
}

function main() {
  const arg = process.argv.indexOf("--trials");
  const trials = arg < 0 ? 600 : Number(process.argv[arg+1]);
  assert(Number.isSafeInteger(trials) && trials >= 0 && trials <= 5000);
  const observed = scan(pages, Array(pages.length).fill(0));
  assert.deepEqual(observed.pair, [28,42]);
  assert.equal(observed.gain,1);
  assert.equal(observed.center,0);
  assert(Math.abs(observed.score-65.20074349442378)<1e-8);

  const plant = positive();
  const seed = 0xc1cada42;
  const random = rng(seed);
  let exceeded = 0;
  let histograms = 0;
  let expensive = 0;
  const started = Date.now();
  for (let t = 0; t < trials; t++) {
    const offsets = pages.map(p => random()%p.seq.length);
    const a = scan(pages, offsets, observed.score);
    if (a.score >= observed.score-1e-9) exceeded++;
    histograms += a.histograms;
    expensive += a.expensive;
  }
  process.stdout.write(JSON.stringify({
    hypothesis:"shared affine-mod29 pad, arbitrary relative gain and offset",
    input:{pages:pages.length,minimumPageRunes:MIN_RUNES,
      pairCount,pagesPhysical:"0..55, exclude rune-free page50"},
    multiplicity:{nonzeroGains:28,centers:29,
      configurations:pairCount*28*29},
    observed,
    null:{trials,seed:"0x"+seed.toString(16),exceeded,
      addOneUpperTail:(exceeded+1)/(trials+1),
      pageRotation:"independently circular rotate entire physical pages",
      histogramsEvaluated:histograms,
      exactProjectionTests:expensive,
      elapsedMs:Date.now()-started},
    syntheticHighContrastPositive:plant,
    caveat:"Conditional familywise anomaly only. Original pair and symmetry " +
      "family were previously noticed; no decrypted original LP2 text or " +
      "English-register power guarantee. Arbitrary nonlinear page alphabets " +
      "and stateful channel alterations remain untested."
  },null,2)+"\n");
}

if (require.main === module) main();
module.exports = {mod,rng,bestCentered,scan,positive};
