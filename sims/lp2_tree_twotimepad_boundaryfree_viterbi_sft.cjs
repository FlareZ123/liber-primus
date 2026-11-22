"use strict";

/**
 * Original-source p32/p55 shared-pad pair attack with no plaintext word breaks.
 *
 * This attempts to recover TWO plaintexts, rather than interpret the previously
 * reported p32/p55 differential IoC. An arbitrary per-symbol shared additive
 * GP29 key cancels between source ciphertexts. The exact, source-linked pair is
 * fixed at physical p32 offset 19 and p55 offset 0. Letter-level Viterbi
 * optimizes both candidate plaintexts simultaneously against a held-out
 * Shakespeare-trained interpolated GP29 tetragram model.
 *
 * This is an attack on a CONDITIONAL key-reuse cipher, not an authenticated
 * Cicada algorithm. It must never be used to assert a plaintext without
 * independently reproducible prose and calibrated original-source controls.
 *
 * Windows 11 / Node.js 22; no dependencies or network access.
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const english = fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8"
);
const R = 29, R2 = R * R, R3 = R2 * R, R4 = R3 * R;
const letterIndex = new Map(corpus.translit.map((t, i) => [t, i]));

/**
 * GP orthography used for an English control. Manuscript punctuation is NOT
 * assumed to delimit plaintext words. The exact same encoder trains the
 * model and supplies the independently held-out positive-control plaintext.
 * @param {string} text
 * @returns {number[]}
 */
function gpEncode(text) {
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  const output = [];
  for (let i = 0; i < normalized.length; i++) {
    if (!/[A-Z]/.test(normalized[i])) continue;
    const pair = normalized.slice(i, i + 2);
    if (letterIndex.has(pair)) {
      output.push(letterIndex.get(pair));
      i++;
    } else if (letterIndex.has(normalized[i])) {
      output.push(letterIndex.get(normalized[i]));
    }
  }
  return output;
}

const englishRunes = gpEncode(english);
const trainEnd = Math.floor(englishRunes.length * 0.67);
assert(englishRunes.length > 200000);
const c1 = new Int32Array(R), c2 = new Int32Array(R2),
  c3 = new Int32Array(R3), c4 = new Int32Array(R4);
for (let i = 0; i < trainEnd; i++) {
  const d = englishRunes[i];
  c1[d]++;
  if (i > 0) c2[englishRunes[i - 1] * R + d]++;
  if (i > 1) c3[(englishRunes[i - 2] * R + englishRunes[i - 1]) * R + d]++;
  if (i > 2) c4[((englishRunes[i - 3] * R + englishRunes[i - 2]) * R
    + englishRunes[i - 1]) * R + d]++;
}
const lambda1 = 0.005, lambda2 = 0.7, lambda3 = 2.5, lambda4 = 3;
const total = c1.reduce((a, b) => a + b, 0);
const p1 = new Float32Array(R), p2 = new Float32Array(R2),
  p3 = new Float32Array(R3), log4 = new Float32Array(R4);
for (let a = 0; a < R; a++) p1[a] = (c1[a] + lambda1) / (total + R * lambda1);
for (let a = 0; a < R; a++)
  for (let b = 0; b < R; b++) {
    const j = a * R + b;
    p2[j] = (c2[j] + lambda2 * p1[b]) / (c1[a] + lambda2);
  }
for (let a = 0; a < R; a++)
  for (let b = 0; b < R; b++)
    for (let c = 0; c < R; c++) {
      const j = (a * R + b) * R + c;
      p3[j] = (c3[j] + lambda3 * p2[b * R + c])
        / (c2[a * R + b] + lambda3);
    }
for (let j = 0; j < R3; j++)
  for (let d = 0; d < R; d++) {
    const k = j * R + d;
    log4[k] = Math.log((c4[k] + lambda4 * p3[(j % R2) * R + d])
      / (c3[j] + lambda4));
  }
const log1 = Array.from(p1, Math.log);
const mod = (v) => (v + R) % R;

/**
 * Exact joint maximum-likelihood 4-gram decoding for an arbitrary shared
 * GP29 additive pad. P2[i] = P1[i] - D[i] (mod29); state is P1's last
 * three symbols (29^3 states, 29 next-symbol candidates per state).
 * @param {number[]} differences
 * @returns {{score:number,first:number[],second:number[],plain1:string,plain2:string}}
 */
