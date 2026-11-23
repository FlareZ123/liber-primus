'use strict';

/**
 * LP2 p8/p9 original 256-rune frame versus the established p50 GF29 code.
 * Historically player-visible check polynomial sources:
 *   signed 2013 BASE29 3301 -> 3QO, [3,26,24] ascending;
 *   original p39 red three-rune runes -> [27,5,15] ascending.
 * The p50 numeric 32x8 byte array, modulo29, is divisible by BOTH.
 *
 * The p8/p9 256-rune frame begins after its first 4 complete red runes
 * and ends at completion of its p8->p9 last printed word. Test if the
 * same generator protects this original frame; if the 4 red runes carry
 * its leading/trailing syndrome; and if one original rune is an error.
 *
 * This excludes a bounded, source-authored ECC proposal, not every
 * 256-register cipher. Windows11 Node22 CommonJS:
 * node sims/lp2_p8_p50_gf29_hg_original_syndrome_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} filename @returns {any} */
const read = filename => JSON.parse(fs.readFileSync(
  path.join(source, filename), 'utf8'));
const corpus = read('lp2-corpus.json');
const grid = read('lp2-grid-256.json');
const ink = read('lp2-ink-annotations.json');
/** @param {number} p @returns {number[]} */
const page = p => corpus.pages.find(x => x.page === p).indices;
const p8 = page(8);
const p9 = page(9);
const p57 = page(57);
const header = p8.slice(0, 4);
const frame = p8.slice(4).concat(p9.slice(0, 5));
assert.deepEqual([p8.length, p9.length, frame.length, grid.bytes.length],
  [255, 268, 256, 256]);
assert.deepEqual(header, [14, 10, 14, 19]);
assert.deepEqual(ink.pages.find(p => p.page === 8).red_spans
  .map(x => [x.start,x.length]), [[0,12]]);
assert.deepEqual(frame.slice(0, 8), [1, 14, 19, 5, 2, 13, 3, 17]);
assert.equal(p57.length, 95);

const p = 29;
const mod = n => ((n % p) + p) % p;
/** @param {number} number @returns {number} */
const inv = number => {
  const a = mod(number);
  assert(a > 0);
  for(let x=1;x<p;x++)if (mod(a*x)===1) return x;
  throw new Error('nonunit GF29 symbol');
};
/**
 * Descending-coefficient polynomial multiplication over GP29.
 * @param {number[]} a @param {number[]} b @returns {number[]}
 */
const multiply = (a,b) => {
  const o = Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    o[i+j] = mod(o[i+j]+a[i]*b[j]);
  return o;
};
/**
 * Descending-coefficient polynomial remainder over GP29.
 * @param {number[]} dividend @param {number[]} divisor
 * @returns {number[]}
 */
const remainder = (dividend,divisor) => {
  const a = dividend.map(mod);
  const n = divisor.length, leadingInverse = inv(divisor[0]);
  for(let i=0;i<=a.length-n;i++){
    const q=mod(a[i]*leadingInverse);
    for(let j=0;j<n;j++)a[i+j]=mod(a[i+j]-q*divisor[j]);
  }
  return a.slice(-(n-1));
};
// 2013 BASE29 3QO [3,26,24] and original p39 red3 [27,5,15]:
// In printed sequence their ascending polynomial coefficients become
// descending-degree source factors as shown.
const H = [24,26,3], G = [15,5,27], Q=multiply(H,G);
assert.deepEqual(Q,[12,17,11,21,23]);
const codes = grid.bytes.map(n=>n%29);
assert.deepEqual(remainder(codes,H),[0,0]);
assert.deepEqual(remainder(codes,G),[0,0]);
assert.deepEqual(remainder(codes,Q),[0,0,0,0]);
assert.deepEqual(remainder(frame,H),[5,17]);
assert.deepEqual(remainder(frame,G),[11,11]);
assert.deepEqual(remainder(frame,Q),[5,19,0,19]);
assert.deepEqual(remainder(header.concat(frame),Q),[18,17,24,24]);
assert.deepEqual(remainder(frame.concat(header),Q),[27,11,26,18]);

/**
 * Solve a 4-equation GF29 linear system with exact pivots.
 * Each column is an independent 4-symbol syndrome.
 * @param {number[]} target @param {number[][]} columns
 * @returns {number[]}
 */
