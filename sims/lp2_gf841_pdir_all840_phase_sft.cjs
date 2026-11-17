'use strict';

/**
 * All 840 phase states of the authenticated 2013 H-root field trace,
 * and its original p39 G-root modulation, on source-printed LP2 p0–2.
 *
 * A frozen, source-constrained key recovery attack on an original cipher;
 * 2 historical natural pointer conventions (000 and 100), 2 models,
 * 2 key signs, 2 direction orientations, 2 source factor streams.
 *
 * No tuning on original plaintext, no relabeled alphabets, no random key.
 * No file writes. Run: node sims/lp2_gf841_pdir_all840_phase_sft.cjs
 *
 * @typedef {{ptr:number,score:number,count:Uint16Array}} State
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcript = fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const byRune = new Map(corpus.runes.map((r,i)=>[r,i]));
const words = []; let w = [];
for(const ch of transcript){
  if(byRune.has(ch))w.push(byRune.get(ch));
  else if(('- .§&'.includes(ch))&&ch!==' '&&w.length){words.push(w);w=[];}
}
if(w.length)words.push(w);
const exact = corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(exact.length,12956);
assert.equal(words.slice(0,2896).length,2896);
assert.deepEqual(words.slice(0,2896).flat(),exact);
const openingWords = words.slice(0,158);
const original = openingWords.flat();
assert.equal(original.length,729);
const sourceDirs = openingWords.map(word=>word.reduce((a,r)=>a+corpus.prime[r],0)%2?1:-1);
const key = [[],[]];let a=1,b=0,g=1;
for(let j=0;j<840;j++){
 const t=(2*a+11*b)%29;
 key[0].push(t);
 key[1].push(t*g%29);
 [a,b]=[18*b%29,(a+11*b)%29];g=g*24%29;
}
assert.deepEqual([a,b,g],[1,0,1]);
const ring = j=>(j%840+840)%840;

/**
 * Equivalent to pdir h=0/1, m=0, cmp=0 in the publicly
 * implemented pre-existing historical research model.
 * @param {number[]} c GP29 ciphertext
 * @param {number} flip Direction sign ±1
 * @param {number} h 0: read key at current pointer; 1: backward first-read predecessor
 */
function plan(c,flip,h){
 const dirs=[],mv=[],prev=[];
 let k=0;
 for(let t=0;t<openingWords.length;t++){
  const d=sourceDirs[t]*flip;
  for(let i=0;i<openingWords[t].length;i++){
   const p=k+i;
   dirs[p]=d;
   mv[p]=i===0&&d<0&&h===1?-1:0;
   prev[p]=p?c[p-1]:-1;
  }
  k+=openingWords[t].length;
 }
 return {dirs,mv,prev};
}
const plans = {
  '-1:0':plan(original,-1,0),
  '-1:1':plan(original,-1,1),
  '1:0':plan(original,1,0),
  '1:1':plan(original,1,1),
};

/**
 * Exact LAST/coin anti-repeat branching; key pointer wraps in
 * independent GF(29²) period 840, giving a well-defined phase.
 * @param {number[]} c Cipher GP29 indices
 * @param {number[]} k Source stream
 * @param {number} phase Unknown field state in 0..839
 * @param {number} sign Additive key sign ±1
 * @param {number} model 0=LAST skip, 1=coin
 * @param {{dirs:number[],mv:number[],prev:number[]}} layout
 * @param {number} n Prefix length
 */
