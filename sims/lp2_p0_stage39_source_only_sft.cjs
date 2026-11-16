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
const mod = (a, n) => ((a % n) + n) % n;
const maxDistance = (a, b) => Math.max(
  Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
/**
 * Published Reports 01–15, evaluated solely on current source coordinates.
 * Candidate plaintext or next-stage coordinates are never consulted.
 */
function forecast(previous) {
  const {source, ciphertext: C, sourceRunes, phase: p, S, a} = previous;
  const B = C[0], E = C.at(-1), M = source[1];
  const L = C.reduce((u,v) => v[1] < u[1] ||
    (v[1] === u[1] && v[0] > u[0]) ? v : u);
  const Z = source.reduce((u,v) => v[0] > u[0] ||
    (v[0] === u[0] && v[1] > u[1]) ? v : u);
  const mode = Math.floor(S / 7) % 4;
  const reflected = mode === 1 || mode === 2;
  const offset = (mode === 0 || mode === 2) ? 1 : 0;
  const nextPhase = mod(offset + C.reduce((sum,cell) =>
    sum + mu(reflected ? n180(cell) : n0(cell)), 0), 3);
  assert.ok(!(nextPhase === 2 && S % 7 === 6),
    "Proposed seven-phase skip is forbidden.");
  const nextA = mod(a + mu(n90(L)), 2);
  const signatures = [
    ["0,0,0","1,1,1"],
    ["0,1,0","1,-1,1"],
    ["0,-1,0","1,0,1"]
  ];
  const group = Number(
    (mu(n90(M)+n180(Z)) < 0) === (mu(n90(L)+n180(Z)) < 0));
  const sourceSum = sourceRunes.reduce(
    (sum,v) => sum + corpus.prime[v], 0);
  const diagonalBit = Number(mu(gcd(n90(M),n270(Z))) < 0) ^
    Number(mu(sourceSum) > 0) ^
    Number(mu(n0(M)+n270(Z)) !== 0);
  const axisNumber = 2*group + diagonalBit;
  const axes = ["horizontal","NWSE","vertical","NESW"];
  const centerRow = mod(1+B[1]+E[0]+M[0]+mu(n180(B)),2);
  const centerColumn = mod(1+B[0]+E[0]+M[0],2);
  const radiusParity =
    mod(M[0]+M[1]+B[0]+B[1],2) ^
    Number(mu(gcd(n180(Z),n180(L))) < 0) ^
    Number(mu(n90(B)+n90(E)) > 0);
  const score = mu(n180(B)+n0(M)) + mu(gcd(n90(E),n180(E)));
  const nextCipherAxis = score === 0 ? "horizontal" :
    score > 0 ? "vertical" : "diagonal";
  const rowEnd = mod(1+p+mu(n180(M)),2);
  const rowLeftmost = mod(centerRow+1+p+mu(M[0]),2);
  const centerRotation = [n180(M),n270(M),n0(M)][p];
  const colLeftmost = mod(B[0]+C.reduce(
    (sum,v) => sum + mu(n90(v)),0) +
    Number(sourceRunes[0] === sourceRunes[2]) +
    mu(centerRotation),2);
  const q = mu(n0(E)) === 0 && mu(n270(E)) === 0;
  const z = mu(n0(B)) === 0 && mu(n90(B)) === 0;
  const nextMode = Math.floor((S+nextPhase)/7)%4;
  return {
    phase:nextPhase, S:S+nextPhase, a:nextA,
    signature:signatures[nextPhase][nextA],
    sourceAxis:axes[axisNumber],
    centerParity:[centerRow,centerColumn],
    radiusParity,
    mirror:maxDistance(Z,L)%3!==2,
    cipherAxis:nextCipherAxis,
    leftmostFirst:mod(mu(n270(E))+phi(sourceRunes[1]),2)===1,
    leftmost:L,
    leftmostRowParity:rowLeftmost,
    leftmostColParity:colLeftmost,
    endpointRowParity:rowEnd,
    exactRayOffset: q && !z ? 1 : 0,
    mode:nextMode===1||nextMode===2?"reflected":"direct"
  };
}
const stage38 = {
  source: [[11,13],[12,13],[13,13]],
  ciphertext: [[5,17],[6,17],[7,17],[8,17]],
  sourceRunes: [16,19,28],
  phase: 0, S: 32, a: 0
};
assert.deepEqual(stage38.source.map(([r,c]) => at(r,c)), stage38.sourceRunes);
assert.deepEqual(stage38.ciphertext.map(([r,c]) => at(r,c)), [26,14,14,21]);
const stage39 = forecast(stage38);
assert.deepEqual(stage39, {
  phase:1, S:33, a:0, signature:"0,1,0",
  sourceAxis:"horizontal", centerParity:[0,0],
  radiusParity:0, mirror:false, cipherAxis:"diagonal",
  leftmostFirst:true, leftmost:[8,17],
  leftmostRowParity:1, leftmostColParity:0,
  endpointRowParity:1, exactRayOffset:0, mode:"direct"
});
const key39 = keySources({
  centerParity:stage39.centerParity, axis:stage39.sourceAxis,
  mirror:stage39.mirror, radiusParity:stage39.radiusParity,
  signature:stage39.signature
});
const rays39 = cipherRays({
  axis:stage39.cipherAxis,
  firstParity:stage39.leftmostRowParity,
  lastParity:stage39.endpointRowParity,
  leftColParity:stage39.leftmostColParity,
  leftRowParity:stage39.leftmostRowParity,
  L:stage39.leftmost, exactRayOffset:stage39.exactRayOffset,
  mode:stage39.mode
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

// Conditional after the postselected DIE branch. The stage40 forecast
// uses only the selected original stage39 geometry, never its decoded text.
const stage39DIE = {
  source:[[18,10],[18,14],[18,18]],
  ciphertext:[[3,22],[4,23],[5,24]],
  sourceRunes:[5,23,27],
  phase:stage39.phase, S:stage39.S, a:stage39.a
};
const stage40 = forecast(stage39DIE);
assert.deepEqual(stage40, {
  phase:1, S:34, a:0, signature:"0,1,0",
  sourceAxis:"vertical", centerParity:[1,1],
  radiusParity:1, mirror:true, cipherAxis:"vertical",
  leftmostFirst:true, leftmost:[3,22],
  leftmostRowParity:1, leftmostColParity:0,
  endpointRowParity:1, exactRayOffset:0, mode:"direct"
});
const key40 = keySources({
  centerParity:stage40.centerParity, axis:stage40.sourceAxis,
  mirror:stage40.mirror, radiusParity:stage40.radiusParity,
  signature:stage40.signature
});
const rays40 = cipherRays({
  axis:stage40.cipherAxis, firstParity:stage40.leftmostRowParity,
  lastParity:stage40.endpointRowParity,
  leftColParity:stage40.leftmostColParity,
  leftRowParity:stage40.leftmostRowParity,
  L:stage40.leftmost, exactRayOffset:stage40.exactRayOffset,
  mode:stage40.mode
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
  stage39Forecast:stage39,
  stage40Forecast:stage40,
  stage39:{keyNodes:key39.length,ciphertextRays:rays39.length,
    assignments:assignments39,distinctOutputs:values39.size,
    conditionalDIE:dieCandidates},
  stage40AfterDIE:{keyNodes:key40.length,ciphertextRays:rays40.length,
    assignments:assignments40,distinctOutputs:values40.size},
  conclusion:"Published source-only filters do not uniquely determine an outgoing key, path, or plaintext."
},null,2));
