"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const MOD = 29;
const mod = (n) => ((n % MOD) + MOD) % MOD;

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

function matInv(a) {
  const det = mod(a[0][0] * a[1][1] - a[0][1] * a[1][0]);
  const z = inv(det);
  return [
    [mod(a[1][1] * z), mod(-a[0][1] * z)],
    [mod(-a[1][0] * z), mod(a[0][0] * z)],
  ];
}

function matPow(a, n) {
  let out = [[1, 0], [0, 1]];
  let base = a;
  let e = n;
  while (e > 0) {
    if (e & 1) out = matMul(out, base);
    base = matMul(base, base);
    e >>= 1;
  }
  return out;
}

function applyPGL(a, x) {
  if (x === null) return a[1][0] === 0 ? null : mod(a[0][0] * inv(a[1][0]));
  const den = mod(a[1][0] * x + a[1][1]);
  if (den === 0) return null;
  return mod((a[0][0] * x + a[0][1]) * inv(den));
}

function finiteIoc(values) {
  const f = Array(MOD).fill(0);
  let n = 0;
  for (const x of values) {
    if (x === null) continue;
    f[x]++;
    n++;
  }
  return f.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}

function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  const m = Math.min(k, n - k);
  let s = 0;
  for (let i = 1; i <= m; i++) s += Math.log(n - m + i) - Math.log(i);
  return s;
}

function hypergeomUpper(N, K, n, k) {
  const max = Math.min(K, n);
  const denom = logChoose(N, n);
  let sum = 0;
  for (let x = k; x <= max; x++) {
    if (n - x > N - K) continue;
    sum += Math.exp(logChoose(K, x) + logChoose(N - K, n - x) - denom);
  }
  return sum;
}

const M7 = [[14, 25], [25, 28]];
const correction = [3, 0, 8];
const coordinateMaps = correction.map((n) => matMul([[1, n], [0, 1]], M7));
const start = [13, 23, 2];
const states = [];
let state = start.slice();
for (let n = 0; n < 210; n++) {
  states.push(state.slice());
  state = state.map((x, i) => applyPGL(coordinateMaps[i], x));
}
assert.deepEqual(state, start);
assert.deepEqual(states[1], [27, 5, 15]);

const collisionStates = states
  .map((s, i) => ({i, s}))
  .filter(({s}) => new Set(s.map((x) => x === null ? "inf" : String(x))).size < 3);
assert.equal(collisionStates.length, 15);

const section = corpus.pages.filter((p) => p.page >= 33 && p.page <= 39).flatMap((p) => p.indices);
assert.equal(section.length, 1680);

function hom(x) {
  return x === null ? [1, 0] : [x, 1];
}

function tensor8(s) {
  const p = s.map(hom);
  const out = [];
  for (let bits = 0; bits < 8; bits++) {
    let v = 1;
    for (let i = 0; i < 3; i++) v = mod(v * p[i][(bits >> (2 - i)) & 1]);
    out.push(v);
  }
  return out;
}

const patience = [6, 5, 3, 0, 2, 4, 7, 1];
const tensorKey = states.flatMap(tensor8);
const patienceKey = states.flatMap((s) => {
  const row = tensor8(s);
  return patience.map((i) => row[i]);
});
assert.equal(tensorKey.length, 1680);

const tensorRuns = [];
for (const [name, key] of [["tensor", tensorKey], ["tensor-patience", patienceKey]]) {
  for (const [op, fn] of [
    ["C-K", (c, k) => mod(c - k)],
    ["C+K", (c, k) => mod(c + k)],
    ["K-C", (c, k) => mod(k - c)],
  ]) {
    const plain = section.map((c, i) => fn(c, key[i]));
    tensorRuns.push({name, op, ioc: finiteIoc(plain)});
  }
}
const tensorMin = Math.min(...tensorRuns.map((x) => x.ioc));
const tensorMax = Math.max(...tensorRuns.map((x) => x.ioc));
assert.ok(Math.abs(tensorMin - 0.034270682662582604) < 1e-15);
assert.ok(Math.abs(tensorMax - 0.03475991945318926) < 1e-15);

