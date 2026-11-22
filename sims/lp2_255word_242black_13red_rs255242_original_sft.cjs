'use strict';
/**
 * Source-shaped RS(255,242) hypothesis on actual LP2 p3–p7 printed words.
 * Exact original word and red-ink cuts, eleven fixed byte summaries,
 * GF(2^8) with primitive polynomial 0x11D, primitive element 2.
 *
 * Windows 11, Node22 SFT:
 *   node sims/lp2_255word_242black_13red_rs255242_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const panel = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const glyph = new Map(gp.runes.map((s,i)=>[s,i]));
const starts = new Map();
let count = 0;
for (const p of gp.pages.filter(p => p.page <= 55)) {
  starts.set(p.page,count);
  count += p.indices.length;
}
assert.equal(count,12956);
const red = new Set();
for (const p of ink.pages.filter(p=>p.page<=55)) {
  for(const s of p.red_spans || []) {
    for(let j=0;j<s.length;j++)red.add(starts.get(p.page)+s.start+j);
  }
}
let words=[], current=[], all=[],start=0;
for(const ch of source.split('%').slice(0,55).join('%')){
  if(glyph.has(ch)){
    if(!current.length)start=all.length;
    const v=glyph.get(ch);
    current.push(v);all.push(v);
  }else if(ch==='%'||ch==='/'||/\s/u.test(ch)){
    // Original line and page wraps do not end complete printed words.
  }else if(current.length){
    words.push({start,w:current,red:current.every((_,j)=>red.has(start+j))});
    current=[];
  }
}
if(current.length)words.push({start,w:current,red:current.every((_,j)=>red.has(start+j))});
assert.equal(all.length,12956);
assert.equal(words.length,2896);
const scroll = words.filter(w=>w.start>=starts.get(3)&&w.start<starts.get(8));
const parityPositions = scroll.map((w,i)=>w.red?i:-1).filter(i=>i>=0);
const dataPositions = scroll.map((w,i)=>w.red?-1:i).filter(i=>i>=0);
const redTokens = scroll.filter(w=>w.red).map(w=>w.w.join(','));
const blackTokens = scroll.filter(w=>!w.red).map(w=>w.w.join(','));
assert.equal(scroll.length,255);
assert.equal(parityPositions.length,13);
assert.equal(dataPositions.length,242);
assert.deepEqual(parityPositions,[0,1,2,22,176,177,178,179,250,251,252,253,254]);
const sourceRedProducts = scroll.slice(250).map(w =>
  w.w.reduce((acc,v)=>(acc*v)%29,1));
assert.deepEqual(sourceRedProducts,[11,26,8,15,2]);
assert.equal(new Set(redTokens).size,13);
assert.equal(new Set(blackTokens).size,239);
assert.equal(new Set([...redTokens,...blackTokens]).size,252);
assert.equal(gp.pages.find(p=>p.page===8).indices.length,255);
assert.equal(panel.bytes.length,256);

/** @param {number} x @param {number} y @returns {number} */
function gfMul(x,y){
  let z=0;
  while(y){
    if(y&1)z^=x;
    y>>=1;
    x<<=1;
    if(x&256)x^=0x11D;
  }
  return z;
}
const EXP=Array(255).fill(0), LOG=Array(256).fill(-1);
for(let i=0,a=1;i<255;i++){
  assert.equal(LOG[a],-1);
  EXP[i]=a;LOG[a]=i;
  a=gfMul(a,2);
}
assert.equal(new Set(EXP).size,255);
/** @param {number} value @returns {number} */
function gfInv(value){
  assert.notEqual(value,0);
  return EXP[(255-LOG[value])%255];
}
/**
 * Polynomial represented by 255 bytes, highest term first.
 * @param {number[]} b
 * @param {number} rootPower
 * @returns {number}
 */
function evalAt(b,rootPower){
  const alpha=EXP[rootPower%255];
  return b.reduce((s,v)=>gfMul(s,alpha)^v,0);
}
/**
 * Solve parity bytes at original noncontiguous red positions so that a
 * synthesized 255-byte codeword has roots alpha^(start..start+12).
 * @param {number[]} bytes
 * @param {number} rootStart
 * @returns {number[]}
 */
