'use strict';

/**
 * Source-original LP2 p55 inner43 / pp49-51 Q252 congruence mod p39 G.
 * For Node 22. Does not read user guesses or generate plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const mod = x => (x % 29 + 29) % 29;
const H = [3,26,24], G = [27,5,15], F=[23,21,11,17,12];
/** @param {number[]} cs @param {number} x */
function evalp(cs,x){let y=0;for(let i=cs.length-1;i>=0;i--)y=mod(y*x+cs[i]);return y;}
/** @param {number[]} cs @param {number} x */
function deriv(cs,x){let y=0;for(let i=cs.length-1;i>=1;i--)y=mod(y*x+i*cs[i]);return y;}
/** @param {number[]} cs @param {number[]} d @returns {number[]} */
function remainder(cs,d) {
  const a=cs.map(mod);
  let inverse=1;
  while(mod(inverse*d[d.length-1])!==1)inverse++;
  for(let i=a.length-d.length;i>=0;i--) {
    const z=mod(a[i+d.length-1]*inverse);
    for(let j=0;j<d.length;j++)a[i+j]=mod(a[i+j]-z*d[j]);
  }
  return a.slice(0,d.length-1);
}
const raw=grid.pages.flatMap(p=>p.bytes);
assert.equal(raw.length,256);
const r=raw.map(mod),qdesc=[];
for(let i=0;i<252;i++){
  const z=mod(r[i]*17);
  qdesc.push(z);
  for(let j=0;j<F.length;j++)r[i+j]=mod(r[i+j]-z*F[F.length-1-j]);
}
assert.deepEqual(r.slice(252),[0,0,0,0]);
const q=qdesc.slice().reverse(); // ascending polynomial expression of fixed-width quotient
const lengths=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const full=corpus.pages.find(p=>p.page===55).indices;
assert.equal(full.length,76);
let off=0;
const inner=lengths.flatMap(n=>{
  const word=full.slice(off,off+n);
  off+=n;
  return word.slice(1,-1);
});
assert.equal(off,76);
assert.equal(inner.length,43);
assert.deepEqual(G,[27,5,15]);
assert.deepEqual(remainder(G,[mod(-24),1]),[0]); // root24
const pValue=evalp(inner,24),qValue=evalp(q,24);
const pSlope=deriv(inner,24),qSlope=deriv(q,24);
assert.deepEqual([pValue,qValue,pSlope,qSlope],[18,9,22,22]);
const pm=remainder(inner,G),qm=remainder(q,G);
assert.deepEqual(pm,[12,22]);
assert.deepEqual(qm,[3,22]);
const delta=pm.map((v,i)=>mod(v-qm[i]));
assert.deepEqual(delta,[9,0]);
assert.equal(evalp(inner,18),23);
assert.equal(evalp(inner,22),22);
console.log(JSON.stringify({
  source:'original p55 43 word interiors and original pp49-51 table 252-slot dual-factor quotient',
  p39RedFactor:G,
  p39RedFactorRoot:24,
  p39Factor:'15*(X-24)^2',
  p55GResidue:pm,
  Q252GResidue:qm,
  differenceGResidue:delta,
  derivativeAtRoot:pSlope,
  p55AtRoot:pValue,
  QAtRoot:qValue,
  p55At1033Residue:evalp(inner,18),
  p55At22:evalp(inner,22),
  caveat:'Original-source arithmetic relation; polynomial orientation and downstream consumer are not historically authorized; no plaintext.'
},null,2));