const sectionStart = corpus.pages.filter((p) => p.page < 33).reduce((n, p) => n + p.indices.length, 0);
const sectionEnd = sectionStart + section.length - 1;
const runic = /[\u16A0-\u16FF]/u;
const stream = transcription.split("%").slice(0, 55).join("%");
let globalRune = -1;
let inWord = false;
let lastRune = -1;
const wordEndsGlobal = new Set();
for (const character of stream) {
  if (runic.test(character)) {
    globalRune++;
    inWord = true;
    lastRune = globalRune;
  } else if (character === "%" || character === "/" || /\s/u.test(character)) {
  } else if (inWord) {
    wordEndsGlobal.add(lastRune);
    inWord = false;
  }
}
if (inWord) wordEndsGlobal.add(lastRune);
const wordEnds = new Set([...wordEndsGlobal]
  .filter((x) => x >= sectionStart && x <= sectionEnd)
  .map((x) => x - sectionStart));
assert.equal(wordEnds.size, 378);

const projectiveRuns = [];
for (const order of [[0, 1, 2], [2, 1, 0]]) {
  const cycle = [];
  for (let n = 0; n < 210; n++) {
    let g = [[1, 0], [0, 1]];
    for (const i of order) g = matMul(g, matPow(coordinateMaps[i], n));
    cycle.push(g);
  }
  for (const [direction, invert] of [["forward", false], ["inverse", true]]) {
    const plain = section.map((c, i) => applyPGL(invert ? matInv(cycle[i % 210]) : cycle[i % 210], c));
    const poles = plain.flatMap((x, i) => x === null ? [i] : []);
    const wordEndHits = poles.filter((i) => wordEnds.has(i)).length;
    projectiveRuns.push({
      order: order.join(""),
      direction,
      poles: poles.length,
      ioc: finiteIoc(plain),
      wordEndHits,
      expectedWordEndHits: poles.length * wordEnds.size / section.length,
    });
  }
}
assert.deepEqual(projectiveRuns.map((x) => x.poles), [48, 59, 51, 48]);
const projectiveMin = Math.min(...projectiveRuns.map((x) => x.ioc));
const projectiveMax = Math.max(...projectiveRuns.map((x) => x.ioc));
assert.ok(Math.abs(projectiveMin - 0.03408681068994121) < 1e-15);
assert.ok(Math.abs(projectiveMax - 0.034513827008172064) < 1e-15);
const bestPoleAlignment = projectiveRuns.reduce((a, b) => b.wordEndHits > a.wordEndHits ? b : a);
assert.equal(bestPoleAlignment.wordEndHits, 17);
assert.equal(bestPoleAlignment.poles, 51);
const poleTail = hypergeomUpper(section.length, wordEnds.size, bestPoleAlignment.poles, bestPoleAlignment.wordEndHits);
assert.ok(Math.abs(poleTail - 0.04779658854368277) < 1e-12);

console.log(JSON.stringify({
  source: {sectionPages:[33,39], runes:section.length, states:210, cycles:8, collisionStates:collisionStates.map((x) => x.i)},
  tensorReadout: {keyIoc:finiteIoc(tensorKey), minIoc:tensorMin, maxIoc:tensorMax, variants:tensorRuns},
  composedPGL: {minFiniteIoc:projectiveMin, maxFiniteIoc:projectiveMax, variants:projectiveRuns},
  poleBoundaryGate: {best:bestPoleAlignment, oneSidedHypergeomTail:poleTail, testedNaturalVariants:projectiveRuns.length},
  verdict:"The two most direct projective-safe readouts do not recover native-GP plaintext; the 210-state structural bridge remains unassigned to a source-authenticated symbol readout.",
}, null, 2));
