#!/usr/bin/env node
"use strict";

// Source-fixed p36/R238 norm and DH23/EA key tests.
// Run from the repository root: node sims/p36_norm_dh23_ea_key_sft.cjs
// No third-party packages; all field arithmetic is exact modulo 29.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const mod29 = n => ((n % 29) + 29) % 29;
const mod28 = n => ((n % 28) + 28) % 28;
const mod840 = n => ((n % 840) + 840) % 840;

const fieldSource = read("sims/p36_dh11_power_trace_stream_sft.cpp");
function readArray(name) {
  const marker = "const A " + name + " = {";
  const start = fieldSource.indexOf(marker);
  assert.notEqual(start, -1, "missing source array " + name);
  const a = start + marker.length;
  const b = fieldSource.indexOf("}", a);
  assert.notEqual(b, -1, "unterminated source array " + name);
  return fieldSource.slice(a, b).split(",").map(x => Number(x.trim()));
}
const Q = readArray("Q"), SEED = readArray("SEED"), D = 238;
assert.equal(Q.length, D);
assert.equal(SEED.length, D);

function fieldMul(a, b) {
  const t = new Float64Array(2 * D - 1);
  for (let i = 0; i < D; i++) if (a[i])
    for (let j = 0; j < D; j++) if (b[j]) t[i + j] += a[i] * b[j];
  for (let k = 2 * D - 2; k >= D; k--) {
    const c = mod29(t[k]);
    if (c) for (let j = 0; j < D; j++) t[k - D + j] -= c * Q[j];
    t[k] = 0;
  }
  const out = new Int16Array(D);
  for (let i = 0; i < D; i++) out[i] = mod29(t[i]);
  return out;
}
function fieldPow(a, e) {
  let r = new Int16Array(D); r[0] = 1;
  while (e > 0n) {
    if (e & 1n) r = fieldMul(r, a);
    e >>= 1n;
    if (e > 0n) a = fieldMul(a, a);
  }
  return r;
}
function fieldAdd(a, b) {
  const out = new Int16Array(D);
  for (let i = 0; i < D; i++) out[i] = mod29(a[i] + b[i]);
  return out;
}
function fieldScale(a, k) {
  const out = new Int16Array(D);
  for (let i = 0; i < D; i++) out[i] = mod29(a[i] * k);
  return out;
}
const fieldZero = a => a.every(x => x === 0);
function scalarValue(a) {
  assert.ok(a.slice(1).every(x => x === 0), "expected a base-field scalar");
  return a[0];
}
const N = 29n ** 238n - 1n;
assert.equal(N % 840n, 0n);
const v = fieldPow(SEED, N / 840n);
const vConjugate = fieldPow(v, 29n);
const vTrace = fieldAdd(v, vConjugate);
const vNorm = fieldMul(v, vConjugate);
const vSquaredPlus2 = fieldAdd(fieldMul(v, v), (() => {
  const a = new Int16Array(D); a[0] = 2; return a;
})());
assert.ok(fieldZero(fieldAdd(fieldPow(v, 841n), fieldScale(v, -1))), "v must lie in GF(29^2)");
const v56 = fieldPow(v, 56n), v28 = fieldPow(v, 28n);
assert.equal(scalarValue(v56), 1);
assert.ok(v56.slice(1).every(x => x === 0));
assert.ok(!(v28[0] === 1 && v28.slice(1).every(x => x === 0)));
assert.ok(fieldZero(vTrace));
assert.equal(scalarValue(vNorm), 2);
assert.ok(fieldZero(vSquaredPlus2));
const absoluteNorm = fieldPow(SEED, N / 28n);
assert.equal(scalarValue(absoluteNorm), 2);
assert.ok(absoluteNorm.slice(1).every(x => x === 0));

