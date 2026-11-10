"use strict";
/**
 * Fit an arbitrary, shared 29-symbol outer permutation over a
 * prescribed base60-grid-derived page-reset additive key stream.
 *
 * Encryption hypothesis:
 *   C(page,t) = sigma((P(page,t) + K[(t+offset) mod 256]) mod 29).
 * For fixed K and offset, fit the global permutation sigma using only
 * training pages via maximum-weight bipartite assignment (Hungarian).
 * Score independent held-out pages. Nulls shuffle the prescribed grid
 * stream but preserve its symbol counts; planted scenarios use a random
 * global sigma, optional collision-driven independent key skips.
 *
 * This is a method-specific, held-out attack, not a general LP2 decode.
 * Run: node sims/grid_outer_permutation_cv.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"
));
const pages = corpus.pages.filter((p) =>
  p.status === "unsolved" && p.indices.length >= 64
);
const arrays = pages.map((p) => p.indices);
const ref = corpus.pages.filter((p) =>
  p.status === "solved"
).flatMap((p) => p.indices);
const N = 29;
const PERIOD = 256;
const WINDOWS = [16, 32, 64];
const NULL_REPS = 100;
const PLANT_REPS = 24;
const SEED = 0x10299391;
const key = Uint8Array.from(grid.byte_rows.flat().map((x) => x % N));
const counts = Array(N).fill(1);
for (const x of ref) counts[x]++;
const q = counts.map((x) => x / (ref.length + N));
const logOdds = q.map((x) => Math.log(x * N));

/** @param {number} seed */
function rng(seed) {
  let s = seed | 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}
const draw = rng(SEED);

/**
 * Maximum-weight perfect matching for a 29x29 cost matrix.
 * @param {Float64Array} weights row-major weights[c*N + u].
 * @returns {Uint8Array} inferred inverse permutation u(c).
 */
