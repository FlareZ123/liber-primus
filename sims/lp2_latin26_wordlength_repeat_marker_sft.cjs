'use strict';
/** Reproduce: node sims/lp2_latin26_wordlength_repeat_marker_sft.cjs (Node 22). */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} filename @returns {string} */
const read=filename=>fs.readFileSync(path.join(root,filename),'utf8');
const runeSet=new Set([...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ']);
const runeOrder=[...runeSet],runeIndex=new Map(runeOrder.map((r,i)=>[r,i]));
const source=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
let page=0,previous=null,word=[],words=[],repeat=[0,0,0],total=0;
/** @returns {void} */
function finish(){
 if(!word.length)return;
 const L=word.length;
 word.forEach((x,k)=>{if(x.event){repeat[0]++;if(L>=8)repeat[1]++;if(k===0)repeat[2]++;}});
 words.push(word);word=[];
}
for(const c of source){
 if(runeSet.has(c)){
  const eligible=previous!==null&&previous.page===page;
  const valueIndex=runeIndex.get(c);
  const previousIndex=eligible?runeIndex.get(previous.value):null;
  const r={eligible,event:eligible&&previous.value===c,page,value:c,valueIndex,previousIndex};
  word.push(r);previous=r;total++;
 }else if(c==='%')page++;
 else if(c==='/'||/\s/u.test(c)){}
 else finish();
}
finish();
assert.equal(total,12956);assert.equal(words.length,2896);
assert.deepEqual(repeat,[86,21,23]);

// Descriptive absolute-output coverage only. A fixed rank map into the 28
// successors is state-relative and can produce all 29 absolute runes, so
// these counts do not bound that model. Exclude page-first headers/repeats.
const pageAlphabets=new Map();
const physicalPage=p=>p>=50?p+1:p; // physical p50 has no runic transcription segment.
for(const w of words)for(const r of w){
 if(!r.eligible||r.event)continue;
 const p=physicalPage(r.page);
 if(!pageAlphabets.has(p))pageAlphabets.set(p,new Set());
 pageAlphabets.get(p).add(r.value);
}
assert.equal(pageAlphabets.size,55);
const pageDistinct=[...pageAlphabets.entries()].map(([p,set])=>[p,set.size]);
assert.equal(pageDistinct.filter(([,n])=>n===29).length,53);
assert.deepEqual(pageDistinct.filter(([,n])=>n!==29),[[49,28],[55,25]]);
const chapterRanges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapterDistinct=chapterRanges.map(([lo,hi])=>{
 const set=new Set();
 for(const [p,values] of pageAlphabets)if(p>=lo&&p<=hi)for(const v of values)set.add(v);
 return set.size;
});
assert.deepEqual(chapterDistinct,[29,29,29,29,29,29,29,29,29]);

// Normalize each nonrepeat ciphertext rune by its predecessor: its rank in
// the GP29 alphabet after removing the previous ciphertext rune. A fixed
// 25-letter plaintext map can emit at most 25 distinct successor ranks.
const pageRankSets=new Map(),globalRanks=new Set();
for(const w of words)for(const r of w){
 if(!r.eligible||r.event)continue;
 const rank=r.valueIndex-(r.valueIndex>r.previousIndex?1:0);
 assert(rank>=0&&rank<28);
 globalRanks.add(rank);
 const p=physicalPage(r.page);
 if(!pageRankSets.has(p))pageRankSets.set(p,new Set());
 pageRankSets.get(p).add(rank);
}
const pageRankDistinct=[...pageRankSets.entries()].map(([p,set])=>[p,set.size]);
assert.equal(globalRanks.size,28);
assert.equal(pageRankDistinct.length,55);
assert.equal(pageRankDistinct.filter(([,n])=>n===28).length,52);
assert.deepEqual(pageRankDistinct.filter(([,n])=>n!==28),[[22,27],[49,27],[55,24]]);
assert.equal(pageRankDistinct.filter(([,n])=>n>25).length,54);
const chapterRankDistinct=chapterRanges.map(([lo,hi])=>{
 const set=new Set();
 for(const [p,values] of pageRankSets)if(p>=lo&&p<=hi)for(const v of values)set.add(v);
 return set.size;
});
assert.deepEqual(chapterRankDistinct,[28,28,28,28,28,28,28,28,28]);

const histogram=new Uint32Array(14);
for(const w of words)histogram[w.length-1]++;
assert.deepEqual([...histogram],[83,448,720,513,317,256,216,156,78,52,32,18,4,3]);
const refs=[
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt',
 'resources/control/emerson_essays_2944.txt',
 'resources/liber-primus/lp1-plaintext-reference.txt'
];
/** @param {number[]} values @returns {number[]} */
function probs(values){
 const n=values.length,counts=new Uint32Array(15);
 for(const v of values)counts[Math.min(v,15)-1]++;
 return [...counts].map(x=>x/n);
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function kl(a,b){return a.reduce((sum,p,k)=>sum+p*Math.log((p+1e-12)/(b[k]+1e-12)),0);}
const original=probs(words.map(w=>w.length));
const records=[];
for(const file of refs){
 const lines=read(file).split('\n');
 const txt=file.includes('lp1-plaintext-reference')?lines.filter(s=>!s.startsWith('#')).join(' '):lines.join('\n');
 const entries=txt.toUpperCase().match(/[A-Z]+/g)||[];
 const latin=entries.map(w=>w.length);
 const gp=entries.map(w=>{
  const x=w.replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
  return (x.match(/TH|NG|EO|OE|AE|IA|EA|./g)||[]).length;
 });
 // Also test the source-calibrated LP1/p57 English spelling: QU→CW,
 // V→U, K/Q→C, Z→S, with ING and IO each emitted as one rune.
 const sourceGp=entries.map(w=>{
  const x=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  return (x.match(/ING|IO|TH|NG|EO|OE|AE|IA|EA|./g)||[]).length;
 });
 const latinKL=kl(original,probs(latin)),gpKL=kl(original,probs(gp));
 const sourceGpKL=kl(original,probs(sourceGp));
 assert(latinKL<gpKL,file+' native Latin shape should fit better than legacy GP29');
 assert(latinKL<sourceGpKL,file+' native Latin shape should fit better than source-calibrated GP29');
 const occ=Array.from({length:15},(_,n)=>Array.from({length:n+1},()=>new Uint32Array(26)));
 const pop=new Uint32Array(15);
 for(const w of entries){
  const len=w.length;if(len<1||len>14)continue;
  pop[len]++;
  for(let k=0;k<len;k++)occ[len][k][w.charCodeAt(k)-65]++;
 }
 const expected=Array.from({length:26},()=>[0,0,0]);
 for(const w of words){
  const L=w.length;
  assert(pop[L]>0);
  for(let k=0;k<L;k++){
   if(!w[k].eligible)continue;
   for(let q=0;q<26;q++){
    const p=occ[L][k][q]/pop[L];
    expected[q][0]+=p;
    if(L>=8)expected[q][1]+=p;
    if(k===0)expected[q][2]+=p;
   }
  }
 }
 const score=v=>Math.sqrt(v.reduce((s,x,k)=>s+((x-repeat[k])/Math.sqrt(repeat[k]))**2,0));
 const rank=expected.map((v,q)=>({q,score:score(v)})).sort((a,b)=>a.score-b.score);
 assert.equal(rank[0].q,10,'Latin K expected to be nearest of 26 in '+file);
 records.push({file,referenceWords:entries.length,latinMean:latin.reduce((s,n)=>s+n,0)/entries.length,
  gpMean:gp.reduce((s,n)=>s+n,0)/entries.length,
  sourceCalibratedGpMean:sourceGp.reduce((s,n)=>s+n,0)/entries.length,
  KLlatin:latinKL,KLgp:gpKL,KLsourceCalibratedGP:sourceGpKL,
  bestMarker:String.fromCharCode(65+rank[0].q),expectedK:expected[10],
  markerSecond:String.fromCharCode(65+rank[1].q)});
}
console.log(JSON.stringify({result:'PASS; Latin-register discriminator and predecessor-relative rank-map exclusion, no cipher/key or plaintext',
 original:{runes:total,words:words.length,repeat,mean:total/words.length},
 absoluteOutputCoverage:{pages:pageDistinct,visualChapterDistinct:chapterDistinct,
  interpretation:'descriptive only; absolute rune coverage does not constrain relative successor ranks'},
 relativeSuccessorRankCoverage:{globalDistinct:globalRanks.size,pages:pageRankDistinct,
  pagesWithAll28:pageRankDistinct.filter(([,n])=>n===28).length,
  pagesWithMoreThan25:pageRankDistinct.filter(([,n])=>n>25).length,
  visualChapterDistinct:chapterRankDistinct,
  interpretation:'a fixed map from 25 ordinary Latin letters to 28 predecessor-relative successor ranks cannot produce 28 distinct ranks; it is excluded globally, per chapter, and on 54/55 physical pages'},
 references:records},null,2));