const add2 = (a, b) => [mod29(a[0] + b[0]), mod29(a[1] + b[1])];
const sub2 = (a, b) => [mod29(a[0] - b[0]), mod29(a[1] - b[1])];
const scale2 = (a, k) => [mod29(a[0] * k), mod29(a[1] * k)];
const mul2 = (a, b) => [
  mod29(a[0] * b[0] + 8 * a[1] * b[1]),
  mod29(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])
];
const pow2 = (a, n) => {
  let r = [1, 0];
  while (n > 0) {
    if (n % 2) r = mul2(r, a);
    a = mul2(a, a);
    n = Math.floor(n / 2);
  }
  return r;
};
const norm2 = a => mod29(a[0] * a[0] + 3 * a[0] * a[1] - 8 * a[1] * a[1]);
const trace2 = a => mod29(2 * a[0] + 3 * a[1]);
const z = [23, 27];
assert.deepEqual(pow2(z, 840), [1, 0]);
for (const p of [2, 3, 5, 7]) assert.notDeepEqual(pow2(z, 840 / p), [1, 0]);
assert.equal(norm2(z), 11);
const z15 = pow2(z, 15);
assert.deepEqual(z15, [28, 20]);
assert.deepEqual(scale2(z15, 10), [19, 26]);

const mulV = (a, b) => [
  mod29(a[0] * b[0] - 2 * a[1] * b[1]),
  mod29(a[0] * b[1] + a[1] * b[0])
];
const powV = (a, n) => {
  let r = [1, 0];
  while (n > 0) {
    if (n % 2) r = mulV(r, a);
    a = mulV(a, a);
    n = Math.floor(n / 2);
  }
  return r;
};
const uV = [16, 19], zV = [20, 20];
assert.deepEqual(mulV(uV, uV), [mod29(3 * uV[0] + 8), mod29(3 * uV[1])]);
assert.deepEqual(zV, [mod29(23 - 2 * uV[0]), mod29(-2 * uV[1])]);
assert.deepEqual(scale2(powV(zV, 15), 10), [0, 1]);
assert.deepEqual(scale2(powV([20, 9], 15), 10), [0, 28]);

const log15 = new Int16Array(29).fill(-1);
let g = 1;
for (let i = 0; i < 28; i++) { log15[g] = i; g = mod29(g * 15); }
assert.equal(g, 1);
assert.equal(log15[2], 27);
assert.equal(log15[11], 3);

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.status === "unsolved" && p.indices.length)
  .sort((a, b) => a.page - b.page);
const beforePages = pages.filter(p => p.page < 36);
const seedPage = pages.find(p => p.page === 36);
const afterPages = pages.filter(p => p.page > 36);
assert.ok(seedPage);
const before = beforePages.flatMap(p => p.indices);
const after = afterPages.flatMap(p => p.indices);
assert.equal(before.length, 8706);
assert.equal(seedPage.indices.length, 238);
assert.equal(after.length, 4012);
const targetPages = [...beforePages, ...afterPages];
const raw = targetPages.flatMap(p => p.indices);
assert.equal(raw.length, 12718);

const translitIndex = new Map(corpus.translit.map((s, i) => [s, i]));
function gpEncode(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const digraph = word.slice(i, i + 2);
      if (translitIndex.has(digraph)) { out.push(translitIndex.get(digraph)); i += 2; }
      else { if (translitIndex.has(word[i])) out.push(translitIndex.get(word[i])); i++; }
    }
  }
  return out;
}
const control = gpEncode(read("resources/control/shakespeare_first300k.txt"));
assert.ok(control.length >= 150000 + raw.length);
const tri = new Uint32Array(29 ** 3), bi = new Uint32Array(29 ** 2);
for (let i = 2; i < 100000; i++) {
  tri[control[i - 2] * 841 + control[i - 1] * 29 + control[i]]++;
  bi[control[i - 2] * 29 + control[i - 1]]++;
}
const lm = Float64Array.from({ length: 29 ** 3 }, (_, i) =>
  Math.log((tri[i] + 0.25) / (bi[Math.floor(i / 29)] + 7.25)));