function solve(target, columns){
  const a=Array.from({length:4}, (_,row)=>
    [...columns.map(col=>col[row]),mod(target[row])]);
  for(let j=0;j<4;j++){
    const pivot=a.findIndex((row,i)=>i>=j&&row[j]!==0);
    assert(pivot>=0);
    [a[j],a[pivot]]=[a[pivot],a[j]];
    const scale=inv(a[j][j]);
    for(let k=j;k<=4;k++)a[j][k]=mod(a[j][k]*scale);
    for(let i=0;i<4;i++)if(i!==j){
      const factor=a[i][j];
      for(let k=j;k<=4;k++)a[i][k]=mod(a[i][k]-factor*a[j][k]);
    }
  }
  return a.map(row=>row[4]);
}
/**
 * Required four-runic parity prefix for any 256-symbol body.
 * @param {number[]} body @returns {number[]}
 */
function prefixParity(body){
  const base=remainder(Array(4).fill(0).concat(body),Q);
  const cols=Array.from({length:4},(_,j)=>{
    const basis=Array(4).fill(0);
    basis[j]=1;
    return remainder(basis.concat(Array(body.length).fill(0)),Q);
  });
  const out=solve(base.map(x=>mod(-x)),cols);
  assert.deepEqual(remainder(out.concat(body),Q),[0,0,0,0]);
  return out;
}
/**
 * Required four-runic suffix parity for arbitrary input data.
 * @param {number[]} data @returns {number[]}
 */
function suffixParity(data){
  const out=remainder(data.concat([0,0,0,0]),Q).map(x=>mod(-x));
  assert.deepEqual(remainder(data.concat(out),Q),[0,0,0,0]);
  return out;
}
/**
 * Given a length-256 codeword with at most ONE unknown GP29 rune
 * corruption, list each exact one-rune repair. No language model.
 * @param {number[]} received @returns {{index:number,delta:number}[]}
 */
function oneRuneRepairs(received) {
  const syndrome=remainder(received,Q);
  const all=[];
  for(let index=0;index<received.length;index++){
    const unit=Array(received.length).fill(0);
    unit[index]=1;
    const basis=remainder(unit,Q);
    for(let delta=1;delta<29;delta++)if(
      basis.every((value,k)=>mod(syndrome[k]+delta*value)===0))
      all.push({index,delta});
  }
  return all;
}
const front=prefixParity(frame),back=suffixParity(frame);
assert.deepEqual(front,[3,14,4,26]);
assert.deepEqual(back,[16,28,17,1]);
assert.equal(front.filter((v,i)=>v!==header[i]).length,4);
assert.equal(back.filter((v,i)=>v!==header[i]).length,4);
assert.deepEqual(oneRuneRepairs(frame),[]);

// Authentic solved source-native 252-rune data check, with exactly one
// source-native GP29 error deliberately introduced after forming code.
const sourceNative=Array.from({length:252},(_,i)=>p57[i%p57.length]);
const control=sourceNative.concat(suffixParity(sourceNative));
assert.deepEqual(remainder(control,Q),[0,0,0,0]);
const corrupted=control.slice();
corrupted[37]=mod(corrupted[37]+7);
assert.deepEqual(oneRuneRepairs(corrupted),[{index:37,delta:22}]);
corrupted[37]=mod(corrupted[37]+22);
assert.deepEqual(corrupted,control);
const controlPrefix=prefixParity(control);
assert.deepEqual(remainder(controlPrefix.concat(control),Q),[0,0,0,0]);

console.log(JSON.stringify({
  original: {
    sourceP50Bytes:256,
    sourceFactors: {H,G},
    generatorQ: Q,
    originalGridSyndrome: remainder(codes,Q),
    originalP8Heading:header,
    frameRunes:frame.length,
    frameSyndromeH:remainder(frame,H),
    frameSyndromeG:remainder(frame,G),
    frameSyndromeQ:remainder(frame,Q),
    actualFourRedHeaderAsPrefixSyndrome:remainder(header.concat(frame),Q),
    actualFourRedHeaderAsSuffixSyndrome:remainder(frame.concat(header),Q),
    exactRequiredPrefix:front,
    exactRequiredSuffix:back,
    positionsAgreeingWithRedPrefix:0,
    positionsAgreeingWithRedSuffix:0,
    sourceFrameOneRuneCorrections:oneRuneRepairs(frame).length
  },
  nativeGPControl: {
    source:'solved original clear p57 repeated to 252 data runes',
    exactCodeword256Syndrome:remainder(control,Q),
    exactFront4Syndrome:remainder(controlPrefix.concat(control),Q),
    plantedSingleRuneCorrection:{index:37,delta:22},
    oneErrorCorrectionRestoresAll256:true
  },
  claim: 'This specific p50-derived 4-parity-code and p8 receiver are incompatible; original plaintext and key unknown'
},null,2));
