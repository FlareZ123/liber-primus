'use strict';
/**
 * Source-derived GP29 3x3 Hill-key candidate on the original physical p8:
 * first three red runes XIX (Roman19), remaining nine runes form a matrix
 * with determinant 19 modulo29, followed by 243 (=3^5) black rune payload.
 * Test an exact, small set of standard reversible Hill modes and replay.
 * Windows11 / Node22 / CJS, read-only, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = corpus.pages.find((p) => p.page === 8);
assert.equal(page.indices.length, 255);
const red = page.indices.slice(0, 12);
const body = page.indices.slice(12);
assert.deepEqual(red.slice(0, 3), [14, 10, 14]);
assert.equal(body.length, 3 ** 5);
const iv = red.slice(0, 3); // actual physical title prefix, not tuned
const K = [red.slice(3, 6), red.slice(6, 9), red.slice(9, 12)];
assert.deepEqual(K, [[19,1,14], [19,5,2], [13,3,17]]);
const mod = (n) => ((n % 29) + 29) % 29;
const det3 = (m) => m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])
  -m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
  +m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
assert.equal(det3(K), 1092);
assert.equal(mod(det3(K)), 19);
const modInv = (x) => {
  for (let i = 1; i < 29; i += 1) if (mod(x * i) === 1) return i;
  throw Error('Nonunit matrix determinant');
};
const mul = (M, v) => M.map((row) => mod(row.reduce((a, x, i) => a + x * v[i], 0)));
const mm = (A, B) => A.map((row) => B[0].map((_, j) => mod(row.reduce((s, x, i) => s + x * B[i][j], 0))));
const transpose = (m) => m[0].map((_, j) => m.map((row) => row[j]));
const minus = (a, b) => a.map((x, i) => mod(x - b[i]));
const plus = (a, b) => a.map((x, i) => mod(x + b[i]));
const identity = [[1,0,0],[0,1,0],[0,0,1]];
const cofactors = K.map((row, i) => row.map((_, j) => {
  const minor = K.filter((_, r) => r !== i).map((r) => r.filter((_, k) => k !== j));
  return (i + j) % 2 === 0
    ? minor[0][0] * minor[1][1] - minor[0][1] * minor[1][0]
    : minor[0][1] * minor[1][0] - minor[0][0] * minor[1][1];
}));
const adjugate = transpose(cofactors);
const L = adjugate.map((row) => row.map((x) => mod(x * modInv(det3(K)))));
assert.deepEqual(L, [[24,12,1],[21,12,12],[24,16,4]]);
assert.deepEqual(mm(K,L), identity);
assert.deepEqual(mm(L,K), identity);
const ioc = (values) => {
  const n = new Array(29).fill(0);
  for (const x of values) n[x] += 1;
  return n.reduce((s, k) => s + k * (k - 1), 0)/(values.length*(values.length-1));
};
const excerpt = (x) => x.slice(0, 25).map((v) => corpus.translit[v]).join(' ');

/**
 * Exactly invert one of seven standard matrix/symmetric feedback equations,
 * using only the printed title IV and 3x3 matrix. Reconstruct the input tape.
 * @param {number[][]} enc Original-source encryption matrix.
 * @param {number[][]} dec Its authentic GF29 inverse.
 * @param {string} mode The frozen classical-mode identifier.
 * @returns {{mode:string,ioc:number,first25:string,valid:boolean}}
 */
function tryMode(enc, dec, mode) {
  let priorCipher = iv.slice(), priorPlain = iv.slice(), stream = iv.slice();
  const output = [];
  for (let i = 0; i < body.length; i += 3) {
    const C = body.slice(i, i + 3);
    let P;
    if (mode === 'ECB') P = mul(dec, C);
    else if (mode === 'AFFINE_IV') P = mul(dec, minus(C, iv));
    else if (mode === 'CBC_XOR_ANALOG') P = minus(mul(dec, C), priorCipher);
    else if (mode === 'CBC_OUTPUT') P = mul(dec, minus(C, priorCipher));
    else if (mode === 'CFB') P = minus(C, mul(enc, priorCipher));
    else if (mode === 'OFB') { stream = mul(enc, stream); P = minus(C, stream); }
    else if (mode === 'PLAINTEXT_FEEDBACK') P = minus(mul(dec, C), priorPlain);
    else throw Error('Unknown mode');
    // Mode-specific forward replay, not evidence that this is the creator key.
    let reconstructed;
    if (mode === 'ECB') reconstructed = mul(enc, P);
    else if (mode === 'AFFINE_IV') reconstructed = plus(mul(enc, P), iv);
    else if (mode === 'CBC_XOR_ANALOG') reconstructed = mul(enc, plus(P, priorCipher));
    else if (mode === 'CBC_OUTPUT') reconstructed = plus(mul(enc, P), priorCipher);
    else if (mode === 'CFB') reconstructed = plus(P, mul(enc, priorCipher));
    else if (mode === 'OFB') reconstructed = plus(P, stream);
    else reconstructed = mul(enc, plus(P, priorPlain));
    assert.deepEqual(reconstructed, C);
    output.push(...P);
    priorPlain = P;
    priorCipher = C;
  }
  assert.equal(output.length, 243);
  return {mode, ioc: ioc(output), first25:excerpt(output), valid:true};
}
const modes = ['ECB','AFFINE_IV','CBC_XOR_ANALOG','CBC_OUTPUT','CFB','OFB','PLAINTEXT_FEEDBACK'];
const rows = [];
for (const [basis, enc, dec] of [['rowMajor',K,L],['columnMajor',transpose(K),transpose(L)]]) {
  for (const mode of modes) rows.push({basis,...tryMode(enc,dec,mode)});
}
assert.equal(rows.length, 14);
assert(rows.every((r) => r.ioc < 0.04));