function hungarian(weights) {
  const dualRow = new Float64Array(N + 1);
  const dualCol = new Float64Array(N + 1);
  const assignedRow = new Int16Array(N + 1);
  const previous = new Int16Array(N + 1);
  for (let i = 1; i <= N; i++) {
    assignedRow[0] = i;
    let j0 = 0;
    const minCost = new Float64Array(N + 1).fill(Infinity);
    const used = new Uint8Array(N + 1);
    do {
      used[j0] = 1;
      const i0 = assignedRow[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= N; j++) {
        if (used[j]) continue;
        const candidate =
          -weights[(i0 - 1) * N + j - 1] - dualRow[i0] - dualCol[j];
        if (candidate < minCost[j]) {
          minCost[j] = candidate;
          previous[j] = j0;
        }
        if (minCost[j] < delta) {
          delta = minCost[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= N; j++) {
        if (used[j]) {
          dualRow[assignedRow[j]] += delta;
          dualCol[j] -= delta;
        } else minCost[j] -= delta;
      }
      j0 = j1;
    } while (assignedRow[j0] !== 0);
    do {
      const j1 = previous[j0];
      assignedRow[j0] = assignedRow[j1];
      j0 = j1;
    } while (j0 !== 0);
  }
  const decodedSymbol = new Uint8Array(N);
  for (let j = 1; j <= N; j++) {
    decodedSymbol[assignedRow[j] - 1] = j - 1;
  }
  return decodedSymbol;
}

/** @param {number[]} weights */
function allDifferent(weights) {
  return (new Set(weights)).size === weights.length;
}

/**
 * @param {number[][]} data
 * @param {Uint8Array} keyStream
 * @param {number[]} train
 * @param {number[]} test
 * @param {boolean} [returnBest=false]
 */
function screen(data, keyStream, train, test, returnBest = false) {
  const result = WINDOWS.map(() => ({
    best: -Infinity, offset: -1, mapping: null, trainFit: -Infinity
  }));
  const scores = new Float64Array(N * N);
  const logWeights = Array.from({ length: N }, (_, k) =>
    Array.from({ length: N }, (_, u) => logOdds[(u - k + N) % N])
  );
  for (let off = 0; off < PERIOD; off++) {
    scores.fill(0);
    let at = 0;
    for (let t = 0; t < WINDOWS[WINDOWS.length - 1]; t++) {
      const k = keyStream[(t + off) & 255];
      const weights = logWeights[k];
      for (const i of train) {
        const c = data[i][t];
        for (let u = 0; u < N; u++) scores[c * N + u] += weights[u];
      }
      if (t + 1 === WINDOWS[at]) {
        const decoded = hungarian(scores);
        let heldOut = 0, fit = 0;
        for (const i of test) {
          const a = data[i];
          for (let pos = 0; pos <= t; pos++) {
            const p = (decoded[a[pos]] -
              keyStream[(pos + off) & 255] + N) % N;
            heldOut += logOdds[p];
          }
        }
        if (heldOut > result[at].best) {
          for (const i of train) {
            const a = data[i];
            for (let pos = 0; pos <= t; pos++) {
              const p = (decoded[a[pos]] -
                keyStream[(pos + off) & 255] + N) % N;
              fit += logOdds[p];
            }
          }
          result[at] = {
            best: heldOut, offset: off,
            mapping: returnBest ? Array.from(decoded) : null,
            trainFit: fit
          };
        }
        at++;
      }
    }
  }
  return result;
}

/**
 * @param {number} n
 * @param {() => number} random
 */
function permutation(n, random) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {boolean} skip
 * @param {() => number} random
 */
function plant(skip, random) {
  const sigma = permutation(N, random);
  const out = [];
  for (const original of arrays) {
    const a = [], offset = 0;
    let pointer = offset;
    for (let t = 0; t < original.length; t++) {
      let r = random(), plain = N - 1;
      for (let p = 0; p < N; p++) {
        r -= q[p];
        if (r <= 0) { plain = p; break; }
      }
      let c;
      do {
        c = sigma[(plain + key[pointer++ & 255]) % N];
      } while (skip && t > 0 && c === a[t - 1] && random() < 0.83);
      a.push(c);
    }
    out.push(a);
  }
  return out;
}

const split = permutation(arrays.length, draw);
const train = split.slice(0, Math.floor(split.length / 2));
const test = split.slice(train.length);
const original = screen(arrays, key, train, test, true);
const nulls = [];
for (let j = 0; j < NULL_REPS; j++) {
  const randomKey = Uint8Array.from(permutation(PERIOD, draw).map((i) => key[i]));
  nulls.push(screen(arrays, randomKey, train, test).map((x) => x.best));
}
const byWindow = WINDOWS.map((window, i) => {
  const x = nulls.map((r) => r[i]);
  const mean = x.reduce((a, b) => a + b, 0) / x.length;
  const sd = Math.sqrt(x.reduce((a, b) => a + (b - mean) ** 2, 0) / (x.length - 1));
  return {
    window, score: original[i].best, offset: original[i].offset,
    trainFit: original[i].trainFit, fittedInverseSigma: original[i].mapping,
    nullMean: mean, nullSd: sd, z: (original[i].best - mean) / sd,
    upperTailP: (x.filter((v) => v >= original[i].best).length + 1) / (x.length + 1)
  };
});
const maxZ = Math.max(...byWindow.map((x) => x.z));
const maxNull = nulls.map((row) => Math.max(...row.map((v, i) =>
  (v - byWindow[i].nullMean) / byWindow[i].nullSd
)));
const familywiseP = (1 + maxNull.filter((x) => x >= maxZ).length) /
  (NULL_REPS + 1);
const plantControl = { noSkip: [], skip83: [] };
for (let j = 0; j < PLANT_REPS; j++) {
  plantControl.noSkip.push(screen(plant(false, draw), key, train, test)
    .map((x) => x.best));
  plantControl.skip83.push(screen(plant(true, draw), key, train, test)
    .map((x) => x.best));
}
const controls = WINDOWS.map((window, i) => {
  const sorted = nulls.map((row) => row[i]).sort((a, b) => a - b);
  const threshold = sorted[Math.floor(0.95 * NULL_REPS)];
  return {
    window, threshold,
    noSkipAbove95: plantControl.noSkip.filter((row) =>
      row[i] > threshold).length,
    skip83Above95: plantControl.skip83.filter((row) =>
      row[i] > threshold).length,
    trials: PLANT_REPS
  };
});
if (!allDifferent(original[0].mapping)) {
  throw new Error("The fitted outer mapping is not a permutation");
}
console.log(JSON.stringify({
  model: "C=sigma((P+K[(offset+t)%256]) mod29), global unknown sigma",
  prescribedKey: "base60 grid row-major byte%29",
  criterion: "held-out page log likelihood ratio vs uniform",
  seed: "0x10299391",
  trainPages: train.map((i) => pages[i].page),
  testPages: test.map((i) => pages[i].page),
  windows: WINDOWS,
  keyOffsets: PERIOD,
  nulls: NULL_REPS,
  plantReplicates: PLANT_REPS,
  familywiseP,
  byWindow,
  controls
}, null, 2));