function decode(c,k,phase,sign,model,layout,n){
 const {dirs,mv,prev}=layout;
 const ks=j=>(sign*k[ring(phase+j)]+29)%29;
 /** @type {State[]} */
 let st=[{ptr:0,score:0,count:new Uint16Array(29)}];
 for(let i=0;i<n;i++){
  const candidates=new Map(),ci=c[i],pv=prev[i],dir=dirs[i];
  for(const state of st){
   const j=state.ptr+mv[i],k0=ks(j),k1=ks(j+dir),k2=ks(j+2*dir);
   const p0=(ci+29-k0)%29,p1=(ci+29-k1)%29,p2=(ci+29-k2)%29;
   const opts=[[p0,j+(model===1&&pv===ci?2:1)*dir]];
   if(pv>=0){
    if(model===0){
     if((p1+k0)%29===pv)opts.push([p1,j+2*dir]);
     if((p2+k0)%29===pv&&(p2+k1)%29===pv)opts.push([p2,j+3*dir]);
    }else if((p2+k0)%29===pv)opts.push([p2,j+3*dir]);
   }
   for(const [val,nextPtr] of opts){
    const score=state.score+2*state.count[val];
    const old=candidates.get(nextPtr);
    if(!old||score>old.score){
     const count=state.count.slice();
     count[val]++;
     candidates.set(nextPtr,{ptr:nextPtr,score,count});
    }
   }
  }
  st=[...candidates.values()].sort((x,y)=>y.score-x.score).slice(0,16);
  assert.ok(st.length>0);
 }
 return 29*st[0].score/(n*(n-1));
}
const clear=corpus.pages.find(p=>p.page===57).indices;
assert.equal(clear.length,95);
const plain=Array.from({length:300},(_,i)=>clear[i%95]);
const truthPhase=473,truthLayout=plans['1:0'],plant=[];let ptr=0,skips=0;
for(let i=0;i<300;i++){
 const dir=truthLayout.dirs[i],start=ptr+truthLayout.mv[i];
 let use=-1,used=-1;
 for(let trial=0;trial<=2;trial++){
  const c=(plain[i]+key[0][ring(truthPhase+start+trial*dir)])%29;
  if(trial===2||i===0||c!==plant[i-1]){
   use=c;used=trial;break;
  }
 }
 plant.push(use);skips+=used;
 ptr=start+(1+used)*dir;
}
const plantResult=decode(plant,key[0],truthPhase,1,0,plan(plant,1,0),300);
assert.ok(plantResult>=1.4);
let h=Array(29).fill(0);for(const x of plain)h[x]++;
const truthIoc=29*h.reduce((a,x)=>a+x*(x-1),0)/(300*299);
assert.ok(plantResult>=truthIoc-0.15);

const t0=Date.now(),best=[],hits=[];
for(let keyIndex=0;keyIndex<2;keyIndex++)
for(const flip of [-1,1])
for(const convention of [0,1])
for(const sign of [-1,1])
for(const model of [0,1]){
 const layout=plans[flip+':'+convention];
 let local={ioc:-Infinity};
 for(let phase=0;phase<840;phase++){
  const ioc=decode(original,key[keyIndex],phase,sign,model,layout,300);
  if(ioc>local.ioc)local={ioc,keyIndex,flip,convention,sign,model,phase};
  if(ioc>=1.4)hits.push({ioc,keyIndex,flip,convention,sign,model,phase});
 }
 best.push(local);
}
best.sort((a,b)=>b.ioc-a.ioc);
hits.sort((a,b)=>b.ioc-a.ioc);
const verify=hits.slice(0,10).map(item=>({
 ...item,
 full729:decode(original,key[item.keyIndex],item.phase,item.sign,item.model,
   plans[item.flip+':'+item.convention],729)
}));
console.log(JSON.stringify({
 source:'Original LP2 p0–2 GP29, 300-screen / untouched729 follow-through',
 variants:2*2*2*2*2*840,
 wallTimeMs:Date.now()-t0,
 knownNativePlant:{phase:truthPhase,skips,ioc:plantResult,plainIoc:truthIoc},
 original:{best:best.slice(0,12),screenHitsGe140:hits.length,firstTenWhole729:verify}
},null,2));


// FIELD-AFFINE ALL-PHASE: completely independent reversible cipher
// reading of the same two historical small factors. The exponent in
// 24^(phase+j) shares the authentic field-element clock rather than
// being fitted independently. Direct and root-modulated trace are
// C=24^(phase+j)*P ± Trace(alpha^(phase+j))
// C=24^(phase+j)*(P ± Trace(alpha^(phase+j))).
const f = [], finv = [];
let g24=1;
for(let j=0;j<840;j++){
 f.push(g24);
 let inverse=0;
 for(let i=1;i<29;i++)if(g24*i%29===1){inverse=i;break;}
 assert.ok(inverse);
 finv.push(inverse);
 g24=g24*24%29;
}
assert.equal(g24,1);