// Self-referential characteristic invariants of the source-defined matrix:
const trace = mod(K[0][0] + K[1][1] + K[2][2]);
const principal2 = mod(
  K[0][0]*K[1][1]-K[0][1]*K[1][0]
  + K[0][0]*K[2][2]-K[0][2]*K[2][0]
  + K[1][1]*K[2][2]-K[1][2]*K[2][1]);
const shiftBy2 = K.map((row,i) => row.map((value,j) => value + (i===j ? 2 : 0)));
assert.deepEqual([trace,principal2,mod(det3(K)),mod(det3(shiftBy2))], [12,6,19,0]);
// chi_K(x) = (x+2)(x²-14x+5) modulo29.
// The root -2 is the negative of the preceding p7 fifth red product2.

/**
 * Full 3^5 body recipient under five independent 3x3 tensor axes.
 * @param {number[]} tape Exactly 243 GP29 rune indices.
 * @param {number[][]} matrix Invertible source GF29 key.
 * @returns {number[]} Output exactly 243 indices.
 */
function tensor243(tape, matrix) {
  assert.equal(tape.length, 243);
  const output = tape.slice();
  for (const stride of [1,3,9,27,81]) {
    for (let base = 0; base < 243; base += 3*stride) {
      for (let j = 0; j < stride; j += 1) {
        const p = base + j;
        const tri = [output[p], output[p+stride], output[p+2*stride]];
        const encoded = mul(matrix, tri);
        for (let row=0;row<3;row+=1)output[p+row*stride]=encoded[row];
      }
    }
  }
  return output;
}
const tensorModels=[];
for(const [basis,dec,enc] of [['row',L,K],['column',transpose(L),transpose(K)]]) {
  for(const [direction,matrix,undo] of [['inverse',dec,enc],['forward',enc,dec]]) {
    const recovered=tensor243(body,matrix);
    assert.deepEqual(tensor243(recovered,undo),body);
    tensorModels.push({basis,direction,ioc:ioc(recovered),first25:excerpt(recovered)});
  }
}
assert.equal(tensorModels.length,4);
assert(tensorModels.every(v=>v.ioc<0.04));

const GP1Det = mod(det3(K.map(row => row.map(x => x + 1))));
const primeDet = mod(det3(K.map(row => row.map(x => corpus.prime[x]))));
assert.deepEqual([GP1Det,primeDet], [6,15]);
const allHits = [];
for (const p of corpus.pages.filter(p => p.page <= 55)) {
  for(let i=0;i+2<p.indices.length;i++) {
    if(p.indices[i]===14 && p.indices[i+1]===10 && p.indices[i+2]===14)allHits.push([p.page,i]);
  }
}
assert.deepEqual(allHits, [[8,0]]);
console.log(JSON.stringify({
  originalTitle:red, roman19Prefix:iv, redMatrix:K,
  determinantInteger:det3(K), determinantGP0:19, determinantGP1:GP1Det,
  determinantPrimeValues:primeDet, inverse:L,
  characteristic:{trace,principal2,determinant:19,rootNegative2:true},
  tensorFiveLevels:tensorModels,
  originalBlackRunes:body.length, blackOriginalIOC:ioc(body),
  modeResults:rows, classification:'source-shape key candidate; no original plaintext'
},null,2));
console.log('PASS GP29 3x3 source-key determinant and 14 block modes plus 4 full 243-rune 5-tensor inverses');
