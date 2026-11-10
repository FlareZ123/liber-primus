"use strict";
/**
 * Hidden-pad likelihood model invariant to arbitrary independent
 * substitutions of the rune alphabet on every LP2 page.
 *
 * C_{page,t} = sigma_page(P_{page,t} + K_t mod 29).
 * For two positions t,u on one page, equality of cipher runes implies
 * P_t + K_t == P_u + K_u (mod 29), regardless of sigma_page.
 *
 * Assuming iid plaintext rune frequencies q, the probability of
 * C_t == C_u conditional on d = K_u - K_t is
 * R[d] = sum_x q[x] * q[(x+d) mod 29].
 *
 * Given the cross-page count of such equality events S[t,u], evaluate a
 * composite binomial log likelihood for candidate pad K. Site-wise Gibbs
 * annealing approximately searches the 29^T keys, fixing the global
 * shift by pinning K_0=0. Its likelihood is a composite score, NOT a
 * full-data probability or a calibrated plaintext solver.
 *
 * Execute from project root in optional workflow:
 *   node sims/key_difference_likelihood.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const MOD = 29;
const LENGTH = 200;
const GAP = 8;
const RESTARTS = 10;
const SWEEPS = 120;
const ROTATIONS = 12;
const SEED = 0x6e3f481a;

/** @param {number} seed */
function rng(seed) {
  let s = seed | 0;
  return function draw() {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** @param {number[]} plaintext */
function unigram(plaintext) {
  const q = new Float64Array(MOD);
  for (const x of plaintext) q[x]++;
  for (let i = 0; i < MOD; ++i) q[i] /= plaintext.length;
  return q;
}

/** @param {Float64Array} q */
function coincidence(q) {
  const r = new Float64Array(MOD);
  for (let d = 0; d < MOD; ++d)
    for (let i = 0; i < MOD; ++i) r[d] += q[i] * q[(i + d) % MOD];
  return r;
}

/**
 * @param {Uint8Array[]} pages
 * @returns {{equal:Uint16Array, counted:Uint16Array}}
 */
function collect(pages) {
  const equal = new Uint16Array(LENGTH * LENGTH);
  const counted = new Uint16Array(LENGTH * LENGTH);
  for (let u = GAP; u < LENGTH; ++u) {
    for (let t = 0; t < u - GAP + 1; ++t) {
      let n = 0, same = 0;
      for (const a of pages) {
        if (a.length <= u) continue;
        n++;
        same += Number(a[t] === a[u]);
      }
      const index = t * LENGTH + u;
      if (n >= 10) {
        equal[index] = same;
        counted[index] = n;
      }
    }
  }
  return { equal, counted };
}

/**
 * @param {{equal:Uint16Array, counted:Uint16Array}} counts
 * @param {Float64Array} r
 * @returns {Float64Array}
 */
function evidence(counts, r) {
  const l = new Float64Array(LENGTH * LENGTH * MOD);
  const base = 1 / MOD;
  const yes = r.map(p => Math.log(p / base));
  const no = r.map(p => Math.log((1 - p) / (1 - base)));
  for (let t = 0; t < LENGTH; ++t) {
    for (let u = t + GAP; u < LENGTH; ++u) {
      const index = t * LENGTH + u, n = counts.counted[index];
      if (!n) continue;
      const m = counts.equal[index], off = index * MOD;
      for (let d = 0; d < MOD; ++d) l[off + d] = m * yes[d] + (n - m) * no[d];
    }
  }
  return l;
}

/**
 * @param {Float64Array} e
 * @param {Uint8Array} key
 */
function globalScore(e, key) {
  let total = 0;
  for (let t = 0; t < LENGTH; ++t)
    for (let u = t + GAP; u < LENGTH; ++u)
      total += e[(t * LENGTH + u) * MOD + ((key[u] - key[t] + MOD) % MOD)];
  return total;
}

/**
 * @param {Float64Array} e
 * @param {() => number} random
 * @returns {{score:number,key:Uint8Array}}
 */
function fit(e, random) {
  let best = -Infinity, bestKey = new Uint8Array(LENGTH);
  const logits = new Float64Array(MOD);
  for (let restart = 0; restart < RESTARTS; ++restart) {
    const key = new Uint8Array(LENGTH);
    for (let t = 1; t < LENGTH; ++t) key[t] = Math.floor(random() * MOD);
    for (let sweep = 0; sweep < SWEEPS; ++sweep) {
      const progress = sweep / (SWEEPS - 1);
      const temp = 1.3 * Math.pow(0.035 / 1.3, progress);
      const offset = Math.floor(random() * (LENGTH - 1));
      for (let n = 0; n < LENGTH - 1; ++n) {
        const t = 1 + (n + offset) % (LENGTH - 1);
        let max = -Infinity;
        for (let trial = 0; trial < MOD; ++trial) {
          let score = 0;
          for (let u = 0; u < t - GAP + 1; ++u) {
            score += e[(u * LENGTH + t) * MOD + ((trial - key[u] + MOD) % MOD)];
          }
          for (let u = t + GAP; u < LENGTH; ++u) {
            score += e[(t * LENGTH + u) * MOD + ((key[u] - trial + MOD) % MOD)];
          }
          logits[trial] = score;
          if (score > max) max = score;
        }
        let mass = 0;
        for (let j = 0; j < MOD; ++j) {
          logits[j] = Math.exp((logits[j] - max) / temp);
          mass += logits[j];
        }
        const r = random() * mass;
        let acc = 0;
        for (let j = 0; j < MOD; ++j) {
          acc += logits[j];
          if (r <= acc) { key[t] = j; break; }
        }
      }
    }
    const score = globalScore(e, key);
    if (score > best) { best = score; bestKey = Uint8Array.from(key); }
  }
  return {score:best,key:bestKey};
}

/**
 * @param {number} nPages
 * @param {Float64Array} q
 * @param {() => number} random
 * @returns {{pages:Uint8Array[],truth:Uint8Array}}
 */
function planted(nPages, q, random) {
  const cdf = [];
  let total = 0;
  for (const v of q) { total += v; cdf.push(total); }
  function plaintext() {
    const r = random();
    for (let i = 0; i < MOD; ++i) if (r <= cdf[i]) return i;
    return MOD - 1;
  }
  const truth = new Uint8Array(LENGTH);
  for (let t = 1; t < LENGTH; ++t) truth[t] = Math.floor(random() * MOD);
  const pages = [];
  for (let i = 0; i < nPages; ++i) {
    const sigma = Array.from({length:MOD}, (_,j)=>j);
    for (let j = MOD - 1; j > 0; --j) {
      const k = Math.floor(random() * (j + 1));
      [sigma[k], sigma[j]] = [sigma[j], sigma[k]];
    }
    const page = new Uint8Array(LENGTH);
    for (let t = 0; t < LENGTH; ++t) {
      let value = sigma[(plaintext() + truth[t]) % MOD];
      if (t > 0 && page[t - 1] === value && random() < 0.81) {
        value = (value + 1 + Math.floor(random() * 28)) % MOD;
      }
      page[t] = value;
    }
    pages.push(page);
  }
  return {pages,truth};
}

/**
 * @param {Uint8Array} guess
 * @param {Uint8Array} truth
 */
function agreement(guess, truth) {
  let max = 0;
  for (let sign of [1,-1]) {
    for (let offset = 0; offset < MOD; ++offset) {
      let n = 0;
      for (let t = 0; t < LENGTH; ++t)
        if (guess[t] === ((sign * truth[t] + offset + MOD) % MOD)) n++;
      if (n > max) max = n;
    }
  }
  return max;
}

const solved = corpus.pages.filter(p => p.status === "solved").flatMap(p => p.indices);
const q = unigram(solved);
const r = coincidence(q);
const random = rng(SEED);
const valid = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length >= LENGTH);
const observedPages = valid.map(p => Uint8Array.from(p.indices.slice(0, LENGTH)));
const obs = evidence(collect(observedPages), r);
const real = fit(obs, random);
console.log("OBSERVED", JSON.stringify({score:real.score,firstKey: Array.from(real.key.slice(0,30)),referenceRunes:solved.length,pages:valid.map(p=>p.page),seed:SEED}));
const shuffled=[];
for (let rep = 0; rep < ROTATIONS; ++rep) {
  const rotations=observedPages.map(a=>{
    const n=Math.floor(random()*LENGTH);
    return Uint8Array.from({length:LENGTH},(_,t)=>a[(t+n)%LENGTH]);
  });
  shuffled.push(fit(evidence(collect(rotations),r),random).score);
  console.log("NULL",rep,shuffled[rep]);
}
const control = planted(observedPages.length,q,random);
const plantedEvidence = evidence(collect(control.pages),r);
const plantFit = fit(plantedEvidence,random);
const plantScore = globalScore(plantedEvidence,control.truth);
console.log("CONTROL", JSON.stringify({score:plantFit.score,trueKeyScore:plantScore,recoveredPositionsUpToGlobalShiftAndReflection:agreement(plantFit.key,control.truth),length:LENGTH,reference:"two solved LP2 pages, unigram draws",seed:SEED}));
console.log("FINAL",JSON.stringify({realScore:real.score,nullScores:shuffled,nullMean:shuffled.reduce((s,x)=>s+x,0)/shuffled.length,exceedances:shuffled.filter(x=>x>=real.score).length,empiricalP:(1+shuffled.filter(x=>x>=real.score).length)/(shuffled.length+1),controlTruth:plantScore,controlOptimized:plantFit.score,controlAgreement:agreement(plantFit.key,control.truth)}));
