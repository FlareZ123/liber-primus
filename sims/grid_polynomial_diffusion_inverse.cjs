"use strict";
/**
 * Exact original-LP2 GP29 finite-polynomial convolution inversion.
 * Source: printed 256 base60 bytes; optional twice-divided X-24 factor.
 *
 * Cipher architecture (finite 29-symbol, lossless):
 *   Y_n = sum_j taps[j]*P_(n-j) mod29    (P_i=0 for i<0)
 *   D_n = Y_n==28 ? 0 : 15^Y_n mod29
 *   C_n = C_(n-1)+D_n mod29, C_-1=0.
 *
 * This preserves original adjacency equalities exactly in the Y=28 channel,
 * with no lossy rank28 duplicate or ambiguous EA elimination.
 *
 * The forward table tap has zero first coefficient in F29. The original
 * first C rune is index15, so Y_0=1; hence a zero-state forward tap is
 * impossible before trying any plaintext. Reversed coefficient vectors
 * have invertible first tap and admit exact original inverses.
 *
 * Reproduce from repository root: node sims/grid_polynomial_diffusion_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {nativeGP,divideAc,profile} =
  require("./ink256_grid256_lfsr_inversion.cjs");

const root = path.resolve(__dirname,"..");
/** @param {string} file */
const read = file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/base60-grid.json");
const original = corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const mod = x => ((x%29)+29)%29;
const GP_POW = [];
const GP_LOG = Array(29).fill(-1);
for(let i=0,v=1;i<28;i++,v=(v*15)%29) {
  assert.equal(GP_LOG[v],-1);
  GP_POW.push(v);
  GP_LOG[v]=i;
}
assert.equal(GP_POW.length,28);

/** @param {number} x */
function inverse(x) {
  assert.ok(x>0&&x<29);
  for(let n=1;n<29;n++)if(x*n%29===1)return n;
  throw new Error("Impossible: nonzero element without inverse in F29");
}

/** @param {number[]} cipher */
function extractRank(cipher) {
  const ranks=[];
  let prev=0;
  for(const c of cipher) {
    const delta=mod(c-prev);
    ranks.push(delta===0?28:GP_LOG[delta]);
    prev=c;
  }
  return ranks;
}

/** @param {number[]} plain @param {number[]} taps */
function forwardFilter(plain,taps) {
  const y=new Array(plain.length).fill(0);
  for(let i=0;i<plain.length;i++) {
    let s=0;
    for(let j=0;j<taps.length&&j<=i;j++)
      s+=taps[j]*plain[i-j];
    y[i]=s%29;
  }
  return y;
}

/** @param {number[]} signal @param {number[]} taps */
function inverseFilter(signal,taps) {
  assert.ok(taps[0]!==0);
  const out=new Array(signal.length).fill(0);
  const iv=inverse(taps[0]);
  for(let i=0;i<signal.length;i++) {
    let s=signal[i];
    for(let j=1;j<taps.length&&j<=i;j++)
      s-=taps[j]*out[i-j];
    out[i]=mod(s*iv);
  }
  return out;
}

/** @param {number[]} plain @param {number[]} taps */
function encrypt(plain,taps) {
  const y=forwardFilter(plain,taps);
  const out=[];
  let prev=0;
  for(const v of y) {
    prev=mod(prev+(v===28?0:GP_POW[v]));
    out.push(prev);
  }
  return out;
}

/** @param {number[]} sequence */
function sourceProfile(sequence) {
  const f=Array(29).fill(0);
  for(const g of sequence)f[g]++;
  const result=profile(sequence);
  return {...result,GP_EA:f[28],leastSymbol:Math.min(...f),
    prefix:sequence.slice(0,60).map(n=>corpus.translit[n]).join("")};
}

function run() {
  const originalSignal=extractRank(original);
  assert.equal(originalSignal.filter(i=>i===28).length,86);
  assert.equal(original[0],15);
  assert.equal(originalSignal[0],1);
  const raw=grid.byte_rows.flat().map(n=>n%29);
  assert.equal(raw.length,256);
  const once=divideAc(raw),twice=divideAc(once.quotient);
  assert.equal(once.remainder,0);
  assert.equal(twice.remainder,0);
  assert.equal(twice.quotient.length,254);
  const native=nativeGP();
  const out=[];
  for(const [coefficientName,base] of [
    ["raw-256",raw],["Ac-double-root-254",twice.quotient]
  ]) for(const reverse of [false,true]) {
    const taps=reverse?base.slice().reverse():base;
    const entry={coefficientName,reverse,firstCoefficient:taps[0]};
    if(taps[0]===0) {
      const contradiction=originalSignal[0]!==0;
      assert.equal(contradiction,true);
      out.push({...entry,
        validCausalZeroState:false,
        exactObstruction:"Y[0]=1 but coefficient[0]=0 forces Y[0]=0"});
      continue;
    }
    const plaintext=inverseFilter(originalSignal,taps);
    assert.deepEqual(forwardFilter(plaintext,taps),originalSignal);
    assert.deepEqual(encrypt(plaintext,taps),original);
    const plant=encrypt(native,taps);
    assert.deepEqual(inverseFilter(extractRank(plant),taps),native);
    assert.deepEqual(extractRank(plant),forwardFilter(native,taps));
    out.push({...entry,validCausalZeroState:true,
      originalReencrypted:original.length,
      nativeControlRecovered:native.length,
      original:sourceProfile(plaintext)});
  }
  assert.equal(out.length,4);
  return {
    source:"Original printed 256-byte table modulo 29, raw and Ac-root quotient",
    cipherSymbols:original.length,
    ciphertextRepeatEvents:86,
    nativeLP1Control:sourceProfile(native),
    originalInput:sourceProfile(original),
    cases:out,
    interpretation:"No English plaintext; exact inverse and planted recovery prove mechanical implementation only."
  };
}
if(require.main===module)
  console.log(JSON.stringify(run(),null,2));
module.exports={run,forwardFilter,inverseFilter,extractRank,encrypt};
