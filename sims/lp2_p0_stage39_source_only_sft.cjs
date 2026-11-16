"use strict";
/**
 * Source-only continuation after the proposed LP2 p0–p2 stage 38, I ASK.
 * Implements the published Reports 00–15 that can be checked without English:
 * key phase/signature, mirror, center parity, axis, radius parity;
 * ciphertext axis/direction, mode, endpoint/leftmost parity, exact ray,
 * length >= 2, and four squarefree-GCD source compatibility gates.
 *
 * The 38-stage route is provisional. This script tests its UNDERDETERMINATION,
 * not the historical authenticity of the proposed plaintext.
 * Run on Node 22: node sims/lp2_p0_stage39_source_only_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const tape = corpus.pages.slice(0, 3).flatMap(p => p.indices);
const names = corpus.translit;
assert.equal(tape.length, 729);
const at = (r, c) => tape[(r - 1) * 27 + c - 1];
const n0 = ([r, c]) => 27 * (r - 1) + c;
const n90 = ([r, c]) => 27 * (c - 1) + 28 - r;
const n180 = cell => 730 - n0(cell);
const n270 = cell => 730 - n90(cell);
/** @param {number} n Positive integer. */
function phi(n) {
  let value = n, rest = n;
  for (let factor = 2; factor * factor <= rest; factor++) {
    if (rest % factor === 0) {
      value -= value / factor;
      while (rest % factor === 0) rest /= factor;
    }
  }
  if (rest > 1) value -= value / rest;
  return value;
}
/** @param {number} n Positive integer. */
function mu(n) {
  let sign = 1, rest = n;
  for (let factor = 2; factor * factor <= rest; factor++) {
    if (rest % factor === 0) {
      rest /= factor;
      sign = -sign;
      if (rest % factor === 0) return 0;
    }
  }
  return rest > 1 ? -sign : sign;
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
const sig = key => key.map(v => mu(phi(v))).join(",");
const ray = (L, B) => {
  const dr = Math.abs(L[0] - B[0]), dc = Math.abs(L[1] - B[1]);
  return Math.min(dr, dc, Math.abs(dr - dc));
};
const squarefree = (M, B, E) => [
  gcd(n0(M), n0(B)),
  gcd(n0(M), n0(B)), // leftmost is B in both enumerated stages
  gcd(n90(M), n270(E)),
  gcd(n0(M), n180(E))
].every(v => mu(v) !== 0);
function plaintext(key, cells) {
  // The forecast is phase 1 for each of these two adjacent stages.
  const aligned = [key[1], key[2], key[0]];
  return cells.map(([r, c], i) => names[
    (at(r, c) - aligned[i % 3] + 29) % 29]).join("");
}
function keySources({centerParity, axis, mirror, radiusParity, signature}) {
  const out = [];
  for (let r = 1; r <= 27; r++)
  for (let c = 1; c <= 27; c++) {
    if (r % 2 !== centerParity[0] || c % 2 !== centerParity[1]) continue;
    for (let d = 1; d <= 13; d++) {
      if (d % 2 !== radiusParity) continue;
      let cells;
      if (axis === "horizontal") cells = [[r,c-d], [r,c], [r,c+d]];
      else if (axis === "vertical") cells = [[r-d,c], [r,c], [r+d,c]];
      else throw Error("Only the two source-selected stage axes are tested.");
      if (cells.some(([y,x]) => y < 1 || y > 27 || x < 1 || x > 27)) continue;
      const raw = cells.map(([y,x]) => at(y,x));
      if (raw.includes(0) || (raw[0] === raw[2]) !== mirror) continue;
      for (const transformed of [false, true]) {
        const key = [raw[0], transformed ? phi(raw[1]) : raw[1], raw[2]];
        if (sig(key) !== signature) continue;
        out.push({r,c,d,raw,key,transformed});
      }
    }
  }
  return out;
}
function cipherRays({axis, firstParity, lastParity, leftColParity,
                     leftRowParity, L, exactRayOffset, mode}) {
  const out = [];
  for (let r = 1; r <= 27; r++)
  for (let c = 1; c <= 27; c++) {
    if (r % 2 !== firstParity ||
        r % 2 !== leftRowParity || c % 2 !== leftColParity ||
        ray(L, [r,c]) !== exactRayOffset) continue;
    if (mode === "direct" && mu(n90([r,c])) < 0) continue;
    for (const slope of (axis === "diagonal" ? [-1,1] : [-1])) {
      const cells = [];
      for (let i = 0; i < 27; i++) {
        const row = r + slope * i;
        const col = c + (axis === "diagonal" ? i : 0);
        if (row < 1 || row > 27 || col > 27) break;
        cells.push([row,col]);
        if (cells.length >= 2 && row % 2 === lastParity) out.push(cells.slice());
      }
    }
  }
  return out;
}
const stage38 = {
  source: [[11,13],[12,13],[13,13]],
  ciphertext: [[5,17],[6,17],[7,17],[8,17]],
  sourceRunes: [16,19,28],
  phase: 0, S: 32, a: 0
};
assert.deepEqual(stage38.source.map(([r,c]) => at(r,c)), stage38.sourceRunes);
assert.deepEqual(stage38.ciphertext.map(([r,c]) => at(r,c)), [26,14,14,21]);
const signature39 = "0,1,0";
const key39 = keySources({
  centerParity:[0,0], axis:"horizontal", mirror:false,
  radiusParity:0, signature:signature39
});
const rays39 = cipherRays({
  axis:"diagonal", firstParity:1, lastParity:1,
  leftColParity:0, leftRowParity:1,
  L:[8,17], exactRayOffset:0, mode:"direct"
});
const values39 = new Set();
let assignments39 = 0;
const dieCandidates = [];
for (const source of key39) for (const cells of rays39) {
  if (!squarefree([source.r,source.c],cells[0],cells.at(-1))) continue;
  for (const reversed of [false,true]) {
    const key = reversed ? source.key.slice().reverse() : source.key;
    const text = plaintext(key,cells);
    values39.add(text);
    assignments39++;
    if (text === "DIE") dieCandidates.push({
      source:[source.r,source.c,source.d],
      sourceRunes:source.raw, transformed:source.transformed,
      reversed, ciphertext:cells, derivedKey:key
    });
  }
}
assert.equal(key39.length,86);
assert.equal(rays39.length,132);
assert.equal(assignments39,21818);
assert.equal(values39.size,18561);
assert.deepEqual(dieCandidates,[{
  source:[18,14,4],
  sourceRunes:[5,23,27],transformed:false,reversed:false,
  ciphertext:[[3,22],[4,23],[5,24]],derivedKey:[5,23,27]
}]);

// Conditional after the postselected DIE branch, with stage39 state
// S=33, a=0, phase=1. All source-only forecasts remain distinct tests.
const key40 = keySources({
  centerParity:[1,1], axis:"vertical", mirror:true,
  radiusParity:1, signature:"0,1,0"
});
const rays40 = cipherRays({
  axis:"vertical", firstParity:1, lastParity:1,
  leftColParity:0, leftRowParity:1,
  L:[3,22], exactRayOffset:0, mode:"direct"
});
const values40 = new Set();
let assignments40 = 0;
for (const source of key40) for (const cells of rays40) {
  if (!squarefree([source.r,source.c],cells[0],cells.at(-1))) continue;
  // Mirrored outer runes are identical: reversal cannot produce a new key.
  values40.add(plaintext(source.key,cells));
  assignments40++;
}
assert.equal(key40.length,7);
assert.equal(rays40.length,152);
assert.equal(assignments40,1064);
assert.equal(values40.size,1063);
console.log(JSON.stringify({
  source:"Original LP2 p0–p2 729 GP29 runes",
  stage38:"I ASK is a provisional route, not authenticated plaintext",
  stage39Forecast:{
    phase:1, signature:signature39, sourceAxis:"horizontal",
    sourceCenterParity:[0,0],sourceRadiusParity:0,sourceMirror:false,
    ciphertextAxis:"diagonal", leftmostFirst:true,
    ciphertextStartParity:[1,0], ciphertextEndRowParity:1,
    exactRayOffset:0
  },
  stage39:{keyNodes:key39.length,ciphertextRays:rays39.length,
    assignments:assignments39,distinctOutputs:values39.size,
    conditionalDIE:dieCandidates},
  stage40AfterDIE:{keyNodes:key40.length,ciphertextRays:rays40.length,
    assignments:assignments40,distinctOutputs:values40.size},
  conclusion:"Published source-only filters do not uniquely determine an outgoing key, path, or plaintext."
},null,2));
