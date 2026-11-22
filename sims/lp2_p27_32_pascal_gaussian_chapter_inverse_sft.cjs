/**
 * One-dimensional GF29 Pascal-Gaussian deblur with original visual-chapter
 * boundaries, inspired by the p32 blurred tree and p55 sharp tree.
 *
 * This is a single source-shaped cipher candidate, not a claim of an
 * authentic Cicada encryption. Node.js 22 CommonJS; read-only SFT.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8",
));
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {number} x - Nonzero GF29 element. */
function inverse29(x) {
  for (let i = 1; i < MOD; i++) {
    if (mod(i * x) === 1) return i;
  }
  throw new Error("singular GF29 divisor");
}

/**
 * Blur original plaintext with the frozen normalized 3-tap
 * [1,2,1]/4 discrete Gaussian (zero-padded ends).
 * @param {number[]} plain
 * @returns {number[]}
 */
function blur(plain) {
  const inv4 = inverse29(4);
  return plain.map((x, i) => mod(inv4 *
    ((i > 0 ? plain[i-1] : 0) + 2 * x +
     (i + 1 < plain.length ? plain[i+1] : 0))));
}

/**
 * Exact Dirichlet-boundary tridiagonal inverse in GF29.
 * Determinant of diag(2)+offdiag(1) on n sites is n+1 modulo29.
 * @param {number[]} cipher
 * @returns {number[]}
 */
function deblur(cipher) {
  const n = cipher.length;
  assert(n >= 2);
  assert(mod(n + 1) !== 0, "kernel singular on this source length");
  // For q_i=4 C_i, P[-1]=0, and P[0]=t, the homogeneous
  // response at index k is (-1)^k(k+1)*t.
  const beta = new Array(n+1);
  beta[0] = 0;
  beta[1] = mod(4 * cipher[0]);
  for (let k = 1; k < n; k++) {
    beta[k+1] = mod(4*cipher[k]-2*beta[k]-beta[k-1]);
  }
  const hN = mod((n % 2 ? -1 : 1) * (n + 1));
  const initial = mod(-beta[n] * inverse29(hN));
  const plain = beta.slice(0,n).map((b,i) =>
    mod(b + mod((i % 2 ? -1 : 1) * (i+1))*initial));
  assert.deepEqual(blur(plain), cipher,
    "whole-original forward replay failed");
  return plain;
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    counts[x]++;
  }
  return counts.reduce((a,n)=>a+n*(n-1),0)/
    (values.length*(values.length-1));
}

/** @param {number} from @param {number} through */
function originalRange(from, through) {
  return source.pages.filter((p) =>
    p.page >= from && p.page <= through).flatMap((p) => p.indices);
}
const original = originalRange(0,55);
assert.equal(original.length, 12956);
assert.equal(source.pages.find((p)=>p.page===32).indices.length,121);
assert.equal(originalRange(27,32).length,1433);
const cases = [
  [27,32,1433,0.03469495959174603],
  [32,32,121,0.030991735537190084],
  [54,55,308,0.03439231777993993],
  [40,53,3008,0.03448602197708892],
  [0,2,729,0.03434254360180286],
];
for (const [from,to,n,wantedIoC] of cases) {
  const cipher = originalRange(from,to);
  assert.equal(cipher.length,n);
  const plain = deblur(cipher);
  assert.equal(plain.length,cipher.length);
  assert(Math.abs(ioc(plain)-wantedIoC)<1e-13);
  console.log(JSON.stringify({
    pages:[from,to],originalRunes:n,
    rawIoC:ioc(cipher),debIoC:ioc(plain),
    romanization:plain.slice(0,45).map((v)=>source.translit[v]).join(""),
    reenciphered:n,
  }));
}

// Independent actual solved p57 GP29 source, expanded to a complete
// chapter-length plant without inventing the original unknown plaintext.
const native = source.pages.find((p)=>p.page===57).indices;
assert.equal(native.length,95);
const planted = Array.from({length:1433},(_,i)=>native[i%native.length]);
const encoded = blur(planted);
const decoded = deblur(encoded);
assert.deepEqual(decoded,planted);
assert(!encoded.every((x,i)=>x===planted[i]));
console.log(JSON.stringify({plantLength:planted.length,
  plantRecovered:decoded.length, originalUnknownPlaintextRecovered:false,
  decision:"3-tap exact GF29 deblur fails to produce native original prose"}));
