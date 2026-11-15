"use strict";
/**
 * Source-constrained GP29 red-cell feedback inverse on original Liber Primus.
 * Source objects: signed Fibonacci-prime p15 matrix, p39 red triad, p49–51
 * 256-token table polynomial. The cipher clock, F-prefixed IV and feedback
 * rule are exploratory hypotheses, not instructions signed by Cicada.
 * Windows Node.js 22, CommonJS; no external dependencies.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const load = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const table = load("resources/liber-primus/lp2-grid-256.json");
const FIELD = 29;
const mod = (x) => ((x % FIELD) + FIELD) % FIELD;
assert.equal(corpus.pages.length, 58);
assert.equal(table.bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(table.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
const matrix = [[10,3,20,22],[1,22,21,25],[11,17,19,7],[8,12,12,22]];
const identity = Array.from({length:4}, (_,i) =>
  Array.from({length:4}, (_,j) => Number(i === j)));
const zero = () => Array.from({length:4}, () => [0,0,0,0]);

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function multiply(a, b) {
  return a.map(row => b[0].map((_,j) =>
    mod(row.reduce((sum,x,k) => sum + x*b[k][j], 0))));
}
/** @param {number[][]} a @param {number[]} v @returns {number[]} */
function apply(a, v) {
  return a.map(row => mod(row.reduce((sum,x,k) => sum + x*v[k], 0)));
}
/**
 * Original high-first table polynomial divided by the monic p39 factor
 * (X-24)^2 = X^2+10X+25 over GF29. Keeps the leading zero coefficient.
 * @param {number[]} bytes
 */
function divide(bytes) {
  const remainder = bytes.map(mod);
  const quotient = [];
  for(let i=0; i<bytes.length-2; i++) {
    const x = remainder[i];
    quotient.push(x);
    remainder[i+1] = mod(remainder[i+1] - 10*x);
    remainder[i+2] = mod(remainder[i+2] - 25*x);
  }
  return {quotient, remainder:remainder.slice(-2)};
}
/** @param {number[]} coeff @param {number[][]} m @returns {number[][]} */
function evaluate(coeff, m) {
  let a = zero();
  for(const k of coeff) {
    a = multiply(a, m);
    for(let i=0; i<4; i++) a[i][i] = mod(a[i][i] + k);
  }
  return a;
}
const redTriad = corpus.pages[39].indices.slice(119, 122);
assert.deepEqual(redTriad, [27,5,15]);
const {quotient, remainder} = divide(table.bytes);
assert.equal(quotient.length, 254);
assert.deepEqual(remainder, [0,0]);
const R = evaluate(quotient, matrix);
assert.deepEqual(R, [[21,27,22,0],[28,10,13,22],[12,0,9,13],[12,24,7,3]]);
assert.deepEqual(multiply(R,matrix), multiply(matrix,R));
// Original source p15 red 3299 is in row 2, col 2 (index [1,1]).
const RED = 1;
// The source supplies three red glyphs but no fourth state rune: choosing
// F=0 as prefix is a declared hypothesis with no original p33 instruction.
const initial = [0, ...redTriad];
const powers = [identity];
for(let i=1; i<FIELD; i++) powers.push(multiply(powers[i-1], R));

/**
 * All candidates are reversible for arbitrary GP29 inputs; this says nothing
 * about historical identity. "power" is ciphertext-controlled R^cipher,
 * the other two are competing source-shaped R*s plus red-cell injection.
 * @param {number[]} input
 * @param {"power"|"cipher-injection"|"plain-injection"} mode
 * @param {"encrypt"|"decrypt"} direction
 */
function transform(input, mode, direction) {
  let s = initial.slice();
  const out = [];
  for(const value of input) {
    const c = direction === "decrypt" ? value : mod(value+s[RED]);
    const p = direction === "decrypt" ? mod(c-s[RED]) : value;
    out.push(direction === "decrypt" ? p : c);
    if(mode === "power") s = apply(powers[c], s);
    else {
      s = apply(R, s);
      s[RED] = mod(s[RED] + (mode === "cipher-injection" ? c : p));
    }
  }
  return out;
}
/** @param {number[]} values */
function summary(values) {
  const counts = Array(FIELD).fill(0);
  for(const x of values) counts[x]++;
  return {
    length:values.length,
    ioc:counts.reduce((s,n) => s+n*(n-1),0)/(values.length*(values.length-1)),
    adjacentEquals:values.slice(1).filter((x,i) => x===values[i]).length,
    opening:values.slice(0,55).map(x=>corpus.translit[x]).join(" ")
  };
}
const sourcePages = corpus.pages.slice(0,56);
assert.equal(sourcePages.reduce((s,p)=>s+p.indices.length,0),12956);
const chapter = sourcePages.filter(p=>p.page>=33 && p.page<=39).flatMap(p=>p.indices);
const holdout = sourcePages.filter(p=>p.page>=40 && p.page<=53).flatMap(p=>p.indices);
const clear = corpus.pages[57].indices;
assert.equal(chapter.length,1680);
assert.equal(holdout.length,3008);
assert.equal(clear.length,95);
const expected = {
  power:[0.03471879520122522,0.034405314903522985],
  "cipher-injection":[0.03420970532346351,0.03437546434206709],
  "plain-injection":[0.03439405541847471,0.03440664159514325]
};
const results={source:"p15 signed 4x4; p39 red119; p49-51 table SHA256; original p33-39 plus p40-53", raw:summary(chapter),modes:{}};
for(const mode of ["power","cipher-injection","plain-injection"]) {
  const decoded = transform(chapter,mode,"decrypt");
  const blind = transform(holdout,mode,"decrypt");
  assert.deepEqual(transform(decoded,mode,"encrypt"),chapter);
  assert.deepEqual(transform(blind,mode,"encrypt"),holdout);
  assert.deepEqual(transform(transform(clear,mode,"encrypt"),mode,"decrypt"),clear);
  const a=summary(decoded),b=summary(blind);
  assert.ok(Math.abs(a.ioc-expected[mode][0])<1e-12);
  assert.ok(Math.abs(b.ioc-expected[mode][1])<1e-12);
  results.modes[mode]={chapter:a,holdout:b,positive:"native solved p57 95/95",roundtrip:"1680+3008 exact"};
}
console.log(JSON.stringify(results,null,2));
console.log("PASS: reproducible bounded negatives only; no authenticated unknown-page plaintext.");