/**
 * @param {number[]} c Original source or planted cipher
 * @param {number} type 0: trace-after-multiply, 1: trace-before-multiply
 * @param {number} phase GF(29²) field state
 * @param {number} sign ±1 in the field
 * @param {number} model 0=LAST,1=coin
 * @param {{dirs:number[],mv:number[],prev:number[]}} layout Word direction plan
 * @param {number} n Original prefix
 */
function decodeAffine(c,type,phase,sign,model,layout,n){
 const {dirs,mv,prev}=layout;
 const enc=(p,j)=>{
  const index=ring(phase+j);
  return (f[index]*p+sign*key[type][index]+29)%29;
 };
 const dec=(v,j)=>{
  const index=ring(phase+j);
  return ((v-sign*key[type][index]+29)*finv[index])%29;
 };
 /** @type {State[]} */
 let st=[{ptr:0,score:0,count:new Uint16Array(29)}];
 for(let i=0;i<n;i++){
  const next=new Map(),ci=c[i],pv=prev[i],dir=dirs[i];
  for(const state of st){
   const j=state.ptr+mv[i];
   const p0=dec(ci,j),p1=dec(ci,j+dir),p2=dec(ci,j+2*dir);
   const opts=[[p0,j+(model===1&&pv===ci?2:1)*dir]];
   if(pv>=0){
    if(model===0){
     if(enc(p1,j)===pv)opts.push([p1,j+2*dir]);
     if(enc(p2,j)===pv&&enc(p2,j+dir)===pv)opts.push([p2,j+3*dir]);
    }else if(enc(p2,j)===pv)opts.push([p2,j+3*dir]);
   }
   for(const [val,nextPtr] of opts){
    const score=state.score+2*state.count[val],older=next.get(nextPtr);
    if(!older||score>older.score){
     const count=state.count.slice();
     count[val]++;
     next.set(nextPtr,{ptr:nextPtr,score,count});
    }
   }
  }
  st=[...next.values()].sort((x,y)=>y.score-x.score).slice(0,16);
  assert.ok(st.length);
 }
 return 29*st[0].score/(n*(n-1));
}
const affinePlant=[];let affinePointer=0,affineSkips=0;
for(let i=0;i<300;i++){
 const dir=truthLayout.dirs[i],start=affinePointer+truthLayout.mv[i];
 let used=0,chosen=0;
 for(let retry=0;retry<=2;retry++){
  const at=ring(truthPhase+start+retry*dir);
  const trial=(f[at]*plain[i]+key[0][at])%29;
  if(retry===2||i===0||trial!==affinePlant[i-1]){
   used=retry;chosen=trial;break;
  }
 }
 affinePlant.push(chosen);
 affineSkips+=used;
 affinePointer=start+(1+used)*dir;
}
const affinePositive=decodeAffine(affinePlant,0,truthPhase,1,0,plan(affinePlant,1,0),300);
assert.ok(affinePositive>1.4);
const affineBest=[],affineHits=[];
for(let type=0;type<2;type++)
for(const flip of [-1,1])
for(const convention of [0,1])
for(const sign of [-1,1])
for(const model of [0,1]){
 const layout=plans[flip+':'+convention];
 let local={ioc:-Infinity};
 for(let phase=0;phase<840;phase++){
  const ioc=decodeAffine(original,type,phase,sign,model,layout,300);
  if(ioc>local.ioc)local={ioc,type,flip,convention,sign,model,phase};
  if(ioc>=1.4)affineHits.push({ioc,type,flip,convention,sign,model,phase});
 }
 affineBest.push(local);
}
affineBest.sort((a,b)=>b.ioc-a.ioc);
affineHits.sort((a,b)=>b.ioc-a.ioc);
const affineVerify=affineHits.slice(0,10).map(item=>({
 ...item,
 full729:decodeAffine(original,item.type,item.phase,item.sign,item.model,
   plans[item.flip+':'+item.convention],729)
}));
assert.equal(affineBest.length*840,26880);
console.log(JSON.stringify({
 source:'Original LP2 p0–2 GP29: field-affine all-840-phase inverse',
 variants:26880,
 knownNativePlant:{phase:truthPhase,skips:affineSkips,ioc:affinePositive},
 original:{best:affineBest.slice(0,12),screenHitsGe140:affineHits.length,firstTenWhole729:affineVerify}
},null,2));