function inferredParity(bytes,rootStart){
  const a=[];
  for(let j=0;j<13;j++){
    const rootPower=(j+rootStart)%255;
    let rhs=0;
    for(const i of dataPositions)rhs^=gfMul(bytes[i],
      EXP[(rootPower*(254-i))%255]);
    a.push([...parityPositions.map(i=>EXP[(rootPower*(254-i))%255]),rhs]);
  }
  for(let col=0;col<13;col++){
    let pivot=col;
    while(pivot<13&&a[pivot][col]===0)pivot++;
    assert.ok(pivot<13,'parity matrix full rank');
    [a[pivot],a[col]]=[a[col],a[pivot]];
    const inverse=gfInv(a[col][col]);
    for(let j=col;j<14;j++)a[col][j]=gfMul(a[col][j],inverse);
    for(let i=0;i<13;i++){
      if(i===col||a[i][col]===0)continue;
      const factor=a[i][col];
      for(let j=col;j<14;j++)a[i][j]^=gfMul(factor,a[col][j]);
    }
  }
  return a.map(row=>row[13]);
}
const summaries = {
  'GP-index-product-mod29':w=>w.reduce((s,v)=>(s*v)%29,1),
  'GP-prime-product-mod29':w=>w.reduce((s,v)=>(s*gp.prime[v])%29,1),
  'GP-index-sum-mod29':w=>w.reduce((s,v)=>s+v,0)%29,
  'GP-prime-sum-mod29':w=>w.reduce((s,v)=>s+gp.prime[v],0)%29,
  'ordinal-sum':w=>w.reduce((s,v)=>s+v,0)&255,
  'prime-sum':w=>w.reduce((s,v)=>s+gp.prime[v],0)&255,
  'ordinal-base29':w=>w.reduce((s,v)=>(s*29+v)&255,0),
  'onebased-base29':w=>w.reduce((s,v)=>(s*29+v+1)&255,0),
  'ordinal-product':w=>w.reduce((s,v)=>(s*(v+1))&255,1),
  'prime-product':w=>w.reduce((s,v)=>(s*gp.prime[v])&255,1),
  'word-length':w=>w.length,
  'first-index':w=>w[0],
  'last-index':w=>w.at(-1),
  'weighted-index':w=>w.reduce((s,v,i)=>s+(i+1)*v,0)&255,
  'ordinal-xor':w=>w.reduce((s,v)=>s^v,0)
};
const summary=[];
for(const [name,fn] of Object.entries(summaries)){
  const bytes=scroll.map(w=>fn(w.w));
  const roots=EXP.map((_,i)=>evalAt(bytes,i));
  const zeroRoots=roots.map((x,i)=>x===0?i:-1).filter(i=>i>=0);
  let maxConsecutive=0,run=0;
  for(let i=0;i<267;i++){
    run=roots[i%255]===0?run+1:0;
    maxConsecutive=Math.max(maxConsecutive,Math.min(run,255));
  }
  assert.equal(maxConsecutive<13,true,name+': no 13 consecutive roots');

  let maxExactRed=0;
  for(const rootStart of [0,1]){
    const needed=inferredParity(bytes,rootStart);
    const actual=parityPositions.map(i=>bytes[i]);
    const matches=needed.filter((v,i)=>v===actual[i]).length;
    maxExactRed=Math.max(maxExactRed,matches);
    const inserted=bytes.slice();
    for(let i=0;i<13;i++)inserted[parityPositions[i]]=needed[i];
    for(let j=0;j<13;j++)assert.equal(evalAt(inserted,rootStart+j),0,
      name+': planted RS(255,242) syndrome '+j);
    assert.deepEqual(inferredParity(inserted,rootStart),needed);
    inserted[parityPositions[0]]^=1;
    assert.equal(evalAt(inserted,rootStart),EXP[(rootStart*(254-parityPositions[0]))%255],
      name+': planted wrong parity rejected');
  }
  summary.push({map:name,zeroRoots:zeroRoots.length,
    maximumConsecutiveRoots:maxConsecutive,redExactAtRoots0Or1:maxExactRed});
}
assert.equal(summary.length,15);
assert.equal(summary.every(x=>x.maximumConsecutiveRoots<=1),true);
assert.equal(summary.every(x=>x.redExactAtRoots0Or1<=1),true);
console.log(JSON.stringify({
  originalWords:scroll.length,
  originalBlackWords:dataPositions.length,
  originalRedWords:parityPositions.length,
  originalRedPositions:parityPositions,
  originalDistinctWholeWords:252,
  nextPhysicalPageRunes:255,
  originalNumberPanelByteCells:256,
  gp256PrimitivePolynomial:'0x11D',
  summary
},null,2));
console.log('PASS: all 15 original byte maps reject RS(255,242); noncontiguous-red 13-parity planted controls PASS.');
