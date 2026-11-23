#!/usr/bin/env node
'use strict';

/**
 * LP2 p39 versus the exact table-derived GF29 degree-16 factor.
 * SFT: node sims/lp2_p39_f16_quotient_sft.cjs
 *
 * Both original p39 coefficient orders, the 224/16 quotient-syndrome
 * inverse, and 16-wide circulant source-spiral consumers are reproducible.
 * No unknown plaintext/key is claimed.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a,b) {
  const result = Array(a.length+b.length-1).fill(0);
  for (let i=0;i<a.length;i++) for(let j=0;j<b.length;j++)
    result[i+j]=mod(result[i+j]+a[i]*b[j]);
  return result;
}
/** @param {number[]} a @param {number[]} divisor @returns {{q:number[],r:number[]}} */
function divMonic(a,divisor) {
  assert.equal(divisor.at(-1),1);
  const r=a.slice(), q=Array(a.length-divisor.length+1).fill(0);
  for(let i=q.length-1;i>=0;i--) {
    const x=r[i+divisor.length-1];
    q[i]=x;
    for(let j=0;j<divisor.length;j++) r[i+j]=mod(r[i+j]-x*divisor[j]);
  }
  return {q,r:r.slice(0,divisor.length-1)};
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts=Array(29).fill(0);
  for(const x of a) counts[x]++;
  return counts.reduce((sum,x)=>sum+x*(x-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @returns {string} */
const gp = a => a.map(x=>corpus.translit[x]).join('');
/** @param {number} n @returns {number} */
function inverse(n) {
  for(let x=1;x<29;x++) if(mod(x*n)===1) return x;
  throw Error('noninvertible GF29 element');
}
/** @param {number[]} a @returns {number[][]} */
function circulant(a) {
  return Array.from({length:16},(_,i)=>Array.from({length:16},(_,j)=>a[(i-j+16)%16]));
}
/** @param {number[][]} matrix @returns {number[][]} */
function invert(matrix) {
  const n=matrix.length;
  const a=matrix.map((r,i)=>r.concat(Array.from({length:n},(_,j)=>+(i===j))));
  for(let i=0;i<n;i++) {
    let pivot=i;
    while(pivot<n&&a[pivot][i]===0) pivot++;
    assert.ok(pivot<n,'source spiral circulant singular');
    [a[i],a[pivot]]=[a[pivot],a[i]];
    const k=inverse(a[i][i]);
    for(let j=0;j<n*2;j++) a[i][j]=mod(a[i][j]*k);
    for(let h=0;h<n;h++) if(h!==i) {
      const v=a[h][i];
      for(let j=0;j<n*2;j++) a[h][j]=mod(a[h][j]-v*a[i][j]);
    }
  }
  return a.map(x=>x.slice(n));
}
/** @param {number[][]} m @param {number[]} v @returns {number[]} */
function blockMap(m,v) {
  assert.equal(v.length%16,0);
  const out=[];
  for(let i=0;i<v.length;i+=16) {
    const row=v.slice(i,i+16);
    for(const coeffs of m) out.push(mod(coeffs.reduce((s,x,j)=>s+x*row[j],0)));
  }
  return out;
}

/** @param {number[]} a @returns {number[]} */
function trimPolynomial(a) {
  let n=a.length;
  while(n>0 && a[n-1]===0)n--;
  return a.slice(0,n);
}
/** @param {number[]} a @param {number[]} b @param {number} sign @returns {number[]} */
function addPolynomial(a,b,sign=1) {
  return trimPolynomial(Array.from({length:Math.max(a.length,b.length)},
    (_,i)=>mod((a[i]||0)+sign*(b[i]||0))));
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiplyPolynomial(a,b) {
  if(!a.length || !b.length) return [];
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++) for(let j=0;j<b.length;j++)
    out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return trimPolynomial(out);
}
/** @param {number[]} a @param {number[]} b @returns {{q:number[],r:number[]}} */
function dividePolynomial(a,b) {
  assert.ok(b.length && b[b.length-1]!==0);
  let r=trimPolynomial(a);
  const q=Array(Math.max(0,a.length-b.length+1)).fill(0);
  const invLead=inverse(b.at(-1));
  while(r.length>=b.length) {
    const shift=r.length-b.length,coeff=mod(r.at(-1)*invLead);
    q[shift]=coeff;
    for(let i=0;i<b.length;i++)r[shift+i]=mod(r[shift+i]-coeff*b[i]);
    r=trimPolynomial(r);
  }
  return {q:trimPolynomial(q),r};
}
/** @param {number[]} key @param {number[]} modulus @returns {number[]} */
function invertPolynomialModulo(key,modulus) {
  let a=trimPolynomial(modulus), b=trimPolynomial(key), u=[],v=[1];
  while(b.length) {
    const {q,r}=dividePolynomial(a,b);
    [a,b]=[b,r];
    [u,v]=[v,addPolynomial(u,multiplyPolynomial(q,v),-1)];
  }
  assert.equal(a.length,1,'p50 source quotient must be invertible in the 240-cycle');
  return dividePolynomial(u.map(x=>mod(x*inverse(a[0]))),modulus).r;
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function cyclic240(a,b) {
  assert.equal(a.length,240);
  assert.equal(b.length,240);
  const v=multiplyPolynomial(a,b),out=Array(240).fill(0);
  for(let i=0;i<v.length;i++)out[i%240]=mod(out[i%240]+v[i]);
  return out;
}

function run() {
  assert.equal(grid.bytes.length,256);
  const hash=crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex');
  assert.equal(hash,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const F=[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1];
  const monic=grid.bytes.slice(1).reverse().map(x=>mod(-x));
  assert.equal(grid.bytes[0]%29,0);
  assert.equal(grid.bytes[1]%29,28);
  const factor=divMonic(monic,F);
  assert.equal(factor.q.length,239);
  assert.ok(factor.r.every(x=>x===0));
  assert.deepEqual(mul(factor.q,F),monic);
  const original=corpus.pages.find(x=>x.page===39).indices;
  const solved=corpus.pages.find(x=>x.page===57).indices;
  assert.equal(original.length,240);
  assert.deepEqual(original.slice(119,122),[27,5,15]);
  const results=[];
  for(const orientation of ['printed','reversed']) {
    const input=orientation==='printed'?original.slice().reverse():original.slice();
    const {q,r}=divMonic(input,F);
    assert.equal(q.length,224);
    assert.equal(r.length,16);
    const replay=mul(q,F);
    for(let i=0;i<r.length;i++) replay[i]=mod(replay[i]+r[i]);
    assert.deepEqual(replay,input);
    results.push({operation:'factor16 division',orientation,quotientLength:q.length,
      syndromeLength:r.length,quotientIoC:ioc(q),
      quotientPrefix:gp(q.slice().reverse().slice(0,48)),
      syndrome:gp(r.slice().reverse())});
  }
  // Planted authentic prose: a source-native 224-rune quotient,
  // with the *same original* 16-digit syndrome as retained side data.
  const planted=Array.from({length:224},(_,i)=>solved[i%solved.length]);
  const originalSyndrome=divMonic(original.slice().reverse(),F).r;
  const codeword=mul(planted,F);
  for(let i=0;i<16;i++) codeword[i]=mod(codeword[i]+originalSyndrome[i]);
  assert.deepEqual(divMonic(codeword,F),{q:planted,r:originalSyndrome});
  const spiral=[22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21];
  for(const orientation of ['printed','reversed']) {
    const input=orientation==='printed'?original:original.slice().reverse();
    for(const key of ['spiral','reverse-spiral']) {
      const M=circulant(key==='spiral'?spiral:spiral.slice().reverse());
      const Mi=invert(M);
      for(const operation of ['forward','inverse']) {
        const output=blockMap(operation==='forward'?M:Mi,input);
        assert.deepEqual(blockMap(operation==='forward'?Mi:M,output),input);
        results.push({operation:'cyclic16 '+operation,orientation,key,ioc:ioc(output),
          prefix:gp(output.slice(0,32))});
      }
    }
  }

  // A separate no-secret original receiver: 240-symbol cyclic polynomial
  // convolution by the exact normalized table quotient, over GF29[x]/(x^240-1).
  // Both coefficient directions and both input directions are frozen.
  const normalizedQ240=divMonic(monic,F).q.concat([0]);
  assert.equal(normalizedQ240.length,240);
  assert.deepEqual(mul(normalizedQ240,F).slice(0,255),monic);
  const modulus240=[28,...Array(239).fill(0),1];
  for(const orientation of ['printed','reversed']) {
    const cipher=orientation==='printed'?original.slice().reverse():original.slice();
    for(const quotientOrder of ['printed','reversed']) {
      const quotient=quotientOrder==='printed'
        ?normalizedQ240.slice():normalizedQ240.slice().reverse();
      const inverseKey=invertPolynomialModulo(quotient,modulus240);
      const inverseLength240=inverseKey.concat(Array(240-inverseKey.length).fill(0));
      const forward=cyclic240(cipher,quotient);
      const decoded=cyclic240(cipher,inverseLength240);
      assert.deepEqual(cyclic240(decoded,quotient),cipher);
      const plantedNative=Array.from({length:240},(_,i)=>solved[i%solved.length]);
      assert.deepEqual(cyclic240(cyclic240(plantedNative,quotient),inverseLength240),
        plantedNative);
      results.push({operation:'cyclic240 quotient receiver',orientation,quotientOrder,
        forwardIoC:ioc(forward),inverseIoC:ioc(decoded),
        forwardPrefix:gp(forward.slice().reverse().slice(0,32)),
        inversePrefix:gp(decoded.slice().reverse().slice(0,32))});
    }
  }
  const cyclicCases=results.filter(x=>x.operation==='cyclic240 quotient receiver');
  assert.equal(cyclicCases.length,4);
  assert.ok(cyclicCases.every(x=>x.forwardIoC<0.04 && x.inverseIoC<0.04));

  const divisions=results.filter(x=>x.operation==='factor16 division');
  assert.ok(Math.abs(divisions[0].quotientIoC-0.033311979500320305)<1e-12);
  assert.ok(Math.abs(divisions[1].quotientIoC-0.03343209481101858)<1e-12);
  assert.equal(divisions[0].syndrome,'ARTDRAOORAEPUTHPXI');
  assert.equal(divisions[1].syndrome,'FDNGCTHLEAOELOXHOEJRS');
  for(const r of results) if(r.operation.startsWith('cyclic16')) assert.ok(r.ioc<0.04);
  console.log(JSON.stringify({source:'unchanged p39/p50 and p15 spiral',
    sourceP39IoC:ioc(original),positivePlantedNative:224,
    solvedP57IoC:ioc(solved),results},null,2));
  console.log('PASS: table factor; 224/16 reconstruction; native plants; eight 16-wide and four cyclic240 quotient receiver inverses');
}
run();
