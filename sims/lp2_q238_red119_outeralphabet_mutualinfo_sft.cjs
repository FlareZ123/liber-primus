'use strict';
/**
 * Source Q238 full-seed LFSR: fixed-secret-alphabet-independent MI gate.
 * Native-GP positive control and four original-source tests.
 * Run: node sims/lp2_q238_red119_outeralphabet_mutualinfo_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const get=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus=get('resources/liber-primus/lp2-corpus.json');
const grid=get('resources/liber-primus/lp2-grid-256.json');
const {encodeEnglish}=require('./outer_permutation_assignment.cjs');
const original=corpus.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const mod=x=>(x%29+29)%29;
const products=[[25,10,1],[11,18,1],[24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1]];
const multiply=(a,b)=>{const o=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]=mod(o[i+j]+a[i]*b[j]);return o;};
const D=products.reduce(multiply,[28]),A=grid.bytes.slice().reverse().map(mod);
assert.equal(D.length,17);
const Q=Array(239).fill(0);
for(let i=238;i>=0;i--){const v=mod(A[i+16]*28);Q[i]=v;for(let j=0;j<17;j++)A[i+j]=mod(A[i+j]-v*D[j]);}
assert.deepEqual(A,Array(256).fill(0));
assert.equal(Q[238],1);
const text=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
const native=encodeEnglish(text).slice(13000,13000+original.length);
assert.equal(native.length,original.length);
/** Empirical mutual information between observed symbol and source key GF29 digit. */
function mutualInformation(a,b){
 const n=a.length,xy=Array(841).fill(0),cx=Array(29).fill(0),cy=Array(29).fill(0);
 for(let i=0;i<n;i++){xy[29*a[i]+b[i]]++;cx[a[i]]++;cy[b[i]]++;}
 let mi=0;
 for(let i=0;i<29;i++)for(let j=0;j<29;j++){
  const count=xy[29*i+j];
  if(count)mi+=count/n*Math.log2(count*n/(cx[i]*cy[j]));
 }
 return mi;
}
function lfsr(seed,poly){const s=seed.slice();while(s.length<original.length){const t=s.length;let z=0;for(let j=0;j<238;j++)z+=poly[j]*s[t-238+j];s.push(mod(-z));}return s;}
const output=[];
for(const [order,seed] of [
 ['p3+p39',corpus.pages[3].indices.slice(0,119).concat(corpus.pages[39].indices.slice(0,119))],
 ['p39+p3',corpus.pages[39].indices.slice(0,119).concat(corpus.pages[3].indices.slice(0,119))]
])for(const [direction,poly] of [['direct',Q],['reciprocal',Q.slice().reverse()]]){
 assert.equal(seed.length,238);
 const k=lfsr(seed,poly),synthetic=native.map((v,i)=>mod(7*mod(v+k[i])+3));
 const measured=mutualInformation(original,k),planted=mutualInformation(synthetic,k),baseline=mutualInformation(native,k);
 assert(measured>=0.035&&measured<0.06,'authentic source MI register');
 assert(planted>0.6&&planted<0.71,'detect native-GP generated with secret outer bijection');
 assert(baseline<0.06,'independent source/native control');
 output.push({order,direction,originalMI:measured,secretBijectionNativePlantMI:planted,independentNativeMI:baseline});
}
assert.equal(output.length,4);
console.log(JSON.stringify({source:'Q238 quotient of original 32x8 grid, source p3/p39 first119 rune seeds',n:original.length,cases:output, conclusion:'All four source-anchored streams show no English-scale output-key dependence, even granting any unknown fixed 29-symbol output permutation. This is a register-dependent diagnostic, not recovered plaintext or an unconditional impossibility.'},null,2));
