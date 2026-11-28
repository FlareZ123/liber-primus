"use strict";
/**
 * Original LP2 fixed-word-boundary necessary-condition test for C11/Round48
 * strict-nonrepeat iid-key erasure channels.
 *
 * Upstream unverified premise: all 2,896 physically printed complete groups
 * encode preserved plaintext GP word boundaries; neither C11 model supplies
 * that as a first-party instruction. This scope excludes dummy word breaks,
 * insertions, nonuniform keys, exceptional space encoding and length-morphing.
 *
 * Exact analytic distributions (no fitted parameters):
 * A) strict-repeat GP29 + independently deleted accepted outputs, d=7/36.
 * B) strict-repeat mod36 output with exactly 7 invisible states, fresh iid
 *    uniform candidate keys. Source length fixed per word; unlike the embedded
 *    visible-state process, its full printed-count law is NOT iid binomial.
 * Positive Monte Carlo controls check independent code and predicted moments.
 *
 * Run Node22: node sims/lp2_round48_word_preserving_erasure_length_gate_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gold=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const raw=read("resources/transcriptions/lp2_krisyotam_2017.txt");
const runeSet=new Set(corpus.runes);
assert.equal(runeSet.size,29);
const originalWords=[];let current=0,runes=0;
for(const ch of raw) {
 if(runeSet.has(ch)){runes++;current++;}
 else if("- .&$§0123456789".replaceAll(" ","").includes(ch)){
  if(current){originalWords.push(current);current=0;}
 }
 if(runes===12956)break;
}
if(current)originalWords.push(current);
assert.equal(runes,12956);
assert.equal(originalWords.length,2896);
assert.equal(originalWords.reduce((a,b)=>a+b,0),12956);
const sourceWords=text=>{
 const words=[];
 for(const w0 of text.match(/[A-Za-z]+/g)||[]){
  const w=w0.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
   .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let n=0,j=0,ok=true;
  while(j<w.length){
   const t=corpus.translit
    .map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length)
    .find(t=>w.startsWith(t.s,j));
   if(!t){ok=false;break;}
   j+=t.s.length;n++;
  }
  if(ok&&n)words.push(n);
 }
 return words;
};
function solvedWords(text){
 const out=[];let n=0;
 for(const ch of text){
  if(runeSet.has(ch))n++;
  else if(n){out.push(n);n=0;}
 }
 if(n)out.push(n);
 return out;
}
const donors=[
 ["Cicada solved GP control",gold.sections.flatMap(s=>solvedWords(s.source_text))],
 ["Shakespeare GP-native",sourceWords(read("resources/control/shakespeare_first300k.txt"))],
 ["Gibran GP-native",sourceWords(read("resources/control/gibran_prophet_58585.txt"))],
 ["Emerson GP-native",sourceWords(read("resources/control/emerson_essays_2944.txt"))]
];
const p=29/36,q=7/36;
function deletionDist(t){
 const prob=Array(t+1).fill(0);prob[0]=q**t;
 for(let k=0;k<t;k++)prob[k+1]=prob[k]*(t-k)/(k+1)*p/q;
 assert(Math.abs(prob.reduce((a,b)=>a+b,0)-1)<1e-11);
 return prob;
}
function silentDist(t){
 let V=Array(t+1).fill(0),H=Array(t+1).fill(0);
 V[1]=p;H[0]=q;
 for(let i=2;i<=t;i++){
  const nextV=Array(t+1).fill(0),nextH=Array(t+1).fill(0);
  for(let k=0;k<i;k++){
   nextV[k+1]+=V[k]*28/35+H[k]*29/35;
   nextH[k]+=V[k]*7/35+H[k]*6/35;
  }
  V=nextV;H=nextH;
 }
 const d=V.map((v,k)=>v+H[k]);
 assert(Math.abs(d.reduce((a,b)=>a+b,0)-1)<1e-11);
 return d;
}
assert(Math.abs(silentDist(2)[2]-(29/36)*(28/35))<1e-14);
assert(Math.abs(deletionDist(2)[2]-(29/36)**2)<1e-14);
const obs={
 printedGroups:originalWords.length,
 printedRunes:runes,
 mean:runes/originalWords.length,
 oneRune:originalWords.filter(v=>v===1).length,
 eightOrMore:originalWords.filter(v=>v>=8).length
};
function summary(lengths,model) {
 const max=Math.max(...lengths),hist=Array(max+1).fill(0);
 for(const len of lengths){
  const d=model(len);
  for(let k=0;k<d.length;k++)hist[k]+=d[k]/lengths.length;
 }
 const nonempty=1-hist[0];
 const mass=hist.map((v,i)=>i===0?0:v/nonempty);
 const mean=mass.reduce((a,v,k)=>a+k*v,0);
 const variance=mass.reduce((a,v,k)=>a+(k-mean)**2*v,0);
 const long=mass.slice(8).reduce((a,b)=>a+b,0);
 const sd=Math.sqrt(variance);
 const nl=obs.printedGroups;
 return {
  originalNativeWords:lengths.length,
  originalNativeMean:lengths.reduce((a,b)=>a+b,0)/lengths.length,
  emptyPlaintextWordFraction:hist[0],
  expectedKeptLengthMean:mean,
  expectedNonemptyTotalRunes:mean*nl,
  expectedNonemptyOneRuneGroups:mass[1]*nl,
  expectedNonemptyEightPlusGroups:long*nl,
  expectedKeptLengthSD:sd,
  zObservedMean:(obs.mean-mean)/(sd/Math.sqrt(nl)),
  zObservedEightPlus:(obs.eightOrMore-nl*long)/Math.sqrt(nl*long*(1-long)),
  variance,
  masses:mass
 };
}
/* Independent fixed-seed forward simulators, not using either analytic DP. */
let state=0x33013607;
function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;}
function simulateDelete(len){
 let visible=0,last=-1;
 for(let i=0;i<len;i++){
  let c;
  do{c=Math.floor(random()*29);}while(c===last);
  last=c;
  if(random()<p)visible++;
 }
 return visible;
}
function simulateSilent(len){
 let visible=0,last=-1;
 for(let i=0;i<len;i++){
  let c;
  do{c=Math.floor(random()*36);}while(c===last);
  last=c;if(c<29)visible++;
 }
 return visible;
}
const out=[];
for(const [label,lens]of donors){
 const D=summary(lens,deletionDist),H=summary(lens,silentDist);
 // 250k independently generated native word lengths per channel, collect all
 // generated nonempty words and verify analytic moment/long tail (positive).
 const controls=[];
 for(const [name,sim,theory]of [["delete",simulateDelete,D],["hidden36",simulateSilent,H]]){
  let count=0,total=0,tail=0,one=0;
  for(let j=0;j<250000;j++){
   const n=sim(lens[Math.floor(random()*lens.length)]);
   if(n){count++;total+=n;if(n>=8)tail++;if(n===1)one++;}
  }
  const empiricalMean=total/count,empiricalLong=tail/count;
  assert(Math.abs(empiricalMean-theory.expectedKeptLengthMean)<.045,
   label+" "+name+" independent plant mean");
  assert(Math.abs(empiricalLong-theory.expectedNonemptyEightPlusGroups/2896)<.008,
   label+" "+name+" independent plant tail");
  controls.push({name,nonempty:count,empiricalMean,empiricalEightPlus:empiricalLong,
   expectedMean:theory.expectedKeptLengthMean,expectedEightPlus:theory.expectedNonemptyEightPlusGroups/2896,
   positivePassed:true});
 }
 function select(o){
  const {masses,...rest}=o;return rest;
 }
 out.push({label,delete:select(D),hidden36:select(H),controls});
}
assert(out.every(x=>x.delete.zObservedMean>25&&x.hidden36.zObservedMean>25));
const digest={
 source:"Original canonical 2,896 printed groups and 12,956 p0–55 runes; four independent source-native word-length calibration corpora",
 crucialPremise:"PRINTED word/group separators are authentic plaintext word boundaries, preserved after the cipher; HYPOTHETICAL, not source-established",
 fixedParameters:{v:29,h:7,n:36,deleteProbability:7/36},
 original:obs,
 donorResults:out,
 conclusion:"Both models with uniform fresh key draws and plaintext-word-preserving erasure are inconsistent with the word lengths of all four pinned GP-native source controls; printed boundaries may be synthetic, a different source register is possible, no LP2 cipher proven or plaintext recovered"
};
console.log(JSON.stringify(digest,null,2));
