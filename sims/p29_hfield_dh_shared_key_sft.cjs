"use strict";

/**
 * Original LP2: source-derived 2013 BASE29 H-field Diffie-Hellman key.
 * A mathematical candidate, not an authenticated historical cipher.
 * Run: node sims/p29_hfield_dh_shared_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const M = 29;
const H = [24, 26, 3]; // 2013 signed BASE29 3301 = 3QO
const G = [15, 5, 27]; // original p39 red triad, descending polynomial
const mod = (v) => ((v % M) + M) % M;

/**
 * @param {number[]} a High-degree-first polynomial coefficients.
 * @param {number[]} b High-degree-first polynomial coefficients.
 * @returns {number[]}
 */
function polyMul(a, b) {
  const r = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      r[i + j] = mod(r[i + j] + a[i] * b[j]);
  return r;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polySub(a, b) {
  const n = Math.max(a.length, b.length);
  const x = Array(n - a.length).fill(0).concat(a);
  const y = Array(n - b.length).fill(0).concat(b);
  return x.map((v, i) => mod(v - y[i]));
}

/**
 * @param {number[]} a High-degree-first dividend.
 * @param {number[]} b High-degree-first divisor.
 * @returns {{q:number[],r:number[]}}
 */
function polyDiv(a, b) {
  assert.ok(a.length >= b.length && b[0] !== 0);
  const r = a.map(mod);
  const q = [];
  const inverse = Array.from({length: 28}, (_, i) => i + 1)
    .find((v) => mod(v * b[0]) === 1);
  assert.notEqual(inverse, undefined);
  for (let i = 0; i <= a.length - b.length; i++) {
    const v = mod(r[i] * inverse);
    q.push(v);
    for (let j = 0; j < b.length; j++)
      r[i + j] = mod(r[i + j] - v * b[j]);
  }
  return {q, r: r.slice(q.length)};
}

/**
 * GF(29)[X]/(X^2+18X+11): X^2=11X+18.
 * A field element [a,b] means aX+b.
 * @param {[number,number]} u
 * @param {[number,number]} v
 * @returns {[number,number]}
 */
function fieldMul([a, b], [c, d]) {
  return [mod(11*a*c+a*d+b*c), mod(18*a*c+b*d)];
}

/**
 * @param {[number,number]} value
 * @param {number} exponent Nonnegative integer.
 * @returns {[number,number]}
 */
function fieldPow(value, exponent) {
  assert.ok(Number.isSafeInteger(exponent) && exponent >= 0);
  let x = value, n = exponent;
  /** @type {[number,number]} */
  let out = [0, 1];
  while (n > 0) {
    if (n % 2) out = fieldMul(out, x);
    n = Math.floor(n / 2);
    x = fieldMul(x, x);
  }
  return out;
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const counts = Array(M).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((sum, n) => sum + n*(n-1), 0) /
    (values.length*(values.length-1));
}

/**
 * Pairwise GF(29^2) field multiplication, with one optional unmatched last rune.
 * @param {number[]} source
 * @param {(pairIndex:number)=>[number,number]} factor
 * @param {boolean} allowLast
 * @returns {number[]}
 */
function transform(source, factor, allowLast=false) {
  assert.ok(allowLast || source.length % 2 === 0);
  const out = [];
  for (let i = 0; i + 1 < source.length; i += 2)
    out.push(...fieldMul([source[i], source[i+1]], factor(i/2)));
  if (source.length % 2) out.push(source[source.length-1]);
  return out;
}

const P = corpus.pages[29].indices;
const S = table.bytes.map(mod);
assert.equal(P.length, 277);
assert.equal(S.length, 256);
const pG = polyDiv(P, G);
const sHG = polyDiv(S, polyMul(H,G));
assert.deepEqual(pG.r, [0,0]);
assert.deepEqual(sHG.r, [0,0,0,0]);
const A = polyDiv(pG.q, H).r;
const B = polyDiv(sHG.q, H).r;
assert.deepEqual(A, [19,16]);
assert.deepEqual(B, [6,5]);
const residual = polyDiv(polySub(polySub(pG.q,
  polyMul(H,sHG.q)), [2]), G);
assert.deepEqual(residual.r, [0,0]);
assert.equal(residual.q.length, 273);

// Candidate extension of historical DH: use the class of X as generator.
// This generator, the pairing and consumer below are NOT creator-authenticated.
const generator = [1,0];
const powers = new Map();
for (let n=0; n<840; n++) {
  const x=fieldPow(generator,n);
  powers.set(x.join(","),n);
}
assert.equal(powers.size, 840);
const a = powers.get(A.join(","));
const b = powers.get(B.join(","));
assert.equal(a, 261);
assert.equal(b, 423);
const K = fieldPow(generator,a*b);
assert.deepEqual(K, [7,1]);
assert.deepEqual(fieldPow(A,b), K);
assert.deepEqual(fieldPow(B,a), K);
assert.deepEqual(fieldPow(K,280), [0,1]);
for (const primeFactor of [2,5,7])
  assert.notDeepEqual(fieldPow(K,280/primeFactor), [0,1]);
const Kinv = fieldPow(K, 279);
assert.deepEqual(fieldMul(K,Kinv), [0,1]);

const book = corpus.pages.filter((page) => page.status === "unsolved")
  .flatMap((page) => page.indices);
assert.equal(book.length, 12956);
const decoded = transform(book, () => Kinv);
const p55 = corpus.pages[55].indices;
assert.equal(p55.length, 76);
const decoded55 = transform(p55, () => Kinv);
const decodedR = transform(residual.q, () => Kinv, true);
const decodedRpower = transform(residual.q,
  (j) => fieldPow(K, (280-((j+1)%280))%280), true);

const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
const plant = Array.from({length: book.length}, (_,i) => known[i%known.length]);
const encoded = transform(plant, () => K);
assert.deepEqual(transform(encoded, () => Kinv), plant);
const rPlant = Array.from({length: residual.q.length},
  (_,i) => known[i%known.length]);
assert.deepEqual(transform(transform(rPlant, () => K, true),
  () => Kinv, true), rPlant);
assert.deepEqual(transform(transform(rPlant, (j) => fieldPow(K,j+1), true),
  (j) => fieldPow(K,(280-((j+1)%280))%280), true), rPlant);

// Frozen original-input outputs. These are uniform-like, not native-GP prose.
const close = (x,y) => assert.ok(Math.abs(x-y)<1e-12,
  "Unexpected source or transform change: " + x + " versus " + y);
close(ioc(book), 0.03447839786450569);
close(ioc(decoded), 0.03451561077370321);
close(ioc(p55), 0.037894736842105266);
close(ioc(decoded55), 0.032280701754385965);
close(ioc(residual.q), 0.033801982331394094);
close(ioc(decodedR), 0.03425985778926956);
close(ioc(decodedRpower), 0.03412518853695324);
const text = (values, count) => values.slice(0,count)
  .map((v) => corpus.translit[v]).join("");
console.log(JSON.stringify({
  classification:"candidate only; no original LP2 plaintext recovered",
  signedSource:"2013 BASE29 and DH worked protocol",
  fieldGeneratorOrder:840, a, b, key:K, keyOrder:280,
  book:{runes:book.length,rawIoc:ioc(book),inverseIoc:ioc(decoded),
    sample:text(decoded,65)},
  p55:{runes:76,rawIoc:ioc(p55),inverseIoc:ioc(decoded55),
    sample:text(decoded55,76)},
  residual:{runes:273,rawIoc:ioc(residual.q),
    constantInverseIoc:ioc(decodedR),powerInverseIoc:ioc(decodedRpower),
    sample:text(decodedR,65)},
  plants:{book:plant.length,residual:rPlant.length,exact:true}
},null,2));