function score(a) {
  let s = 0;
  for (let i = 2; i < a.length; i++) s += lm[a[i - 2] * 841 + a[i - 1] * 29 + a[i]];
  return s / (a.length - 2);
}
function ioc(a) {
  const h = new Uint32Array(29);
  for (const x of a) h[x]++;
  let n = 0; for (const x of h) n += x * (x - 1);
  return n / (a.length * (a.length - 1));
}
const reference = control.slice(150000, 150000 + raw.length);
const rawScore = score(raw), nativeScore = score(reference);
assert.ok(Math.abs(rawScore - (-4.146318887503244)) < 1e-9);
assert.ok(Math.abs(nativeScore - (-2.462214954971598)) < 1e-9);

const pairKeys = [];
for (let i = 0; i < 4353; i++) pairKeys.push(pow2(z, mod840(15 - 4353 + i)));
for (let i = 0; i < 2006; i++) pairKeys.push(pow2(z, mod840(15 + i)));
assert.equal(pairKeys.length, raw.length / 2);
function inv2(a) {
  const n = norm2(a); assert.notEqual(n, 0);
  let ni = 1; while (mod29(ni * n) !== 1) ni++;
  return [mod29((a[0] + 3 * a[1]) * ni), mod29(-a[1] * ni)];
}
const pairOut = { addMinus: [], addPlus: [], mulDivide: [], mulTimes: [] };
for (let i = 0; i < pairKeys.length; i++) {
  const c = [raw[2 * i], raw[2 * i + 1]], k = pairKeys[i];
  pairOut.addMinus.push(...sub2(c, k));
  pairOut.addPlus.push(...add2(c, k));
  pairOut.mulDivide.push(...mul2(c, inv2(k)));
  pairOut.mulTimes.push(...mul2(c, k));
}
const pairScores = Object.fromEntries(Object.entries(pairOut).map(([k, v]) => [k, score(v)]));
for (const s of Object.values(pairScores)) assert.ok(s < rawScore);

// Independent native-GP positive plants for each pairwise inverse.
for (let i = 0; i < pairKeys.length; i++) {
  const p = [reference[2 * i], reference[2 * i + 1]], k = pairKeys[i], ki = inv2(k);
  assert.deepEqual(sub2(add2(p, k), k), p, "add-minus pair plant");
  assert.deepEqual(add2(sub2(p, k), k), p, "add-plus pair plant");
  assert.deepEqual(mul2(mul2(p, k), ki), p, "multiply-then-divide pair plant");
  assert.deepEqual(mul2(mul2(p, ki), k), p, "divide-then-multiply pair plant");
}

const scalarTrace = [], scalarNorm = [];
for (let i = 0; i < before.length; i++) {
  const p = pow2(z, mod840(15 - before.length + i));
  scalarTrace.push(trace2(p)); scalarNorm.push(norm2(p));
}
for (let i = 0; i < after.length; i++) {
  const p = pow2(z, mod840(15 + i));
  scalarTrace.push(trace2(p)); scalarNorm.push(norm2(p));
}
const scalarAdd = (key, sign) => raw.map((c, i) => mod29(c + sign * key[i]));
const scalarScores = {
  traceMinus: score(scalarAdd(scalarTrace, -1)),
  tracePlus: score(scalarAdd(scalarTrace, 1)),
  normMinus: score(scalarAdd(scalarNorm, -1)),
  normPlus: score(scalarAdd(scalarNorm, 1)),
  normDivide: score(raw.map((c, i) => {
    let inv = 1; while (mod29(inv * scalarNorm[i]) !== 1) inv++;
    return mod29(c * inv);
  })),
  normMultiply: score(raw.map((c, i) => mod29(c * scalarNorm[i])))
};
for (const s of Object.values(scalarScores)) assert.ok(s < rawScore);

// Independent native-GP positive plants for scalar trace/norm readouts.
function invScalar(k) {
  let inv = 1; while (mod29(inv * k) !== 1) inv++;
  return inv;
}
for (let i = 0; i < reference.length; i++) {
  const p = reference[i], t = scalarTrace[i], n = scalarNorm[i], ni = invScalar(n);
  assert.equal(mod29(mod29(p + t) - t), p, "trace-minus scalar plant");
  assert.equal(mod29(mod29(p - t) + t), p, "trace-plus scalar plant");
  assert.equal(mod29(mod29(p + n) - n), p, "norm-minus scalar plant");
  assert.equal(mod29(mod29(p - n) + n), p, "norm-plus scalar plant");
  assert.equal(mod29(mod29(p * n) * ni), p, "norm-divide scalar plant");
  assert.equal(mod29(mod29(p * ni) * n), p, "norm-multiply scalar plant");
}

