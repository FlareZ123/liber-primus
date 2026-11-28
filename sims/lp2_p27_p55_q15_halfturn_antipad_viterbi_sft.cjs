"use strict";

/**
 * Original-source p27/p55 six-rune seam: Q^15 half-cycle opposite-pad pair attack.
 *
 * A source-motivated independent rival of the previous *same* shared-pad test:
Q=17+24u is primitive in the p3 field of order840, and the authenticated
2013 DH exponent b=15 gives Q^(15*28)=Q^420=-1. Original p55/p27
ciphertext footer is copied exactly, at a physical gap of 28 pages.
Hypothesize anti-reused GP29 pads K and -K, rather than K and K:
C27=P27+K, C55=P55-K. Then the EXACT unknown-key-free invariant is
SUM=(C27+C55) mod29=(P27+P55) mod29. Recover BOTH plaintexts by an exact
joint tetragram Viterbi inverse with printed word boundaries hidden.
The six copied source ciphertext runes force SUM[-6:]=2*C[-6:], not zero.
The anti-pad model is not an established author operation, and any English
output needs independent authentication and planted/wrong-alignment controls.
Windows 11/Node22, no dependencies/network writes.
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
 * GP29 additive pad. P2[i] = S[i] - P1[i] (mod29); state is P1's last
 * three symbols (29^3 states, 29 next-symbol candidates per state).
 * @param {number[]} differences
 * @returns {{score:number,first:number[],second:number[],plain1:string,plain2:string}}
 */
