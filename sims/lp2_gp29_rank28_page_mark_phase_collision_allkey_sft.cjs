"use strict";
/**
 * Complete original LP2 GP29 predecessor-skip rank28 escape phase model.
 * Exact within-state equality invariant, including fully private original
 * page + large-mark reset tables. Node 22 CommonJS, Windows 11.
 *
 * Every plaintext GP29 rune can be encoded without a missing side bit:
 * P_i=EA(28) iff C_i=C_(i-1), else rank the 28 other ciphertext successors
 * and apply one hidden 28! permutation selected by printed source phase.
 * The phase is index modulo 28, restarting at source-visible cuts.
 * Four source cut regimes allow 1, 29, 55, and 74 private segments.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8")
  .replace(/\r\n/g,"\n");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const nativeSolved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
assert.deepEqual(nativeSolved.runes,gp.runes);
const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
const source=pages.flatMap(p=>p.indices);
assert.equal(source.length,12956);
const pageStart=new Map();
let offset=0;
for(const page of pages){pageStart.set(page.page,offset);offset+=page.indices.length;}
assert.equal(offset,source.length);
const pageCuts=[0,...pages.map(p=>pageStart.get(p.page)+p.indices.length)];
const inkCuts=ink.pages.filter(p=>p.page<=55).flatMap(p=>
 (p.large_punctuation||[]).map(m=>{
   assert(pageStart.has(p.page)||p.page===50);
   return pageStart.get(p.page)+m[0];
 }));
assert.equal(inkCuts.length,31);
const uniq=a=>[...new Set(a)].sort((x,y)=>x-y);
const settings=[
 ["global",[0,source.length]],
 ["mark",uniq([0,source.length,...inkCuts])],
 ["page",uniq(pageCuts)],
 ["mark+page",uniq([0,source.length,...pageCuts,...inkCuts])]
];
assert.deepEqual(settings.map(s=>s[1].length-1),[1,29,55,74]);
const diff=source.map((r,i)=>i>0?(r-source[i-1]+29)%29:0);
const echoed=source.slice(1).filter((x,i)=>x===source[i]).length;
assert.equal(echoed,86);
const spell=gp.translit.map((s,i)=>({s,i}))
 .sort((a,b)=>b.s.length-a.s.length);
function gpNative(text){
 const out=[];
 for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
   w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C")
     .replace(/Z/g,"S");
   for(let j=0;j<w.length;){
     if(w.startsWith("ING",j)){out.push(21);j+=3;}
     else if(w.startsWith("IO",j)){out.push(27);j+=2;}
     else{
       const match=spell.find(q=>w.startsWith(q.s,j));
       assert(match,"unmatched "+w+" at "+j);
       out.push(match.i);j+=match.s.length;
     }
   }
 }
 return out;
}
const ref=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1];
assert.deepEqual(gpNative(ref),gp.pages[57].indices);
const literature=[
 ["Gibran","resources/control/gibran_prophet_58585.txt"],
 ["Shakespeare","resources/control/shakespeare_first300k.txt"],
 ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([name,file])=>({name,runes:gpNative(read(file))}));
const runeIndex=new Map(gp.runes.map((x,i)=>[x,i]));
function solvedWords(text){
 let word=[],out=[];
 for(const ch of text){
   if(runeIndex.has(ch))word.push(runeIndex.get(ch));
   else if(word.length){out.push(word);word=[];}
 }
 if(word.length)out.push(word);
 return out;
}
const authenticPools=[
 nativeSolved.sections.slice(0,5),nativeSolved.sections.slice(5)
].map(sections=>{
 const pool=new Map();
 for(const w of sections.flatMap(s=>solvedWords(s.source_text))){
   if(!pool.has(w.length))pool.set(w.length,[]);
   pool.get(w.length).push(w);
 }
 return pool;
});
const transcript=read("resources/liber-primus/lp2-transcription.txt");
const originalWords=[];
let active=[];
for(const ch of transcript.split("%").slice(0,55).join("%")){
 if(runeIndex.has(ch))active.push(runeIndex.get(ch));
 else if(ch==="/"||ch==="%"||/\s/u.test(ch)){}
 else if(active.length){originalWords.push(active);active=[];}
}
if(active.length)originalWords.push(active);
assert.equal(originalWords.length,2896);
assert.deepEqual(originalWords.flat(),source);

let seed=0x33011222;
function rand(){
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return(seed>>>0)/4294967296;
}
let nativeSeed=0x3301a211;
function randNative(){
 nativeSeed=(Math.imul(nativeSeed,1664525)+1013904223)>>>0;
 return nativeSeed/4294967296;
}
const choose2=n=>n*(n-1)/2;
function buildGroups(cuts,observedCipher=source){
 const groups=new Map();
 for(let z=0;z<cuts.length-1;z++)
   for(let i=Math.max(1,cuts[z]);i<cuts[z+1];i++){
     if(observedCipher[i]===observedCipher[i-1])continue;
     const key=z+":"+((i-cuts[z])%28);
     if(!groups.has(key))groups.set(key,[]);
     groups.get(key).push(i);
   }
 return groups;
}
function countPairs(groups,values){
 let count=0,denominator=0;
 for(const positions of groups.values()){
   const bins=Array(29).fill(0);
   for(const i of positions)bins[values[i]]++;
   denominator+=choose2(positions.length);
   for(const n of bins)count+=choose2(n);
 }
 return {count,denominator,rate:count/denominator};
}
const results=[];
for(const [name,cuts] of settings){
 const groups=buildGroups(cuts);
 const original=countPairs(groups,diff);
 const windows=[];
 for(const {name:donorName,runes} of literature){
   const scores=[];
   for(let t=0;t<128;t++){
     const begin=Math.floor(rand()*(runes.length-source.length));
     scores.push(countPairs(groups,runes.slice(begin,begin+source.length)).count);
   }
   scores.sort((a,b)=>a-b);
   windows.push({donor:donorName,windows:128,minimum:scores[0],
     median:scores[64],maximum:scores.at(-1),
     atOrBelowOriginal:scores.filter(x=>x<=original.count).length});
 }
 results.push({regime:name,keySegments:cuts.length-1,
   possiblePrivateAlphabetKeys:(cuts.length-1)*28,
   activePhaseCells:groups.size,source:original,windows});
}
assert.deepEqual(results.map(x=>x.source.count),[104918,11021,1775,1648]);
assert(results.every(r=>r.windows.every(w=>w.atOrBelowOriginal===0)));
assert.deepEqual(results.map(x=>x.keySegments),[1,29,55,74]);
// Strongest competitor, separate alphabet for each GP29 period28 phase
// at every authentic page OR mark boundary. Yet every one of the 384
// independent literary windows still exceeds its exact Q.
const hardest=results.at(-1),cuts=settings.at(-1)[1],groups=buildGroups(cuts);
const solvedControls=[];
for(const [j,pool] of authenticPools.entries()){
 const scores=[];
 for(let t=0;t<128;t++){
   const out=[];
   for(const w of originalWords){
     const candidates=pool.get(w.length);
     const donor=candidates?
       candidates[Math.floor(randNative()*candidates.length)]:
       Array.from({length:w.length},()=>Math.floor(randNative()*29));
     out.push(...donor);
   }
   assert.equal(out.length,source.length);
   scores.push(countPairs(groups,out).count);
 }
 scores.sort((a,b)=>a-b);
 solvedControls.push({name:j?"author-holdout":"author-training",
   windows:128,minimum:scores[0],median:scores[64],
   maximum:scores.at(-1),
   atOrBelowOriginal:scores.filter(x=>x<=hardest.source.count).length});
}
assert(solvedControls.every(x=>x.atOrBelowOriginal===0));

/**
 * Full-ranked source-C receiver and exact original-C forward inverse.
 * EA=28 is reserved for ciphertext echoes; 28 other plaintext runes
 * use rank from 28 nonzero source successor differences.
 */
