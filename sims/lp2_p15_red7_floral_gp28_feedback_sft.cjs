'use strict';
/**
 * LP2 p15 red 3299 and floral all-red sum 3294 independently select
 * modulus 3299, primitive root 7. In the 3299-rune floral black body,
 * 3298 predecessor steps exhaust the complete multiplicative period.
 * GP28 predecessor-excluding sorted/cyclic rank inverse, fixed key
 * 7^step mod3299 -> modulo28, two signs; doublets remain erasures.
 *
 * Windows / Node22 SFT: node sims/lp2_p15_red7_floral_gp28_feedback_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pathModule=require('node:path');
/** @param {string} name @returns {any} */
const read=name=>JSON.parse(fs.readFileSync(pathModule.join(
  __dirname,'..',name),'utf8'));
const c=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const body=c.pages.slice(40,56).flatMap(p=>p.indices.slice(
  p.page===40?8:p.page===54?9:0));
assert.equal(body.length,3299);
const red=ink.pages.filter(p=>p.page>=40&&p.page<=55)
  .flatMap(p=>(p.red_spans||[]).map(s=>[p.page,s.start,s.length]));
assert.deepEqual(red,[[40,0,8],[53,128,51],[54,0,9]]);
const redSum=red.reduce((total,[p,at,n])=>
  total+c.pages[p].indices.slice(at,at+n)
    .reduce((t,index)=>t+c.prime[index],0),0);
assert.equal(redSum,3294);
assert.equal(3301-redSum,7);
/** @param {number} base @param {number} exponent */
function pow(base,exponent){
  let out=1;
  while(exponent){
    if(exponent%2)out=out*base%3299;
    base=base*base%3299;
    exponent=Math.floor(exponent/2);
  }
  return out;
}
for(const factor of [2,17,97])assert.notEqual(pow(7,3298/factor),1);
assert.equal(pow(7,3298),1);
/** @param {number} prev @param {number} next @param {string} kind */
function rank(prev,next,kind){
  assert.notEqual(prev,next);
  const v=kind==='cyclic'?(next-prev+28)%29:
    next-(next>prev?1:0);
  assert.ok(v>=0&&v<28);
  return v;
}
/** @param {number} prev @param {number} v @param {string} kind */
function unrank(prev,v,kind){
  assert.ok(v>=0&&v<28);
  const next=kind==='cyclic'?(prev+v+1)%29:
    v+(v>=prev?1:0);
  assert.equal(rank(prev,next,kind),v);
  return next;
}
/** @param {number[]} ciphertext @param {string} kind @param {number} sign */
function decode(ciphertext,kind,sign){
  let state=1;const digits=[],erasures=[];
  for(let i=1;i<ciphertext.length;i++){
    state=state*7%3299;
    if(ciphertext[i]===ciphertext[i-1])erasures.push(i);
    else digits.push((rank(ciphertext[i-1],ciphertext[i],kind)
      +sign*(state%28)+28)%28);
  }
  return {digits,erasures,last:state};
}
/** @param {number[]} plaintext @param {Set<number>} skip @param {string} kind @param {number} sign */
function encrypt(plaintext,skip,kind,sign){
  let state=1,at=0;const output=[body[0]];
  for(let i=1;i<body.length;i++){
    state=state*7%3299;
    const prev=output[output.length-1];
    if(skip.has(i)){output.push(prev);continue;}
    const key=state%28;
    const r=((plaintext[at++]-sign*key)%28+28)%28;
    output.push(unrank(prev,r,kind));
  }
  assert.equal(at,plaintext.length);
  assert.equal(state,1);
  return output;
}
/** @param {number[]} x @returns {number} */
function ioc(x){
  const h=Array(28).fill(0);
  for(const v of x)h[v]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
const erasures=body.flatMap((x,i)=>i>0&&x===body[i-1]?[i]:[]);
assert.equal(erasures.length,21);
const native=c.pages[57].indices.filter(v=>v<28);
assert.ok(native.length>70);
const planted=Array.from({length:body.length-1-erasures.length},
  (_,i)=>native[i%native.length]);
assert.ok(ioc(planted)>0.05);
const expected={
  'cyclic,-1':0.03560036410204247,
  'cyclic,1':0.035662774143091505,
  'sorted,-1':0.03577697520327975,
  'sorted,1':0.035635015647221935
};
const tests=[];
for(const kind of ['cyclic','sorted'])for(const sign of [-1,1]){
  const observed=decode(body,kind,sign);
  assert.deepEqual(observed.erasures,erasures);
  assert.equal(observed.last,1);
  assert.ok(Math.abs(ioc(observed.digits)-
    expected[`${kind},${sign}`])<1e-14);
  const restored=encrypt(observed.digits,new Set(erasures),kind,sign);
  assert.deepEqual(restored,body);
  const testCipher=encrypt(planted,new Set(erasures),kind,sign);
  const testDecoded=decode(testCipher,kind,sign);
  assert.deepEqual(testDecoded.digits,planted);
  assert.deepEqual(testDecoded.erasures,erasures);
  tests.push({kind,sign,originalIoC:ioc(observed.digits),
    solvedGPPlantIoC:ioc(planted),
    knownPlaintextPositions:observed.digits.length,
    undecodedDoublets:erasures.length,oneIV:true,
    cipherRoundtrip:true,controlRecovery:true,
    preview:observed.digits.slice(0,50)
      .map(v=>c.translit[v]).join('.')});
}
console.log(JSON.stringify({
  originalSource:'p15 red3299, pp40-55 all-red prime sum3294',
  generator:'7^i mod3299',period:3298,
  originalBlackRuneCount:body.length,
  sourceDoubletOffsets:erasures,
  tests,
  verdict:'No native-GP plaintext recovered in four source-frozen GP28 inverses. The 21 repeated glyphs are erasures and the first rune is an IV.'
},null,2));