function solve(sums) {
  const n = sums.length;
  assert(n >= 4);
  let scores = new Float64Array(R3);
  let next = new Float64Array(R3);
  const back = new Int8Array(n * R3);
  for (let a = 0; a < R; a++)
    for (let b = 0; b < R; b++)
      for (let c = 0; c < R; c++) {
        const aa = mod(sums[0] - a);
        const bb = mod(sums[1] - b);
        const cc = mod(sums[2] - c);
        const state = (a * R + b) * R + c;
        scores[state] = log1[a] + Math.log(p2[a * R + b]) + Math.log(p3[state])
          + log1[aa] + Math.log(p2[aa * R + bb])
          + Math.log(p3[(aa * R + bb) * R + cc]);
      }
  for (let i = 3; i < n; i++) {
    next.fill(-Infinity);
    const di0 = sums[i - 3], di1 = sums[i - 2],
      di2 = sums[i - 1], di3 = sums[i];
    let state = 0;
    for (let a = 0; a < R; a++)
      for (let b = 0; b < R; b++)
        for (let c = 0; c < R; c++, state++) {
          const aa = mod(di0 - a), bb = mod(di1 - b), cc = mod(di2 - c);
          const firstBase = state * R;
          const secondBase = ((aa * R + bb) * R + cc) * R;
          const nextBase = (b * R + c) * R;
          const oldScore = scores[state];
          for (let d = 0; d < R; d++) {
            const newState = nextBase + d;
            const candidate = oldScore + log4[firstBase + d]
              + log4[secondBase + mod(di3 - d)];
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
  const second = first.map((v, i) => mod(sums[i] - v));
  return {
    score: best,
    first, second,
    plain1: first.map((v) => corpus.translit[v]).join(""),
    plain2: second.map((v) => corpus.translit[v]).join(""),
  };
}

/** @param {number[]} first @param {number[]} second @returns {number[]} */
function summation(first, second) {
  assert.equal(first.length, second.length);
  return first.map((v, i) => mod(v + second[i]));
}
const section = corpus.pages.filter((p) => p.page >= 27 && p.page <= 32)
  .flatMap((p) => p.indices);
const p55 = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(section.length, 1433);
assert.equal(p55.length, 76);
assert.equal(corpus.pages.filter((p) => p.page <= 55)
  .reduce((sum, p) => sum + p.indices.length, 0), 12956);
// The existing original p55/p56->p27 seven-rune exact seam fixes this walk.
// The p27 section's last 42 runes followed by its first 34 make 76.
const window27 = section.slice(1391).concat(section.slice(0, 34));
assert.equal(window27.length, 76);
assert.deepEqual(window27.slice(-6), p55.slice(-6));
const realSum=summation(window27,p55);
assert.deepEqual(realSum.slice(-6),p55.slice(-6).map(v=>mod(2*v)));
const real=solve(realSum);

// Select naturally occurring held-out English pairs, independently of
// the original two ciphertexts. Both must share their exact final six runes,
// so that the positive controls genuinely include the original seam condition.
const suffixOccurrence = new Map();
const usedEnds = [];
const controls = [];
for (let end = trainEnd + 1000; end < englishRunes.length - 100 && controls.length < 8; end++) {
  const suffix = englishRunes.slice(end - 5, end + 1).join(",");
  const earlier = suffixOccurrence.get(suffix);
  if (earlier === undefined) suffixOccurrence.set(suffix, end);
  if (earlier === undefined || end - earlier < 1600) continue;
  if (usedEnds.some((e) => Math.abs(e - earlier) < 150 || Math.abs(e - end) < 150)) continue;
  const original1 = englishRunes.slice(earlier - 75, earlier + 1);
  const original2 = englishRunes.slice(end - 75, end + 1);
  if (original1.length !== 76 || original2.length !== 76) continue;
  assert.deepEqual(original1.slice(-6), original2.slice(-6));
  const seed = controls.length;
  const key = original1.map((_, i) => i>=70?0:(7*i*i+11*i+3+seed)%R);
  const cipher1 = original1.map((v, i) => mod(v + key[i]));
  const cipher2 = original2.map((v, i) => mod(v - key[i]));
  const delta = summation(cipher1,cipher2);
  assert.deepEqual(cipher1.slice(-6),cipher2.slice(-6));assert.deepEqual(delta.slice(-6),cipher1.slice(-6).map(v=>mod(2*v)));
  const recovered = solve(delta);
  const correct1 = recovered.first.filter((v, i) => v === original1[i]).length;
  const correct2 = recovered.second.filter((v, i) => v === original2[i]).length;
  controls.push({sourceEnd1:earlier,sourceEnd2:end,suffix,
    score:recovered.score,correct1,correct2,
    recoveredSuffix:recovered.plain1.slice(-16)});
  usedEnds.push(earlier,end);
}
assert.equal(controls.length, 8, "Need eight independently heldout natural English suffix pairs");

// Preserve the genuine six-symbol cipher seam exactly in each false
// alignment. Circulate only p55's source-ordered 70-symbol prefix.
const rotations = [1, 7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67];
const nulls = rotations.map((shift) => {
  const other = Array.from({length: 70}, (_, i) => p55[(i + shift) % 70])
    .concat(p55.slice(70));
  assert.deepEqual(other.slice(-6), p55.slice(-6));
  return {shift,score:solve(summation(window27, other)).score};
});
const sortedPlants = controls.map((v) => v.score).sort((a, b) => a - b);
const sortedNulls = nulls.map((v) => v.score).sort((a, b) => a - b);
const output = {
  model: "GP29 joint-tetragram Viterbi, Q^15 half-turn opposite pad; copied six-rune original seam",
  source: {page27SectionLength:1433,page27Walk:"last42 + first34",
    page55Length:76,sharedSixRuneSuffix:"D-J-U-B-E-I",
    originalSixDoubleFooter:true,
    englishRuneTrain:trainEnd,englishRuneHoldout:englishRunes.length - trainEnd},
  original: {score:real.score,decoded27:real.plain1,decoded55:real.plain2},
  plantedEnglish: {controls,scoreMedian:sortedPlants[3],
    countAtOrBelowOriginal:sortedPlants.filter((x) => x <= real.score).length},
  seamPreservingRotationNull: {nulls,scoreMedian:sortedNulls[6],
    countAtLeastOriginal:nulls.filter((v) => v.score >= real.score).length},
  decision: "Opposite-pad full two-plaintext inverse; require independent original-control calibration. No authentic plaintext claimed from a mere score or copied-seam constraint."
};
console.log(JSON.stringify(output, null, 2));