function powMod(a, n, m) {
  let r = 1;
  while (n > 0) { if (n % 2) r = r * a % m; a = a * a % m; n = Math.floor(n / 2); }
  return r;
}
function invMod(a, m) {
  for (let x = 1; x < m; x++) if (a * x % m === 1) return x;
  throw new Error("no modular inverse");
}
function makeKeys(kind) {
  let clock = 0;
  return targetPages.map(page => page.indices.map(() => {
    const t = clock++ - before.length;
    if (kind === "step3") return mod28(27 + 3 * t);
    const e = kind === "power11" ? 11 : 15;
    const ePow = t >= 0 ? powMod(e, t, 28) : powMod(invMod(e, 28), -t, 28);
    return mod28(27 * ePow);
  }));
}
function decryptPage(cipher, keys) {
  const plain = new Array(cipher.length);
  if (!cipher.length) return plain;
  plain[0] = mod29(cipher[0] - keys[0]);
  for (let i = 1; i < cipher.length; i++) {
    const d = mod29(cipher[i] - cipher[i - 1]);
    plain[i] = d === 0 ? 28 : mod28(log15[d] - keys[i]);
  }
  return plain;
}
function encryptPage(plain, keys) {
  const cipher = new Array(plain.length);
  if (!plain.length) return cipher;
  cipher[0] = mod29(plain[0] + keys[0]);
  for (let i = 1; i < plain.length; i++)
    cipher[i] = plain[i] === 28 ? cipher[i - 1] :
      mod29(cipher[i - 1] + powMod(15, mod28(plain[i] + keys[i]), 29));
  return cipher;
}
const eaResults = {};
for (const kind of ["step3", "power11", "power15"]) {
  const keys = makeKeys(kind);
  const decoded = targetPages.map((p, j) => decryptPage(p.indices, keys[j])).flat();
  let offset = 0;
  const plantPages = targetPages.map(p => {
    const x = reference.slice(offset, offset + p.indices.length); offset += p.indices.length; return x;
  });
  const plantedCipher = plantPages.map((p, j) => encryptPage(p, keys[j]));
  const recovered = plantedCipher.map((c, j) => decryptPage(c, keys[j])).flat();
  assert.deepEqual(recovered, reference, kind + " positive plant");
  eaResults[kind] = { trigram: score(decoded), ioc: ioc(decoded), EAcount: decoded.filter(x => x === 28).length, positivePlantExact: true };
  assert.ok(eaResults[kind].trigram < rawScore);
}

console.log(JSON.stringify({
  fieldBridge: {
    absoluteNormGF29: scalarValue(absoluteNorm),
    relativeNormGF29SquaredOrder: 56,
    relativeNormTrace: scalarValue(vTrace),
    relativeNormNorm: scalarValue(vNorm),
    relativeNormMinimalPolynomial: "X^2 + 2",
    p3RootOrder: 840,
    p3RootNorm: norm2(z),
    p3Root15: z15,
    tenTimesP3Root15: scale2(z15, 10),
    embeddingUInBasis1V: uV,
    embeddingZInBasis1V: zV,
    vEqualsTenZ15: true,
    log15_2: log15[2],
    log15_11: log15[11],
    uniformNormConjugacyProbability: "2/840 = 1/420"
  },
  input: { beforeP36: before.length, p36Seed: seedPage.indices.length, afterP36: after.length, nonSeedRunes: raw.length, pages: targetPages.length },
  scores: { raw: rawScore, nativeGP: nativeScore, pairwiseGF29Squared: pairScores, scalarTraceNorm: scalarScores, EA: eaResults },
  positiveControls: { PairMasksExact: true, ScalarMasksExact: true, EAPlantsExact: Object.values(eaResults).every(x => x.positivePlantExact) }
}, null, 2));
