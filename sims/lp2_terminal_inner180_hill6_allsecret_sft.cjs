"use strict";
/**
 * Original 32x8 LP2 numerical table interior: arbitrary secret affine
 * 6x6 Hill-cipher recovery from the 180 genuine solved terminal runes.
 * CommonJS, Node 22; read-only single runnable test file (SFT).
 *
 * Source hypothesis: physical table perimeter76 ↔ unknown p55 76 runes,
 * inner30x6 ↔ solved p56 85 + clear p57 95 GP29 runes. A 6-column block
 * affine cipher Y=A*X+b could allow blind inference from 30 known pairs.
 *
 * The source suggests the geometry, but does NOT prescribe a Hill cipher;
 * failure rules out only this entire arbitrary-key 6-symbol block family.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} f @returns {any} */
const json = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const gp = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json");
const bytes = grid.pages.flatMap(p => p.bytes);
const mod = n => ((n % 29) + 29) % 29;
assert.equal(bytes.length, 256);
assert.equal(grid.pages.length, 3);
assert.deepEqual(grid.pages.map(p => p.bytes.length), [80,104,72]);
assert.equal(gp.pages[55].indices.length, 76);
assert.equal(gp.pages[56].indices.length, 85);
assert.equal(gp.pages[57].indices.length, 95);

