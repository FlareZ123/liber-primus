'use strict';
/**
 * Original LP2 p33..39 840 consecutive field pairs vs p7/p8
 * source-reversed title g=3+4alpha, alpha^2=8, order(g)=840.
 * Frozen #2309 original-only 4 direct g-orbit add/multiply receivers.
 * Windows 11 Node22 CJS, read-only; no fitted offsets or alphabets.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources',
  'liber-primus','lp2-corpus.json'),'utf8'));
const mod=n=>(n%29+29)%29;
/** @param {[number,number]} a @param {[number,number]} b @returns {[number,number]} */
const mul=(a,b)=>[mod(a[0]*b[0]+8*a[1]*b[1]),mod(a[0]*b[1]+a[1]*b[0])];
/** @param {[number,number]} a @param {[number,number]} b @returns {[number,number]} */
const add=(a,b)=>[mod(a[0]+b[0]),mod(a[1]+b[1])];
/** @param {[number,number]} a @returns {[number,number]} */
const neg=a=>[mod(-a[0]),mod(-a[1])];
/** @param {[number,number]} a @returns {[number,number]} */
function inv(a){
  let z=1;for(let i=0;i<27;i++)z=mod(z*mod(a[0]*a[0]-8*a[1]*a[1]));
  return [mod(z*a[0]),mod(-z*a[1])];
}
/** @param {[number,number]} a @param {number} n @returns {[number,number]} */
function power(a,n){
  let z=[1,0],b=a,k=n;
  while(k){if(k%2)z=mul(z,b);b=mul(b,b);k=Math.floor(k/2);}
  return z;
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const f=Array(29).fill(0);
  for(const x of a)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const P=x=>mod(11+26*x+8*x*x+15*x*x*x+2*x*x*x*x);
for(let x=0;x<29;x++)
  assert.equal(mod(P(x)-x),mod(2*(x-3)*(x-4)*(x*x-8)));
const title=gp.pages[8].indices.slice(0,12);
assert.deepEqual([title.slice(0,4),title.slice(4)]
  .map(w=>w.reduce((a,x)=>mod(a*x),1)),[4,3]);
const g=[3,4],h=[4,3];
assert.deepEqual(power(g,840),[1,0]);
assert.deepEqual(power(g,420),[28,0]);
assert.deepEqual(power(h,168),[1,0]);
for(const q of [2,3,5,7])assert.notDeepEqual(power(g,840/q),[1,0]);
const chapter=gp.pages.slice(33,40);
assert.deepEqual(chapter.map(x=>x.indices.length),[214,261,271,238,228,228,240]);
const original=chapter.flatMap(x=>x.indices);
assert.equal(original.length,1680);
const orbit=[];let state=[1,0];
for(let j=0;j<840;j++){
  orbit.push(state);
  state=mul(state,g);
}
assert.deepEqual(state,[1,0]);
assert.equal(new Set(orbit.map(([a,b])=>29*a+b)).size,840);
const positive=gp.pages[57].indices;
assert.equal(positive.length,95);
assert(ioc(positive)>0.06);
/**
 * @param {number[]} input
 * @param {'add-minus'|'add-plus'|'mul-inverse'|'mul-forward'} model
 * @returns {number[]}
 */
function transform(input,model){
  assert.equal(input.length,original.length);
  const out=[];
  for(let j=0;j<840;j++){
    const a=[input[2*j],input[2*j+1]],key=orbit[j];
    let b;
    if(model==='add-minus')b=add(a,neg(key));
    else if(model==='add-plus')b=add(a,key);
    else if(model==='mul-inverse')b=mul(a,inv(key));
    else if(model==='mul-forward')b=mul(a,key);
    else throw Error('Unknown frozen field model');
    out.push(...b);
  }
  return out;
}
const inverseModel={
  'add-minus':'add-plus','add-plus':'add-minus',
  'mul-inverse':'mul-forward','mul-forward':'mul-inverse'
};
const plant=Array.from({length:1680},(_,j)=>positive[j%positive.length]);
const results=[];
for(const model of Object.keys(inverseModel)){
  const output=transform(original,model);
  assert.deepEqual(transform(output,inverseModel[model]),original);
  assert.deepEqual(transform(transform(plant,inverseModel[model]),model),plant);
  results.push({
    model,originalRunes:original.length,originalIoC:ioc(original),
    decodedIoC:ioc(output),
    firstGpTransliteration:output.slice(0,36).map(x=>gp.translit[x]).join(' '),
    fullOriginalReplay:true,solvedP57Plant:true
  });
}
console.log(JSON.stringify({
  source:'P7 quartic X²−8; p8 red reversed products [3,4]',
  sourceElement:{g,order:840,hPrinted:h},
  originalReceiver:'Physical pp33–39, 1,680 GP29 glyphs, 840 paired field states',
  originalPageLengths:chapter.map(x=>x.indices.length),
  ciphertextOriginalIoC:ioc(original),
  nativeSolvedP57ControlIoC:ioc(positive),
  models:results,
  outputClaim:'No model selection by ciphertext output; interpretation requires native prose',
  fixedFourReceiverCount:4
},null,2));
console.log('PASS: original p33-p39 840-pair direct g-orbit additive and multiplicative field pad');
