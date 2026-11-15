'use strict';
/**
 * All-secret word-key drift + five-phase affine GP29 test on original LP2.
 * Hypothesis: C[w,j] = a[chapter,j%5]*P[w,j]+b[chapter,j%5]+h[w] (mod 29),
 * with all invertible a, arbitrary b, and a fresh arbitrary word shift h.
 * Taking adjacent differences within a word cancels h; for each chapter
 * and phase, the collision count is that of r*P[j]-P[j-1] for some r=1..28.
 * Minimizing independently over all 28 ratios in each of the 45 classes
 * grants more freedom than consistent phase keys and yields a rigorous
 * lower bound for any fixed native-GP plaintext.
 *
 * Node.js 22 CommonJS; no dependencies or writes.
 * Original sources: resources/liber-primus/lp2-{corpus.json,transcription.txt}.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyph=new Map(gp.runes.map((r,i)=>[r,i]));
const rx=new RegExp('['+gp.runes.join('')+']+','gu');
const source=read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('%')
  .replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'');
const original=(source.match(rx)||[])
  .map(w=>Array.from(w,ch=>glyph.get(ch)));
assert.equal(original.length,2896);
assert.equal(original.flat().length,12956);
const lengths=original.map(w=>w.length);
const chapterCounts=[158,255,383,437,224,326,378,669,66];
const chapters=chapterCounts.flatMap((n,c)=>Array(n).fill(c));
assert.equal(chapters.length,original.length);
const mod=x=>(x%29+29)%29;
function inv(x){for(let k=1;k<29;k++)if(x*k%29===1)return k;
  throw Error('invalid GF29 scalar');}
/** @param {number[][]} words */
function counts(words){
  const rows=Array.from({length:45},()=>new Int32Array(841));
  for(let w=0;w<words.length;w++){
    const p=words[w];
    for(let j=1;j<p.length;j++)
      rows[5*chapters[w]+(j-1)%5][29*p[j-1]+p[j]]++;
  }
  return rows;
}
/** @param {Int32Array} row @param {number} ratio */
function collisions(row,ratio){
  const bin=new Int32Array(29);
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)
    bin[mod(ratio*b-a)]+=row[29*a+b];
  return bin.reduce((s,n)=>s+n*(n-1)/2,0);
}
/** @param {number[][]} words */
function metrics(words){
  const cells=counts(words);
  const n=cells.map(row=>row.reduce((a,b)=>a+b,0));
  const raw=cells.map(row=>collisions(row,1));
  const minima=cells.map(row=>Math.min(...Array.from({length:28},
    (_,r)=>collisions(row,r+1))));
  return {raw, minima, n};
}
const sourceStats=metrics(original);
const hitSource=sourceStats.raw.reduce((a,b)=>a+b,0);
const pairTotal=sourceStats.n.reduce((s,n)=>s+n*(n-1)/2,0);
assert.equal(original.reduce((s,w)=>s+w.length-1,0),10060);
assert.equal(hitSource,60891);
assert.equal(pairTotal,1720847);
/** @param {string} text */
function pools(text){
  const p=new Map();
  for(const token of text.match(/[A-Za-z]+/g)||[]){
    const w=encodeSourceNativeGP(token);
    if(!p.has(w.length))p.set(w.length,[]);
    p.get(w.length).push(w);
  }
  return p;
}
/** @param {Map<number,number[][]>} dict @param {number} seed */
function native(dict,seed){
  return lengths.map((length,i)=>{
    const entries=dict.get(length);
    assert(entries?.length,'no control words of length '+length);
    return entries[(i*17+seed*997+3)%entries.length];
  });
}
const refs=[
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
];
const controls=[];
let positive=null;
for(const [name,file] of refs){
  const dict=pools(read(file));
  for(let seed=0;seed<4;seed++){
    const words=native(dict,seed);
    const summary=metrics(words);
    const min=summary.minima.reduce((a,b)=>a+b,0);
    assert(min>hitSource,name+' sample '+seed);
    controls.push({corpus:name,seed,allSecretMinHits:min,
      minimumConditionalRate:min/pairTotal,
      cellsOriginalBelowMinimum:summary.minima.filter((x,i)=>
        sourceStats.raw[i]<x).length});
    if(name==='Gibran'&&seed===0)positive=words;
  }
}
assert.deepEqual(controls.filter(c=>c.seed===0).map(c=>c.allSecretMinHits),
  [69839,65175,65507]);
// Fully reversible source-native plant with separately secret per-word h.
const slope=Array.from({length:9},(_,c)=>
  Array.from({length:5},(_,j)=>(c*5+j*3)%28+1));
const bias=Array.from({length:9},(_,c)=>
  Array.from({length:5},(_,j)=>(c*11+j*7)%29));
const encrypted=positive.map((word,i)=>{
  const c=chapters[i],h=mod(17*i+13*c+1);
  return word.map((p,j)=>{
    const z=j%5;return mod(slope[c][z]*p+bias[c][z]+h);
  });
});
const decoded=encrypted.map((word,i)=>{
  const c=chapters[i],h=mod(17*i+13*c+1);
  return word.map((v,j)=>{
    const z=j%5;return mod(inv(slope[c][z])*(v-bias[c][z]-h));
  });
});
assert.deepEqual(decoded,positive);
const a=counts(positive),b=counts(encrypted);
for(let c=0;c<9;c++)for(let z=0;z<5;z++){
  const j=5*c+z,r=mod(slope[c][(z+1)%5]*inv(slope[c][z]));
  assert.equal(collisions(b[j],1),collisions(a[j],r));
}
console.log(JSON.stringify({
  status:'Finite original-source GP-native constraint; no original plaintext',
  model:'chapter-dependent five-phase affine + unrestricted Caesar per word',
  original:{runes:12956,printedWords:2896,withinWordEdges:10060,
    chapterPhaseClasses:45,eligiblePairs:pairTotal,
    observedCollisionHits:hitSource,observedRate:hitSource/pairTotal},
  controls,positive:{nativeSource:'Gibran',plantedRunes:12956,
    exactRecovery:true,all45CollisionIdentities:true},
  interpretation:'The original is flatter than every tested source-native control, even with independently optimal hidden affine ratios in every chapter/phase. This is a source-register comparison, not a universal theorem about all English or other ciphers.'
},null,2));