const secrets=Array.from({length:cuts.length-1},()=>Array.from(
 {length:28},()=>{
   const perm=Array.from({length:28},(_,i)=>i);
   for(let i=27;i>0;i--){
     const j=Math.floor(rand()*(i+1));
     [perm[i],perm[j]]=[perm[j],perm[i]];
   }
   return perm;
 }));
const inverse=secrets.map(seg=>seg.map(perm=>{
 const rev=Array(28);
 perm.forEach((v,i)=>rev[v]=i);
 return rev;
}));
function decrypt(C){
 const out=[];
 let last=0;
 for(let z=0;z<cuts.length-1;z++)
   for(let i=cuts[z];i<cuts[z+1];i++){
     const step=(C[i]-last+29)%29;
     out.push(step===0?28:secrets[z][(i-cuts[z])%28][step-1]);
     last=C[i];
   }
 return out;
}
function encrypt(P){
 const out=[];
 let last=0;
 for(let z=0;z<cuts.length-1;z++)
   for(let i=cuts[z];i<cuts[z+1];i++){
     const step=P[i]===28?0:
       1+inverse[z][(i-cuts[z])%28][P[i]];
     last=(last+step)%29;
     out.push(last);
   }
 return out;
}
const sourcePlain=decrypt(source);
assert.deepEqual(encrypt(sourcePlain),source);
assert.equal(sourcePlain.filter(x=>x===28).length,
 source.reduce((n,c,i)=>n+Number(c===(i>0?source[i-1]:0)),0));
const syntheticP=literature[0].runes.slice(1017,1017+source.length);
const syntheticC=encrypt(syntheticP);
assert.deepEqual(decrypt(syntheticC),syntheticP);
assert.equal(syntheticC.length,12956);
const realGroup=buildGroups(cuts,syntheticC);
const syntheticSourceDiff=syntheticC.map((r,i)=>i?
 (r-syntheticC[i-1]+29)%29:r);
assert.equal(countPairs(realGroup,syntheticSourceDiff).count,
 countPairs(realGroup,syntheticP).count);
console.log(JSON.stringify({
 source:{runes:source.length,exactEchoSites:echoed,marks:inkCuts.length,
   distinctMarkSegments:29,sourceWordCount:originalWords.length},
 originalAllPrivateResults:results,
 strongestSourceAuthenticControls:solvedControls,
 positive:{exactOriginalSourceRecovery:true,
   originalEchoLiteralEAcount:sourcePlain.filter(x=>x===28).length,
   exactNativeFullLengthForwardInverse:true,
   nativeSourcePairInvariant:true},
 decision:"conditional native-GP no-go of ALL per-page and per-mark independently private 28-phase rank28 escape tables; no LP2 plaintext/key"
},null,2));