/** @returns {number[]} First 84 consecutive primes, starting at two. */
function primeSequence() {
  const primes = [];
  for (let n = 2; primes.length < 84; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  return primes;
}
const prime = primeSequence();
let clock = 0;
const solved56 = gp.pages[56].indices.map((c, i) =>
  i === 56 ? c : mod(c - prime[clock++] + 1));
assert.equal(clock, 84);
assert.equal(solved56[56], 0);
assert.equal(solved56.map(x => gp.translit[x]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO" +
  "ITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
const knownPlain = solved56.concat(gp.pages[57].indices);
const knownPrinted = gp.pages[56].indices.concat(gp.pages[57].indices);
assert.equal(knownPlain.length, 180);
assert.equal(knownPrinted.length, 180);
assert.equal(knownPlain.filter(x => x < 0 || x > 28).length, 0);

/** @returns {{inner:number[], perimeter:number[]}} */
function sourcePartition() {
  const inner = [];
  const outer = [];
  for (let r = 0; r < 32; r++) {
    for (let c = 0; c < 8; c++) {
      const x = mod(bytes[8 * r + c]);
      if (r === 0 || r === 31 || c === 0 || c === 7) outer.push(x);
      else inner.push(x);
    }
  }
  assert.equal(inner.length, 180);
  assert.equal(outer.length, 76);
  return {inner, perimeter:outer};
}
const {inner} = sourcePartition();
const innerColumns = [];
for (let c = 1; c <= 6; c++) {
  for (let r = 1; r <= 30; r++) innerColumns.push(mod(bytes[r * 8 + c]));
}
assert.equal(innerColumns.length, 180);

/**
 * Finite-field rank by exact, pivot-normalized row reduction.
 * @param {number[][]} rows
 * @returns {number}
 */
function rank(rows) {
  if (!rows.length) return 0;
  const a = rows.map(row => row.map(mod));
  const cols = a[0].length;
  let pivot = 0;
  for (let c = 0; c < cols && pivot < a.length; c++) {
    const r = a.findIndex((v, i) => i >= pivot && v[c] !== 0);
    if (r < 0) continue;
    [a[pivot], a[r]] = [a[r], a[pivot]];
    let inv = 1;
    while (mod(inv * a[pivot][c]) !== 1) inv++;
    assert.ok(inv <= 28);
    a[pivot] = a[pivot].map(v => mod(v * inv));
    for (let i = 0; i < a.length; i++) {
      if (i === pivot) continue;
      const k = a[i][c];
      for (let j = c; j < cols; j++) {
        a[i][j] = mod(a[i][j] - k * a[pivot][j]);
      }
    }
    pivot++;
  }
  return pivot;
}
/**
 * Invert full-rank square linear system over GF29.
 * @param {number[][]} M
 * @param {number[]} target
 * @returns {number[]}
 */
function solve(M, target) {
  const n = M.length;
  assert.equal(n, 7);
  const a = M.map((r, i) => [...r.map(mod), mod(target[i])]);
  for (let c = 0; c < n; c++) {
    const pos = a.findIndex((r, i) => i >= c && r[c] !== 0);
    assert.ok(pos >= c);
    [a[c], a[pos]] = [a[pos], a[c]];
    let inv = 1;
    while (mod(inv * a[c][c]) !== 1) inv++;
    assert.ok(inv <= 28);
    for (let j = c; j <= n; j++) a[c][j] = mod(a[c][j] * inv);
    for (let i = 0; i < n; i++) {
      if (i === c) continue;
      const k = a[i][c];
      for (let j = c; j <= n; j++) {
        a[i][j] = mod(a[i][j] - k * a[c][j]);
      }
    }
  }
  return a.map(r => r[n]);
}
/**
 * Infer arbitrary unknown 6x6 field matrix plus six arbitrary biases
 * solely from the first seven linearly independent source X blocks.
 *
 * @param {number[]} cipher Source numeric stream in groups of six
 * @param {number[]} plain Receiver runes in groups of six
 * @returns {any}
 */
function testAffine(cipher, plain) {
  assert.equal(cipher.length, 180);
  assert.equal(plain.length, 180);
  const X = [];
  const Y = [];
  for (let i = 0; i < 30; i++) {
    X.push([...cipher.slice(i * 6, i * 6 + 6), 1]);
    Y.push(plain.slice(i * 6, i * 6 + 6));
  }
  const selected = [];
  const seen = [];
  for (let i = 0; i < 30 && selected.length < 7; i++) {
    const test = seen.concat([X[i]]);
    if (rank(test) > seen.length) {
      selected.push(i);
      seen.push(X[i]);
    }
  }
  const dimension = rank(X);
  assert.equal(dimension, 7);
  assert.equal(selected.length, 7);
  const coefficient = [];
  for (let j = 0; j < 6; j++) {
    const targets = selected.map(i => Y[i][j]);
    coefficient.push(solve(selected.map(i => X[i]), targets));
  }
  // Independent ranks prove the impossibility of EVERY secret affine key,
  // rather than relying on any sample-based scoring threshold.
  const augmentedRanks = [];
  for (let j = 0; j < 6; j++) {
    augmentedRanks.push(rank(X.map((x, i) => [...x, Y[i][j]])));
  }
  let heldGlyphs = 0;
  let heldExactRows = 0;
  const mismatches = [];
  for (let i = 0; i < 30; i++) {
    const prediction = coefficient.map(row =>
      mod(X[i].reduce((sum, value, k) => sum + value * row[k], 0)));
    const good = prediction.filter((v, j) => v === Y[i][j]).length;
    if (!selected.includes(i)) {
      heldGlyphs += good;
      if (good === 6) heldExactRows++;
      if (mismatches.length < 2 && good < 6) {
        mismatches.push({block:i,expected:Y[i],predicted:prediction});
      }
    } else {
      assert.equal(good, 6, "training key reconstruction");
    }
  }
  return {
    dimension,augmentedRanks,trainingRows:selected,
    heldMatch:heldGlyphs, heldTotal:(30 - selected.length) * 6,
    exactHeldRows:heldExactRows,firstContradictions:mismatches
  };
}

const variants = [
  ["printed-inner-rows",inner],
  ["reverse-inner-rows",inner.slice().reverse()],
  ["printed-inner-columns",innerColumns],
  ["reverse-inner-columns",innerColumns.slice().reverse()]
];
const outputs = [];
for (const [direction,cipher] of variants) {
  for (const [receiver,plain] of [
    ["independently-deciphered-p56-plus-clear-p57",knownPlain],
    ["original-printed-p56-plus-clear-p57",knownPrinted]
  ]) {
    const r = testAffine(cipher,plain);
    assert.deepEqual(r.augmentedRanks,[8,8,8,8,8,8]);
    assert.equal(r.exactHeldRows,0);
    outputs.push({direction,receiver,...r});
  }
}

// Positive control: a full arbitrary secret invertible affine 6x6 key
// with deterministic nontrivial upper-triangular matrix and six biases.
// The inverse must infer all 42 unknown coefficients from seven X rows,
// without access to the planted key, then predict 138 held-out symbols.
const secret = Array.from({length:6},(_,i)=>
  Array.from({length:7},(_,j)=> j<6
    ? (j===i ? 1 : (j>i ? mod((i+3)*(j+5)) : 0))
    : mod(7*i+11)));
const planted = [];
for (let i=0;i<30;i++) {
  const x=[...inner.slice(i*6,i*6+6),1];
  for (const row of secret) planted.push(mod(
    x.reduce((sum,value,j)=>sum+value*row[j],0)));
}
const positive = testAffine(inner,planted);
assert.deepEqual(positive.augmentedRanks,[7,7,7,7,7,7]);
assert.equal(positive.heldMatch,138);
assert.equal(positive.exactHeldRows,23);
console.log(JSON.stringify({
  candidate:"30 physical table interior rows of 6 GF29 symbols",
  sourceBytes:256,perimeterSymbols:76,innerSymbols:180,
  knownPlainSymbols:180,unknownTerminalSymbols:76,
  prior:"All-secret literal stationary byte lookup was previously excluded",
  result:"All 8 arbitrary-secret 6x6 affine block ciphers are impossible",
  outputs,
  plantedAffineRecovery:{
    heldMatch:positive.heldMatch,
    heldTotal:positive.heldTotal,
    augmentedRanks:positive.augmentedRanks
  }
},null,2));
