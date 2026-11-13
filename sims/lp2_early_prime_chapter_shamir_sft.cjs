'use strict';

/**
 * Original LP2 first-four visual chapters contain respectively
 * 729=3*243, 1145=5*229, 1729=7*247, 1903=11*173 GP29 runes.
 * Try threshold-k Shamir polynomial secret recovery at x=0 in GF29,
 * with two source-conventional equal-share layouts.
 * The historical Cicada Shamir stage used a different field and frame.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const mod=(x)=>((x%29)+29)%29;
function choose(n,k) {
  let z=1;
  for(let i=1;i<=k;i++)z=z*(n-i+1)/i;
  return Math.round(z);
}
function weights(k) {
  return Array.from({length:k},(_,i)=>mod(choose(k,i+1)*(i%2? -1:1)));
}
function ioc(seq) {
  const ct=Array(29).fill(0);
  seq.forEach((x)=>ct[x]++);
  return ct.reduce((a,x)=>a+x*(x-1),0)/(seq.length*(seq.length-1));
}
/**
 * @param {number[]} source Exactly k*n field coefficients.
 * @param {number} k
 * @param {'contiguous'|'interleaved'} layout
 */
function recover(source,k,layout) {
  const n=source.length/k;
  assert.equal(n,Math.floor(n));
  const coeff=weights(k),out=[];
  for(let t=0;t<n;t++) {
    let secret=0;
    for(let j=0;j<k;j++) {
      const y=source[layout==='contiguous'?j*n+t:t*k+j];
      secret=mod(secret+coeff[j]*y);
    }
    out.push(secret);
  }
  return out;
}
/** A synthetic k-share threshold source, distinct from real manuscript. */
function plant(plaintext,k,layout) {
  const n=plaintext.length,out=Array(n*k).fill(0);
  for(let t=0;t<n;t++)for(let j=1;j<=k;j++) {
    let y=plaintext[t],xp=1;
    for(let e=1;e<k;e++) {
      xp=mod(xp*j);
      y=mod(y+xp*mod(13+7*e+9*t));
    }
    out[layout==='contiguous'?(j-1)*n+t:t*k+j-1]=y;
  }
  return out;
}
/** @param {string} input */
function englishGP(input) {
  const tokens=new Map(corpus.translit.map((s,i)=>[s,i]));
  tokens.set('ING',21);
  const words=input.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/K/g,'C')
    .replace(/Z/g,'S').match(/[A-Z]+/g)||[];
  const out=[];
  for(const w of words)for(let i=0;i<w.length;) {
    let found=false;
    for(const n of [3,2,1]) {
      const tok=w.slice(i,i+n);
      if(tokens.has(tok)) {out.push(tokens.get(tok));i+=n;found=true;break;}
    }
    if(!found)i++;
  }
  return out;
}
const native=englishGP(fs.readFileSync(path.join(root,
  'resources/control/emerson_essays_2944.txt'),'utf8'));
assert.equal(native.length,323083);
const chapters=[
  {first:0,last:2,k:3,n:243},
  {first:3,last:7,k:5,n:229},
  {first:8,last:14,k:7,n:247},
  {first:15,last:22,k:11,n:173}
];
const results=[];
for(const {first,last,k,n} of chapters) {
  const source=corpus.pages.filter((p)=>p.page>=first&&p.page<=last)
    .flatMap((p)=>p.indices);
  assert.equal(source.length,k*n);
  const nativeIoCs=[];
  for(let j=0;j+n<=native.length;j+=n)
    nativeIoCs.push(ioc(native.slice(j,j+n)));
  const minNativeIoC=Math.min(...nativeIoCs);
  assert.ok(minNativeIoC>0.049&&minNativeIoC<0.052);
  let equality=0;
  for(let t=0;t<n;t++) {
    const ct=Array(29).fill(0);
    for(let j=0;j<k;j++)ct[source[j*n+t]]++;
    equality+=ct.reduce((a,x)=>a+x*(x-1)/2,0);
  }
  const pairComparisons=n*k*(k-1)/2;
  for(const layout of ['contiguous','interleaved']) {
    const candidate=recover(source,k,layout);
    const originalIoC=ioc(candidate);
    assert.ok(originalIoC<minNativeIoC);
    const nativePlant=native.slice(1000,1000+n);
    const encoded=plant(nativePlant,k,layout);
    assert.deepEqual(recover(encoded,k,layout),nativePlant);
    const altered=encoded.slice();altered[0]=mod(altered[0]+1);
    assert.notDeepEqual(recover(altered,k,layout),nativePlant);
    results.push({chapter:'p'+first+'-p'+last,k,strandLength:n,layout,
      originalIoC,minNativeIoC,nativeWindows:nativeIoCs.length,
      recoveredNativePlant:n,
      first48:candidate.slice(0,48).map((x)=>corpus.translit[x]).join(' ')});
  }
  results.push({chapter:'p'+first+'-p'+last,k,strandLength:n,
    layout:'contiguous reused-pad equality',
    equalPairs:equality,pairComparisons,equalityRate:equality/pairComparisons});
}
console.log(JSON.stringify(results,null,2));
