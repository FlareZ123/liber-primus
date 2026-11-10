'use strict';
/**
 * Source-constrained shifted-pad attack.
 *
 * H0: each physical page uses unrelated/unrecoverable keystream material.
 * H1: C[j,t] = P[j,t] + K[t-s[j]] + b[j] (mod 29), with a single
 * nonperiodic shared K, unknown page offsets s[j] in [-1,1] up to
 * the globally irrelevant origin, and arbitrary independent b[j].
 *
 * Jointly infer s[j] in [-2,2] and b[j] in 0..28 by conditional
 * collision-likelihood ascent on one set of key positions; freeze
 * every parameter before testing a disjoint set of key positions.
 * A full-page circular-rotation null repeats all fitted starts.
 *
 * Manual CI only, standalone Node.js 22 CommonJS.
 *
 * @module shifted_page_pad_crossfit
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {makePrior} = require('./caesar_pad_spectral.cjs');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const english = fs.readFileSync(
  path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const MOD = 29;
const SLIP = 2;
const WIDTH = 90;
const TRAIN_START = 2;
const HOLD_START = 107;
const STARTS = 15;
const ROUNDS = 6;
const SEED = 0x15311531;
const SOURCE = corpus.pages.filter(
  p => p.status === 'unsolved' && p.indices.length >= 200
).map(p => p.indices);
assert.equal(SOURCE.length, 46);
assert.equal(SOURCE.reduce((s,p) => s + p.length, 0),
  corpus.pages.filter(p => p.status === 'unsolved' && p.indices.length >= 200)
    .reduce((s,p) => s + p.indices.length, 0));

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let state = seed >>> 0;
  assert.notEqual(state, 0);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}
/** @param {number[][]} pages @param {number} seed */
function rotatePages(pages, seed) {
  const draw = random(seed);
  return pages.map(page => {
    const split = Math.floor(draw() * page.length);
    return page.slice(split).concat(page.slice(0, split));
  });
}
/** @param {number[]} counts @returns {number} */
function collisions(counts) {
  let total = 0;
  for (const n of counts) total += n * (n - 1) / 2;
  return total;
}
/**
 * @param {number[][]} pages
 * @param {number} seed
 * @param {number} [starts]
 * @returns {{train:number,heldout:number,shifts:number[],offsets:number[]}}
 */
function fit(pages, seed, starts = STARTS) {
  const n = pages.length, phaseCount = SLIP * 2 + 1;
  assert(pages.length >= 2 && pages.every(p => p.length >= 200));
  // Both positions for any fixed page shift are disjoint.
  assert(TRAIN_START + WIDTH <= HOLD_START);
  assert(HOLD_START + WIDTH - 1 + SLIP < 200);
  const prepared = pages.map(page => Array.from({length: phaseCount}, (_,s) =>
    Uint8Array.from({length: WIDTH * 2}, (_,i) => {
      const t = i < WIDTH ? TRAIN_START + i : HOLD_START + i - WIDTH;
      return page[t + s - SLIP];
    })
  ));
  let best = null;
  for (let restart = 0; restart < starts; restart++) {
    const draw = random((seed + restart * 7919) >>> 0);
    const shifts = new Int8Array(n), offsets = new Int8Array(n);
    shifts[0] = SLIP; // Gauge: first page's key and alphabet origin are zero.
    for (let j = 1; j < n; j++) {
      shifts[j] = Math.floor(draw() * phaseCount);
      offsets[j] = Math.floor(draw() * MOD);
    }
    const count = new Uint8Array(WIDTH * MOD);
    /** @param {number} j @param {number} change */
    function update(j, change) {
      const row = prepared[j][shifts[j]], b = offsets[j];
      for (let t = 0; t < WIDTH; t++)
        count[t * MOD + (row[t] + MOD - b) % MOD] += change;
    }
    for (let j = 0; j < n; j++) update(j, 1);
    for (let round = 0; round < ROUNDS; round++) {
      let moved = 0;
      for (let j = 1; j < n; j++) {
        update(j, -1);
        let maximum = -1, chosenS = shifts[j], chosenB = offsets[j];
        for (let s = 0; s < phaseCount; s++) {
          const row = prepared[j][s];
          for (let b = 0; b < MOD; b++) {
            let score = 0;
            for (let t = 0; t < WIDTH; t++)
              score += count[t * MOD + (row[t] + MOD - b) % MOD];
            if (score > maximum) {
              maximum = score;
              chosenS = s;
              chosenB = b;
            }
          }
        }
        if (chosenS !== shifts[j] || chosenB !== offsets[j]) moved++;
        shifts[j] = chosenS;
        offsets[j] = chosenB;
        update(j, 1);
      }
      if (!moved) break;
    }
    const training = collisions(count);
    if (best === null || training > best.train) {
      const heldout = new Uint8Array(WIDTH * MOD);
      for (let j = 0; j < n; j++) {
        const row = prepared[j][shifts[j]], b = offsets[j];
        for (let t = 0; t < WIDTH; t++)
          heldout[t * MOD + (row[t + WIDTH] + MOD - b) % MOD]++;
      }
      best = {train:training, heldout:collisions(heldout),
        shifts:Array.from(shifts, s => s - SLIP), offsets:Array.from(offsets)};
    }
  }
  return best;
}
/**
 * Plant a page-matched GP-English plaintext with a common random pad,
 * independent page-local Caesar masks and unknown key-pointer slips.
 * 81% of tentative adjacent ciphertext repeats are overwritten uniformly.
 * @param {number[][]} layout
 * @param {number[]} prior
 * @param {number} seed
 * @param {number} repairProbability
 */
