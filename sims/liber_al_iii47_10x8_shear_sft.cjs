"use strict";

/**
 * Bounded source-motivated 10x8 shear test for the p32/cuneiform tensor key.
 *
 * Primary visual source: O.T.O. USA, Liber AL holograph page 60 / III:47:
 * https://lib.oto-usa.org/libri/images/liber0031/60.jpg
 *
 * The page has 8 labelled columns (a-h), 10 numbered rows (1-10), a line
 * with visible rise/run 2, and a circled-cross at d7. Taking d7 as the
 * phase anchor gives phase = 6 - 2*3 = 0 in zero-based coordinates.
 *
 * The 1,680-rune pp33-39 target is reshaped as 21 blocks x 10 rows x 8
 * columns. The 210-state source recurrence is likewise 21 x 10, with
 * eight normalized Segre coordinates per state. The candidate shear is
 * r' = (r - 2*c) mod 10. It permutes the key row used for each target
 * coordinate; it is bijective within each 80-cell block.
 *
 * This is a bounded negative gate, not a general search. The 100 affine
 * slopes/phases are only a compact comparison control; the source-selected
 * candidate remains slope 2, phase 0.
 *
 * Run: node sims/liber_al_iii47_10x8_shear_sft.cjs
 * Node.js 22, built-ins only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const native = json("resources/control/latin-vulgate-heldout-gp.json").runes;
const MOD = 29;
const mod = n => (n % MOD + MOD) % MOD;
const mod10 = n => (n % 10 + 10) % 10;

function inv(a) {
  for (let x = 1; x < MOD; x++) if (mod(a * x) === 1) return x;
  throw new Error("noninvertible field element");
}
function matMul(a, b) {
  return [
    [mod(a[0][0] * b[0][0] + a[0][1] * b[1][0]), mod(a[0][0] * b[0][1] + a[0][1] * b[1][1])],
    [mod(a[1][0] * b[0][0] + a[1][1] * b[1][0]), mod(a[1][0] * b[0][1] + a[1][1] * b[1][1])],
  ];
}
function applyPGL(a, x) {
  if (x === null) return a[1][0] === 0 ? null : mod(a[0][0] * inv(a[1][0]));
  const denominator = mod(a[1][0] * x + a[1][1]);
  return denominator === 0 ? null : mod((a[0][0] * x + a[0][1]) * inv(denominator));
}
const hom = x => x === null ? [1, 0] : [x, 1];
function tensor8(state) {
  const point = state.map(hom);
  const row = [];
  for (let bits = 0; bits < 8; bits++) {
    let value = 1;
    for (let i = 0; i < 3; i++) value = mod(value * point[i][(bits >> (2 - i)) & 1]);
    row.push(value);
  }
  return row;
}
function normalize(row) {
  const pivot = row.find(value => value !== 0);
  assert.notEqual(pivot, undefined, "Segre row must be nonzero");
  const scale = inv(pivot);
  return row.map(value => mod(value * scale));
}
function ioc(values) {
  const counts = Array(MOD).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

const M7 = [[14, 25], [25, 28]];
const correction = [3, 0, 8];
const maps = correction.map(n => matMul([[1, n], [0, 1]], M7));
const states = [];
let state = [13, 23, 2];
for (let n = 0; n < 210; n++) {
  states.push(state.slice());
  state = state.map((x, i) => applyPGL(maps[i], x));
}
assert.deepEqual(state, [13, 23, 2], "210-state recurrence must close");
assert.deepEqual(states[1], [27, 5, 15], "first step must reproduce p39 red triad");

const baseKey = states.flatMap(s => normalize(tensor8(s)));
assert.equal(baseKey.length, 1680);

const section = corpus.pages
  .filter(page => page.page >= 33 && page.page <= 39)
  .flatMap(page => page.indices);
assert.equal(section.length, 1680);

function shearKey(slope, phase) {
  const key = [];
  for (let n = 0; n < 210; n++) {
    const block = Math.floor(n / 10);
    const row = n % 10;
    for (let column = 0; column < 8; column++) {
      const sourceRow = mod10(row - slope * column - phase);
      key.push(baseKey[(block * 10 + sourceRow) * 8 + column]);
    }
  }
  return key;
}

const sourceSlope = 2;
const sourcePhase = 0;
const sourceKey = shearKey(sourceSlope, sourcePhase);
assert.equal(sourceKey.length, 1680);

// Each 10x8 shear is a permutation of all 80 cells.
const permutation = new Set(Array.from({length: 80}, (_, index) => {
  const row = Math.floor(index / 8);
  const column = index % 8;
  return mod10(row - sourceSlope * column - sourcePhase) * 8 + column;
}));
assert.equal(permutation.size, 80);

// Verify the claimed 21 x 80 block shape against the source-aware
// transcription, including word- and clause-boundary alignment.
const transcription = fs.readFileSync(
  path.join(root, "resources/transcriptions/liber_primus_master.txt"), "utf8"
);
const marker = "Page     : %";
const markerIndex = transcription.indexOf(marker);
assert.notEqual(markerIndex, -1, "page delimiter header missing");
const pages = transcription.slice(markerIndex + marker.length).split("%");
const targetText = pages.slice(48, 55).join("%"); // LP2 physical pp33-39
const runeAlphabet = new Set(Array.from(
  "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
));
let runePosition = 0;
const wordCuts = [];
const clauseCuts = [];
for (const character of Array.from(targetText)) {
  if (runeAlphabet.has(character)) runePosition++;
  else if (character === "-") wordCuts.push(runePosition);
  else if (character === ".") clauseCuts.push(runePosition);
}
assert.equal(runePosition, 1680);
const blockCuts = Array.from({length: 20}, (_, i) => (i + 1) * 80);
const wordAlignedCuts = blockCuts.filter(cut => wordCuts.includes(cut)).length;
const clauseAlignedCuts = blockCuts.filter(cut => clauseCuts.includes(cut)).length;
assert.equal(wordAlignedCuts, 8);
assert.equal(clauseAlignedCuts, 0);
assert.equal(clauseCuts.length + 1, 22);

// Held-out native Latin in GP29, with the same smoothed trigram score used
// by the existing p32 Segre readout gates.
const trigrams = new Uint32Array(MOD ** 3);
let trigramCount = 0;
for (let i = 0; i + 2 < native.length; i++) {
  trigrams[(native[i] * MOD + native[i + 1]) * MOD + native[i + 2]]++;
  trigramCount++;
}
const alpha = 0.1;
const denominator = trigramCount + alpha * trigrams.length;
function trigramScore(values) {
  let score = 0;
  for (let i = 0; i + 2 < values.length; i++) {
    const count = trigrams[(values[i] * MOD + values[i + 1]) * MOD + values[i + 2]];
    score += Math.log((count + alpha) / denominator);
  }
  return score / (values.length - 2);
}

const operations = [
  ["C-K", (c, k) => mod(c - k)],
  ["C+K", (c, k) => mod(c + k)],
  ["K-C", (c, k) => mod(k - c)],
];
function scoreRuns(key, slope, phase) {
  return operations.map(([operation, fn]) => {
    const plain = section.map((cipher, i) => fn(cipher, key[i]));
    return {
      slope, phase, operation,
      ioc: ioc(plain),
      trigramScore: trigramScore(plain),
      prefix: plain.slice(0, 80).map(index => corpus.translit[index]).join(""),
    };
  });
}

const sourceRuns = scoreRuns(sourceKey, sourceSlope, sourcePhase);
const all = [];
for (let slope = 0; slope < 10; slope++) {
  for (let phase = 0; phase < 10; phase++) {
    all.push(...scoreRuns(shearKey(slope, phase), slope, phase));
  }
}
all.sort((a, b) => b.trigramScore - a.trigramScore);
const sourceBest = sourceRuns.reduce((best, run) =>
  run.trigramScore > best.trigramScore ? run : best);
const sourceRank = all.findIndex(run =>
  run.slope === sourceBest.slope &&
  run.phase === sourceBest.phase &&
  run.operation === sourceBest.operation
) + 1;
const bestOverall = all[0];

// Positive control: encrypt and decrypt a native held-out GP prefix using
// the exact source-selected key and the C-K inverse convention.
const planted = native.slice(0, 1680);
const syntheticCipher = planted.map((value, i) => mod(value + sourceKey[i]));
const recovered = syntheticCipher.map((value, i) => mod(value - sourceKey[i]));
assert.deepEqual(recovered, planted, "source-shear planted control must round-trip exactly");

const raw = {ioc: ioc(section), trigramScore: trigramScore(section)};
const nativeControl = {ioc: ioc(native), trigramScore: trigramScore(native)};
assert.equal(sourceRank, 33, "source-selected slope2/phase0 rank changed");
assert.equal(all.length, 300);
assert.ok(nativeControl.trigramScore > -8);
assert.ok(raw.trigramScore < -10);

console.log(JSON.stringify({
  classification: "bounded negative: Liber AL III:47 source-motivated 10x8 shear",
  sourceGeometry: {
    rows: 10, columns: 8,
    visibleLineRiseRun: [6, 3],
    circledCross: "d7",
    zeroBasedAnchor: {row: 6, column: 3},
    selectedSlope: sourceSlope,
    selectedPhase: sourcePhase,
    transform: "r'=(r-2c) mod 10",
    permutationSize: permutation.size,
  },
  target: {
    pages: [33, 39],
    blocks: 21,
    rowsPerBlock: 10,
    columnsPerBlock: 8,
    runes: section.length,
    blockCuts: 20,
    wordAlignedCuts,
    clauseAlignedCuts,
    clauseSpans: clauseCuts.length + 1,
  },
  raw,
  nativeControl,
  sourceRuns,
  sourceBest,
  sourceRankAmong300: sourceRank,
  bestOverallControl: bestOverall,
  betterThanSource: sourceRank - 1,
  affineControlCount: all.length,
  plantedControl: {
    recovered: recovered.length,
    exact: recovered.every((x, i) => x === planted[i]),
  },
  verdict: "The source-selected shear is reversible but ciphertext-like; 32/300 affine-shear/action controls score higher. No plaintext or key recovered.",
}, null, 2));