function solve(differences) {
  const n = differences.length;
  assert(n >= 4);
  let scores = new Float64Array(R3);
  let next = new Float64Array(R3);
  const back = new Int8Array(n * R3);
  for (let a = 0; a < R; a++)
    for (let b = 0; b < R; b++)
      for (let c = 0; c < R; c++) {
        const aa = mod(a - differences[0]);
        const bb = mod(b - differences[1]);
        const cc = mod(c - differences[2]);
        const state = (a * R + b) * R + c;
        scores[state] = log1[a] + Math.log(p2[a * R + b]) + Math.log(p3[state])
          + log1[aa] + Math.log(p2[aa * R + bb])
          + Math.log(p3[(aa * R + bb) * R + cc]);
      }
  for (let i = 3; i < n; i++) {
    next.fill(-Infinity);
    const di0 = differences[i - 3], di1 = differences[i - 2],
      di2 = differences[i - 1], di3 = differences[i];
    let state = 0;
    for (let a = 0; a < R; a++)
      for (let b = 0; b < R; b++)
        for (let c = 0; c < R; c++, state++) {
          const aa = mod(a - di0), bb = mod(b - di1), cc = mod(c - di2);
          const firstBase = state * R;
          const secondBase = ((aa * R + bb) * R + cc) * R;
          const nextBase = (b * R + c) * R;
          const oldScore = scores[state];
          for (let d = 0; d < R; d++) {
            const newState = nextBase + d;
            const candidate = oldScore + log4[firstBase + d]
              + log4[secondBase + mod(d - di3)];
            if (candidate > next[newState]) {
              next[newState] = candidate;
              back[i * R3 + newState] = a;
            }
          }
        }
    const tmp = scores;
    scores = next;
    next = tmp;
  }
  let best = -Infinity, state = 0;
  for (let j = 0; j < R3; j++)
    if (scores[j] > best) { best = scores[j]; state = j; }
  const first = new Array(n);
  for (let i = n - 1; i >= 3; i--) {
    first[i] = state % R;
    state = back[i * R3 + state] * R2 + Math.floor(state / R);
  }
  first[2] = state % R;
  first[1] = Math.floor(state / R) % R;
  first[0] = Math.floor(state / R2);
  const second = first.map((v, i) => mod(v - differences[i]));
  return {
    score: best,
    first, second,
    plain1: first.map((v) => corpus.translit[v]).join(""),
    plain2: second.map((v) => corpus.translit[v]).join(""),
  };
}

/** @param {number[]} first @param {number[]} second @returns {number[]} */
function differential(first, second) {
  assert.equal(first.length, second.length);
  return first.map((v, i) => mod(v - second[i]));
}
const p32 = corpus.pages.find((p) => p.page === 32).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.equal(corpus.pages.filter((p) => p.page <= 55)
  .reduce((sum, p) => sum + p.indices.length, 0), 12956);
const overlap = p32.slice(19, 95);
const real = solve(differential(overlap, p55));
assert(Math.abs(real.score + 271.3850760580053) < 0.04,
  "Frozen original-score regression changed");
const controls = [];
for (let j = 0; j < 8; j++) {
  const start1 = trainEnd + 1200 + 360 * j;
  const start2 = trainEnd + 9000 + 360 * j;
  const original1 = englishRunes.slice(start1, start1 + 76);
  const original2 = englishRunes.slice(start2, start2 + 76);
  const key = original1.map((_, i) => (7 * i * i + 11 * i + 3 + j) % R);
  const cipher1 = original1.map((v, i) => mod(v + key[i]));
  const cipher2 = original2.map((v, i) => mod(v + key[i]));
  const recovered = solve(differential(cipher1, cipher2));
  const correct1 = recovered.first.filter((v, i) => v === original1[i]).length;
  const correct2 = recovered.second.filter((v, i) => v === original2[i]).length;
  controls.push({seed:j,score:recovered.score,correct1,correct2});
  assert.deepEqual(differential(cipher1, cipher2),
    differential(original1, original2), "Pad failed to cancel");
}
const rotations = [1, 7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73];
const nulls = rotations.map((shift) => {
  const other = p55.map((_, i) => p55[(i + shift) % 76]);
  return {shift,score:solve(differential(overlap, other)).score};
});
const plantScores = controls.map((x) => x.score).sort((a, b) => a - b);
const nullScores = nulls.map((x) => x.score).sort((a, b) => a - b);
const output = {
  model: "GP29 joint-tetragram Viterbi, unknown shared symbol key",
  source: {page32Offset:19,page55Offset:0,runicLength:76,
    knownOriginalP55CrossPageCarry:true,
    englishRuneTrain:trainEnd,englishRuneHoldout:englishRunes.length - trainEnd},
  original: {score:real.score,decoded32:real.plain1,decoded55:real.plain2},
  plantedEnglish: {controls,scoreMedian:plantScores[3],
    exactRuneMatchesPerPair:controls.map((x) => x.correct1 + x.correct2)},
  sourcePreservingRotationNull: {nulls,scoreMedian:nullScores[6],
    countAtLeastOriginal:nullScores.filter((v) => v >= real.score).length},
  decision: "No authentic p32 or p55 plaintext claimed; source pad reuse remains unproven.",
};
console.log(JSON.stringify(output, null, 2));
