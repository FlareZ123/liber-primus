'use strict';

/**
 * Original source three-fold 56-page shared-key keyless exclusion.
 * Signed 2016 THE points to p14 FOLD in the provisional 58-page word map.
 * Three literal half folds of 56 unresolved physical page positions
 * produce seven stacks, each eight positions. This tests only the
 * hypothesis of a common (possibly secret and position-varying) GP29
 * alphabet bijection at matching rune offsets in each stack.
 * A common bijection preserves pairwise rune equalities, allowing a
 * complete original-cipher exclusion without recovering the key.
 *
 * Node.js 22: node sims/lp2_threefold56_sharedkey_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const d = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = d.pages.filter(p => p.page <= 55).map(p => p.indices);
assert.equal(pages.length,56);
assert.deepEqual(pages.map(p=>p.length).reduce((a,b)=>a+b,0),12956);
assert.equal(pages[50].length,0);
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const middle=signed.slice(signed.indexOf('Its words are'),signed.indexOf('Seek and you'));
assert.equal((middle.match(/\bthe\b/gi)||[]).length,3);
const phys=read('resources/liber-primus/lp2-transcription.txt').split('%')[14]
  .replace(/\//g,'').replace(/[\r\n]/g,'')
  .split(/[-.&$§,:!?]/u)
  .map(t=>(t.match(/[ᚠ-᛿]+/gu)||[]).join('')).filter(Boolean);
assert.equal(phys[1],'ᚠᚩᛚᛞ');

/** @type {number[][]} */
let stacks=Array.from({length:56},(_,i)=>[i]);
for(let fold=0;fold<3;fold++) {
  const n=stacks.length;
  stacks=Array.from({length:n/2},(_,i)=>stacks[i].concat(stacks[n-1-i]));
}
assert.equal(stacks.length,7);
assert.ok(stacks.every(s=>s.length===8));
assert.equal(new Set(stacks.flat()).size,56);
const active=stacks.map(s=>s.filter(i=>pages[i].length>0));

/**
 * Count exact rune collisions among every aligned pair in a stack.
 * @param {number[][]} texts
 * @param {number[]|null} [shifts]
 */
function count(texts,shifts=null) {
  let hits=0,compared=0;
  const per=[];
  for(const group of active) {
    let match=0,n=0;
    for(let j=0;j<group.length;j++)for(let k=j+1;k<group.length;k++){
      const x=group[j],y=group[k],a=texts[x],b=texts[y],lim=Math.min(a.length,b.length);
      const dx=shifts?.[x]||0,dy=shifts?.[y]||0;
      for(let i=0;i<lim;i++)if(a[(i+dx)%a.length]===b[(i+dy)%b.length])match++;
      n+=lim;
    }
    hits+=match;compared+=n;
    per.push({pages:group,hits:match,compared:n,rate:match/n});
  }
  return {hits,compared,rate:hits/compared,per};
}
const real=count(pages);
assert.deepEqual([real.hits,real.compared],[1315,39330]);

let state=3301;
/** @returns {number} uniform floating 0..1 */
function random() {
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296;
}
const trials=800,controls=[];
for(let trial=0;trial<trials;trial++){
  const shifts=pages.map(p=>Math.floor(random()*Math.max(1,p.length)));
  controls.push(count(pages,shifts).hits);
}
const mean=controls.reduce((s,x)=>s+x,0)/trials;
const sd=Math.sqrt(controls.reduce((s,x)=>s+(x-mean)**2,0)/(trials-1));
const greater=controls.filter(x=>x>=real.hits).length;
assert.equal(greater,699);

/**
 * Source-native GP English encoded with historical multi-letter graphemes.
 * @param {string} source
 * @returns {number[]}
 */
function toGP(source) {
  const tokens=d.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
  const map=new Map(tokens.map(t=>[t.token,t.i]));
  const text=source.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  const result=[];
  for(const word of text.match(/[A-Z]+/g)||[]) {
    for(let pos=0;pos<word.length;) {
      const sym=[3,2,1].map(n=>word.slice(pos,pos+n)).find(c=>map.has(c));
      assert.ok(sym);
      result.push(map.get(sym));
      pos+=sym.length;
    }
  }
  return result;
}
const native=toGP(read('resources/control/emerson_essays_2944.txt'));
assert.ok(native.length>200000);
let start=50000;
const plant=pages.map(p=>{
  if(p.length===0)return [];
  const a=native.slice(start,start+p.length);
  start+=p.length;
  assert.equal(a.length,p.length);
  return a;
});
const pad=active.map(group=>{
  const lim=Math.max(...group.map(i=>pages[i].length));
  return Array.from({length:lim},()=>Math.floor(random()*29));
});
const groupFor=new Array(56).fill(-1);
for(let g=0;g<active.length;g++)for(const i of active[g])groupFor[i]=g;
const encrypted=plant.map((a,i)=>{
  if(!a.length)return [];
  const g=groupFor[i],out=[];
  for(let j=0;j<a.length;j++) {
    let c=(a[j]+pad[g][j])%29;
    if(j>0&&c===out[j-1]&&random()<.81)
      c=(c+1+Math.floor(random()*28))%29;
    out.push(c);
  }
  return out;
});
const positive=count(encrypted);
assert.ok(positive.rate>.045,'control should expose common key via native GP equality');
assert.ok(positive.rate>real.rate+.012,'original must not match detectable source-native control');

console.log(JSON.stringify({
  classification:'negative for a single shared per-offset GP29 bijection across literal 56-page triple-fold stacks',
  originalCipherRunes:12956,sourcePagePositions:56,stacks:active,
  original:real,
  uniformExpected:real.compared/29,
  circularNull:{trials,mean,sd,upperTailCount:greater,
    upperTailAddOne:(greater+1)/(trials+1),
    z:(real.hits-mean)/sd},
  independentSourceNativePlant:{runicGPSource:'Emerson',samePadPerStackOffset:true,
    adjacentRewriteProbability:.81,
    hits:positive.hits,compared:positive.compared,rate:positive.rate},
  interpretation:'No shared-bijection ciphertext collision signature under fixed triple-fold grouping',
  status:'NO_UNKNOWN_PLAINTEXT'
},null,2));