function plant(layout, prior, seed, repairProbability) {
  const draw = random(seed), cumulative = [], n = layout.length;
  let sum = 0;
  for (const p of prior) {sum += p; cumulative.push(sum);}
  const sample = () => {
    const x = draw();
    for (let i = 0; i < MOD - 1; i++) if (x < cumulative[i]) return i;
    return MOD - 1;
  };
  const pad = Array.from({length:300}, () => Math.floor(draw() * MOD));
  const shifts = Array.from({length:n}, () => Math.floor(draw() * 3) - 1);
  const offsets = Array.from({length:n}, () => Math.floor(draw() * MOD));
  let repaired = 0;
  const pages = layout.map((page,j) => {
    let last = -1;
    return page.map((unused,t) => {
      let c = (sample() + pad[t - shifts[j] + 3] + offsets[j]) % MOD;
      if (last === c && draw() < repairProbability) {
        const other = Math.floor(draw() * 28);
        c = other >= last ? other + 1 : other;
        repaired++;
      }
      last = c;
      return c;
    });
  });
  return {pages, shifts, offsets, repaired};
}
/** @param {number[]} xs */
function summary(xs) {
  const mean = xs.reduce((s,x) => s + x, 0) / xs.length;
  return {mean, min:Math.min(...xs), max:Math.max(...xs)};
}
/** @param {number} nullTrials @param {number} plantTrials */
function run(nullTrials = 80, plantTrials = 12) {
  const source = fit(SOURCE, SEED), draw = random(0x21950f17);
  const nulls = [];
  for (let i = 0; i < nullTrials; i++)
    nulls.push(fit(rotatePages(SOURCE, Math.floor(draw() * 0x100000000)),
      (SEED + i * 1031) >>> 0).heldout);
  const prior = makePrior(english);
  const positives = [];
  for (const repair of [0, 0.81]) {
    for (let i = 0; i < plantTrials; i++) {
      const generated = plant(SOURCE, prior,
        (0x21950000 + Math.round(repair * 1000) + i * 1009) >>> 0, repair);
      const result = fit(generated.pages, SEED);
      const nCorrect = result.shifts.filter((s,j) =>
        s === generated.shifts[j] - generated.shifts[0]).length;
      const congruent = Array.from({length:MOD}, (_,delta) =>
        result.offsets.filter((x,j) =>
          (x - generated.offsets[j] + MOD) % MOD === delta).length);
      positives.push({repair, heldout:result.heldout, train:result.train,
        shiftAligned:nCorrect, largestOffsetGroup:Math.max(...congruent),
        overwritten:generated.repaired});
    }
  }
  const baseline = SOURCE.length * (SOURCE.length-1) / 2 * WIDTH / MOD;
  return {
    cipher:'single nonperiodic shared mod29 keystream with independent page-key shifts and page Caesar offsets',
    data:'46 original rune-bearing unsolved LP2 pages, each >=200 glyphs',
    fit:'15 deterministic restarts; 6 greedy coordinate passes each; first-page shift and alphabet anchored',
    shifts:'relative positions [-2,+2]; corresponding true planted phases [-1,+1]',
    trainPositions:[TRAIN_START,TRAIN_START+WIDTH-1],
    heldoutPositions:[HOLD_START,HOLD_START+WIDTH-1],
    baselineUniformCollisionPairs:baseline,
    actual:{train:source.train,heldout:source.heldout},
    rotationNull:{replicates:nullTrials,seed:'0x21950f17',...summary(nulls),
      empiricalUpperTail:(nulls.filter(x=>x>=source.heldout).length+1)/(nullTrials+1)},
    planted: {priorIoC:prior.reduce((s,x)=>s+x*x,0),
      data:positives,
      noRepairHeldout:summary(positives.filter(x=>x.repair===0).map(x=>x.heldout)),
      repairHeldout:summary(positives.filter(x=>x.repair>0).map(x=>x.heldout)),
      noRepairAboveNull95:positives.filter(x=>x.repair===0 &&
        x.heldout > nulls.slice().sort((a,b)=>a-b)[Math.floor(.95*nullTrials)]).length,
      repairAboveNull95:positives.filter(x=>x.repair>0 &&
        x.heldout > nulls.slice().sort((a,b)=>a-b)[Math.floor(.95*nullTrials)]).length
    },
    caveat:'This bounds a particular low-slip additive/Caesar family; neither a genuine ciphertext key nor LP2 plaintext is recovered.'
  };
}
if (require.main === module)
  console.log(JSON.stringify(run(Number(process.argv[2] || 80),
    Number(process.argv[3] || 12)), null, 2));
module.exports = {random, rotatePages, collisions, fit, plant, run};
