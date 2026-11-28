'use strict';
// A model-independent collision-pattern necessary-condition gate for
// a PUBLIC target-rank remove/reinsert cipher. No secret deck is searched.
// Original p15 clock is source-derived, but the opcode and phase remain
// hypothetical, not a recovered LP2 mechanism.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const {native}=require('./lp2_p15_spiral_rank_order_sync_sft.cjs');
const A=29,FULL=(1<<A)-1;
const clock=[3299,3298,3296,3294,3288,3278,3258,3222,
             3152,3038,2838,2472,1820,708,1206,4516].map(x=>x%A);
const pc=x=>{x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24;};
const lo=x=>31-Math.clz32(x&-x);

const originalPages=gp.pages.filter(p=>p.page>=16&&p.page<=22);
assert.deepEqual(originalPages.map(p=>p.page),[16,17,18,19,20,21,22]);
const original=originalPages.flatMap(p=>p.indices);
assert.equal(original.length,1744);
const pageStarts=[];
let offset=0;
for(const p of originalPages){pageStarts.push(offset);offset+=p.indices.length;}
assert.equal(offset,original.length);

// For any secret deck D, after emitting C_(i-1) and reinserting that card
// at rank k_(i-1), the next plaintext rank P_i equals k_(i-1)
// IF AND ONLY IF C_i == C_(i-1). This holds regardless of D and key.
// If plaintext GP indices are an UNKNOWN FIXED BIJECTION pi(P_i),
// every matching source event forces pi(k) to a given GP rune;
// every nonmatching event forbids that rune. 29x29 matching decides
// whether *any* static rank-to-GP relabeling obeys every constraint.
function edges(cipher,mode,phase){
 assert(['continuous','page-local'].includes(mode));
 const out=[],seams=new Set(pageStarts.slice(1));
 let pageIndex=0;
 for(let i=1;i<cipher.length;i++){
  if(seams.has(i)){pageIndex++;continue;}
  const clockIndex=mode==='continuous'?i-1:i-1-pageStarts[pageIndex];
  out.push({i,k:clock[(clockIndex+phase)%clock.length],
            equal:cipher[i]===cipher[i-1]});
 }
 return out;
}
function matching(allowed){
 const match=new Int8Array(A).fill(-1);let seen=0;
 function augment(k){
  for(let m=allowed[k]&~seen;m;m&=m-1){
   const q=m&-m,r=lo(q);seen|=q;
   if(match[r]<0||augment(match[r])){match[r]=k;return true;}
  }return false;
 }
 const order=Array.from({length:A},(_,i)=>i).sort((a,b)=>pc(allowed[a])-pc(allowed[b]));
 for(const k of order){seen=0;if(!augment(k))return null;}
 const map=Array(A).fill(-1);for(let r=0;r<A;r++)map[match[r]]=r;
 assert(map.every(x=>x>=0));
 return map;
}
function gate(e,p,start,diagnostic=false){
 const req=new Int8Array(A).fill(-1);
 for(const {i,k,equal} of e){
  if(!equal)continue;
  const v=p[start+i];
  if(req[k]>=0&&req[k]!==v)return diagnostic?{positives:false,full:false}:0;
  req[k]=v;
 }
 if(!diagnostic){ /* proceed below */ }
 const allowed=new Uint32Array(A).fill(FULL);
 for(const {i,k,equal} of e){
  if(!equal)allowed[k]&=~(1<<p[start+i]);
 }
 for(let k=0;k<A;k++){
  if(req[k]>=0)allowed[k]&=1<<req[k];
  if(!allowed[k])return diagnostic?{positives:true,full:false}:1;
 }
 const witness=matching(allowed);
 if(!witness)return diagnostic?{positives:true,full:false}:1;
 // The witness itself obeys the original binary equality trace.
 if(diagnostic){
  for(const {i,k,equal} of e)assert.equal(witness[k]===p[start+i],equal);
  return{positives:true,full:true,witness};
 }
 return 2;
}
function donors(){
 return [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
 ].map(file=>({file,p:native(read(file))}));
}
function shuffle(seed){
 let state=seed>>>0;
 function rnd(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
 const a=Array.from({length:A},(_,i)=>i);
 for(let i=A-1;i>0;i--){const j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
function plant(plain,mode,phase,seed){
 assert(plain.length>=original.length);
 const rankToGp=shuffle(seed),gpToRank=Array(A);
 for(let k=0;k<A;k++)gpToRank[rankToGp[k]]=k;
 const c=Array(original.length),p=plain.slice(0,original.length);
 let d=shuffle(seed+13),page=0;
 for(let i=0;i<c.length;i++){
  if(page+1<pageStarts.length&&pageStarts[page+1]===i){
   page++;
   // Both variants allow an independent secret deck at every page boundary;
   // the 'continuous' variant continues only the PUBLIC clock, not the deck.
   d=shuffle(seed+13+page*101);
  }
  const position=mode==='continuous'?i:i-pageStarts[page];
  const k=clock[(position+phase)%clock.length],rank=gpToRank[p[i]];
  const symbol=d[rank];c[i]=symbol;
  d.splice(rank,1);d.splice(k,0,symbol);
 }
 const e=edges(c,mode,phase);
 for(const {i,k,equal} of e)assert.equal(equal,gpToRank[p[i]]===k);
 const test=gate(e,p,0,true);
 assert(test.positives&&test.full);
 // There may be multiple compatible bijections; the planted one is known valid.
 for(const {i,k,equal} of e)assert.equal(equal,rankToGp[k]===p[i]);
 return {mode,phase,runeCount:c.length,checkedPairs:e.length,
   doublets:e.filter(x=>x.equal).length,matched:true};
}
function main(){
 const e0=edges(original,'continuous',0);
 assert.equal(e0.length,1737);
 assert.equal(e0.filter(x=>x.equal).length,10);
 const texts=donors(),scans=[];
 for(const mode of ['continuous','page-local']){
  for(let phase=0;phase<clock.length;phase++){
   const e=edges(original,mode,phase),counts=[];
   for(const d of texts){
    const total=d.p.length-original.length+1;
    let posOnly=0,full=0,firstFull=null;
    for(let start=0;start<total;start++){
     const v=gate(e,d.p,start);
     if(v>=1)posOnly++;
     if(v===2){full++;firstFull??=start;}
    }
    counts.push({file:d.file,windows:total,positiveOnly:posOnly,
       exactBinaryPattern:full,firstFull});
   }
   scans.push({mode,phase,checkedPairs:e.length,sourceDoublets:e.filter(x=>x.equal).length,counts});
  }
 }
 assert(scans.every(x=>x.counts.every(y=>y.exactBinaryPattern===0)));
 assert.deepEqual(scans[0].counts.map(z=>z.positiveOnly),[16,49,96]);
 assert.deepEqual(scans[16].counts.reduce((a,z)=>a+z.positiveOnly,0),8);
 const plants=[
  plant(texts[0].p,'continuous',0,3301),
  plant(texts[1].p,'continuous',7,4409),
  plant(texts[2].p,'page-local',0,5503),
  plant(texts[0].p,'page-local',7,6607),
 ];
 console.log(JSON.stringify({schema:'lp2-public-rank-doublet-equivalence-v1',
   claim:'exact GP-native donor exclusion for two 16-phase insertion-clock semantics; no LP2 plaintext',
   originalPages:[16,22],N:original.length,pageStarts,clock,
   scope:'29! unknown initial decks; all 29! fixed GP-rank relabelings; three finite native corpora',
   scans,plants},null,2));
}
if(require.main===module)main();
module.exports={gate,edges,matching,clock};
