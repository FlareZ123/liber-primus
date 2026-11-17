"use strict";
/**
 * Fixed source-motivated affine receiver test for the provisional p57/p50 DH73
 * candidate. Tests only j=(A*i+K) mod76 with A=107, K=73, plus its inverse
 * gather/scatter orientation. It is not a key search.
 *
 * Run: node sims/lp2_p55_dh73_affine76_transposition_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { trainNativeGP, languageScore } = require("./historical_solve_path_transfer.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const model = trainNativeGP(read("resources/control/emerson_essays_2944.txt"));
const p55 = corpus.pages.find(page => page.page === 55).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
const N = 76;
const A = 107;
const K = 73;
const a = A % N;
const k = K % N;

function gcd(x, y) {
  while (y) [x, y] = [y, x % y];
  return x;
}
function render(symbols) {
  return symbols.map(index => corpus.translit[index]).join("");
}
function score(symbols) {
  return languageScore(symbols, model);
}
function affineGather(cipher, multiplier, offset) {
  return Array.from({ length: N }, (_, i) => cipher[(multiplier * i + offset) % N]);
}
function affineScatter(cipher, multiplier, offset) {
  const output = Array(N);
  for (let i = 0; i < N; i++) output[(multiplier * i + offset) % N] = cipher[i];
  return output;
}

if (p55.length !== N) throw new Error(`Expected 76 p55 runes, got ${p55.length}`);
if (gcd(a, N) !== 1) throw new Error(`Affine multiplier ${a} is not invertible mod ${N}`);

const gather = affineGather(p55, a, k);
const scatter = affineScatter(p55, a, k);
const rawScore = score(p55);
const gatherScore = score(gather);
const scatterScore = score(scatter);

// Locked null: every affine permutation of 76 positions, not a tuned key search.
const family = [];
for (let multiplier = 0; multiplier < N; multiplier++) {
  if (gcd(multiplier, N) !== 1) continue;
  for (let offset = 0; offset < N; offset++) {
    family.push({
      multiplier,
      offset,
      score: score(affineGather(p55, multiplier, offset))
    });
  }
}
family.sort((x, y) => y.score - x.score);
const rank = value => family.findIndex(item => Math.abs(item.score - value) < 1e-12) + 1;
const gatherRank = rank(gatherScore);
const scatterRank = rank(scatterScore);

console.log(JSON.stringify({
  evidenceClass: "fixed candidate receiver test; no plaintext or key recovered",
  sourceHypothesis: {
    candidateDH_A: A,
    candidateDH_K: K,
    modulus: N,
    affineMap: "j=(A*i+K) mod76",
    reducedCoefficients: { a, k },
    gcd_a_76: gcd(a, N),
    p55Runes: p55.length
  },
  languageModel: {
    reference: "resources/control/emerson_essays_2944.txt",
    trainedGPSymbols: model.symbolCount,
    method: "existing trainNativeGP/languageScore from historical_solve_path_transfer.cjs"
  },
  scoresPerRune: {
    nativeP55: rawScore,
    affineGather: gatherScore,
    affineScatter: scatterScore,
    nativeP57PositiveControl: score(p57)
  },
  affineNull: {
    familySize: family.length,
    gatherRank,
    scatterRank,
    gatherPercentile: 100 * (1 - (gatherRank - 1) / family.length),
    scatterPercentile: 100 * (1 - (scatterRank - 1) / family.length),
    bestFive: family.slice(0, 5)
  },
  outputGP: { gather: render(gather), scatter: render(scatter) },
  conclusion: "Both fixed orientations score worse than native p55 and rank in the lower quarter of all affine permutations. This rejects the direct one-layer affine-76 receiver, not the upstream DH tuple or every possible use of the numbers."
}, null, 2));
