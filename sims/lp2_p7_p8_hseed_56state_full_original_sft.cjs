'use strict';
/**
 * Original LP2 p7 residual field alpha^2=8, source p8 title h=4+3alpha:
 * full-book non-scalar 56-state coset receiver h*alpha^(page-8).
 * Director #2309 predeclared source-root sign +/- and inverse direction,
 * with page 8 as the source-visible zero-state clock origin.
 * Original ciphertext is complete 12,956-rune p0..p55 GP29 tape.
 * Windows 11 / Node.js 22 / CommonJS, read-only, source-native controls.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources',
  'liber-primus','lp2-corpus.json'),'utf8'));
const mod=x=>(x%29+29)%29;
/** @param {[number,number]} a @param {[number,number]} b @returns {[number,number]} */
const mul=(a,b)=>[
  mod(a[0]*b[0]+8*a[1]*b[1]),mod(a[0]*b[1]+a[1]*b[0])
];
/** @param {[number,number]} a @param {number} n @returns {[number,number]} */
function power(a,n){
  assert(Number.isInteger(n)&&n>=0);
  let z=[1,0],b=a,k=n;
  while(k){if(k%2)z=mul(z,b);b=mul(b,b);k=Math.floor(k/2);}
  return z;
}
/** @param {[number,number]} a @returns {[number,number]} */
function inverse(a){
  const norm=mod(a[0]*a[0]-8*a[1]*a[1]);
  assert.notEqual(norm,0);
  const inv=power29(norm,27);
  return [mod(inv*a[0]),mod(-inv*a[1])];
}
/** @param {number} a @param {number} n @returns {number} */
function power29(a,n){
  let z=1,b=mod(a),k=n;
  while(k){if(k%2)z=mod(z*b);b=mod(b*b);k=Math.floor(k/2);}
  return z;
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const f=Array(29).fill(0);a.forEach(x=>f[x]++);
  return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
const P=x=>mod(11+26*x+8*x*x+15*x*x*x+2*x*x*x*x);
for(let x=0;x<29;x++)
  assert.equal(mod(P(x)-x),mod(2*(x-3)*(x-4)*(x*x-8)));
const sourceTitle=gp.pages[8].indices.slice(0,12);
assert.equal(sourceTitle.length,12);
assert.deepEqual([sourceTitle.slice(0,4),sourceTitle.slice(4)]
  .map(a=>a.reduce((z,x)=>mod(z*x),1)),[4,3]);
assert.equal(sourceTitle[11],17);
for(const sign of [1,-1]){
  const alpha=[0,mod(sign)],h=[4,mod(3*sign)];
  assert.deepEqual(power(alpha,56),[1,0]);
  for(let p=0;p<56;p++){
    const k=mul(h,power(alpha,(p-8+56)%56));
    assert(k[0]!==0&&k[1]!==0,'Printed h coset escapes scalar no-go');
    assert.deepEqual(mul(k,inverse(k)),[1,0]);
  }
}
const ciphertext=[],origin=[];
const pageStarts=[];
for(let p=0;p<56;p++){
  pageStarts[p]=ciphertext.length;
  for(const r of gp.pages[p].indices){ciphertext.push(r);origin.push(p);}
}
assert.equal(ciphertext.length,12956);
assert.equal(gp.pages[50].indices.length,0);
assert.equal(ciphertext.length%2,0);
/**
 * @param {number[]} input
 * @param {1|-1} sign
 * @param {'forward'|'inverse'} direction
 * @returns {number[]}
 */
function apply(input,sign,direction){
  assert.equal(input.length,ciphertext.length);
  const alpha=[0,mod(sign)],h=[4,mod(3*sign)];
  const out=input.slice();
  for(let i=0;i<input.length;i+=2){
    const p=origin[i];
    const key=mul(h,power(alpha,(p-8+56)%56));
    const factor=direction==='inverse'?inverse(key):key;
    const q=mul([input[i],input[i+1]],factor);
    out[i]=q[0];out[i+1]=q[1];
  }
  return out;
}
/** @param {number[]} data @param {number} lo @param {number} hi @returns {number[]} */
function range(data,lo,hi){
  return gp.pages.slice(lo,hi+1).flatMap(p=>{
    const offset=pageStarts[p.page];
    return data.slice(offset,offset+p.indices.length);
  });
}
const scopes=[[0,0],[16,21],[40,53],[54,55]];
const results=[];
const clear=gp.pages[57].indices;
assert.equal(clear.length,95);
assert(ioc(clear)>0.06);
const plant=Array.from({length:ciphertext.length},(_,i)=>clear[i%clear.length]);
for(const sign of [1,-1])for(const direction of ['inverse','forward']){
  const inverseDirection=direction==='inverse'?'forward':'inverse';
  const received=apply(ciphertext,sign,direction);
  assert.deepEqual(apply(received,sign,inverseDirection),ciphertext);
  const plantedCipher=apply(plant,sign,inverseDirection);
  assert.deepEqual(apply(plantedCipher,sign,direction),plant);
  const stats=Object.fromEntries(scopes.map(([lo,hi])=>{
    const a=range(received,lo,hi);
    return ['p'+lo+'-'+hi,{runes:a.length,ioc:ioc(a),
      first:a.slice(0,35).map(x=>gp.translit[x]).join(' ')}];
  }));
  results.push({rootSign:sign,direction,
    bookIoC:ioc(received),scopes:stats,
    acrossAllPagesAtLeastOneLongNativeRegion:scopes.some(([lo,hi])=>{
      const v=stats['p'+lo+'-'+hi];
      return v.runes>=200 && v.ioc>0.047;
    }),
    exactForwardReplay:true,sourceNativePlant:true});
}
console.log(JSON.stringify({
  source:'original p7 red quartic, p8 adjacent heading products [4,3]',
  architecture:'Complete original GP29 pair h*alpha^(page-8), alpha^2=8, h=4+3alpha',
  sourceClockZero:'physical page8',
  sourceOriginalRrunes:ciphertext.length,
  rootSignAndOperationCandidates:results.length,
  sourceAllPageIoC:ioc(ciphertext),
  sourceSolvedP57IoC:ioc(clear),
  originalSections:scopes.map(([lo,hi])=>({pages:lo+'-'+hi,
    runes:range(ciphertext,lo,hi).length,ioc:ioc(range(ciphertext,lo,hi))})),
  results
},null,2));
console.log('PASS: full-book p8 title-seeded non-scalar 56-state field inverse and solved controls');
