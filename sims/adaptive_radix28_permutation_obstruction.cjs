'use strict';
// Exact, plaintext-independent obstruction for fixed-permutation 5:3
// adaptive radix-28 byte encodings of LP2. Run with Node.js 22.
// Source: resources/liber-primus/lp2-corpus.json.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=corpus.pages.filter(p=>p.page<=55 && p.indices.length).map(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(pages.flat().length,12956);
assert.equal(256**3-27*28**4,181504);
assert.equal(Math.floor(181504/(28**3)),8);

/**
 * @param {number[]} a GP rune indices (0..28)
 * @param {'sorted'|'cyclic'} kind Exclusion rank ordering
 * @param {'drop'|'zero'|'max'|'index'} exceptions Equal-adjacent handling
 * @returns {number[]} Rank sequence (0..27)
 */
function toRanks(a,kind,exceptions){
 const d=[];
 for(let i=1;i<a.length;i++){
  const c=a[i],p=a[i-1];
  if(c===p){
   if(exceptions!=='drop') d.push(exceptions==='zero'?0:exceptions==='max'?27:c%28);
  }else d.push(kind==='sorted'?c-Number(c>p):(c-p+29)%29-1);
 }
 return d;
}

/**
 * @param {number[][]} streams One or more independently phased streams
 * @param {number} phase Block phase 0..4
 * @param {boolean} reverse Read 5-digit blocks in reverse order
 * @returns {{blocks:number,minDistinct:number,bestRank:number,feasible:number,neighborCounts:number[]}}
 */
function test(streams,phase,reverse){
 const neighbors=Array.from({length:28},()=>new Set());
 let blocks=0;
 for(const d of streams)for(let j=phase;j+4<d.length;j+=5){
  neighbors[d[j+(reverse?4:0)]].add(d[j+(reverse?3:1)]);
  blocks++;
 }
 const counts=neighbors.map(s=>s.size);
 const minDistinct=Math.min(...counts);
 return {blocks,minDistinct,bestRank:counts.indexOf(minDistinct),
  feasible:counts.filter(n=>n<=9).length,neighborCounts:counts};
}

/** @returns {() => number} Seeded positive-control pseudorandom generator. */
function rng(){
 let s=0x33011321;
 return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}

/**
 * A complete arbitrary-permutation byte/rune/byte roundtrip control.
 * @param {'sorted'|'cyclic'} kind
 * @returns {{rank:string,blocks:number,bytes:number,topRank:number,topSuccessors:number}}
 */
function plant(kind){
 const rand=rng(),perm=Array.from({length:28},(_,i)=>i);
 for(let i=27;i>0;i--){const j=rand()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]];}
 const inv=Array(28);
 perm.forEach((r,d)=>{inv[r]=d;});
 const raw=Buffer.alloc(18000);
 for(let i=0;i<raw.length;i++)raw[i]=rand()%256;
 const c=[0],expected=[];
 for(let k=0;k<raw.length;k+=3){
  let v=(raw[k]<<16)|(raw[k+1]<<8)|raw[k+2];
  const digits=Array(5);
  for(let j=4;j>=0;j--){digits[j]=v%28;v=Math.floor(v/28);}
  assert.equal(v,0);
  for(const digit of digits){
   const r=perm[digit],p=c[c.length-1];
   const next=kind==='sorted'?r+Number(r>=p):(p+r+1)%29;
   assert.notEqual(next,p);c.push(next);expected.push(r);
  }
 }
 const ranked=toRanks(c,kind,'drop');
 assert.deepEqual(ranked,expected);
 const back=Buffer.alloc(raw.length);
 for(let i=0;i<ranked.length;i+=5){
  let v=0;
  for(let j=0;j<5;j++)v=v*28+inv[ranked[i+j]];
  assert(v<256**3);
  const k=i/5*3;
  back[k]=v>>>16;back[k+1]=(v>>>8)&255;back[k+2]=v&255;
 }
 assert.deepEqual(back,raw);
 const w=test([ranked],0,false);
 assert(w.neighborCounts[perm[27]]<=9 && w.feasible>0);
 return {rank:kind,blocks:w.blocks,bytes:raw.length,topRank:perm[27],
  topSuccessors:w.neighborCounts[perm[27]]};
}
const controls=['sorted','cyclic'].map(plant);
const tests=[];
for(const kind of ['sorted','cyclic'])for(const exceptions of ['drop','zero','max','index']){
 const local=pages.map(p=>toRanks(p,kind,exceptions));
 const modes={page:local,stitch:[local.flat()],
  continuous:[toRanks(pages.flat(),kind,exceptions)]};
 for(const [mode,streams] of Object.entries(modes))
  for(let phase=0;phase<5;phase++)for(const reverse of [false,true]){
   const {neighborCounts,...stat}=test(streams,phase,reverse);
   tests.push({kind,exceptions,mode,phase,reverse,...stat});
  }
}
assert.equal(tests.length,240);
assert(tests.every(t=>t.feasible===0));
const min=Math.min(...tests.map(t=>t.minDistinct));
console.log(JSON.stringify({pages:pages.length,runes:pages.flat().length,
 models:tests.length,allImpossible:true,minDistinct:min,
 byKind:['sorted','cyclic'].map(kind=>({kind,minDistinct:Math.min(...tests.filter(t=>t.kind===kind).map(t=>t.minDistinct))})),
 byMode:['page','stitch','continuous'].map(mode=>({mode,minDistinct:Math.min(...tests.filter(t=>t.mode===mode).map(t=>t.minDistinct))})),
 argmin:tests.filter(t=>t.minDistinct===min),
 plantedByteRoundtrips:controls},null,2));
